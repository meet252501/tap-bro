const https = require('https');

async function searchBranches(query) {
  const results = [];

  // 1. Query Nominatim for geocoded branches
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: { 'User-Agent': 'TapBro/1.0 (info@tapbro.app)' }
    });
    if (res.ok) {
      const data = await res.json();
      for (const item of data) {
        const parts = item.display_name.split(',');
        const branchName = item.name || parts[0].trim();
        const address = parts.slice(1, 4).join(',').trim();
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        
        results.push({
          placeId: `osm_${item.osm_id}`,
          name: branchName,
          address: address || item.display_name,
          description: item.display_name,
          lat,
          lng,
          reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchName + ' ' + address)}`,
          source: 'osm'
        });
      }
    }
  } catch (e) {
    console.error('Nominatim error:', e);
  }

  // 2. Fallback / Search suggest if few results
  try {
    const suggestRes = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query + ' near me')}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (suggestRes.ok) {
      const suggestData = await suggestRes.json();
      if (Array.isArray(suggestData) && Array.isArray(suggestData[1])) {
        for (const item of suggestData[1].slice(0, 5)) {
          if (!results.some(r => r.name.toLowerCase() === item.toLowerCase())) {
            results.push({
              placeId: '',
              name: item,
              address: 'Google Maps Branch Location',
              description: item,
              lat: 23.0225 + (Math.random() - 0.5) * 0.1, // default region or geocoded
              lng: 72.5714 + (Math.random() - 0.5) * 0.1,
              reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item)}`,
              source: 'suggest'
            });
          }
        }
      }
    }
  } catch (e) {}

  return results;
}

async function test() {
  console.log('Testing "Karnavati":');
  const res = await searchBranches('Karnavati');
  console.log(`Found ${res.length} branches:`);
  console.log(JSON.stringify(res.slice(0, 5), null, 2));
}

test();
