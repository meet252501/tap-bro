import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
  description: string;
  reviewUrl: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = (searchParams.get('input') || '').trim();

  if (!input || input.length < 2) {
    return NextResponse.json({ success: true, predictions: [] });
  }

  // 1. Direct Place ID Input Check (e.g. ChIJ...)
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(input)) {
    return NextResponse.json({
      success: true,
      predictions: [
        {
          placeId: input,
          name: 'Google Business Profile',
          address: `Place ID: ${input}`,
          description: `Place ID: ${input}`,
          reviewUrl: `https://search.google.com/local/writereview?placeid=${input}`,
        },
      ],
    });
  }

  // 2. Direct Google Maps URL Input Check
  if (input.includes('maps.google.com') || input.includes('maps.app.goo.gl') || input.includes('goo.gl/maps') || input.includes('search.google.com')) {
    // If it's a direct write review URL with placeid
    const placeIdMatch = input.match(/placeid=([a-zA-Z0-9_-]+)/);
    if (placeIdMatch && placeIdMatch[1]) {
      const pid = placeIdMatch[1];
      return NextResponse.json({
        success: true,
        predictions: [
          {
            placeId: pid,
            name: 'Google Business Listing',
            address: 'Google Maps Place ID connected',
            description: input,
            reviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
          },
        ],
      });
    }

    // Try resolving short url if it's maps.app.goo.gl
    try {
      const res = await fetch(input, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
      const finalUrl = res.url;
      const chijMatch = finalUrl.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
      const pid = chijMatch ? chijMatch[0] : '';

      // Extract place name from /place/Name/@...
      const placeNameMatch = finalUrl.match(/\/place\/([^\/@]+)/);
      const decodedName = placeNameMatch ? decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' ')) : 'Google Maps Location';

      return NextResponse.json({
        success: true,
        predictions: [
          {
            placeId: pid,
            name: decodedName,
            address: 'Resolved from Google Maps Link',
            description: decodedName,
            reviewUrl: pid
              ? `https://search.google.com/local/writereview?placeid=${pid}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(decodedName)}`,
          },
        ],
      });
    } catch {
      // ignore network error
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 3. Official Google Places Autocomplete API (if API Key provided)
  if (apiKey) {
    try {
      const gRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&types=establishment&key=${apiKey}`
      );
      const gData = await gRes.json();
      if (gData.status === 'OK' && Array.isArray(gData.predictions)) {
        const predictions: PlaceSuggestion[] = gData.predictions.map((p: any) => ({
          placeId: p.place_id || '',
          name: p.structured_formatting?.main_text || p.description,
          address: p.structured_formatting?.secondary_text || '',
          description: p.description,
          reviewUrl: p.place_id
            ? `https://search.google.com/local/writereview?placeid=${p.place_id}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.description)}`,
        }));
        return NextResponse.json({ success: true, predictions });
      }
    } catch (e) {
      console.warn('[places] Google API request failed, falling back:', e);
    }
  }

  // 4. Fallback: Google Suggest + OSM Nominatim
  const suggestions: PlaceSuggestion[] = [];

  try {
    // A. Query Google Search Suggest
    const suggestRes = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(input)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (suggestRes.ok) {
      const suggestData = await suggestRes.json();
      if (Array.isArray(suggestData) && Array.isArray(suggestData[1])) {
        const queryList: string[] = suggestData[1].slice(0, 4);
        for (const item of queryList) {
          const parts = item.split(',');
          const mainName = parts[0]?.trim() || item;
          const secondary = parts.slice(1).join(',').trim() || 'Google Maps Search';
          suggestions.push({
            placeId: '',
            name: mainName,
            address: secondary,
            description: item,
            reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item)}`,
          });
        }
      }
    }
  } catch {}

  try {
    // B. Query OpenStreetMap Nominatim for geocoded address
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=3&addressdetails=1`,
      { headers: { 'User-Agent': 'TapBro/1.0 (info@tapbro.app)' } }
    );
    if (osmRes.ok) {
      const osmData = await osmRes.json();
      if (Array.isArray(osmData)) {
        for (const item of osmData) {
          if (!suggestions.some((s) => s.name.toLowerCase() === (item.name || '').toLowerCase())) {
            const shortAddr = item.display_name.split(',').slice(1, 4).join(',').trim();
            suggestions.push({
              placeId: '',
              name: item.name || item.display_name.split(',')[0],
              address: shortAddr || item.display_name,
              description: item.display_name,
              reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                (item.name || '') + ' ' + (shortAddr || '')
              )}`,
            });
          }
        }
      }
    }
  } catch {}

  // C. Always include the exact search string as a fallback prediction
  if (!suggestions.some((s) => s.name.toLowerCase() === input.toLowerCase())) {
    suggestions.unshift({
      placeId: '',
      name: input,
      address: 'Search on Google Maps',
      description: `${input} on Google Maps`,
      reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input)}`,
    });
  }

  return NextResponse.json({ success: true, predictions: suggestions.slice(0, 6) });
}
