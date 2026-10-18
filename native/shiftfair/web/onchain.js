import { createClient } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";
import { studionet } from "genlayer-js/chains";

const ADDRESS = window.CONTRACT_ADDRESS;
const VERIFIED = /^0x[0-9a-fA-F]{40}$/.test(ADDRESS || "");
const QUALIFIED = window.RELEASE_QUALIFIED === true;
let signer = null;
let currentAddress = "";
const safe = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const element = id => document.getElementById(id);
const toMessage = err => String(err?.shortMessage || err?.message || err).slice(0,450);
const reader = createClient({ chain: studionet });
const numeric = x => {
  const v = Number(x);
  if (!Number.isSafeInteger(v) || v < 0) throw new Error("An exact nonnegative integer is required.");
  return v;
};
const format = obj => JSON.stringify(obj, (k, v) => typeof v === "bigint" ? v.toString() : v, 2);
const receiptSuccessful = receipt => receipt?.status_name === "FINALIZED" && receipt?.result_name === "MAJORITY_AGREE";

function output(text, state = "") {
  const el = element("chain-output");
  if (!el) return;
  el.textContent = typeof text === "string" ? text : format(text);
  el.dataset.status = state;
}
const field = (id, label, placeholder = "", type = "text") =>
  `<label class="chain-field"><span class="eyebrow">${safe(label)}</span><input class="input" id="${safe(id)}" type="${type}" placeholder="${safe(placeholder)}" ${type==="number"?'min="0" step="1"':''}/></label>`;
const value = id => element(id)?.value?.trim() || "";

export const chainUI = {
  render() {
    const extras = window.APP.label === "SHIFTFAIR"
      ? field("requested-minutes","Requested shift minutes","120","number") + field("max-minutes","Maximum permitted minutes","90","number")
      : "";
    const qualified = QUALIFIED
      ? '<span class="pill">LIVE CONTRACT ENABLED</span>'
      : '<span class="pill">RELEASE QUALIFICATION PENDING</span>';
    return `<div class="release"><span class="signal"></span><span>Contract source deployed on Studionet. This view separates verified blockchain reads from synthetic sample data. The deployed contract passed a live two-party GenLayer consensus assessment. Wallet signing remains user-controlled, and every result requires canonical state verification.</span></div>
    <div class="stats">
      <div class="stat"><div class="eyebrow">NETWORK</div><div class="value" style="font-size:24px">61999</div><small>GenLayer Studionet</small></div>
      <div class="stat"><div class="eyebrow">CONTRACT</div><div class="value" style="font-size:24px">${VERIFIED ? "Deployed" : "Unbound"}</div><small>Studionet live state-qualified</small></div>
      <div class="stat"><div class="eyebrow">WRITES</div><div class="value" style="font-size:24px">${QUALIFIED ? "Enabled" : "Locked"}</div><small>No synthetic success receipts</small></div>
    </div>
    <div class="columns">
      <div class="surface">
        <div class="section-head"><h2>Network and contract</h2>${qualified}</div>
        <div class="mono" style="overflow-wrap:anywhere">${safe(ADDRESS || "No contract address")}</div>
        <p class="muted">RPC: https://studio.genlayer.com/api</p>
        <div class="toolbar"><button id="chain-inspect" class="cta" ${!VERIFIED?"disabled":""}>Read canonical contract info</button>
        <button id="chain-wallet" class="tab">Connect wallet</button></div>
        <p id="chain-wallet-info" class="footnote">Not connected. Browser wallet keys never enter this application.</p>
      </div>
      <div class="surface">
        <div class="section-head"><h2>Read case from Studionet</h2><span class="hint">Canonical read / not sample</span></div>
        ${field("chain-case-id","Case reference","CASE-123")}
        <button id="chain-read" class="cta" ${!VERIFIED?"disabled":""}>Read case and assessment lineage</button>
        <p class="footnote">Reads use the deployed contract's public view methods. Unavailable cases remain unavailable.</p>
      </div>
    </div>
    <div class="surface" style="margin-top:18px">
      <div class="section-head"><h2>Multi-actor lifecycle</h2><span class="hint">Create → consent → freeze → evidence → adjudicate → challenge</span></div>
      <div class="detail">
        <div class="detail-box">
          ${field("chain-recipient","Counterparty address","0x…")}
          ${field("chain-rule","Frozen rule / agreement clause","Required terms and evidence…")}
          ${field("chain-hours","Hours until deadline","24","number")}
          ${extras}
          <p class="footnote">An address must be represented as a GenLayer Address, never arbitrary text. Actor and deadline rules are enforced by the contract.</p>
        </div>
        <div class="detail-box">
          <label class="chain-field"><span class="eyebrow">Action</span>
          <select class="input" id="chain-action">
            <option value="create_case">Create case</option>
            <option value="consent">Counterparty consent</option>
            <option value="freeze">Freeze terms</option>
            <option value="submit_evidence">Submit evidence</option>
            <option value="adjudicate">Request independent consensus</option>
            <option value="challenge">Challenge decision</option>
          </select></label>
          <label class="chain-field"><span class="eyebrow">Evidence / challenge statement</span><textarea class="input" id="chain-evidence" rows="5" placeholder="Only bounded verified evidence, not secrets"></textarea></label>
          <button class="cta" id="chain-execute" ${!QUALIFIED ? 'disabled title="Enable after canonical qualification"' : ""}>Submit verified chain transaction</button>
          <p class="footnote">Every transaction must finalize successfully. A tx hash or ACCEPTED status alone never counts as success.</p>
        </div>
      </div>
    </div>
    <div class="surface" style="margin-top:18px">
      <div class="section-head"><h2>Canonical network response</h2><span class="hint">Real SDK output only</span></div>
      <pre id="chain-output" class="mono" style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:420px;overflow:auto">Select an action to make a read-only GenLayer query.</pre>
    </div>`;
  },
  bind() {
    element("chain-inspect")?.addEventListener("click",async () => {
      if(!VERIFIED) return output("No verified deployment address.","error");
      output("Reading contract_info from Studionet...");
      try {
        const result = await reader.readContract({address:ADDRESS,functionName:"contract_info",args:[]});
        output(result,"success");
      } catch(e) { output("Canonical contract read failed: " + toMessage(e),"error"); }
    });
    element("chain-read")?.addEventListener("click", async () => {
      const caseId=value("chain-case-id");
      if (!caseId) return output("Provide a case ID before reading.","error");
      output("Reading real case and immutable history from the network...");
      try {
        const [caseData, history] = await Promise.all([
          reader.readContract({address:ADDRESS,functionName:"get_case",args:[caseId]}),
          reader.readContract({address:ADDRESS,functionName:"get_history",args:[caseId]})
        ]);
        output({network:"Studionet",contract:ADDRESS,case:caseData,history},"success");
      } catch(e) {output("Case read failed; no synthetic fallback: " + toMessage(e),"error");}
    });
    element("chain-wallet")?.addEventListener("click", async () => {
      if(!window.ethereum) {output("An EIP-1193 browser wallet is required.","error");return;}
      try {
        const accounts = await window.ethereum.request({method:"eth_requestAccounts"});
        currentAddress=accounts[0];
        signer=createClient({chain:studionet,account:currentAddress,provider:window.ethereum});
        await signer.connect("studionet");
        const chain=await window.ethereum.request({method:"eth_chainId"});
        const id=parseInt(chain,16);
        if(id!==61999) throw new Error("Wrong wallet chain: "+id);
        element("chain-wallet-info").textContent="Connected "+currentAddress+" · Studionet 61999. "+(QUALIFIED?"Writes may be signed.":"Writes remain locked while qualification is pending.");
        output({wallet:currentAddress,chainId:id,contract:ADDRESS,releaseQualified:QUALIFIED},"success");
      } catch(e){output("Wallet connection failed: "+toMessage(e),"error");}
    });
    element("chain-execute")?.addEventListener("click",async ()=>{
      if(!QUALIFIED || !VERIFIED)return output("On-chain writes are locked pending qualification.","error");
      if(!signer)return output("Connect a Studionet wallet first.","error");
      const action=value("chain-action"),id=value("chain-case-id");
      if(!id)return output("Provide the target case reference.","error");
      const recipient=value("chain-recipient"),rule=value("chain-rule"),text=value("chain-evidence");
      let args=[id];
      try{
        if(action==="create_case"){
          if(!/^0x[0-9a-fA-F]{40}$/.test(recipient))throw new Error("Invalid counterparty address");
          const deadline=Math.floor(Date.now()/1000)+numeric(value("chain-hours"))*3600;
          args=[id,recipient,rule,deadline];
          if(window.APP.label==="SHIFTFAIR")args.push(numeric(value("requested-minutes")),numeric(value("max-minutes")));
        } else if(action==="submit_evidence"||action==="challenge"){args.push(text);}
        let previous = null;
        try {
          previous = JSON.parse(await reader.readContract({address:ADDRESS,functionName:"get_case",args:[id]}));
        } catch(readError) {
          if(action !== "create_case")throw new Error("Case must exist before "+action+": "+toMessage(readError));
        }
        if(action==="create_case" && previous)throw new Error("Case ID already exists on-chain; choose a unique reference.");
        const allowed={
          consent:previous?.status==="DRAFT" && previous?.consented!==true,
          freeze:previous?.status==="DRAFT" && previous?.consented===true,
          submit_evidence:previous?.status==="FROZEN" && !previous?.evidence,
          adjudicate:["EVIDENCE_LOCKED","CHALLENGED"].includes(previous?.status),
          challenge:previous?.status==="ASSESSED"
        };
        if(action!=="create_case" && !allowed[action])throw new Error("Action does not match canonical pre-state; refresh case before continuing.");
        output("Preparing GenLayer "+action+" transaction and estimating fees...");
        const request={address:ADDRESS,functionName:action,args};
        const estimate = typeof signer.estimateTransactionFeesForWrite === "function" ? await signer.estimateTransactionFeesForWrite(request) : null;
        const options = estimate ? {...request, fees:{distribution:estimate.distribution,feeValue:estimate.feeValue}} : request;
        const transaction=await signer.writeContract(options);
        output({status:"SUBMITTED_NOT_FINAL",transactionHash:transaction,action});
        const receipt=await signer.waitForTransactionReceipt({hash:transaction,status:TransactionStatus.FINALIZED});
        if(!receiptSuccessful(receipt))throw new Error("Finality or majority agreement not confirmed: "+format({status_name:receipt?.status_name,result_name:receipt?.result_name}));
        // A successful consensus vote can agree on a contract execution error.
        // Independently verify durable state, not just transaction lifecycle.
        const raw=await reader.readContract({address:ADDRESS,functionName:"get_case",args:[id]});
        const state=JSON.parse(raw);
        const expected={"create_case":"DRAFT","freeze":"FROZEN","submit_evidence":"EVIDENCE_LOCKED","adjudicate":"ASSESSED","challenge":"CHALLENGED"};
        const verified=action==="consent" ? state.consented === true && previous?.consented!==true
         : state.status===expected[action] && (action!=="adjudicate" || state.round===previous.round+1);
        if(!verified)throw new Error("Finalized transaction did not produce the required state: "+state.status);
        output({status:"FINALIZED_AND_STATE_VERIFIED",transactionHash:transaction,contract:ADDRESS,action,caseId:id,observedStatus:state.status,verdict:state.result,consented:state.consented,round:state.round,receiptStatus:receipt.status_name,consensusResult:receipt.result_name},"success");
      }catch(e){output("Action not completed: "+toMessage(e),"error");}
    });
  }
};