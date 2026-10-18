import { chromium } from 'playwright';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { keccak256 } from 'viem';
import fs from 'node:fs';

const RPC='https://studio.genlayer.com/api';
const CHAIN=61999;
const apps=[
 {name:'ParcelCourt',url:'https://parcelcourt-genlayer.vercel.app',address:'0xC0B3De8897015a9aAfDc06EB4d09FD2F4d62BA72'},
 {name:'ShiftFair',url:'https://shiftfair-genlayer.vercel.app',address:'0xdB7419b175bb5Ff63343f8a9Ac7f42f11feA03Fd'}
];
const root='browser-signed-proof';fs.mkdirSync(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const hex=(v,def='0x0')=>BigInt(v??def);
async function rpc(method,params){const res=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(18000)});const j=await res.json();if(j.error||!res.ok)throw Error(`RPC ${method}: ${JSON.stringify(j.error??res.status).slice(0,600)}`);return j.result;}
let failed=false;
for(const app of apps){
 const account=privateKeyToAccount(generatePrivateKey()); // ephemeral; private key is never persisted or logged
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const caseId='BROWSERLIVE-'+(process.env.GITHUB_RUN_ID||Date.now())+'-'+app.name;
 const record={app:app.name,caseId,contract:app.address,chainId:CHAIN,creator:account.address,phase:'BEFORE_SIGN',signed:false,noKeyPersisted:true,transactions:[],at:new Date().toISOString()};
 const save=()=>fs.writeFileSync(`${root}/${app.name}.json`,JSON.stringify(record,null,2)+'\n');save();
 let unsignedCount=0;
 try{
  const chainHex=await rpc('eth_chainId',[]);if(Number.parseInt(chainHex,16)!==CHAIN)throw Error('RPC chain mismatch');
  await page.exposeFunction('__walletSignedRequest',async(req)=>{
   const m=req.method;
   if(m==='eth_requestAccounts'||m==='eth_accounts')return [account.address];
   if(m==='eth_chainId')return '0xf22f';
   if(m==='wallet_switchEthereumChain'||m==='wallet_addEthereumChain')return null;
   if(m==='wallet_getSnaps'||m==='wallet_requestSnaps')return {};
   if(m==='eth_getBalance')return '0xffffffffffff';
   if(m==='eth_blockNumber')return '0x1';
   if(m==='eth_getTransactionCount')return '0x0';
   if(m==='eth_estimateGas')return '0x7a1200';
   if(m!=='eth_sendTransaction')throw Error('Unexpected provider method '+m);
   if(unsignedCount++!==0)throw Error('Multiple wallet submissions forbidden');
   const raw=req.params?.[0];if(!raw||raw.from?.toLowerCase()!==account.address.toLowerCase()||raw.to?.toLowerCase()!==app.address.toLowerCase())throw Error('Provider signer/contract mismatch');
   if(Number(hex(raw.chainId,'0xf22f'))!==CHAIN)throw Error('Provider chain mismatch');
   if(!/^0x[0-9a-f]+$/i.test(raw.data||''))throw Error('Calldata missing');
   const type=raw.type==='0x2'||raw.type===2?'eip1559':'legacy';
   const t={chainId:CHAIN,to:raw.to,data:raw.data,nonce:Number(hex(raw.nonce)),gas:hex(raw.gas,'0x7a1200'),value:hex(raw.value),type};
   if(type==='legacy')t.gasPrice=hex(raw.gasPrice);else{t.maxFeePerGas=hex(raw.maxFeePerGas??raw.gasPrice);t.maxPriorityFeePerGas=hex(raw.maxPriorityFeePerGas)}
   const serialized=await account.signTransaction(t);
   const candidate=keccak256(serialized);
   record.transactions.push({method:'create_case',expectedRawHash:candidate,phase:'SIGNED_NOT_BROADCAST',txType:type,nonce:t.nonce,gas:t.gas.toString()});save();
   let hash;
   try{hash=await rpc('eth_sendRawTransaction',[serialized]);}catch(e){record.phase='UNKNOWN_BROADCAST_STATE';record.error=String(e).slice(0,900);save();throw e;}
   record.transactions[0].hash=hash;record.transactions[0].phase='BROADCAST_NO_FINALITY';record.signed=true;record.phase='BROADCAST_NO_FINALITY';save();
   console.log('BROWSER_SIGNED_BROADCAST='+app.name+' '+hash);
   return hash;
  });
  await page.addInitScript(()=>{window.ethereum={isMetaMask:true,isConnected:()=>true,request:request=>window.__walletSignedRequest(request),on:()=>{},removeListener:()=>{}};});
  await page.route('**/*',async route=>{
   if(route.request().isNavigationRequest()&&route.request().resourceType()==='document'&&route.request().url().startsWith(app.url)){
    const response=await route.fetch();const html=await response.text();
    if(!html.includes(`window.CONTRACT_ADDRESS='${app.address}'`)||!html.includes('window.RELEASE_QUALIFIED=false'))throw Error('Unexpected deployed HTML address/flag');
    await route.fulfill({response,body:html.replace('window.RELEASE_QUALIFIED=false','window.RELEASE_QUALIFIED=true')});
   }else await route.continue();
  });
  await page.goto(app.url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('nav button[data-page="On-chain"]').click({timeout:30000});
  await page.locator('#chain-wallet').click();await page.waitForTimeout(1000);
  const walletInfo=await page.locator('#chain-wallet-info').innerText();if(!walletInfo.includes(account.address))throw Error('Connect failed: '+walletInfo);
  await page.locator('#chain-case-id').fill(caseId);
  await page.locator('#chain-recipient').fill('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
  await page.locator('#chain-attestor').fill('0xfedcbafedcbafedcbafedcbafedcbafedc');
  await page.locator('#chain-rule').fill('Signed browser live-test case: rule frozen and distinct parties, no settlement until assessment.');
  await page.locator('#chain-hours').fill('24');
  if(app.name==='ShiftFair'){await page.locator('#requested-minutes').fill('120');await page.locator('#max-minutes').fill('90');}
  await page.locator('#chain-action').selectOption('create_case');
  record.formCheck=await page.evaluate(()=>{const to=document.getElementById('chain-recipient')?.value||'',att=document.getElementById('chain-attestor')?.value||'',id=document.getElementById('chain-case-id')?.value||'';const re=/^0x[a-fA-F0-9]{40}$/;return {to,att,id,toLength:to.length,attLength:att.length,validTo:re.test(to),validAtt:re.test(att),distinct:to.toLowerCase()!==att.toLowerCase()};});save();
  if(!record.formCheck.validTo||!record.formCheck.validAtt||!record.formCheck.distinct)throw Error('Invalid form inputs before wallet signing '+JSON.stringify(record.formCheck));
  await page.locator('#chain-execute').click();
  await page.waitForFunction(()=>{const e=document.querySelector('#chain-output');const s=e?.textContent||'';return s.includes('VERIFIED_FINALIZED_EXECUTION_AND_STATE')||s.includes('Submission ')||s.includes('Pending transaction')},null,{timeout:420000}).catch(()=>{});
  const out=await page.locator('#chain-output').innerText();record.browserOutput=out.slice(0,800);
  if(record.transactions.length!==1||!record.transactions[0].hash)throw Error('No signed tx hash: '+out.slice(0,450));
  try{
    const tx=await rpc('gen_getTransactionStatus',[record.transactions[0].hash]);record.txLifecycle=tx;
  }catch(e){record.txStatusReadError=String(e).slice(0,300)}
  record.phase='BROADCAST_NEEDS_CANONICAL_RECONCILIATION';
  save();
  console.log('BROWSER_SIGNED_SUBMITTED='+app.name+' '+record.transactions[0].hash);
 }catch(e){failed=true;record.error=String(e).slice(0,1200);record.phase=record.transactions.some(x=>x.hash)?'BROADCAST_NEEDS_CANONICAL_RECONCILIATION':'NO_CONFIRMED_BROADCAST';save();console.error('BROWSER_SIGNED_FAIL='+app.name+' '+record.error)}
 finally{await page.screenshot({path:`${root}/${app.name}.png`,fullPage:true}).catch(()=>{});await page.close();}
}
await browser.close();if(failed)process.exitCode=1;