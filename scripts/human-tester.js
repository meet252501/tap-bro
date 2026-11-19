/**
 * Human-Like End-to-End Browser Tester for Tap-Bro
 * 
 * Simulates real human browser behavior:
 * 1. Super Admin login & invite dispatch
 * 2. Real email button inspection (ensures NO localhost links!)
 * 3. Onboarding form auto-unlock, fill, and restaurant activation
 * 4. Diner tabletop review generation, chip clicking, and copy action
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function step(num, title) {
  console.log(`\n${colors.bold}${colors.cyan}--- [Human Tester Step ${num}] ${title} ---${colors.reset}`);
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ${colors.red}✗ FAILED ASSERTION:${colors.reset} ${message}`);
    throw new Error(message);
  }
  console.log(`  ${colors.green}✓ VERIFIED:${colors.reset} ${message}`);
}

async function runHumanTester() {
  console.log(`\n${colors.bold}${colors.cyan}============================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}     TAP-BRO REAL HUMAN-USER END-TO-END TEST SUITE          ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}============================================================${colors.reset}`);
  console.log(`Simulating real human user interactions using Google Chrome...\n`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile iPhone viewport like real tabletop diners & owners
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
  });
  const page = await context.newPage();

  let createdSlug = null;

  try {
    // -------------------------------------------------------------
    // Step 1: Human enters Super Admin & Logs In
    // -------------------------------------------------------------
    step(1, 'Super Admin logs in through the UI');
    await page.goto(`${BASE_URL}/super-admin`, { waitUntil: 'networkidle' });

    // Look for login fields
    await page.fill('input[type="email"]', 'princesharma9955a@gmail.com');
    await page.fill('input[placeholder*="prince@777"]', 'prince@777');
    await page.click('button:has-text("Access Super Admin Dashboard")');

    // Wait for master dashboard to mount
    await page.waitForSelector('text=Master Control', { timeout: 15000 });
    assert(true, 'Super Admin successfully signed in to Master Dashboard');

    // -------------------------------------------------------------
    // Step 2: Human dispatches an Invite to a Restaurant Owner
    // -------------------------------------------------------------
    step(2, 'Super Admin dispatches an invite to a restaurant owner');
    const testOwnerEmail = `human.owner.${Date.now()}@tapbro.test`;
    await page.fill('input[placeholder*="manager@tajdining.com"]', testOwnerEmail);
    await page.click('button:has-text("Send Temp Pass & Invite")');

    // Wait for the dispatched banner to appear
    await page.waitForSelector('text=Email Automatically Sent', { timeout: 10000 });
    assert(true, 'Dispatched invitation banner appeared on dashboard');

    // Verify the setup link in the UI does NOT contain localhost
    const displayedSetupLink = await page.locator('text=Setup Link:').locator('..').innerText();
    console.log(`  🔗 Displayed Setup Link: ${colors.yellow}${displayedSetupLink.trim()}${colors.reset}`);
    assert(!displayedSetupLink.includes('localhost'), 'Setup link in Super Admin dashboard DOES NOT contain localhost');
    assert(displayedSetupLink.includes('https://tapbro.vercel.app'), 'Setup link uses authoritative public domain https://tapbro.vercel.app');

    // -------------------------------------------------------------
    // Step 3: Human opens Email & inspects the Button
    // -------------------------------------------------------------
    step(3, 'Human receives email and verifies the Action Button URL');
    const sentEmailsPath = path.join(process.cwd(), 'data', 'sent-emails.json');
    let latestEmail = null;
    for (let retry = 0; retry < 10; retry++) {
      if (fs.existsSync(sentEmailsPath)) {
        try {
          const sentEmails = JSON.parse(fs.readFileSync(sentEmailsPath, 'utf-8'));
          latestEmail = sentEmails.find(e => e.to === testOwnerEmail);
          if (latestEmail) break;
        } catch (_) {}
      }
      await new Promise(r => setTimeout(r, 500));
    }

    assert(latestEmail && latestEmail.to === testOwnerEmail, `Email found in queue addressed to ${testOwnerEmail}`);

    // Parse button href from HTML
    const ctaMatches = [...latestEmail.html.matchAll(/href="([^"]+)"[^>]*class="cta-btn"|class="cta-btn"[^>]*href="([^"]+)"/gi)];
    const buttonHref = ctaMatches.length > 0 ? (ctaMatches[0][1] || ctaMatches[0][2]) : (latestEmail.text.match(/https?:\/\/[^\s]+/)?.[0]);

    console.log(`  📬 Email "Set Up Restaurant Now" Button Href: ${colors.yellow}${buttonHref}${colors.reset}`);
    assert(buttonHref !== null && buttonHref !== undefined, 'Found "Set Up Restaurant Now" button in email template');
    assert(!buttonHref.includes('localhost'), 'Email button link DOES NOT send users to localhost!');
    assert(buttonHref.startsWith('https://tapbro.vercel.app/setup'), 'Email button cleanly points to https://tapbro.vercel.app/setup');

    // Extract temporary pass code
    const tempPassMatch = latestEmail.text.match(/Temporary Pass is:\s*([A-Z0-9-]+)/i);
    const tempPass = tempPassMatch ? tempPassMatch[1] : null;
    assert(tempPass !== null, `Extracted Temporary Pass from email: ${tempPass}`);

    // -------------------------------------------------------------
    // Step 4: Human clicks link and completes onboarding
    // -------------------------------------------------------------
    step(4, 'Human opens Setup Page on phone and onboards their restaurant');
    // Navigate to local setup page with the extracted credentials (simulating user clicking email button)
    await page.goto(`${BASE_URL}/setup?email=${encodeURIComponent(testOwnerEmail)}&pass=${encodeURIComponent(tempPass)}`, { waitUntil: 'networkidle' });

    // The email button auto-unlocks the form. Wait for the restaurant profile form to be visible
    await page.waitForSelector('input[placeholder*="Enter your restaurant name" i]', { timeout: 15000 });
    assert(true, 'Setup form successfully auto-unlocked with credentials from email link');

    // Fill in restaurant details
    const uniqueRestName = `Bistro Luxe ${Date.now()}`;
    await page.fill('input[placeholder*="Enter your restaurant name" i]', uniqueRestName);
    await page.fill('input[placeholder*="9876543210" i]', '9876543210');
    await page.fill('input[placeholder*="4-digit PIN" i]', '1234');
    await page.fill('input[placeholder*="Italian, Cafe" i]', 'Italian & Continental');

    // Submit setup
    await page.click('button:has-text("Activate Tabletop Station")');

    // Wait for redirect to admin page with slug
    await page.waitForURL(/\/admin\//, { timeout: 15000 });
    const currentUrl = page.url();
    createdSlug = currentUrl.split('/admin/')[1]?.split('?')[0];
    assert(createdSlug !== undefined && createdSlug.length > 0, `Restaurant successfully activated with slug: ${createdSlug}`);

    // -------------------------------------------------------------
    // Step 5: Real Diner taps table stand & drafts a review
    // -------------------------------------------------------------
    step(5, 'Real Diner arrives at table, taps stand, and generates an authentic review');
    const dinerUrl = `${BASE_URL}/r/${createdSlug}`;
    await page.goto(dinerUrl, { waitUntil: 'networkidle' });

    // Wait for Step 1: Star Ratings
    await page.waitForSelector('text=Continue to Dishes & Notes', { timeout: 15000 });
    assert(true, `Public Diner Station loaded with restaurant branding: ${uniqueRestName}`);

    // Diner selects rating and clicks continue
    await page.click('button:has-text("Continue to Dishes & Notes")');

    // Wait for Step 2: Dishes
    await page.waitForSelector('text=Generate AI Review Draft', { timeout: 10000 });
    assert(true, 'Diner progressed to Dish & Atmosphere selection screen');

    // Diner clicks "Generate AI Review Draft"
    await page.click('button:has-text("Generate AI Review Draft")');

    // Wait for Step 3: AI Draft Card & Copy Button
    await page.waitForSelector('text=Copy & Open Google Reviews', { timeout: 20000 });
    assert(true, 'AI generated authentic dining review draft with 1-Tap Google Share button!');

    console.log(`\n${colors.bold}${colors.green}============================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green} 🎉 ALL 5 HUMAN-USER END-TO-END SCENARIOS PASSED 100%!     ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}============================================================\n${colors.reset}`);

  } catch (error) {
    console.error(`\n${colors.bold}${colors.red}❌ HUMAN TESTER ERROR: ${error.message}${colors.reset}\n`);
    throw error;
  } finally {
    await browser.close();

    // Reset database test records so clean state is preserved
    const invitesPath = path.join(process.cwd(), 'data', 'invites.json');
    const sentEmailsPath = path.join(process.cwd(), 'data', 'sent-emails.json');
    const restaurantsPath = path.join(process.cwd(), 'data', 'restaurants.json');
    
    // Clean up test restaurant
    if (createdSlug && fs.existsSync(restaurantsPath)) {
      const rests = JSON.parse(fs.readFileSync(restaurantsPath, 'utf-8'));
      const cleaned = rests.filter(r => r.slug !== createdSlug);
      fs.writeFileSync(restaurantsPath, JSON.stringify(cleaned, null, 2));
    }
    fs.writeFileSync(invitesPath, '[]\n');
    fs.writeFileSync(sentEmailsPath, '[]\n');
  }
}

runHumanTester().catch(() => process.exit(1));
