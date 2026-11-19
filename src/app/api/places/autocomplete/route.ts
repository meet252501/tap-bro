import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
  description: string;
  reviewUrl: string;
  lat: number;
  lng: number;
  branchName?: string;
}

// City coordinate centroids for instant geocoding fallback
const KNOWN_CITIES: Record<string, { lat: number; lng: number }> = {
  gandhinagar: { lat: 23.2156, lng: 72.6369 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  kudasan: { lat: 23.1846, lng: 72.6391 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  pune: { lat: 18.5204, lng: 73.8567 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
};

function getFallbackCoordinates(text: string, index = 0): { lat: number; lng: number } {
  const lower = text.toLowerCase();
  for (const [city, coords] of Object.entries(KNOWN_CITIES)) {
    if (lower.includes(city)) {
      return {
        lat: coords.lat + (index % 3 - 1) * 0.015,
        lng: coords.lng + (Math.floor(index / 3) - 1) * 0.015,
      };
    }
  }
  // Default to Ahmedabad / Gandhinagar metro hub
  return {
    lat: 23.0225 + (index % 3 - 1) * 0.02,
    lng: 72.5714 + (Math.floor(index / 3) - 1) * 0.02,
  };
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
          lat: 23.0225,
          lng: 72.5714,
          reviewUrl: `https://search.google.com/local/writereview?placeid=${input}`,
        },
      ],
    });
  }

  // 2. Direct Google Maps URL Input Check
  if (
    input.includes('maps.google.com') ||
    input.includes('maps.app.goo.gl') ||
    input.includes('goo.gl/maps') ||
    input.includes('search.google.com')
  ) {
    // If it contains direct coords like @23.1846,72.6391
    const coordsMatch = input.match(/@([0-9.]+),([0-9.]+)/);
    const parsedLat = coordsMatch ? parseFloat(coordsMatch[1]) : 23.0225;
    const parsedLng = coordsMatch ? parseFloat(coordsMatch[2]) : 72.5714;

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
            lat: parsedLat,
            lng: parsedLng,
            reviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
          },
        ],
      });
    }

    // Try resolving short url if it's maps.app.goo.gl
    try {
      const res = await fetch(input, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const finalUrl = res.url;
      const chijMatch = finalUrl.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
      const pid = chijMatch ? chijMatch[0] : '';

      const finalCoords = finalUrl.match(/@([0-9.]+),([0-9.]+)/);
      const lat = finalCoords ? parseFloat(finalCoords[1]) : parsedLat;
      const lng = finalCoords ? parseFloat(finalCoords[2]) : parsedLng;

      const placeNameMatch = finalUrl.match(/\/place\/([^\/@]+)/);
      const decodedName = placeNameMatch
        ? decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '))
        : 'Google Maps Location';

      return NextResponse.json({
        success: true,
        predictions: [
          {
            placeId: pid,
            name: decodedName,
            address: 'Resolved from Google Maps Link',
            description: decodedName,
            lat,
            lng,
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

  const suggestions: PlaceSuggestion[] = [];

  // 3. Query OpenStreetMap Nominatim for real geocoded branches (e.g. "Karnavati" has 10+ branches)
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        input
      )}&format=json&limit=12&addressdetails=1`,
      { headers: { 'User-Agent': 'TapBro/1.0 (info@tapbro.app)' } }
    );
    if (osmRes.ok) {
      const osmData = await osmRes.json();
      if (Array.isArray(osmData)) {
        for (const item of osmData) {
          const parts = item.display_name.split(',');
          const rawName = item.name || parts[0]?.trim();
          const area = parts.slice(1, 4).join(',').trim();
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);

          if (!isNaN(lat) && !isNaN(lng)) {
            suggestions.push({
              placeId: `osm_${item.osm_id}`,
              name: rawName,
              address: area || item.display_name,
              description: item.display_name,
              lat,
              lng,
              branchName: area ? `${rawName} (${parts[1]?.trim() || 'Branch'})` : rawName,
              reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                rawName + ' ' + (area || '')
              )}`,
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('[places] Nominatim query error:', e);
  }

  // 4. Query Google Suggest to enrich with popular search branches
  try {
    const suggestRes = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(
        input
      )}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (suggestRes.ok) {
      const suggestData = await suggestRes.json();
      if (Array.isArray(suggestData) && Array.isArray(suggestData[1])) {
        const queryList: string[] = suggestData[1].slice(0, 6);
        for (let i = 0; i < queryList.length; i++) {
          const item = queryList[i];
          if (!suggestions.some((s) => s.name.toLowerCase() === item.toLowerCase())) {
            const parts = item.split(',');
            const mainName = parts[0]?.trim() || item;
            const secondary = parts.slice(1).join(',').trim() || 'Store Branch Location';
            const coords = getFallbackCoordinates(item, suggestions.length + i);

            suggestions.push({
              placeId: '',
              name: mainName,
              address: secondary,
              description: item,
              lat: coords.lat,
              lng: coords.lng,
              branchName: item,
              reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                item
              )}`,
            });
          }
        }
      }
    }
  } catch {}

  // 5. Always include search input fallback if no exact match
  if (!suggestions.some((s) => s.name.toLowerCase() === input.toLowerCase())) {
    const fallbackCoords = getFallbackCoordinates(input, 0);
    suggestions.unshift({
      placeId: '',
      name: input,
      address: 'Main Store Location',
      description: `${input} on Google Maps`,
      lat: fallbackCoords.lat,
      lng: fallbackCoords.lng,
      branchName: `${input} (Primary Branch)`,
      reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input)}`,
    });
  }

  return NextResponse.json({ success: true, predictions: suggestions.slice(0, 10) });
}
