const { chromium } = require('playwright');
const path = require('path');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  const page = await context.newPage();

  console.log('Opening https://tapbro.vercel.app/create on mobile...');
  await page.goto('https://tapbro.vercel.app/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take screenshot of the map specifically
  const mapEl = await page.$('.leaflet-container');
  if (mapEl) {
    await mapEl.screenshot({ path: path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3/debug-map-only.png') });
    console.log('Saved debug-map-only.png');
  }

  await page.screenshot({ path: path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3/debug-mobile-page.png') });
  console.log('Saved debug-mobile-page.png');

  // Check tile images
  const tileSrcs = await page.$$eval('.leaflet-tile', tiles => tiles.map(t => ({ src: t.getAttribute('src'), complete: t.complete, naturalWidth: t.naturalWidth })));
  console.log('Tile sources count:', tileSrcs.length);
  console.log('Sample tile:', tileSrcs[0]);

  await browser.close();
}

run();
