const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/Meet Sutariya/.gemini/antigravity/brain/3610ed57-98d7-46e7-be59-421186d757d3');
const BASE_URL = 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  const page = await context.newPage();

  // Step 1: Create an invite
  const testEmail = `bistro.owner.${Date.now()}@tapbro.test`;
  const inviteRes = await fetch(`${BASE_URL}/api/super-admin/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      superAdminEmail: 'princesharma9955a@gmail.com',
      superAdminPin: 'prince@777',
      targetEmail: testEmail,
      notes: 'Visual inspection test',
    }),
  });
  const inviteData = await inviteRes.json();
  const invite = inviteData.invite;
  console.log('Invite created:', invite.tempPass);

  // Step 2: Open Setup with token
  const setupUrl = `${BASE_URL}/setup?email=${encodeURIComponent(testEmail)}&pass=${invite.tempPass}&token=${invite.token}`;
  await page.goto(setupUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-setup-unlocked.png') });
  console.log('Captured setup unlocked');

  // Click "Where do I find this?" in Setup
  try {
    const helpBtn = await page.getByRole('button', { name: /Where do I find this\?/i });
    if (helpBtn) {
      await helpBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-setup-google-help.png') });
      console.log('Captured setup with google review guide expanded');
    }
  } catch (e) {
    console.log('Help btn click error:', e.message);
  }

  // Step 3: Fill Setup form
  await page.fill('input[placeholder="Enter your restaurant name"]', 'Bistro Varanasi');
  await page.fill('input[placeholder="e.g. 9876543210"]', '9876543210');
  await page.fill('input[placeholder="4-digit PIN (e.g. 1234)"]', '1234');
  await page.fill('input[placeholder="e.g. Italian, Cafe, North Indian"]', 'North Indian & Chaat Lounge');
  await page.fill('input[placeholder="https://g.page/r/your-restaurant/review"]', 'https://g.page/r/bistro-varanasi/review');

  // Add 2 dishes
  await page.fill('input[placeholder="e.g. Paneer Tikka, Cold Brew"]', 'Banarasi Tamatar Chaat');
  await page.getByRole('button', { name: /Add/i }).click();
  await page.fill('input[placeholder="e.g. Paneer Tikka, Cold Brew"]', 'Dal Makhani Gold');
  await page.getByRole('button', { name: /Add/i }).click();

  await page.getByRole('button', { name: /Activate Tabletop Station/i }).click();
  await page.waitForTimeout(2500);

  // Capture Admin Reviews Tab
  console.log('Current URL after setup:', page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-admin-reviews.png') });
  console.log('Captured Admin Reviews Tab');

  // Simulate a review in Admin
  try {
    const simBtn = await page.getByRole('button', { name: /Simulate Review/i });
    if (simBtn) {
      await simBtn.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-admin-simulated.png') });
      console.log('Captured Admin with simulated review');
    }
  } catch (e) {
    console.log('Sim btn error:', e.message);
  }

  // Switch to Menu Tab
  try {
    await page.getByRole('button', { name: /Menu/i }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-admin-menu.png') });
    console.log('Captured Admin Menu Tab');
  } catch (e) {}

  // Switch to Profile Tab
  try {
    await page.getByRole('button', { name: /Profile/i }).click();
    await page.waitForTimeout(600);
    const profileHelp = await page.getByRole('button', { name: /How to find this\?/i });
    if (profileHelp) await profileHelp.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-admin-profile.png') });
    console.log('Captured Admin Profile Tab with Google Review Guide');
  } catch (e) {}

  // Switch to Stands Tab
  try {
    await page.getByRole('button', { name: /Stands/i }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-admin-stands.png') });
    console.log('Captured Admin Stands Tab');
  } catch (e) {}

  // Step 4: Capture Tabletop Diner Station
  const dinerUrl = `${BASE_URL}/r/bistro-varanasi`;
  await page.goto(dinerUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-diner-step1.png') });
  console.log('Captured Diner Step 1');

  // Tap stars
  const starButtons = await page.$$('button');
  if (starButtons.length > 5) {
    await starButtons[2].click();
    await starButtons[6].click();
    await starButtons[10].click();
    await starButtons[14].click();
  }

  await page.getByRole('button', { name: /Continue to Dishes/i }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-diner-step2.png') });
  console.log('Captured Diner Step 2 (Dishes)');

  // Select dishes
  const dishChips = await page.getByText('Banarasi Tamatar Chaat');
  if (dishChips) await dishChips.click();

  // Generate Review Draft
  await page.getByRole('button', { name: /Draft 5-Star Review/i }).click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-screen-diner-step3.png') });
  console.log('Captured Diner Step 3 (Draft & Google Review 1-Tap)');

  await browser.close();

  // Clean up database so it leaves ONLY super admin credentials as requested
  fs.writeFileSync(path.resolve('data/restaurants.json'), '[]\n', 'utf-8');
  fs.writeFileSync(path.resolve('data/invites.json'), '[]\n', 'utf-8');
  fs.writeFileSync(path.resolve('data/sent-emails.json'), '[]\n', 'utf-8');
  console.log('Test data cleaned up! Only super admin credentials remain.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
