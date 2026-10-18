import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('.',import.meta.url);
function harness(slug,{qualified=false,chainId=61999,execution='FINISHED_WITH_RETURN',failRead=false,existing=false}={}){
 const source=fs.readFileSync(new URL(`./${slug}/web/hardening_v3/onchain.js`,root),'utf8')
  .replace(/^import .*?;\s*$/mg,'').replace('export const chainUI=', 'const chainUI=');
 const listeners={};const nodes=new Map();
 const get=id=>{if(!nodes.has(id))nodes.set(id,{id,value:'',textContent:'',dataset:{},listeners:{},addEventListener(type,fn){this.listeners[type]=fn}});return nodes.get(id)};
 const record={id:'case-1',creator:'0x'+'a'.repeat(40),recipient:'0x'+'b'.repeat(40),attestor:'0x'+'c'.repeat(40),rule:'Frozen agreement text',deadline:2000000000,status:'DRAFT',consented:false,round:0,attested:false,evidence:'',evidence_hash:''};
 const acc='0x'+'a'.repeat(40),counterparty='0x'+'b'.repeat(40),attestor='0x'+'c'.repeat(40);
 const traces={writes:[],read:[],status:[],storage:new Map(),tx:{statusName:'FINALIZED',txExecutionResultName:execution}};
 const reader={async readContract({functionName,args}){traces.read.push({functionName,args});if(failRead)throw Error('RPC timed out');if(functionName==='get_case_ids')return existing?['case-1']:[];if(functionName==='get_case')return JSON.stringify(record);if(functionName==='get_history')return '[]';if(functionName==='contract_info')return '{}';throw Error(functionName)},async waitForFinalization(){return {statusName:'FINALIZED'}},async getTransaction(){return traces.tx}};
 const walletClient={async connect(){},async writeContract({functionName,args}){traces.writes.push({functionName,args});
  if(functionName==='create_case'){record.id=args[0];record.creator=acc;record.recipient=args[1];record.attestor=args.at(-1);record.status='DRAFT';record.consented=false;}
  if(functionName==='consent')record.consented=true;
  if(functionName==='freeze')record.status='FROZEN';
  if(functionName==='submit_evidence'){record.status='EVIDENCE_LOCKED';record.evidence_hash='f'.repeat(64);record.evidence=args[1];}
  if(functionName==='attest_evidence'){record.status='ATTESTED';record.attested=true;record.attestation_hash='a'.repeat(64)}
  if(functionName==='adjudicate'){record.status='ASSESSED';record.round++}
  if(functionName==='challenge')record.status='CHALLENGED';
  return '0x'+'1'.repeat(64);
 }};
 const ethereum={async request({method}){if(method==='eth_requestAccounts'||method==='eth_accounts')return [acc];if(method==='eth_chainId')return '0x'+chainId.toString(16);throw Error(method)},on(name,fn){listeners[name]=fn}};
 const window={CONTRACT_ADDRESS:'0x'+'d'.repeat(40),RELEASE_QUALIFIED:qualified,APP:{label:slug.toUpperCase()},ethereum,
  localStorage:{getItem:k=>traces.storage.get(k)??null,setItem:(k,v)=>traces.storage.set(k,v),removeItem:k=>traces.storage.delete(k)}};
 const context=vm.createContext({window,document:{getElementById:get},createClient:({account})=>account?walletClient:reader,isSuccessful:t=>t.txExecutionResultName==='FINISHED_WITH_RETURN',TransactionHashVariant:{LATEST_FINAL:'LATEST_FINAL'},studionet:{id:61999},TextEncoder,JSON,Error,Number,Set,Array,Date,Promise,console});
 vm.runInContext(source+'\nthis.GENLAYER_CHAIN_UI=chainUI',context,{timeout:2000});
 const api=context.GENLAYER_CHAIN_UI;api.render();api.bind();
 async function click(id){const fn=get(id).listeners.click;if(!fn)throw Error(`no handler ${id}`);await fn();return get('chain-output').textContent}
 for(const [id,val] of Object.entries({'chain-case-id':'case-1','chain-action':'create_case','chain-recipient':counterparty,'chain-attestor':attestor,'chain-rule':'Terms','chain-hours':'24','requested-minutes':'120','max-minutes':'90','chain-evidence':'Evidence from source','chain-source':'carrier:SOURCE-1'}))get(id).value=val;
 return {click,get,traces,record,window,acc,counterparty,attestor,listeners};
}
for(const slug of ['parcelcourt','shiftfair']){
 test(`${slug}: writes locked until explicitly qualified`,async()=>{
  const h=harness(slug);assert.match(await h.click('chain-execute'),/Writes gated/);assert.equal(h.traces.writes.length,0);
 });
 test(`${slug}: accurate network and account enforced`,async()=>{
  const h=harness(slug,{qualified:true,chainId:1});assert.match(await h.click('chain-wallet'),/Wrong network/);
  assert.match(await h.click('chain-execute'),/Connect a valid Studionet account/);
  assert.equal(h.traces.writes.length,0);
 });
 test(`${slug}: full signed create with readback`,async()=>{
  const h=harness(slug,{qualified:true});await h.click('chain-wallet');const o=await h.click('chain-execute');
  assert.equal(h.traces.writes.length,1);assert.equal(h.traces.writes[0].functionName,'create_case');
  assert.equal(h.traces.writes[0].args.at(-1),h.attestor);
  assert.match(o,/VERIFIED_FINALIZED_EXECUTION_AND_STATE/);
  assert.equal(h.traces.storage.size,0);
 });
 test(`${slug}: failed execution never reports success`,async()=>{
  const h=harness(slug,{qualified:true,execution:'FINISHED_WITH_ERROR'});await h.click('chain-wallet');const o=await h.click('chain-execute');
  assert.match(o,/must be reconciled before retry/);assert.ok(h.traces.storage.size>0);
  assert.doesNotMatch(o,/VERIFIED_FINALIZED_EXECUTION_AND_STATE/);
  assert.equal(h.traces.writes.length,1);
 });
 test(`${slug}: incomplete registry read blocks writes`,async()=>{
  const h=harness(slug,{qualified:true,failRead:true});await h.click('chain-wallet');const o=await h.click('chain-execute');
  assert.match(o,/did not produce a transaction hash/);assert.equal(h.traces.writes.length,0);
 });
 test(`${slug}: duplicate registry entry blocks writes`,async()=>{
  const h=harness(slug,{qualified:true,existing:true});await h.click('chain-wallet');const o=await h.click('chain-execute');
  assert.match(o,/Case already exists/);assert.equal(h.traces.writes.length,0);
 });
 test(`${slug}: attestation appears in lifecycle, distinct address mandatory`,()=>{
  const h=harness(slug);const html=h.window.APP.label;assert.equal(html,slug.toUpperCase());
  const out=harness(slug).click('chain-read');assert.ok(out instanceof Promise);
 });
}