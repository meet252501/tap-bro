const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const consoleMsgs = [];
  page.on('console', msg => consoleMsgs.push(msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to https://tapbro.vercel.app/create...');
  await page.goto('https://tapbro.vercel.app/create', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  
  console.log('Console messages:', consoleMsgs);
  
  const mapEl = await page.$('.leaflet-container');
  console.log('Leaflet container found:', Boolean(mapEl));
  if (mapEl) {
    const box = await mapEl.boundingBox();
    console.log('Map bounding box:', box);
  }

  const tiles = await page.$$('.leaflet-tile');
  console.log('Tiles count:', tiles.length);

  // Check what is rendered on screen
  const textContent = await page.evaluate(() => document.body.innerText);
  console.log('Page visible text sample:', textContent.slice(0, 300));

  await browser.close();
}

run();
