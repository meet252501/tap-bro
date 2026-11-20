const assert = require('assert');

// Simulate resolveUniversalReviewUrls logic from src/components/StepDraft.tsx
function resolveUniversalReviewUrls(config) {
  const rawUrl = (config.googleReviewUrl || '').trim();
  let placeId = (config.placeId || '').trim();
  let cid = (config.cid || '').trim();

  // 1. Extract CID if not explicitly set
  if (!cid) {
    const cidMatch =
      rawUrl.match(/[?&]cid=([0-9]+)/i) ||
      rawUrl.match(/\/cid\/([0-9]+)/i) ||
      rawUrl.match(/cid:([0-9]+)/i);
    if (cidMatch) {
      cid = cidMatch[1];
    } else if (/^[0-9]{15,}$/.test(rawUrl)) {
      cid = rawUrl;
    }
  }

  // 2. Extract Place ID if not explicitly set
  if (!placeId) {
    const placeIdMatch =
      rawUrl.match(/placeid=([a-zA-Z0-9_-]+)/i) ||
      rawUrl.match(/place_id[=:]\s*([a-zA-Z0-9_-]+)/i) ||
      rawUrl.match(/query_place_id=([a-zA-Z0-9_-]+)/i);

    if (placeIdMatch) {
      placeId = placeIdMatch[1];
    } else if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(rawUrl)) {
      placeId = rawUrl;
    }
  }

  const queryPart = encodeURIComponent(
    [config.name, config.location].filter(Boolean).join(' ') || 'restaurant'
  );

  // 3. Universal Google Maps App URL (Primary for mobile - opens native Google Maps app without login walls)
  let universalMapsUrl = '';
  if (cid) {
    universalMapsUrl = `https://maps.google.com/?cid=${cid}`;
  } else if (placeId) {
    universalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryPart}&query_place_id=${placeId}`;
  } else if (rawUrl && /^https?:\/\//i.test(rawUrl) && !rawUrl.includes('search.google.com/local/writereview')) {
    universalMapsUrl = rawUrl;
  } else {
    universalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryPart}`;
  }

  // 4. Direct Google 5-Star Write-Review Web Dialog URL (search.google.com write review form)
  let directReviewUrl = '';
  if (placeId) {
    directReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
  } else if (rawUrl.includes('writereview') || rawUrl.includes('g.page') || rawUrl.includes('/review')) {
    directReviewUrl = rawUrl;
  } else if (cid) {
    directReviewUrl = `https://maps.google.com/?cid=${cid}`;
  } else {
    directReviewUrl = `https://www.google.com/search?q=${queryPart}+write+a+review`;
  }

  // 5. Maps Search Fallback URL
  const mapsSearchUrl = placeId
    ? `https://www.google.com/maps/search/?api=1&query=${queryPart}&query_place_id=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${queryPart}`;

  const primaryReviewUrl = universalMapsUrl || directReviewUrl;

  return {
    primaryReviewUrl,
    universalMapsUrl,
    directReviewUrl,
    mapsSearchUrl,
    placeId,
    cid,
  };
}

function runTests() {
  console.log('Testing resolveUniversalReviewUrls...');

  // Test 1: Eat Punjab with CID and PlaceId
  const eatPunjabConfig = {
    name: 'Eat Punjab',
    location: 'Kudasan, Gandhinagar, Gujarat',
    googleReviewUrl: 'https://maps.google.com/?cid=3682833924407842058',
    placeId: 'ChIJJ-nuYQArXDkRClUWF_ENHDM',
    cid: '3682833924407842058',
  };
  const res1 = resolveUniversalReviewUrls(eatPunjabConfig);
  assert.strictEqual(res1.primaryReviewUrl, 'https://maps.google.com/?cid=3682833924407842058');
  assert.strictEqual(res1.universalMapsUrl, 'https://maps.google.com/?cid=3682833924407842058');
  assert.strictEqual(res1.directReviewUrl, 'https://search.google.com/local/writereview?placeid=ChIJJ-nuYQArXDkRClUWF_ENHDM');
  assert.strictEqual(res1.placeId, 'ChIJJ-nuYQArXDkRClUWF_ENHDM');
  assert.strictEqual(res1.cid, '3682833924407842058');
  console.log('✓ Test 1 Passed: Eat Punjab resolved correctly.');

  // Test 2: Honest Restaurant with CID and PlaceId
  const honestConfig = {
    name: 'Honest Restaurant',
    location: 'Kudasan, Gandhinagar, Gujarat',
    googleReviewUrl: 'https://maps.google.com/?cid=15017142005634115862',
    placeId: 'ChIJA0fxfgApXDkRFilrAxebZ9A',
    cid: '15017142005634115862',
  };
  const res2 = resolveUniversalReviewUrls(honestConfig);
  assert.strictEqual(res2.primaryReviewUrl, 'https://maps.google.com/?cid=15017142005634115862');
  assert.strictEqual(res2.universalMapsUrl, 'https://maps.google.com/?cid=15017142005634115862');
  assert.strictEqual(res2.directReviewUrl, 'https://search.google.com/local/writereview?placeid=ChIJA0fxfgApXDkRFilrAxebZ9A');
  console.log('✓ Test 2 Passed: Honest Restaurant resolved correctly.');

  // Test 3: Backward compatibility: raw writereview URL with only placeid parameter
  const legacyConfig = {
    name: 'Legacy Cafe',
    location: 'Ahmedabad',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ1234567890abcdef',
  };
  const res3 = resolveUniversalReviewUrls(legacyConfig);
  assert.strictEqual(res3.placeId, 'ChIJ1234567890abcdef');
  assert.strictEqual(res3.directReviewUrl, 'https://search.google.com/local/writereview?placeid=ChIJ1234567890abcdef');
  assert(res3.universalMapsUrl.includes('query_place_id=ChIJ1234567890abcdef'));
  console.log('✓ Test 3 Passed: Legacy writereview URL extracted placeId and fallback maps URL.');

  // Test 4: Raw CID URL in googleReviewUrl without explicit cid field
  const rawCidConfig = {
    name: 'Test Business',
    location: 'Gujarat',
    googleReviewUrl: 'https://maps.google.com/?cid=999888777666555',
  };
  const res4 = resolveUniversalReviewUrls(rawCidConfig);
  assert.strictEqual(res4.cid, '999888777666555');
  assert.strictEqual(res4.universalMapsUrl, 'https://maps.google.com/?cid=999888777666555');
  assert.strictEqual(res4.primaryReviewUrl, 'https://maps.google.com/?cid=999888777666555');
  console.log('✓ Test 4 Passed: Raw CID URL extracted cid automatically.');

  console.log('\nAll 4 unit tests passed successfully!');
}

runTests();
