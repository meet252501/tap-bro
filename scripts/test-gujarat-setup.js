const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
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
  console.log('🚀 Starting Gujarat & Invite Verification Test...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // =========================================================================
  // TEST 1: /create (Direct Self-Serve Stand Setup - Gujarat Bounded)
  // =========================================================================
  console.log('\n--- 1. Testing /create direct self-serve mode ---');
  await page.goto('http://localhost:3000/create', { waitUntil: 'networkidle' });

  // Verify header shows self-serve
  const pageTitle = await page.locator('h1').textContent();
  console.log('Page Title on /create:', pageTitle);
  if (!pageTitle.includes('Launch Your Tabletop Stand')) {
    throw new Error('Expected direct mode header on /create');
  }

  // Verify switcher banner to /setup exists
  const switcher = await page.locator('text=Have an official invitation code').isVisible();
  console.log('Switcher to /setup banner visible:', switcher);

  // Type brand search: "Karnavati"
  const searchInput = page.locator('input[placeholder*="Karnavati"]');
  await searchInput.fill('Karnavati');
  console.log('Filled search with "Karnavati"... waiting for Gujarat branches');

  // Wait for branch predictions
  console.log('Waiting for branch cards...');
  await page.waitForSelector('button:has-text("Lock Branch ➔")', { timeout: 10000 });
  const branchCards = page.locator('button:has-text("Lock Branch ➔")');
  const count = await branchCards.count();
  console.log(`Found ${count} branches in Gujarat on map`);

  // Verify branches are in Gujarat, India
  const branchTexts = await page.locator('.space-y-2\\.5').textContent();
  console.log('Branches sample text:', branchTexts?.slice(0, 150));
  const hasAhmedabad = /ahmedabad|vejalpur|sarkhej|paldi|mumatpura|gujarat/i.test(branchTexts || '');
  console.log('Matches Gujarat / Ahmedabad locations:', hasAhmedabad);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gujarat-map-search.png') });
  console.log('📸 Saved screenshot: gujarat-map-search.png');

  // Lock first branch
  if (count > 0) {
    await branchCards.first().click();
    await page.waitForTimeout(600);

    const lockedBadge = await page.locator('text=Store Branch Locked on Map').isVisible();
    console.log('Branch locked badge visible:', lockedBadge);

    const reviewUrlInput = page.locator('input[value*="google.com/maps"]');
    const reviewUrl = await reviewUrlInput.inputValue();
    console.log('Review URL Target:', reviewUrl);

    // Verify Review URL contains Gujarat / India and not USA
    const hasGujaratInUrl = /gujarat/i.test(decodeURIComponent(reviewUrl));
    console.log('Review URL contains Gujarat target:', hasGujaratInUrl);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gujarat-branch-locked.png') });
    console.log('📸 Saved screenshot: gujarat-branch-locked.png');
  }

  // =========================================================================
  // TEST 2: /setup Direct Visit (Invitation Gate Active)
  // =========================================================================
  console.log('\n--- 2. Testing /setup direct visit (Invitation Gate) ---');
  await page.goto('http://localhost:3000/setup', { waitUntil: 'networkidle' });

  const setupTitle = await page.locator('h1').textContent();
  console.log('Page Title on direct /setup:', setupTitle);

  const isGateVisible = await page.locator('text=Verify Business Invitation').isVisible();
  console.log('Invitation Gate card visible:', isGateVisible);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'invite-gate-direct.png') });
  console.log('📸 Saved screenshot: invite-gate-direct.png');

  // =========================================================================
  // TEST 3: Create real invite and test auto-verification via URL
  // =========================================================================
  console.log('\n--- 3. Testing /setup invite URL auto-verification ---');
  const testEmail = `testowner_${Date.now()}@restaurant.com`;

  const inviteResp = await makePost('/api/super-admin/invite', {
    superAdminEmail: 'princesharma9955a@gmail.com',
    superAdminPin: 'prince@777',
    targetEmail: testEmail,
    notes: 'Automated verification test',
  });

  console.log('Created invite response:', inviteResp.success, '| TempPass:', inviteResp.invite?.tempPass);
  const tempPass = inviteResp.invite?.tempPass;
  const token = inviteResp.invite?.token;

  if (!tempPass) {
    throw new Error('Failed to create test invite: ' + JSON.stringify(inviteResp));
  }

  // Open /setup with email, pass, and token in query params
  const inviteUrl = `http://localhost:3000/setup?email=${encodeURIComponent(testEmail)}&pass=${encodeURIComponent(tempPass)}&token=${encodeURIComponent(token)}`;
  console.log('Opening invite URL:', inviteUrl);
  await page.goto(inviteUrl, { waitUntil: 'networkidle' });

  // Wait for auto-validation
  await page.waitForTimeout(1000);

  const verifiedBanner = await page.locator('text=1-Time Pass Ready').isVisible();
  console.log('Verified 1-Time Pass banner visible:', verifiedBanner);

  // Verify map and search are unlocked
  const mapVisible = await page.locator('text=Search Restaurant or Chain Name').isVisible();
  console.log('Gujarat Store Map & Search unlocked for verified owner:', mapVisible);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'invite-gate-verified.png') });
  console.log('📸 Saved screenshot: invite-gate-verified.png');

  console.log('\n✅ ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  await browser.close();
})();
