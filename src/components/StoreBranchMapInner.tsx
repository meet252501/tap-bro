'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center (Gujarat / Western India)
    const initialLat = branches[0]?.lat || 23.0225;
    const initialLng = branches[0]?.lng || 72.5714;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark Matter CartoDB Tiles (free, fast, dark luxury aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when branches or selectedBranch changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (!branches || branches.length === 0) return;

    const bounds = L.latLngBounds([]);

    branches.forEach((branch, idx) => {
      const isSelected = selectedBranch?.name === branch.name && selectedBranch?.address === branch.address;

      // Custom Gold Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-leaflet-div-icon',
        html: `
          <div class="branch-marker-pin ${isSelected ? 'active ring-4 ring-white' : ''}" style="cursor: pointer;">
            <span>${idx + 1}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([branch.lat, branch.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-2 space-y-1.5 text-xs text-white';
      popupDiv.innerHTML = `
        <div class="flex items-center gap-1.5 font-bold text-amber-400">
          <span>📍 Branch #${idx + 1}</span>
        </div>
        <div class="font-bold text-sm text-white">${branch.name}</div>
        <div class="text-[11px] text-zinc-400 leading-tight">${branch.address}</div>
        <button class="mt-2 w-full py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition">
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
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
    }
  }, [branches, selectedBranch, onSelectBranch]);

  // Center on selected branch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBranch) return;

    map.flyTo([selectedBranch.lat, selectedBranch.lng], 15, {
      duration: 0.8,
    });
  }, [selectedBranch]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-zinc-800 relative z-0"
    />
  );
};
export default StoreBranchMapInner;
