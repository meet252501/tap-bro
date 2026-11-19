/**
 * Test Suite: Unique & Single-Use Temporary Pass Enforcement
 */
const BASE_URL = 'http://localhost:3000';
const SUPER_ADMIN_EMAIL = 'princesharma9955a@gmail.com';
const SUPER_ADMIN_PASS = 'prince@777';

async function run() {
  console.log('\n=== TESTING UNIQUE & SINGLE-USE TEMPORARY PASSES ===\n');

  // PART 1: Verify each invite gets a completely unique pass (no repeats)
  console.log('1. Testing pass uniqueness across multiple invites for same email...');
  const testEmail = `chef-${Date.now()}@testroyalbistro.com`;
  const generatedPasses = [];

  for (let i = 1; i <= 5; i++) {
    const res = await fetch(`${BASE_URL}/api/super-admin/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPin: SUPER_ADMIN_PASS,
        targetEmail: testEmail,
        notes: `Test pass uniqueness #${i}`,
      }),
    });
    const data = await res.json();
    if (!data.success || !data.invite?.tempPass) {
      throw new Error(`Failed to generate invite #${i}: ${JSON.stringify(data)}`);
    }
    console.log(`   Invite #${i} generated pass: ${data.invite.tempPass}`);
    generatedPasses.push(data.invite);
  }

  const passStrings = generatedPasses.map((p) => p.tempPass);
  const uniqueSet = new Set(passStrings);
  if (uniqueSet.size === 5) {
    console.log('✓ PASS: All 5 temporary passes are completely unique with zero repeats!\n');
  } else {
    throw new Error(`FAIL: Pass collision detected! Set size: ${uniqueSet.size}/5: ${passStrings.join(', ')}`);
  }

  // Pick the latest invite for the single-use test
  const targetInvite = generatedPasses[generatedPasses.length - 1];
  console.log(`2. Testing Single-Use Flow with pass: ${targetInvite.tempPass}...`);

  // Step A: Validate the pass initially (should be valid)
  const val1 = await fetch(`${BASE_URL}/api/setup/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      tempPass: targetInvite.tempPass,
    }),
  });
  const val1Data = await val1.json();
  if (val1.status === 200 && val1Data.success) {
    console.log('   ✓ Initial validation: PASS (Active & Pending)');
  } else {
    throw new Error(`Initial validation failed: ${JSON.stringify(val1Data)}`);
  }

  // Step B: Use the pass to complete restaurant onboarding
  const completeRes = await fetch(`${BASE_URL}/api/setup/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      tempPass: targetInvite.tempPass,
      restaurantName: 'Royal Single Use Bistro',
      phone: '+91 99999 11111',
      adminPin: '4455',
      cuisine: 'Fine Dining',
    }),
  });
  const completeData = await completeRes.json();
  if (completeRes.status === 200 && completeData.success) {
    console.log('   ✓ Onboarding completed: PASS (Restaurant created)');
  } else {
    throw new Error(`Onboarding failed: ${JSON.stringify(completeData)}`);
  }

  const createdRestaurant = completeData.restaurant;

  // Step C: Try to validate the SAME temporary pass again (MUST BE REJECTED)
  console.log('\n3. Testing reuse prevention (Single-use gate)...');
  const val2 = await fetch(`${BASE_URL}/api/setup/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      tempPass: targetInvite.tempPass,
    }),
  });
  const val2Data = await val2.json();
  if (val2.status === 409 && val2Data.error && val2Data.error.includes('already been used')) {
    console.log(`   ✓ Re-validation blocked: PASS ("${val2Data.error}")`);
  } else {
    throw new Error(`FAIL: Single-use re-validation was not blocked! Status: ${val2.status}, body: ${JSON.stringify(val2Data)}`);
  }

  // Step D: Try to submit onboarding AGAIN with the same pass (MUST BE REJECTED)
  const complete2 = await fetch(`${BASE_URL}/api/setup/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      tempPass: targetInvite.tempPass,
      restaurantName: 'Duplicate Bistro',
      phone: '+91 99999 11111',
      adminPin: '4455',
    }),
  });
  const complete2Data = await complete2.json();
  if (complete2.status === 409 && complete2Data.error && complete2Data.error.includes('already been used')) {
    console.log(`   ✓ Re-submission blocked: PASS ("${complete2Data.error}")`);
  } else {
    throw new Error(`FAIL: Re-submission was not blocked! Status: ${complete2.status}`);
  }

  // Step E: Try to log in to /api/admin/login using the used temporary pass (MUST BE REJECTED)
  const loginWithTemp = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testEmail,
      pinOrId: targetInvite.tempPass,
    }),
  });
  const loginTempData = await loginWithTemp.json();
  if (loginWithTemp.status === 401 && loginTempData.error && loginTempData.error.includes('already been used')) {
    console.log(`   ✓ Login with used temp pass blocked: PASS ("${loginTempData.error}")`);
  } else {
    throw new Error(`FAIL: Login with used temp pass was not blocked! Status: ${loginWithTemp.status}, body: ${JSON.stringify(loginTempData)}`);
  }

  // Step F: Log in using the permanent Admin PIN (MUST SUCCEED)
  const loginWithPin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+91 99999 11111',
      pinOrId: '4455',
    }),
  });
  const loginPinData = await loginWithPin.json();
  if (loginWithPin.status === 200 && loginPinData.success && loginPinData.restaurant?.slug === createdRestaurant.slug) {
    console.log(`   ✓ Permanent PIN login: PASS (Successfully logged in as ${loginPinData.restaurant.name})`);
  } else {
    throw new Error(`FAIL: Permanent PIN login failed! Status: ${loginWithPin.status}`);
  }

  // Cleanup test records
  console.log('\n4. Cleaning up test records from database...');
  await fetch(`${BASE_URL}/api/super-admin/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      superAdminEmail: SUPER_ADMIN_EMAIL,
      superAdminPin: SUPER_ADMIN_PASS,
      restaurantId: createdRestaurant.id,
    }),
  });

  for (const inv of generatedPasses) {
    await fetch(`${BASE_URL}/api/super-admin/delete-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPin: SUPER_ADMIN_PASS,
        inviteId: inv.id,
      }),
    });
  }
  console.log('   ✓ Database cleaned successfully.');

  console.log('\n=== ALL TESTS PASSED: TEMPORARY PASSES ARE 100% UNIQUE & STRICTLY SINGLE-USE ===\n');
}

run().catch((e) => {
  console.error('\n✗ TEST FAILED:', e);
  process.exit(1);
});
