const { test, expect } = require('@playwright/test');

const apps = [
  {name:'ParcelCourt', url:'https://parcelcourt-genlayer.vercel.app', id:'GN-parcelcourt-39111325157', verdict:'SUPPORTED_DELIVERY'},
  {name:'ShiftFair', url:'https://shiftfair-genlayer.vercel.app', id:'GN-shiftfair-39111325157', verdict:'APPROVED'},
];
for (const app of apps) {
  test(app.name + ' production: real GenLayer case read without fixtures', async ({page}) => {
    test.setTimeout(90000);
    const response=await page.goto(app.url,{waitUntil:'domcontentloaded'});
    expect(response.status()).toBe(200);
    await expect(page.locator('nav button[data-page="On-chain"]')).toBeVisible();
    await page.locator('nav button[data-page="On-chain"]').click();
    await expect(page.locator('#chain-inspect')).toBeVisible();
    await expect(page.locator('#chain-execute')).toBeEnabled();
    await page.locator('#chain-case-id').fill(app.id);
    await page.locator('#chain-read').click();
    await expect(page.locator('#chain-output')).toContainText(app.verdict,{timeout:60000});
  });
  test(app.name + ' cannot submit without user-supplied wallet',async ({page})=>{
    const response=await page.goto(app.url,{waitUntil:'domcontentloaded'});
    expect(response.status()).toBe(200);
    await page.locator('nav button[data-page="On-chain"]').click();
    await page.locator('#chain-wallet').click();
    await expect(page.locator('#chain-output')).toContainText('EIP-1193 browser wallet is required');
    await expect(page.locator('#chain-output')).not.toContainText('FINALIZED_AND_STATE_VERIFIED');
  });
}
