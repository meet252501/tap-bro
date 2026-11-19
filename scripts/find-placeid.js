const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps/place/Eat+Punjab/@23.1846652,72.6391805,17z/data=!3m1!4b1!4m6!3m5!1s0x395c2b0061eee927:0x331c0df11716550a!8m2!3d23.1846652!4d72.6391805!16s%2Fg%2F11w9nw03wd');
  await page.waitForTimeout(4000);
  
  const writeReviewBtn = await page.$('button[aria-label="Write a review"]');
  if (writeReviewBtn) {
    console.log('Clicking Write a review button...');
    await writeReviewBtn.click();
    await page.waitForTimeout(3000);
    console.log('Current page URL after click:', page.url());
  }

  await browser.close();
}

run();
