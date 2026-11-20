const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/r/honest-restaurant-kudasan', { waitUntil: 'networkidle' });
  console.log('Title:', await page.textContent('h1'));
  const starBtns = await page.$$('.star-btn');
  if (starBtns[4]) await starBtns[4].click();
  await page.click('button:has-text("Continue to Dishes")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Generate AI Review Draft")');
  await page.waitForSelector('button:has-text("Copy & Open Google Reviews")', { timeout: 20000 });
  const link = await page.$eval('a:has-text("Didn\'t open automatically")', a => a.href);
  console.log('Honest direct fallback link:', link);
  await page.click('button:has-text("Copy & Open Google Reviews")');
  await page.waitForTimeout(500);
  const btns = await page.$$eval('div.fixed button', els => els.map(b => b.innerText.trim()).filter(Boolean));
  console.log('Honest Modal Buttons:', btns);
  await browser.close();
}

test().catch(console.error);
