const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps/search/Karnavati+Dabeli/');
  await page.waitForTimeout(4000);
  
  const places = await page.evaluate(() => {
    const results = [];
    const links = document.querySelectorAll('a[href*="/maps/place/"]');
    links.forEach(a => {
      const name = a.getAttribute('aria-label') || a.textContent.trim();
      const href = a.getAttribute('href');
      if (name && href && !results.some(r => r.name === name)) {
        const coordsMatch = href.match(/@([0-9.]+),([0-9.]+)/);
        results.push({
          name: name.replace(/\n+/g, ' '),
          href,
          lat: coordsMatch ? coordsMatch[1] : null,
          lng: coordsMatch ? coordsMatch[2] : null,
        });
      }
    });
    return results;
  });
  
  console.log('Google Maps results count:', places.length);
  console.log('Found branches:');
  console.log(JSON.stringify(places.slice(0, 8), null, 2));

  await browser.close();
}

run();
