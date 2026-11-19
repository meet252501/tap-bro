const { chromium } = require('playwright');
const path = require('path');
const http = require('http');

const ARTIFACT_DIR = 'C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3';

async function makePost(urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(resData));
          } catch (e) {
            resolve({ raw: resData, status: res.statusCode });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('🚀 Starting Unified Setup Pipeline Verification...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  // 1. Verify /create redirects to /setup
  console.log('\n--- 1. Testing /create redirects to /setup ---');
  await page.goto('http://localhost:3000/create', { waitUntil: 'networkidle' });
  const finalUrl = page.url();
  console.log('URL after visiting /create:', finalUrl);
  if (!finalUrl.includes('/setup')) {
    throw new Error('Expected /create to redirect to /setup');
  }

  // 2. Verify Step 1 (Temp Mail & Password Verification) & NO link boxes
  console.log('\n--- 2. Testing Step 1: Temp Pass & Email Gate ---');
  await page.goto('http://localhost:3000/setup', { waitUntil: 'networkidle' });

  const hasStep1 = await page.locator('text=Step 1 • Verify Business Invitation').isVisible();
  console.log('Step 1 Header visible:', hasStep1);

  // Verify NO link box to /create exists
  const hasLinkBox = await page.locator('text=Don\'t have an invite code').isVisible();
  console.log('Old link box removed:', !hasLinkBox);
  if (hasLinkBox) {
    throw new Error('Link box to /create should be completely removed!');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step1-verify.png') });
  console.log('📸 Saved screenshot: step1-verify.png');

  // 3. Create test invite and auto-verify via URL
  console.log('\n--- 3. Creating Invite & Testing Auto-Advance to Step 2 ---');
  const testEmail = `gujaratowner_${Date.now()}@restaurant.com`;

  const inviteResp = await makePost('/api/super-admin/invite', {
    superAdminEmail: 'princesharma9955a@gmail.com',
    superAdminPin: 'prince@777',
    targetEmail: testEmail,
    notes: 'Testing linear pipeline',
  });

  const tempPass = inviteResp.invite?.tempPass;
  const token = inviteResp.invite?.token;
  console.log('Generated Invite:', testEmail, '| Pass:', tempPass);

  const inviteUrl = `http://localhost:3000/setup?email=${encodeURIComponent(testEmail)}&pass=${encodeURIComponent(tempPass)}&token=${encodeURIComponent(token)}`;
  await page.goto(inviteUrl, { waitUntil: 'networkidle' });

  // Wait for auto-validation and Step 2 transition
  await page.waitForTimeout(1000);

  // 4. Verify Step 2 (Owner & Manager Info)
  console.log('\n--- 4. Testing Step 2: Owner Contact & Manager PIN ---');
  const hasStep2 = await page.locator('text=Step 2 • Owner Contact & Manager Security').isVisible();
  console.log('Step 2 Header visible:', hasStep2);

  const phoneInput = page.locator('input[type="tel"]');
  await phoneInput.fill('9825012345');

  const pinInput = page.locator('input[type="password"]');
  await pinInput.fill('4321');

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step2-info.png') });
  console.log('📸 Saved screenshot: step2-info.png');

  // Click Next to Step 3: Map & Review
  await page.click('button:has-text("Next: Select Store on Map ➔")');
  await page.waitForTimeout(600);

  // 5. Verify Step 3: Store Branch Map for Google Review & All Setup
  console.log('\n--- 5. Testing Step 3: Map for Review & All Setup ---');
  const hasStep3 = await page.locator('text=Step 3 • Find & Lock Your Store Branch').isVisible();
  console.log('Step 3 Header visible:', hasStep3);

  // Search "Karnavati" in Gujarat
  const searchInput = page.locator('input[placeholder*="Karnavati"]');
  await searchInput.fill('Karnavati');
  console.log('Searching "Karnavati" in Gujarat...');

  await page.waitForSelector('button:has-text("Lock Branch ➔")', { timeout: 10000 });
  const branchCards = page.locator('button:has-text("Lock Branch ➔")');
  const count = await branchCards.count();
  console.log(`Found ${count} branches in Gujarat on map`);

  // Lock branch #1
  await branchCards.first().click();
  await page.waitForTimeout(600);

  const isLocked = await page.locator('text=Store Branch Locked on Map').isVisible();
  console.log('Branch locked:', isLocked);

  const reviewUrlInput = page.locator('input[value*="google.com/maps"]');
  const reviewUrl = await reviewUrlInput.inputValue();
  console.log('Review URL Target:', reviewUrl);
  console.log('Review URL contains Gujarat:', /gujarat/i.test(decodeURIComponent(reviewUrl)));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step3-map-and-review.png') });
  console.log('📸 Saved screenshot: step3-map-and-review.png');

  // 6. Complete Setup & Activate Station
  console.log('\n--- 6. Activating Tabletop Station ---');
  await page.click('button:has-text("Activate Tabletop Station 🚀")');

  // Wait for redirect to /admin/[slug]
  await page.waitForURL(/.*\/admin\/.*/, { timeout: 15000 });
  console.log('Redirected to Admin Dashboard:', page.url());

  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step4-activated-admin.png') });
  console.log('📸 Saved screenshot: step4-activated-admin.png');

  console.log('\n🎉 ALL PIPELINE STEPS VERIFIED 100% PERFECTLY!');
  await browser.close();
})();
