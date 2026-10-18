import{chromium}from'playwright';import fs from'node:fs';
const apps=[{name:'ParcelCourt',url:'https://parcelcourt-genlayer.vercel.app',tab:'Cases'},{name:'ShiftFair',url:'https://shiftfair-genlayer.vercel.app',tab:'Claims'}];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});fs.mkdirSync('wallet-probe',{recursive:true});let failed=false;
for(const app of apps){
 const page=await browser.newPage({viewport:{width:1440,height:900}}),walletRequests=[],rpcMethods=[],pageErrors=[];
 try{
   await page.exposeFunction('__walletProbeRequest',async(req)=>{rpcMethods.push(req.method);if(req.method==='eth_sendTransaction'||req.method==='eth_sendRawTransaction'){walletRequests.push({method:req.method,txParams:req.params});throw Error('User rejected request (test-only provider; no broadcast)');}if(req.method==='eth_requestAccounts'||req.method==='eth_accounts')return ['0x1234567890abcdef1234567890abcdef12345678'];if(req.method==='eth_chainId')return '0xf22f';if(req.method==='wallet_switchEthereumChain'||req.method==='wallet_addEthereumChain')return null;if(req.method==='eth_getBalance')return '0xffffffffffff';if(req.method==='eth_blockNumber')return '0x1';if(req.method==='eth_getTransactionCount')return '0x0';if(req.method==='eth_estimateGas')return '0x7a1200';throw Error('Unsupported wallet probe RPC method '+req.method);});
   await page.addInitScript(()=>{window.ethereum={isMetaMask:true,isConnected:()=>true,request:(req)=>window.__walletProbeRequest(req),on:()=>{},removeListener:()=>{}};});
   await page.route('**/*',async route=>{if(route.request().isNavigationRequest()&&route.request().resourceType()==='document'&&route.request().url().startsWith(app.url)){const response=await route.fetch();const html=await response.text();if(!html.includes('window.RELEASE_QUALIFIED=false'))throw Error('Release flag not found in production document');await route.fulfill({response,body:html.replace('window.RELEASE_QUALIFIED=false','window.RELEASE_QUALIFIED=true')});}else await route.continue();});
   page.on('pageerror',e=>pageErrors.push(String(e).slice(0,300)));
   await page.goto(app.url,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('nav button[data-page="On-chain"]').click({timeout:20000});
   await page.locator('#chain-execute').waitFor({timeout:15000});
   if(!await page.locator('#chain-execute').isEnabled())throw Error('Test-only release bypass did not unlock signing');
   await page.locator('#chain-wallet').click();
   await page.waitForTimeout(1300);
   const walletInfo=await page.locator('#chain-wallet-info').innerText();
   if(!walletInfo.includes('0x1234567890abcdef1234567890abcdef12345678'))throw Error('Wallet connect failed: '+walletInfo);
   await page.locator('#chain-case-id').fill('WALLETPROBE-'+(process.env.GITHUB_RUN_ID||'LOCAL')+'-'+app.name);
   await page.locator('#chain-recipient').fill('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
   await page.locator('#chain-attestor').fill('0xfedcbafedcbafedcbafedcbafedcbafedcbafedc');
   await page.locator('#chain-rule').fill('Cure by 2026-10-20; evidentiary challenge available.');
   await page.locator('#chain-hours').fill('24');
   if(app.name==='ShiftFair'){await page.locator('#requested-minutes').fill('120');await page.locator('#max-minutes').fill('90')}
   await page.locator('#chain-action').selectOption('create_case');
   await page.locator('#chain-execute').click();
   await page.waitForTimeout(4000);
   const output=await page.locator('#chain-output').innerText();
   if(walletRequests.length!==1)throw Error('Expected one EIP-1193 signing submission RPC; observed '+walletRequests.length+', methods '+rpcMethods.join(',')+', output '+output.slice(0,500));
   if(/SUBMITTED_UNVERIFIED|VERIFIED_FINALIZED_EXECUTION_AND_STATE/.test(output))throw Error('Rejected wallet signing request misrepresented as submitted');
   const result={app:app.name,pass:true,provider:'EPHEMERAL_REJECT_ONLY_NO_TX',method:walletRequests[0].method,walletAddress:'0x1234567890abcdef1234567890abcdef12345678',txKeys:Object.keys(walletRequests[0].txParams?.[0]??{}),noBroadcast:true,releaseFlagPatchedInIsolatedTestOnly:true,connected:walletInfo,methodSequence:rpcMethods,pageErrors,output:output.slice(0,500)};
   fs.writeFileSync('wallet-probe/'+app.name+'.json',JSON.stringify(result,null,2));console.log('WALLET_RPC_PATH_PASS='+app.name);
 }catch(e){failed=true;let output='';try{output=await page.locator('#chain-output').innerText({timeout:500})}catch{}const result={app:app.name,pass:false,error:String(e).slice(0,1400),methods:rpcMethods,pageErrors,output:output.slice(0,700)};fs.writeFileSync('wallet-probe/'+app.name+'.json',JSON.stringify(result,null,2));console.error('WALLET_RPC_PATH_FAIL='+app.name+':'+result.error);}
 finally{await page.screenshot({path:'wallet-probe/'+app.name+'.png',fullPage:true}).catch(()=>{});await page.close()}
}
await browser.close();if(failed)process.exitCode=1;