'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlaceSuggestion } from '@/app/api/places/autocomplete/route';

interface StoreBranchMapInnerProps {
  branches: PlaceSuggestion[];
  selectedBranch: PlaceSuggestion | null;
  onSelectBranch: (branch: PlaceSuggestion) => void;
}

export const StoreBranchMapInner: React.FC<StoreBranchMapInnerProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double initialization

    // Center on first branch or India center (Gujarat / Western region)
    const initialLat = branches[0]?.lat || 23.0225;
    const initialLng = branches[0]?.lng || 72.5714;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: branches.length > 0 ? 12 : 11,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // 100% Free OpenStreetMap Global Tiles (ZERO API keys, ZERO watermarks, full street names)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size to guarantee map fills container immediately
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

  // Update Markers and Bounds when branches change
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

    branches.forEach((branch, idx) => {
      const isSelected =
        selectedBranch?.name === branch.name && selectedBranch?.address === branch.address;

      // Custom high-contrast numbered pin
      const customIcon = L.divIcon({
        className: 'custom-map-pin-wrapper',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${isSelected ? '#FFFFFF' : '#E5A93C'};
            color: #000000;
            font-weight: 800;
            font-size: 13px;
            border: 2.5px solid ${isSelected ? '#E5A93C' : '#FFFFFF'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: transform 0.2s ease;
            ${isSelected ? 'transform: scale(1.2);' : ''}
          ">
            <span>${idx + 1}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([branch.lat, branch.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'padding: 4px; font-family: system-ui, sans-serif; color: #111;';
      popupDiv.innerHTML = `
        <div style="font-size: 10px; font-weight: 700; color: #B45309; text-transform: uppercase;">
          📍 Branch #${idx + 1}
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
          padding: 6px 10px;
          border-radius: 8px;
          background: #E5A93C;
          color: #000;
          font-weight: 700;
          font-size: 11px;
          border: none;
          cursor: pointer;
        ">
          Select & Lock This Store
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
      map.setView([branches[0].lat, branches[0].lng], 14);
    } else if (branches.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    map.invalidateSize();
  }, [branches, selectedBranch, onSelectBranch]);

  // Center on selected branch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBranch) return;

    map.flyTo([selectedBranch.lat, selectedBranch.lng], 15, {
      duration: 0.6,
    });
  }, [selectedBranch]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', minHeight: '300px' }}
      className="relative z-0"
    />
  );
};
export default StoreBranchMapInner;
