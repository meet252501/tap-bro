const { chromium } = require('playwright');
const path = require('path');

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  const outDir = 'C:\\Users\\Meet Sutariya\\.gemini\\antigravity\\brain\\3610ed57-98d7-46e7-be59-421186d757d3';

  console.log('Capturing Diner page...');
  await page.goto('http://localhost:3000/r/demo-taj-bistro', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'mobile-diner-luxury.png'), fullPage: false });

  console.log('Capturing Diner page with ratings...');
  const firstStars = page.locator('.star-btn');
  if (await firstStars.count() > 0) {
    await firstStars.nth(4).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, 'mobile-diner-rated.png'), fullPage: false });
  }

  console.log('Capturing Home page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'mobile-home-luxury.png'), fullPage: false });

  console.log('Capturing Setup page...');
  await page.goto('http://localhost:3000/setup', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'mobile-setup-luxury.png'), fullPage: false });

  console.log('Capturing Admin page...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'mobile-admin-luxury.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
