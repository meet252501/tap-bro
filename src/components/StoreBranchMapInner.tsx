'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlaceSuggestion } from '@/app/api/places/autocomplete/route';

interface StoreBranchMapInnerProps {
  branches: PlaceSuggestion[];
  selectedBranch: PlaceSuggestion | null;
  onSelectBranch: (branch: PlaceSuggestion) => void;
  city?: 'gandhinagar' | 'ahmedabad';
}

const CITY_COORDINATES = {
  gandhinagar: { lat: 23.1885, lng: 72.635, zoom: 14 }, // Centered on Kudasan / Infocity / Sargasan corridor
  ahmedabad: { lat: 23.0285, lng: 72.528, zoom: 13.5 }, // Centered on SG Highway / Bodakdev / Vastrapur
};

export const StoreBranchMapInner: React.FC<StoreBranchMapInnerProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  city = 'gandhinagar',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize Map with high-detail CartoDB Voyager tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const cityDefault = CITY_COORDINATES[city] || CITY_COORDINATES.gandhinagar;

    const map = L.map(mapContainerRef.current, {
      center: [cityDefault.lat, cityDefault.lng],
      zoom: cityDefault.zoom,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // High-Detail CartoDB Voyager Tiles (crisp road names, sectors, landmarks in Gandhinagar & Ahmedabad)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pan to selected city when city prop changes and no branch is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedBranch) return;

    const cityCoords = CITY_COORDINATES[city] || CITY_COORDINATES.gandhinagar;
    map.flyTo([cityCoords.lat, cityCoords.lng], cityCoords.zoom, { duration: 0.8 });
  }, [city, selectedBranch]);

  // Update Markers when branches change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (!branches || branches.length === 0) {
      return;
    }

    const bounds = L.latLngBounds([]);
    const isIndiaCoord = (lat: number, lng: number) =>
      !isNaN(lat) && !isNaN(lng) && lat >= 8.0 && lat <= 36.0 && lng >= 68.0 && lng <= 97.5;

    branches.forEach((branch, idx) => {
      if (!isIndiaCoord(branch.lat, branch.lng)) return;

      const isSelected =
        selectedBranch?.name === branch.name && selectedBranch?.address === branch.address;

      // Custom high-contrast gold pin with number
      const customIcon = L.divIcon({
        className: 'custom-map-pin-wrapper',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            background: ${isSelected ? '#FFFFFF' : '#F5C84C'};
            color: #000000;
            font-weight: 800;
            font-size: ${isSelected ? '14px' : '12px'};
            border: 2.5px solid ${isSelected ? '#F5C84C' : '#121216'};
            box-shadow: 0 4px 14px rgba(0,0,0,0.45);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span>${idx + 1}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([branch.lat, branch.lng], { icon: customIcon }).addTo(map);

      // Rich Popup with verified Place ID info
      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'padding: 4px; font-family: system-ui, sans-serif; color: #111; max-width: 220px;';
      popupDiv.innerHTML = `
        <div style="font-size: 10px; font-weight: 700; color: #B45309; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
          <span>📍 Branch #${idx + 1}</span>
          ${branch.placeId ? '<span style="background: #10B981; color: white; padding: 1px 4px; border-radius: 4px; font-size: 9px;">✓ Place ID</span>' : ''}
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #000; margin-top: 2px;">
          ${branch.branchName || branch.name}
        </div>
        <div style="font-size: 11px; color: #555; margin-top: 2px; line-height: 1.3;">
          ${branch.address}
        </div>
        <button style="
          margin-top: 8px;
          width: 100%;
          padding: 7px 10px;
          border-radius: 8px;
          background: #F5C84C;
          color: #000;
          font-weight: 800;
          font-size: 11px;
          border: none;
          cursor: pointer;
        ">
          Lock This Store Branch ➔
        </button>
      `;

      const btn = popupDiv.querySelector('button');
      if (btn) {
        btn.addEventListener('click', () => {
          onSelectBranch(branch);
        });
      }

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        onSelectBranch(branch);
      });

      markersRef.current[`${branch.lat}_${branch.lng}`] = marker;
      bounds.extend([branch.lat, branch.lng]);
    });

    if (branches.length === 1) {
      map.setView([branches[0].lat, branches[0].lng], 15);
    } else if (branches.length > 1 && !selectedBranch) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    map.invalidateSize();
  }, [branches, selectedBranch, onSelectBranch]);

  // Center on selected branch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBranch) return;

    map.flyTo([selectedBranch.lat, selectedBranch.lng], 15.5, {
      duration: 0.6,
    });
  }, [selectedBranch]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', minHeight: '320px' }}
      className="relative z-0"
    />
  );
};

export default StoreBranchMapInner;
