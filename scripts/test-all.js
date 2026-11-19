/**
 * Tap-Bro Comprehensive End-to-End System Test Suite
 * Tests all components against live Railway PostgreSQL database.
 */

const BASE_URL = 'http://localhost:3000';
const SUPER_ADMIN_EMAIL = 'princesharma9955a@gmail.com';
const SUPER_ADMIN_PASS = 'prince@777';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function pass(testName, details = '') {
  console.log(`${colors.green}  ✓ PASS:${colors.reset} ${colors.bold}${testName}${colors.reset} ${details ? `(${details})` : ''}`);
}

function fail(testName, err) {
  console.error(`${colors.red}  ✗ FAIL:${colors.reset} ${colors.bold}${testName}${colors.reset} - ${err}`);
  process.exitCode = 1;
}

async function runTests() {
  console.log(`\n${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}   TAP-BRO PLATFORM: FULL END-TO-END INTEGRATION TEST SUITE     ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}   Target: ${BASE_URL}  |  Database: Railway PostgreSQL       ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════${colors.reset}\n`);

  let testInvite = null;
  let testRestaurant = null;

  // TEST 1: Health Check & Database Ping
  try {
    const t0 = Date.now();
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    const duration = Date.now() - t0;

    if (res.status === 200 && data.status === 'ok' && data.database?.connected === true) {
      pass('System Health & Railway PostgreSQL Ping', `Status: 200 OK, DB Latency: ${data.database.latencyMs}ms, Total: ${duration}ms`);
    } else {
      fail('System Health Check', JSON.stringify(data));
    }
  } catch (e) {
    fail('System Health Check', e.message);
  }

  // TEST 2: Super Admin Authentication & Platform Stats
  try {
    const res = await fetch(`${BASE_URL}/api/super-admin/overview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPin: SUPER_ADMIN_PASS,
      }),
    });
    const data = await res.json();

    if (res.status === 200 && data.success && data.stats) {
      pass('Super Admin Master Login & Overview', `Active Restaurants: ${data.stats.totalRestaurants}, Invites: ${data.stats.totalInvites}`);
    } else {
      fail('Super Admin Overview', data.error || JSON.stringify(data));
    }
  } catch (e) {
    fail('Super Admin Overview', e.message);
  }

  // TEST 3: Business Owner Invitation Dispatch
  const testEmail = `e2e-test-${Date.now()}@tapbro.io`;
  try {
    const res = await fetch(`${BASE_URL}/api/super-admin/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPin: SUPER_ADMIN_PASS,
        targetEmail: testEmail,
        notes: 'Automated E2E Test Suite Invite',
      }),
    });
    const data = await res.json();

    if (res.status === 200 && data.success && data.invite?.tempPass) {
      testInvite = data.invite;
      pass('Super Admin Owner Invite Creation', `Invite ID: ${testInvite.id}, Temp Pass: ${testInvite.tempPass}`);
    } else {
      fail('Invite Creation', data.error || JSON.stringify(data));
    }
  } catch (e) {
    fail('Invite Creation', e.message);
  }

  // TEST 4: Partner Setup Validation
  if (testInvite) {
    try {
      const res = await fetch(`${BASE_URL}/api/setup/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testInvite.email,
          tempPass: testInvite.tempPass,
          token: testInvite.token,
        }),
      });
      const data = await res.json();

      if (res.status === 200 && data.success) {
        pass('Invite Validation via Temporary Password', `Verified for: ${testInvite.email}`);
      } else {
        fail('Invite Validation', data.error || JSON.stringify(data));
      }
    } catch (e) {
      fail('Invite Validation', e.message);
    }
  }

  // TEST 5: Complete Restaurant Setup (Write to Railway PostgreSQL)
  if (testInvite) {
    try {
      const res = await fetch(`${BASE_URL}/api/setup/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testInvite.email,
          tempPass: testInvite.tempPass,
          restaurantName: 'Saffron Royal Palace',
          phone: '+91 98765 43210',
          adminPin: '9988',
          cuisine: 'North Indian & Mughlai',
          tagline: 'Authentic Royal Flavors',
          location: 'Connaught Place, New Delhi',
          googleReviewUrl: '',
          customDishes: ['Butter Chicken Special', 'Mutton Rogan Josh', 'Garlic Naan', 'Dum Biryani'],
        }),
      });
      const data = await res.json();

      if (res.status === 200 && data.success && data.restaurant?.slug) {
        testRestaurant = data.restaurant;
        pass('Restaurant Onboarding & DB Record Creation', `Slug: ${testRestaurant.slug}, ID: ${testRestaurant.id}`);
      } else {
        fail('Restaurant Setup Completion', data.error || JSON.stringify(data));
      }
    } catch (e) {
      fail('Restaurant Setup Completion', e.message);
    }
  }

  // TEST 6: Public Diner Query & Data Sanitization
  if (testRestaurant) {
    try {
      const res = await fetch(`${BASE_URL}/api/restaurants/${testRestaurant.slug}`);
      const data = await res.json();

      if (res.status === 200 && data.success && data.restaurant) {
        const pinLeaked = Boolean(data.restaurant.adminPin);
        if (pinLeaked) {
          fail('Security Check: Admin PIN Leaked to Public API', 'adminPin was found in response!');
        } else {
          pass('Public Diner Restaurant Query & Sanitization', `Name: "${data.restaurant.name}", PIN sanitized: YES, Menu Items: ${data.restaurant.menuCategories?.[0]?.items?.length || 0}`);
        }
      } else {
        fail('Public Restaurant Query', data.error || JSON.stringify(data));
      }
    } catch (e) {
      fail('Public Restaurant Query', e.message);
    }
  }

  // TEST 7: Tabletop NFC/QR Code Generation
  if (testRestaurant) {
    try {
      const res = await fetch(`${BASE_URL}/api/restaurants/${testRestaurant.slug}/qr`);
      const data = await res.json();

      if (res.status === 200 && data.success && data.qrDataUrl?.startsWith('data:image/png;base64,')) {
        pass('Tabletop Stand QR Code Generation', `Destination: ${data.destinationUrl}, Data Size: ${Math.round(data.qrDataUrl.length / 1024)} KB`);
      } else {
        fail('QR Code Generation', data.error || JSON.stringify(data));
      }
    } catch (e) {
      fail('QR Code Generation', e.message);
    }
  }

  // TEST 8: Diner AI Review Generation & Audit Trail
  if (testRestaurant) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${BASE_URL}/api/review-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug: testRestaurant.slug,
          locale: 'en',
          tone: 'flavorful',
          genderGrammar: 'neutral',
          ratings: { food: 5, service: 5, ambiance: 5, overall: 5 },
          selectedDishes: ['Butter Chicken Special', 'Garlic Naan'],
          customerNotes: 'Everything was fresh, rich gravy, prompt service.',
        }),
      });
      const data = await res.json();
      const duration = Date.now() - t0;

      if (res.status === 200 && data.draft) {
        pass('Diner AI Review Draft Generation', `Engine: ${data.provider || 'NVIDIA AI'}, Latency: ${duration}ms, Draft: "${data.draft.slice(0, 60)}..."`);
      } else {
        fail('AI Review Draft Generation', data.error?.message || JSON.stringify(data));
      }
    } catch (e) {
      fail('AI Review Draft Generation', e.message);
    }
  }

  // TEST 9: Restaurant Manager Portal Authentication
  if (testRestaurant) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+91 98765 43210',
          pinOrId: '9988',
        }),
      });
      const data = await res.json();

      if (res.status === 200 && data.success && data.restaurant?.slug === testRestaurant.slug) {
        pass('Restaurant Manager Authentication', `Verified login for ${data.restaurant.name}`);
      } else {
        fail('Manager Login', data.error || JSON.stringify(data));
      }
    } catch (e) {
      fail('Manager Login', e.message);
    }
  }

  // TEST 10: Clean Slate Cleanup (Delete test records from PostgreSQL)
  console.log(`\n${colors.yellow}─── Performing Post-Test Database Cleanup ───${colors.reset}`);
  if (testRestaurant) {
    try {
      const res = await fetch(`${BASE_URL}/api/super-admin/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: SUPER_ADMIN_EMAIL,
          superAdminPin: SUPER_ADMIN_PASS,
          restaurantId: testRestaurant.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        pass('Cleanup: Deleted test restaurant from Railway PostgreSQL', `ID: ${testRestaurant.id}`);
      }
    } catch (e) {
      console.warn('Failed to delete test restaurant:', e.message);
    }
  }

  if (testInvite) {
    try {
      const res = await fetch(`${BASE_URL}/api/super-admin/delete-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: SUPER_ADMIN_EMAIL,
          superAdminPin: SUPER_ADMIN_PASS,
          inviteId: testInvite.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        pass('Cleanup: Deleted test invite from Railway PostgreSQL', `ID: ${testInvite.id}`);
      }
    } catch (e) {
      console.warn('Failed to delete test invite:', e.message);
    }
  }

  console.log(`\n${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}            ALL INTEGRATION TESTS COMPLETED                   ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════${colors.reset}\n`);
}

runTests();
