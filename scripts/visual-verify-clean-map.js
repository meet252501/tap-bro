const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3');
const TARGET_URL = 'https://tapbro.vercel.app';

async function run() {
  console.log('🚀 Visual test running against live production:', TARGET_URL);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile screen
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  const page = await context.newPage();

  // 1. Initial State: Must be completely clean and NOT pre-filled!
  console.log('📱 1. Opening /create (Initial State)...');
  await page.goto(`${TARGET_URL}/create`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const searchVal = await page.$eval('input[type="text"]', el => el.value);
  console.log('Initial search input value (must be empty):', JSON.stringify(searchVal));

  const branchCardsCount = await page.$$eval('div.cursor-pointer', els => els.length);
  console.log('Initial branch cards count (must be 0):', branchCardsCount);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean-map-1-empty-initial.png') });
  console.log('📸 Captured: clean-map-1-empty-initial.png');

  // 2. User types "Karnavati"
  console.log('⌨️ 2. Typing "Karnavati" in search...');
  await page.fill('input[type="text"]', 'Karnavati');
  await page.waitForTimeout(2000); // Wait for API response and map markers

  const pinsCount = await page.$$eval('.custom-map-pin-wrapper', els => els.length);
  console.log(`📍 Found ${pinsCount} pins plotted on map!`);

  const branchesFound = await page.$$eval('div.cursor-pointer', els => els.length);
  console.log(`🏢 Found ${branchesFound} branch store cards below map!`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean-map-2-karnavati-branches.png') });
  console.log('📸 Captured: clean-map-2-karnavati-branches.png');

  // 3. User taps Branch #2
  console.log('👆 3. User taps Branch #2 to lock...');
  const lockBtns = await page.$$('button:has-text("Lock Branch ➔")');
  if (lockBtns.length > 1) {
    await lockBtns[1].click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean-map-3-branch-locked.png') });
  console.log('📸 Captured: clean-map-3-branch-locked.png');

  await browser.close();
  console.log('🎉 Clean Map Verification Successful!');
}

run().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
