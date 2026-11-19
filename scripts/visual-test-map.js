const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3');
const TARGET_URL = 'http://localhost:3000';

async function run() {
  console.log('🚀 Running Visual Test for Store Branch Map on:', TARGET_URL);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  const page = await context.newPage();

  // 1. Open /create
  console.log('📱 1. Opening /create...');
  await page.goto(`${TARGET_URL}/create`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-map-initial.png') });
  console.log('📸 Captured: visual-map-initial.png');

  // 2. Type "Karnavati" in search input
  console.log('⌨️ 2. Typing "Karnavati" in search...');
  const searchInput = await page.$('input[placeholder*="Karnavati" i], input[type="text"]');
  if (searchInput) {
    await searchInput.fill('Karnavati');
    await page.waitForTimeout(2000); // Wait for API response and map markers render
  }

  // Check how many pins are rendered on map
  const pins = await page.$$('.branch-marker-pin');
  console.log(`📍 Found ${pins.length} interactive pins on the map!`);

  // Check branch cards
  const branchCards = await page.$$('text=Lock Branch ➔');
  console.log(`🏢 Found ${branchCards.length} branch cards below map`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-map-karnavati-branches.png') });
  console.log('📸 Captured: visual-map-karnavati-branches.png');

  // 3. Click Branch #2
  console.log('👆 3. Selecting Branch #2...');
  if (branchCards.length > 1) {
    await branchCards[1].click();
    await page.waitForTimeout(1000);
  } else if (pins.length > 0) {
    await pins[0].click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-map-locked-branch.png') });
  console.log('📸 Captured: visual-map-locked-branch.png');

  // 4. Test "Pick Another Branch on Map"
  const changeBranchBtn = await page.$('button:has-text("Pick Another Branch on Map")');
  if (changeBranchBtn) {
    console.log('🔄 4. Clicking "Pick Another Branch on Map"...');
    await changeBranchBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-map-switched-back.png') });
    console.log('📸 Captured: visual-map-switched-back.png');
  }

  await browser.close();
  console.log('🎉 Store Branch Map visual test completed successfully!');
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
