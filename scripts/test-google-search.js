const { chromium } = require('playwright');
const path = require('path');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  const page = await context.newPage();
  
  await page.goto('https://www.google.com/search?q=Eat+Punjab+Gandhinagar+reviews');
  await page.waitForTimeout(3000);
  
  const content = await page.content();
  const placeIdMatch = content.match(/data-pid="([^"]+)"/) || content.match(/data-place-id="([^"]+)"/) || content.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  console.log('Search page placeId match:', placeIdMatch ? placeIdMatch[0] : 'None');

  await page.screenshot({ path: path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3/visual-google-search-reviews.png') });

  await browser.close();
}

run();
