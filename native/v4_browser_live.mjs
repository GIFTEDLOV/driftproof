import { chromium } from 'playwright';
import fs from 'node:fs';
const apps=[
{name:'ParcelCourt',url:'https://parcelcourt-genlayer.vercel.app',known:'GLV4-parcelcourt-39138161003',tab:'Cases'},
{name:'ShiftFair',url:'https://shiftfair-genlayer.vercel.app',known:'GLV4-shiftfair-39138161003',tab:'Claims'}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let failed=false;
fs.mkdirSync('browser-proof',{recursive:true});
for(const app of apps){const page=await browser.newPage({viewport:{width:1440,height:900}});
try{
  let errors=[];page.on('pageerror',e=>errors.push(String(e).slice(0,250)));
  await page.goto(app.url,{waitUntil:'domcontentloaded',timeout:35000});
  await page.waitForTimeout(2200);
  const navSelector=`nav button[data-page="${app.tab}"]`;
  let visible=false;
  for(let attempt=0;attempt<3;attempt++){
    if(await page.locator(navSelector).count()){visible=true;break;}
    if(attempt<2){await page.reload({waitUntil:'domcontentloaded',timeout:35000});await page.waitForTimeout(1500);}
  }
  if(!visible)throw Error('LIVE_DOM_MISSING_NAV: '+JSON.stringify({url:page.url(),title:await page.title(),nav:await page.locator('nav').count(),head:(await page.locator('body').innerText()).slice(0,500)}));
  await page.locator(navSelector).click({timeout:15000});
  await page.locator('#case-filter').waitFor({timeout:20000});
  await page.waitForFunction((id)=>document.querySelector('#main-content')?.innerText?.includes(id)||document.querySelector('#main-content')?.innerText?.includes('Live read failed:'),app.known,{timeout:55000});
  const cases=await page.locator('#main-content').innerText();
  if(!cases.includes(app.known))throw Error('Network returned no known verified case '+cases.slice(0,1000));
  if(cases.includes('SAMPLE DATA')||cases.includes('Synthetic timetable'))throw Error('Synthetic content present on canonical Cases page');
  await page.locator('nav button[data-page="On-chain"]').click();
  const content=await page.locator('#main-content').innerText();
  if(!content.includes('PRE-RELEASE')||!content.includes('Locked'))throw Error('Security lock not visible');
  if(await page.locator('#chain-execute').isEnabled())throw Error('Signing button unexpectedly enabled');
  if(errors.length)throw Error('Runtime page errors: '+errors.join(' | '));
  await page.screenshot({path:'browser-proof/'+app.name+'-onchain.png',fullPage:true});
  fs.writeFileSync('browser-proof/'+app.name+'.json',JSON.stringify({app:app.name,url:app.url,verifiedCase:app.known,canonicalCaseVisible:true,signingLocked:true,success:true},null,2));
  console.log('BROWSER_CANONICAL_PASS='+app.name);
}catch(e){failed=true;fs.writeFileSync('browser-proof/'+app.name+'.json',JSON.stringify({app:app.name,success:false,error:String(e).slice(0,1100)},null,2));console.error('BROWSER_CANONICAL_FAIL='+app.name+' '+String(e).slice(0,850));}
finally{await page.close()}
}
await browser.close();if(failed)process.exitCode=1;