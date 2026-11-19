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

  console.log('Navigating to diner flow...');
  await page.goto('http://localhost:3000/r/demo-taj-bistro', { waitUntil: 'networkidle' });

  // Rate 5 stars
  const firstStars = page.locator('.star-btn');
  if (await firstStars.count() > 0) {
    await firstStars.nth(4).click();
  }

  // Continue to Step 2
  await page.click('button:has-text("Continue to Dishes")');
  await page.waitForSelector('text=Select Dishes', { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'mobile-diner-dishes.png'), fullPage: false });

  // Select some dishes
  const dishPills = page.locator('button:has-text("Paneer Tikka"), button:has-text("Dal Makhani"), button:has-text("Dum Biryani")');
  const count = await dishPills.count();
  for (let i = 0; i < count; i++) {
    await dishPills.nth(i).click();
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, 'mobile-diner-dishes-selected.png'), fullPage: false });

  // Continue to Step 3
  await page.click('button:has-text("Generate AI Review")');
  await page.waitForSelector('textarea', { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'mobile-diner-draft.png'), fullPage: false });

  await browser.close();
  console.log('Dishes and Draft captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
