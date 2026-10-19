import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

// Separate immutable deploy-and-audit binding from UI's ability to sign.
// RELEASE_QUALIFIED is true only after verified live consensus, signed browser E2E and canonical readback.
const ADDRESS = window.CONTRACT_ADDRESS;
const BOUND = /^0x[a-fA-F0-9]{40}$/.test(ADDRESS ?? "");
const QUALIFIED = window.RELEASE_QUALIFIED === true && BOUND;
const reader = createClient({ chain: studionet });
let wallet = null, walletAddress = "", walletChain = null, pending = false;
const el = id => document.getElementById(id);
const html = x => String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const format = x => JSON.stringify(x,(_,v)=>typeof v==="bigint"?v.toString():v,2);
const message = e => String(e?.shortMessage||e?.message||e).slice(0,600);
const val = x => (el(x)?.value??"").trim();
const addrValid = x => /^0x[a-fA-F0-9]{40}$/.test(x);
const canonical = x => {const y=typeof x==="string"?JSON.parse(x):x;if(!y||typeof y!=="object"||Array.isArray(y))throw Error("Invalid canonical object");return y};
const read = async(name,args=[]) => reader.readContract({address:ADDRESS,functionName:name,args});
const exactNum = (x,min,max) => {const n=Number(x);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`Value must be an integer from ${min} to ${max}`);return n};
const field = (id,label,placeholder,type="text") => `<label class="chain-field"><span class="eyebrow">${html(label)}</span><input class="input" type="${html(type)}" id="${html(id)}" placeholder="${html(placeholder)}" ${type==="number"?'step="1" min="0"':''}/></label>`;
const report=(x,status="")=>{if(el("chain-output")){el("chain-output").textContent=typeof x==="string"?x:format(x);el("chain-output").dataset.status=status;}};
const chainIsRight=()=>walletChain===61999 && addrValid(walletAddress);
function resetWallet(reason){wallet=null;walletAddress="";walletChain=null;if(el("chain-wallet-info"))el("chain-wallet-info").textContent=reason||"Wallet disconnected"}
const caseId=()=>val("chain-case-id");
const currentTxStorage=()=>`genlayer-pending-${ADDRESS?.toLowerCase()||'unset'}`;
const txSaved=()=>{try{return JSON.parse(window.localStorage.getItem(currentTxStorage())||"null")}catch{return null}};
const txRemember=v=>{try{if(v)window.localStorage.setItem(currentTxStorage(),JSON.stringify(v));else window.localStorage.removeItem(currentTxStorage())}catch{}};
async function afterTx(saved){
  const persisted=await reader.waitForTransactionReceipt({hash:saved.hash,status:TransactionStatus.FINALIZED,fullTransaction:false,interval:4000,retries:100});
  const leaders=persisted?.consensus_data?.leader_receipt||[];
  const phase=persisted?.status_name??persisted?.statusName;
  // GenVM execution and canonical state matter, not majority agreement alone.
  const material=leaders.filter(x=>!(x.execution_result==="ERROR"&&/validator execution cancelled after quorum/i.test(String(x?.genvm_result?.stderr||""))));
  if(phase!=="FINALIZED"||!material.some(x=>x.execution_result==="SUCCESS")||material.some(x=>x.execution_result!=="SUCCESS")){
    throw Error("On-chain execution not proven successful: "+format({hash:saved.hash,phase,executions:leaders.map(x=>({result:x.execution_result,error:String(x.genvm_result?.stderr||"").slice(-260)}))}));
  }
  const state=canonical(await read("get_case",[saved.caseId]));
  const s=saved.prev;
  const target={create_case:"DRAFT",freeze:"FROZEN",submit_evidence:"EVIDENCE_LOCKED",attest_evidence:"ATTESTED",adjudicate:"ASSESSED",challenge:"CHALLENGED",finalize_case:"FINALIZED"};
  const ok=saved.action==="consent"?state.status==="DRAFT" && state.consented===true && s?.consented===false:
    state.status===target[saved.action] &&
      (saved.action!=="adjudicate"||state.round===s.round+1) &&
      (saved.action!=="attest_evidence"||state.attested===true && !!state.attestation_hash) &&
      (saved.action!=="create_case"||state.creator.toLowerCase()===saved.wallet.toLowerCase());
  if(!ok)throw Error("Canonical readback does not prove the requested change. Case status: "+state.status);
  txRemember(null);
  report({status:"VERIFIED_FINALIZED_EXECUTION_AND_STATE",transaction:saved.hash,action:saved.action,case:state,history:canonicalHistory(await read("get_history",[saved.caseId]))},"success");
}
const canonicalHistory=x=>{const p=typeof x==="string"?JSON.parse(x):x;if(!Array.isArray(p))throw Error("Invalid audit history");return p};
async function resume(){const old=txSaved();if(!old)return report("No submitted transaction to resume.","error");try{report({status:"RECOVERING_OR_PENDING",hash:old.hash});await afterTx(old)}catch(e){report(`Transaction ${old.hash} is not verified. Check its status before making any new write. ${message(e)}`,"error")}}
export const chainUI={
  render(){const extra=window.APP.label==="MILESTONEPROOF"
      ?field("gross-minor","Milestone budget (minor units)","250000","number")+field("release-numerator","Release fraction numerator","1","number")+field("release-denominator","Release fraction denominator","2","number"):"";
    const badge=QUALIFIED?"SIGNED WRITES VERIFIED":"PRE-RELEASE / TRANSACTIONS LOCKED";
    return `<div class="release"><span class="signal"></span><span>Only canonical case reads count as live. The workflow examples elsewhere are explicitly illustrative. Positive verdicts are provisional until finalization. Third-party on-chain attestation proves which wallet vouched for evidence, <strong>not whether the external record is true.</strong></span></div>
    <div class="stats"><div class="stat"><div class="eyebrow">CHAIN</div><div class="value" style="font-size:24px">61999</div><small>Studionet</small></div><div class="stat"><div class="eyebrow">CONTRACT</div><div class="value" style="font-size:24px">${BOUND?"Bound":"Unbound"}</div><small>GenLayer native</small></div><div class="stat"><div class="eyebrow">TRANSACTION ACCESS</div><div class="value" style="font-size:24px">${QUALIFIED?"Qualified":"Locked"}</div><small>Independent gate</small></div></div>
    <div class="columns"><div class="surface"><div class="section-head"><h2>Live connection</h2><span class="pill">${badge}</span></div><p class="mono" style="overflow-wrap:anywhere">${html(ADDRESS||"NO V4 ADDRESS DEPLOYED")}</p><p class="muted">RPC: https://studio.genlayer.com/api</p><div class="toolbar"><button class="cta" id="chain-inspect" ${!BOUND?'disabled':''}>Read contract metadata</button><button id="chain-wallet" class="tab">Connect wallet</button></div><p id="chain-wallet-info" class="footnote">Not connected. No wallet secrets are requested or stored.</p></div>
    <div class="surface"><div class="section-head"><h2>Live case read</h2><span class="hint">Immutable canonical state</span></div>${field("chain-case-id","Case ID","CASE-2026-001")}
    <div class="toolbar"><button class="cta" id="chain-read" ${!BOUND?'disabled':''}>Fetch case + history</button><button class="tab" id="chain-resume">Resume submitted tx</button></div><p class="footnote">A timeout after a tx hash is returned must not be treated as failure. Resume that hash before attempting another write.</p></div></div>
    <div class="surface" style="margin-top:18px"><div class="section-head"><h2>Signed milestone acceptance lifecycle</h2><span class="hint">Create → consent → freeze → evidence → attest → adjudicate → challenge / finalize</span></div>
    <div class="detail"><div class="detail-box">${field("chain-recipient","Counterparty wallet","0x…")}${field("chain-attestor","Independent attestor wallet","0x…")}${field("chain-rule","Frozen agreement / policy","Objective terms and burden of proof")}${field("chain-hours","Deadline in hours","24","number")}${extra}
    <p class="footnote">Attestor must differ from both parties. The counterparty consents before freezing the rule and designated attestor. For genuine deliverable, acceptance test or signoff evidence, use an externally verifiable source record; a hash alone is not authentication.</p></div>
    <div class="detail-box"><label class="chain-field"><span class="eyebrow">Action</span><select class="input" id="chain-action"><option value="create_case">Create case</option><option value="consent">Counterparty consent</option><option value="freeze">Freeze clause</option><option value="submit_evidence">Lock evidence</option><option value="attest_evidence">Third-party attestation</option><option value="adjudicate">Review deliverable against frozen scope</option><option value="challenge">Challenge assessment</option><option value="finalize_case">Finalize after review window</option></select></label>
    <label class="chain-field"><span class="eyebrow">Evidence / challenge statement</span><textarea class="input" id="chain-evidence" rows="4" placeholder="Bounded text; do not include secrets"></textarea></label>${field("chain-source","External source record reference","Official immutable record ID, URL or issuer reference")}
    <button class="cta" id="chain-execute" ${!QUALIFIED?'disabled title="Pending deployment, exact source parity and signed browser qualification"':''}>Sign and submit transaction</button><p class="footnote">Never infer success from a wallet popup or consensus agreement alone. A successful GenVM result and canonical state readback are mandatory.</p></div></div></div>
    <div class="surface" style="margin-top:18px"><div class="section-head"><h2>Canonical chain events</h2><span class="hint">No fabricated transaction receipts</span></div><pre class="mono" id="chain-output" style="white-space:pre-wrap;max-height:430px;overflow:auto">Select a live read operation.</pre></div>`;
  },
  bind(){
    el("chain-inspect")?.addEventListener("click",async()=>{try{report(canonical(await read("contract_info")),"success")}catch(e){report(message(e),"error")}});
    el("chain-read")?.addEventListener("click",async()=>{const id=caseId();if(!id)return report("Case reference required.","error");try{const [record,history]=await Promise.all([read("get_case",[id]),read("get_history",[id])]);report({case:canonical(record),history:canonicalHistory(history)},"success")}catch(e){report(message(e),"error")}});
    el("chain-resume")?.addEventListener("click",resume);
    el("chain-wallet")?.addEventListener("click",async()=>{if(!window.ethereum)return report("EIP-1193 provider unavailable.","error");try{
      const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
      const addr=accounts?.[0];if(!addrValid(addr))throw Error("Missing valid wallet address");
      wallet=createClient({chain:studionet,account:addr,provider:window.ethereum});
      await wallet.connect("studionet");
      walletChain=parseInt(await window.ethereum.request({method:"eth_chainId"}),16);
      if(walletChain!==61999){resetWallet("Wrong chain; expected Studionet 61999.");throw Error("Wrong network: "+walletChain)}
      walletAddress=addr;
      el("chain-wallet-info").textContent=`Wallet ${addr} · Studionet 61999 · ${QUALIFIED?"writes qualified":"writes remain locked"}`;
      report({wallet:walletAddress,chainId:walletChain,releaseQualified:QUALIFIED},"success");
    }catch(e){resetWallet("Wallet not connected");report(message(e),"error")}});
    window.ethereum?.on?.("accountsChanged",accounts=>{if(!accounts?.length||accounts[0]?.toLowerCase()!==walletAddress.toLowerCase())resetWallet("Wallet account changed. Reconnect required.")});
    window.ethereum?.on?.("chainChanged",chain=>{if(parseInt(chain,16)!==61999)resetWallet("Wallet network changed. Reconnect to Studionet.")});
    el("chain-execute")?.addEventListener("click",async()=>{
      if(!QUALIFIED||!BOUND)return report("Writes are locked until this contract is deployed and the exact live qualification passes.","error");
      if(pending)return report("A transaction is already processing.","error");
      if(!wallet||!chainIsRight())return report("Connect a valid Studionet account first.","error");
      const pendingTx=txSaved();if(pendingTx)return report(`Pending transaction ${pendingTx.hash}. Resume and reconcile before any new write.`,"error");
      const id=caseId(),action=val("chain-action");if(!/^[A-Za-z0-9_-]{1,96}$/.test(id))return report("Invalid case identifier.","error");
      pending=true;let hash="";
      try{
        // Always recheck network and account immediately before wallet signing.
        const chain=parseInt(await window.ethereum.request({method:"eth_chainId"}),16);
        const accounts=await window.ethereum.request({method:"eth_accounts"});
        if(chain!==61999||accounts?.[0]?.toLowerCase()!==walletAddress.toLowerCase())throw Error("Wallet chain or account changed before signing");
        let previous=null;
        if(action==="create_case"){
          // Reject unknown-state instead of treating a timeout as evidence of no case.
          const exists=await read("case_exists",[id]);
          if(typeof exists!=="boolean")throw Error("Cannot verify on-chain case existence; no write submitted.");
          if(exists)throw Error("Case already exists. Provide a new ID.");
        }else{
          previous=canonical(await read("get_case",[id]));
        }
        const allowed={consent:previous?.status==="DRAFT"&&!previous?.consented,freeze:previous?.status==="DRAFT"&&previous?.consented,submit_evidence:previous?.status==="FROZEN"&&!previous?.evidence,attest_evidence:previous?.status==="EVIDENCE_LOCKED"&&!previous?.attested,adjudicate:["ATTESTED","CHALLENGED"].includes(previous?.status),challenge:previous?.status==="ASSESSED"&&previous?.round<2,finalize_case:previous?.status==="ASSESSED"};
        if(action!=="create_case"&&!allowed[action])throw Error("Invalid transition from canonical state "+previous.status);
        let args=[id];const note=val("chain-evidence");
        if(action==="create_case"){
          const to=val("chain-recipient"),attestor=val("chain-attestor");
          if(!addrValid(to)||!addrValid(attestor)||new Set([to.toLowerCase(),attestor.toLowerCase(),walletAddress.toLowerCase()]).size!==3)throw Error("Creator, counterparty and attestor must be distinct valid addresses");
          const deadline=Math.floor(Date.now()/1000)+exactNum(val("chain-hours"),1,8760)*3600;
          const rule=val("chain-rule");if(!rule||new TextEncoder().encode(rule).length>2048)throw Error("Rule text must be 1 to 2048 bytes");
          args=[id,to,rule,deadline];if(window.APP.label==="MILESTONEPROOF"){const budget=exactNum(val("gross-minor"),1,1e15),num=exactNum(val("release-numerator"),0,1e12),den=exactNum(val("release-denominator"),1,1e12);if(num>den)throw Error("Release fraction cannot exceed 100%");args.push(budget,num,den);}args.push(attestor);
        }else if(action==="submit_evidence"||action==="challenge"){
          if(!note||new TextEncoder().encode(note).length>(action==="challenge"?512:4096))throw Error("Invalid text length");args.push(note);
        }else if(action==="attest_evidence"){
          if(walletAddress.toLowerCase()!==previous.attestor.toLowerCase())throw Error("Only the precommitted attestor can attest");
          const source=val("chain-source");if(!source||new TextEncoder().encode(source).length>256)throw Error("Invalid source reference");
          args.push(previous.evidence_hash,source);
        }
        const call={address:ADDRESS,functionName:action,args};
        const estimate=typeof wallet.estimateTransactionFeesForWrite==="function"?await wallet.estimateTransactionFeesForWrite(call):null;
        const opts=estimate?{...call,fees:{distribution:estimate.distribution,feeValue:estimate.feeValue}}:call;
        report("Requesting wallet signature; no transaction submitted yet…");
        hash=await wallet.writeContract(opts);
        const saved={hash,action,caseId:id,prev:previous,wallet:walletAddress};txRemember(saved);
        report({status:"SUBMITTED_UNVERIFIED",hash,action});
        await afterTx(saved);
      }catch(e){report(`Submission ${hash?"was broadcast and must be reconciled before retry":"did not produce a transaction hash"}. ${message(e)}`,"error")}
      finally{pending=false}
    });
  }
};