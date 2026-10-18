/** Real Studionet three-actor qualification. Never log secrets or retry after a tx ID. */
import {createClient, createAccount} from 'genlayer-js';
import {TransactionStatus} from 'genlayer-js/types';
const readExecution = tx => (tx?.consensus_data?.leader_receipt||[]).map(r=>({result:r.execution_result,stderr:String(r?.genvm_result?.stderr||'').slice(-850)}));
import {studionet} from 'genlayer-js/chains';
import fs from 'node:fs';
import crypto from 'node:crypto';
const root='live-proof';fs.mkdirSync(root,{recursive:true});
const a=createAccount(),b=createAccount(),attestor=createAccount();
const cA=createClient({chain:studionet,account:a}),cB=createClient({chain:studionet,account:b}),cI=createClient({chain:studionet,account:attestor});
const readClient=createClient({chain:studionet});
const parse=x=>typeof x==='string'?JSON.parse(x):x;
const entry=async(addr,name,args)=>parse(await readClient.readContract({address:addr,functionName:name,args}));
const sha256=s=>crypto.createHash('sha256').update(s).digest('hex');
const messages={
 noticeclock:{rule:'Notice of breach is valid only if the applicable clause, the breach and requested cure are identified and evidenced by a signed delivery receipt.',evidence:'On-chain attestor voucher: a signed notice cites clause 7, identifies non-delivery, specifies cure within two business days and records receipt by the addressee.'},
 invoicebasis:{rule:'License fee applies to qualified creative services under the signed statement of work, excluding shipping and taxes. The eligibility basis is the issuer invoice description.',evidence:'On-chain attestor voucher: issuer invoice states eligible creative services supplied under signed statement of work and no excluded shipping or tax line.'},
 parcelcourt:{rule:'Deliver parcel to the nominated reception clerk and record receiver authority plus handoff time under the frozen delivery promise.',evidence:'On-chain attestor voucher: carrier signed handoff record specifies the authorized receiving clerk, package ID and delivery time within agreed window.'},
 shiftfair:{rule:'Extra shift minutes require supervisor approval and an attendance record covering the same shift. Payable overtime is capped by the fixed policy.',evidence:'On-chain attestor voucher: third-party attendance ledger lists approved additional 120 minutes within policy, signed supervisor authorization and matching employee shift.'}
};
async function qualify(slug){
 const proof=JSON.parse(fs.readFileSync(`${root}/${slug}.json`,'utf8'));
 const contract=proof.address;if(!/^0x[0-9a-f]{40}$/i.test(contract))throw Error(`${slug} missing deployed contract`);
 const report={app:slug,contract,chainId:61999,caseId:`GLV4-${slug}-${process.env.GITHUB_RUN_ID||Date.now()}`,state:'IN_PROGRESS',txs:[]};
 const save=()=>fs.writeFileSync(`${root}/${slug}-live.json`,JSON.stringify(report,null,2)+'\n');save();
 const curr=async()=>await entry(contract,'get_case',[report.caseId]);
 async function write(actor,method,args,expected){
  let hash;
  try{
   hash=await actor.writeContract({address:contract,functionName:method,args});
   report.txs.push({method,hash,phase:'BROADCAST_NO_FINALITY'});save();
   const status=await readClient.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,fullTransaction:false,interval:4000,retries:100});
   const last=report.txs.at(-1);
   const leaders=readExecution(status);
   last.phase=status.status_name??status.statusName;
   last.execution=leaders;last.consensus=status.result_name;
   save();
   if(last.phase!=='FINALIZED'||leaders.length===0||leaders.some(x=>x.result!=='SUCCESS'))throw Error("Live "+method+" execution failed: "+JSON.stringify(leaders).slice(0,850));
   const state=await curr();
   if(!expected(state))throw Error(`Live ${method} canonical state mismatch ${JSON.stringify(state).slice(0,500)}`);
   last.verifiedCaseState=state.status;save();
   return state;
  }catch(e){report.state='BLOCKED';report.error=String(e).slice(0,700);save();throw e}
 }
 try{
  let args=[report.caseId,b.address,messages[slug].rule,Math.floor(Date.now()/1000)+86400];
  if(slug==='invoicebasis')args.push(1333,1,4);
  if(slug==='shiftfair')args.push(120,90);
  args.push(attestor.address);
  await write(cA,'create_case',args,s=>s.status==='DRAFT'&&s.attestor.toLowerCase()===attestor.address.toLowerCase());
  await write(cB,'consent',[report.caseId],s=>s.consented===true&&s.status==='DRAFT');
  await write(cA,'freeze',[report.caseId],s=>s.status==='FROZEN'&&!!s.rule_hash);
  const evidence=messages[slug].evidence;
  await write(cA,'submit_evidence',[report.caseId,evidence],s=>s.status==='EVIDENCE_LOCKED'&&s.evidence_hash===sha256(evidence));
  const snapshot=await curr();
  await write(cI,'attest_evidence',[report.caseId,snapshot.evidence_hash,`ISSUER-SYNTHETIC-LIVE-V4:${slug}:${report.caseId}`],s=>s.status==='ATTESTED'&&s.attested===true&&!!s.attestation_hash);
  await write(cA,'adjudicate',[report.caseId],s=>s.status==='ASSESSED'&&s.round===1);
  await write(cA,'challenge',[report.caseId,'Review whether the external signatory truly controls the issuer account.'],s=>s.status==='CHALLENGED'&&s.challenges.length===1);
  await write(cB,'challenge',[report.caseId,'The record may lack an independently verifiable off-chain document, reconsider support.'],s=>s.status==='CHALLENGED'&&s.challenges.length===2);
  await new Promise(resolve=>setTimeout(resolve,11000));
  await write(cA,'adjudicate',[report.caseId],s=>s.status==='ASSESSED'&&s.round===2);
  await write(cI,'finalize_case',[report.caseId],s=>s.status==='FINALIZED'&&s.finalized_at>0);
  const hist=await entry(contract,'get_history',[report.caseId]);
  if(!Array.isArray(hist)||hist.length!==2||hist[1].prev!==hist[0].entry_hash)throw Error('History hash-chain mismatch');
  const final=await curr();
  if(slug==='invoicebasis'&&final.payable_minor!==final.provisional_payable_minor)throw Error('Invoice payable basis not finalized');
  if(slug==='shiftfair'&&final.approved_minutes!==final.provisional_approved_minutes)throw Error('Shift cap not finalized');
  report.state='PASS';report.verdict=final.result;report.round=final.round;report.sourceRef=final.source_ref;report.auditEntries=hist.length;save();
 }catch(e){report.state='BLOCKED';report.error=String(e).slice(0,700);save();throw e}
}
const apps=['noticeclock','invoicebasis','parcelcourt','shiftfair'];
let failed=false;
for(const app of apps){try{await qualify(app);console.log('LIVE_QUALIFICATION_PASS='+app)}catch(e){failed=true;console.error('LIVE_QUALIFICATION_BLOCKED='+app+' '+String(e).slice(0,280));}}
if(failed)process.exitCode=1;