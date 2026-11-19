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
  
  console.log('Navigating to Eat Punjab on mobile...');
  await page.goto('https://maps.google.com/?cid=3682833924407842058');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3/visual-google-maps-mobile-eat-punjab.png') });
  console.log('Saved visual-google-maps-mobile-eat-punjab.png');

  await browser.close();
}

run();
