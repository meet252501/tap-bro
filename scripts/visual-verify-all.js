const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3');
const TARGET_URL = 'https://tapbro.vercel.app';

async function run() {
  console.log('🚀 Starting Comprehensive Visual Verification against:', TARGET_URL);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14/15 screen
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  const page = await context.newPage();

  // ==========================================
  // TEST 1: Owner "Search & Lock" Setup Flow (/create)
  // ==========================================
  console.log('\n--- 1. Testing Owner Search & Lock Setup Flow (/create) ---');
  await page.goto(`${TARGET_URL}/create`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-1-owner-setup-initial.png') });
  console.log('📸 1A. verify-1-owner-setup-initial.png');

  // Type in search box
  const searchInput = await page.$('input[placeholder*="Eat Panjab" i], input[placeholder*="Maps" i]');
  if (searchInput) {
    console.log('Found search input! Typing "Eat Panjab, Gandhinagar"...');
    await searchInput.fill('Eat Panjab, Gandhinagar');
    await page.waitForTimeout(1500); // Wait for autocomplete debounce
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-1-owner-autocomplete-dropdown.png') });
    console.log('📸 1B. verify-1-owner-autocomplete-dropdown.png');

    // Click first suggestion button
    const firstOption = await page.$('div.divide-y button, div.max-h-72 button');
    if (firstOption) {
      console.log('Clicking first suggestion from dropdown...');
      await firstOption.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-1-owner-locked-preview.png') });
      console.log('📸 1C. verify-1-owner-locked-preview.png');
    }
  }

  // ==========================================
  // TEST 2: Diner 1-Click Review Flow (/r/eat-panjab)
  // ==========================================
  console.log('\n--- 2. Testing Diner 1-Click Review Flow (/r/eat-panjab) ---');
  await page.goto(`${TARGET_URL}/r/eat-panjab`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Step 1: Select stars
  const starButtons = await page.$$('button:has(svg.lucide-star)');
  console.log(`Found ${starButtons.length} rating star buttons`);
  for (let i = 4; i < starButtons.length; i += 5) {
    await starButtons[i].click().catch(() => {});
    await page.waitForTimeout(80);
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-2-diner-step1-ratings.png') });
  console.log('📸 2A. verify-2-diner-step1-ratings.png');

  // Continue to dishes
  const continueBtn = await page.$('button:has-text("Continue to Dishes")');
  if (continueBtn) {
    await continueBtn.click();
    await page.waitForTimeout(800);
  }

  // Step 2: Select dishes
  const dishChips = await page.$$('button:has-text("Crispy Veg Spring Roll"), button:has-text("Dal Makhani"), button:has-text("Butter Garlic Naan")');
  console.log(`Found ${dishChips.length} dish chips`);
  for (const chip of dishChips.slice(0, 2)) {
    await chip.click();
    await page.waitForTimeout(150);
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-2-diner-step2-dishes.png') });
  console.log('📸 2B. verify-2-diner-step2-dishes.png');

  // Generate Review
  const genBtn = await page.$('button:has-text("Generate AI Review Draft")');
  if (genBtn) {
    await genBtn.click();
    console.log('Waiting for AI generation on Step 3...');
    await page.waitForTimeout(4000);
  }

  // Step 3: Review Draft
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-2-diner-step3-draft.png') });
  console.log('📸 2C. verify-2-diner-step3-draft.png');

  // Test Copy & Open Google Reviews
  let redirectedUrl = '';
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      redirectedUrl = frame.url();
      console.log('⚡ Redirected to:', redirectedUrl);
    }
  });

  const copyAndOpenBtn = await page.$('button:has-text("Copy & Open Google Reviews")');
  if (copyAndOpenBtn) {
    console.log('Tapping "Copy & Open Google Reviews 🚀"...');
    await copyAndOpenBtn.click();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-2-diner-step3-google-maps.png') });
    console.log('📸 2D. verify-2-diner-step3-google-maps.png');
    console.log('Final URL after tap:', page.url());
  }

  // ==========================================
  // TEST 3: Admin Zero-Scroll Hub (/admin/eat-panjab)
  // ==========================================
  console.log('\n--- 3. Testing Admin Zero-Scroll Hub (/admin/eat-panjab) ---');
  await page.goto(`${TARGET_URL}/admin/eat-panjab`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // PIN Login if required
  const pinInput = await page.$('input[type="password"], input[placeholder*="PIN" i]');
  if (pinInput) {
    console.log('Entering PIN 2525...');
    await pinInput.fill('2525');
    const submitBtn = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Unlock")');
    if (submitBtn) await submitBtn.click();
    await page.waitForTimeout(1000);
  }

  // Pill 1: Reviews
  const reviewsPill = await page.$('button:has-text("Reviews")');
  if (reviewsPill) {
    await reviewsPill.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-3-admin-reviews-zero-scroll.png') });
  console.log('📸 3A. verify-3-admin-reviews-zero-scroll.png');

  // Pill 2: Trends
  const trendsPill = await page.$('button:has-text("Trends")');
  if (trendsPill) {
    await trendsPill.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-3-admin-trends.png') });
    console.log('📸 3B. verify-3-admin-trends.png');
  }

  // Pill 3: 30-Day Cycle
  const cyclePill = await page.$('button:has-text("Cycle")');
  if (cyclePill) {
    await cyclePill.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify-3-admin-cycle.png') });
    console.log('📸 3C. verify-3-admin-cycle.png');
  }

  await browser.close();
  console.log('\n🎉 ALL VISUAL VERIFICATIONS COMPLETE!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
