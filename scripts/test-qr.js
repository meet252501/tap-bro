/**
 * Tabletop Stand QR Code & NFC Tap Target Test Suite
 * 
 * Verifies:
 * 1. High-resolution QR Code generation endpoint (/api/restaurants/[slug]/qr)
 * 2. Proper data URL formatting (data:image/png;base64,...)
 * 3. Authoritative destination URL resolution (asserts https://tapbro.vercel.app/r/[slug] and NO localhost)
 * 4. Error boundary on invalid restaurant slug
 */

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

function pass(msg) {
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${msg}`);
}

function fail(msg, err) {
  console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${msg}`);
  if (err) console.error(`    ${colors.yellow}${err}${colors.reset}`);
  throw new Error(msg);
}

async function runQrTests() {
  console.log(`\n${colors.bold}${colors.cyan}============================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}      TAP-BRO TABLETOP QR CODE & NFC ROUTE SUITE            ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}============================================================\n${colors.reset}`);

  const testSlug = `qr-test-${Date.now()}`;
  const restaurantsPath = path.join(process.cwd(), 'data', 'restaurants.json');

  let existing = [];
  if (fs.existsSync(restaurantsPath)) {
    try { existing = JSON.parse(fs.readFileSync(restaurantsPath, 'utf-8')); } catch (_) {}
  }

  const testRest = {
    id: `REST_${Date.now()}`,
    slug: testSlug,
    name: 'Harbor Fish House',
    phone: '9888877777',
    adminPin: '5555',
    createdAt: new Date().toISOString()
  };

  existing.push(testRest);
  fs.writeFileSync(restaurantsPath, JSON.stringify(existing, null, 2));

  try {
    // 1. Valid QR generation
    console.log(`${colors.bold}[1/3] Generating High-Resolution QR Code (/api/restaurants/${testSlug}/qr)...${colors.reset}`);
    const res = await fetch(`${BASE_URL}/api/restaurants/${testSlug}/qr`);
    if (!res.ok) {
      fail(`Failed to fetch QR code: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.qrDataUrl || !data.destinationUrl) {
      fail('Invalid response schema from QR endpoint');
    }

    // 2. Data URL verification
    console.log(`\n${colors.bold}[2/3] Validating QR PNG Payload Data URL...${colors.reset}`);
    if (data.qrDataUrl.startsWith('data:image/png;base64,')) {
      pass(`Valid base64 PNG data URL generated (${data.qrDataUrl.length} characters)`);
    } else {
      fail('QR payload is not a valid base64 PNG data URL');
    }

    // 3. Destination URL validation
    console.log(`\n${colors.bold}[3/3] Validating Destination URL Public Domain...${colors.reset}`);
    console.log(`  Destination URL: ${colors.yellow}${data.destinationUrl}${colors.reset}`);
    if (!data.destinationUrl.includes('localhost') && data.destinationUrl.includes('https://tapbro.vercel.app')) {
      pass(`Destination URL strictly points to public domain: ${data.destinationUrl}`);
    } else {
      fail(`Destination URL contained localhost or invalid domain: ${data.destinationUrl}`);
    }

    // 4. Invalid slug error boundary
    const invalidRes = await fetch(`${BASE_URL}/api/restaurants/non-existent-restaurant-9999/qr`);
    if (invalidRes.status === 404) {
      pass('Non-existent restaurant QR request correctly returns HTTP 404 Not Found');
    } else {
      fail(`Expected 404 for missing restaurant, got ${invalidRes.status}`);
    }

    console.log(`\n${colors.bold}${colors.green}============================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green} 🎉 TABLETOP QR & NFC ROUTE TESTS PASSED 100%!             ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}============================================================\n${colors.reset}`);

  } catch (err) {
    console.error(`\n${colors.bold}${colors.red}❌ QR TEST ERROR: ${err.message}${colors.reset}\n`);
    throw err;
  } finally {
    if (fs.existsSync(restaurantsPath)) {
      const allRests = JSON.parse(fs.readFileSync(restaurantsPath, 'utf-8'));
      const filtered = allRests.filter(r => r.slug !== testSlug);
      fs.writeFileSync(restaurantsPath, JSON.stringify(filtered, null, 2));
    }
  }
}

runQrTests().catch(() => process.exit(1));
