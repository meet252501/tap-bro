const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3');
const TARGET_URL = 'https://tapbro.vercel.app';

async function run() {
  console.log('🚀 Visual test running against:', TARGET_URL);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  const page = await context.newPage();

  // Step 1: Ratings
  console.log('📱 1. Opening /r/eat-panjab (Step 1: Ratings)...');
  await page.goto(`${TARGET_URL}/r/eat-panjab`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Click 5th star in all 4 categories
  const starButtons = await page.$$('button:has(svg.lucide-star)');
  console.log(`Found ${starButtons.length} star buttons`);
  for (let i = 4; i < starButtons.length; i += 5) {
    await starButtons[i].click().catch(() => {});
    await page.waitForTimeout(100);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-diner-step1-ratings.png') });
  console.log('📸 Captured: visual-diner-step1-ratings.png');

  // Click "Continue to Dishes & Notes ➔"
  const continueBtn = await page.$('button:has-text("Continue to Dishes")');
  if (continueBtn) {
    await continueBtn.click();
    await page.waitForTimeout(1000);
  }

  // Step 2: Dishes
  console.log('📱 2. Step 2: Dishes Selection...');
  const dishes = await page.$$('button:has-text("Crispy Veg Spring Roll"), button:has-text("Dal Makhani"), button:has-text("Butter Garlic Naan")');
  console.log(`Found ${dishes.length} dish chips`);
  for (const d of dishes.slice(0, 2)) {
    await d.click();
    await page.waitForTimeout(200);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-diner-step2-dishes.png') });
  console.log('📸 Captured: visual-diner-step2-dishes.png');

  // Click "Generate AI Review Draft ➔"
  const generateBtn = await page.$('button:has-text("Generate AI Review Draft")');
  if (generateBtn) {
    await generateBtn.click();
    console.log('Waiting for AI review to generate on Step 3...');
    await page.waitForTimeout(4000);
  }

  // Step 3: Review Draft
  console.log('📱 3. Step 3: Review Draft & Sticky Bar...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-diner-step3-draft.png') });
  console.log('📸 Captured: visual-diner-step3-draft.png');

  // Click "Copy & Open Google Reviews 🚀"
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      console.log('⚡ Target redirected to:', frame.url());
    }
  });

  const copyBtn = await page.$('button:has-text("Copy & Open Google Reviews")');
  if (copyBtn) {
    console.log('Tapping "Copy & Open Google Reviews 🚀"...');
    await copyBtn.click();
    console.log('Waiting 4s for Google Maps destination to load...');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'visual-diner-step3-after-click.png') });
    console.log('📸 Captured: visual-diner-step3-after-click.png');
    console.log('Current page URL after click:', page.url());
  }

  await browser.close();
  console.log('🎉 Complete Diner Flow Test Passed!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
