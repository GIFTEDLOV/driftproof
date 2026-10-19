import {chromium} from 'playwright';
import fs from 'node:fs';
import {generatePrivateKey,privateKeyToAccount} from 'viem/accounts';
const signingFixture=privateKeyToAccount(generatePrivateKey());
const URL='https://milestoneproof-genlayer.vercel.app';
const address='0xD4AdDBe785176EfC96da0B371FfBa03C5ff6c0c9';
const fake='0x1234567890abcdef1234567890abcdef12345678';
const evidence={kind:'READ_ONLY_SDK_BROWSER_PROBE',broadcasts:0,time:new Date().toISOString(),providerCalls:[],pageErrors:[],networkFailures:[]};
fs.mkdirSync('browser-probe',{recursive:true});const save=()=>fs.writeFileSync('browser-probe/probe.json',JSON.stringify(evidence,null,2));save();
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>{evidence.pageErrors.push(String(e).slice(0,500));save()});
page.on('requestfailed',req=>{evidence.networkFailures.push({url:req.url().split('?')[0],method:req.method(),error:req.failure()?.errorText});save()});
page.on('console',msg=>{if(msg.type()==='error'){evidence.pageErrors.push('console:'+msg.text().slice(0,400));save()}});
try{
 await page.exposeFunction('__testWallet',async req=>{
   evidence.providerCalls.push(req.method);save();
   if(req.method==='eth_requestAccounts'||req.method==='eth_accounts')return [fake];
   if(req.method==='eth_chainId')return '0xf22f';
   if(req.method==='wallet_getSnaps'||req.method==='wallet_requestSnaps')return {};
   if(req.method==='wallet_switchEthereumChain'||req.method==='wallet_addEthereumChain')return null;
   if(req.method==='eth_getBalance')return '0xffffffffffff';
   if(req.method==='eth_blockNumber')return '0x1';
   if(req.method==='eth_estimateGas')return '0x7a1200';
   if(req.method==='eth_getTransactionCount')return '0x0';
   if(req.method==='eth_getBlockByNumber')return {number:'0x1',timestamp:'0x67000000',baseFeePerGas:'0x1',gasLimit:'0x7a1200'};
   if(req.method==='net_version')return '61999';
   if(req.method==='eth_sendTransaction'||req.method==='eth_sendRawTransaction'){evidence.walletRequest=true;
    const raw=req.params?.[0];
    evidence.transactionFields=raw?{from:raw.from,to:raw.to,chainId:raw.chainId,type:raw.type,gas:raw.gas,gasPrice:raw.gasPrice,maxFeePerGas:raw.maxFeePerGas,maxPriorityFeePerGas:raw.maxPriorityFeePerGas,nonce:raw.nonce,value:raw.value,dataChars:String(raw.data??'').length}:null;
    try{
      const num=(v,defaultValue='0x0')=>BigInt(v??defaultValue);
      const txType=raw?.type==='0x2'||raw?.type===2?'eip1559':'legacy';
      const tx={chainId:61999,to:raw.to,data:raw.data,nonce:Number(num(raw.nonce)),gas:num(raw.gas,'0x7a1200'),value:num(raw.value),type:txType};
      if(txType==='legacy')tx.gasPrice=num(raw.gasPrice);
      else{tx.maxFeePerGas=num(raw.maxFeePerGas??raw.gasPrice);tx.maxPriorityFeePerGas=num(raw.maxPriorityFeePerGas)}
      const serialized=await signingFixture.signTransaction(tx);
      evidence.offchainSigningResult='PASS';evidence.offchainRawTxLength=serialized.length;
    }catch(e){evidence.offchainSigningResult='FAIL';evidence.offchainSigningError=String(e).slice(0,750)}
    save();throw Error('Wallet request intentionally rejected in preflight; NO broadcast');}
   throw Error('Unrecognized wallet RPC '+req.method);
 });
 await page.addInitScript(()=>{window.ethereum={isMetaMask:true,isConnected:()=>true,request:req=>window.__testWallet(req),on:()=>{},removeListener:()=>{}};});
 await page.route('**/*',async route=>{
  if(route.request().isNavigationRequest()&&route.request().resourceType()==='document'&&route.request().url().startsWith(URL)){
    const response=await route.fetch();const html=await response.text();
    if(!html.includes(`window.CONTRACT_ADDRESS='${address}'`)||!html.includes('window.RELEASE_QUALIFIED=false'))throw Error('unexpected production release flag or contract binding');
    await route.fulfill({response,body:html.replace('window.RELEASE_QUALIFIED=false','window.RELEASE_QUALIFIED=true')});
  }else await route.continue();
 });
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:40000});
 await page.locator('nav button[data-page="On-chain"]').click();
 await page.locator('#chain-wallet').click();
 await page.waitForTimeout(1500);
 evidence.walletInfo=await page.locator('#chain-wallet-info').innerText();
 if(!evidence.walletInfo.includes(fake))throw Error('Wallet connection failed: '+evidence.walletInfo);
 await page.locator('#chain-case-id').fill('PROBE-'+(process.env.GITHUB_RUN_ID??Date.now()));
 await page.locator('#chain-recipient').fill('0x'+'a'.repeat(40));
 await page.locator('#chain-attestor').fill('0x'+'b'.repeat(40));
 await page.locator('#chain-rule').fill('Read-only probe: no contract write permitted.');
 await page.locator('#chain-hours').fill('24');
 await page.locator('#gross-minor').fill('1000');
 await page.locator('#release-numerator').fill('1');
 await page.locator('#release-denominator').fill('2');
 await page.locator('#chain-action').selectOption('create_case');
 await page.locator('#chain-execute').click();
 await page.waitForTimeout(10000);
 evidence.output=(await page.locator('#chain-output').innerText()).slice(0,1400);
 evidence.result=evidence.walletRequest&&evidence.offchainSigningResult==='PASS'?'PASS_WALLET_CALL_AND_OFFCHAIN_SIGNATURE':'SDK_OR_SIGNER_FORMAT_ERROR';save();
 console.log('BROWSER_PRECHECK',JSON.stringify(evidence));
 if(evidence.result!=='PASS_WALLET_CALL_AND_OFFCHAIN_SIGNATURE')process.exitCode=1;
}catch(e){evidence.error=String(e).slice(0,1300);save();console.error('BROWSER_PROBE_ERROR',evidence.error);process.exitCode=1}
finally{await page.screenshot({path:'browser-probe/screenshot.png',fullPage:true}).catch(()=>{});await browser.close();save();}