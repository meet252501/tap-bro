const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3');

async function capture() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });

  const page = await context.newPage();

  console.log('1. Capturing /admin (Partner Portal Login)...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-v2-admin.png') });

  console.log('2. Capturing /setup (Setup Form)...');
  await page.goto('http://localhost:3000/setup', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-v2-setup.png') });

  console.log('3. Capturing /super-admin (Super Admin Login)...');
  await page.goto('http://localhost:3000/super-admin', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-v2-superadmin.png') });

  await browser.close();
  console.log('Screenshots captured successfully!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
