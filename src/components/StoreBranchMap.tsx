'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { PlaceSuggestion } from '@/app/api/places/autocomplete/route';
import { MapPin, RefreshCw, Navigation } from 'lucide-react';

interface StoreBranchMapProps {
  branches: PlaceSuggestion[];
  selectedBranch: PlaceSuggestion | null;
  onSelectBranch: (branch: PlaceSuggestion) => void;
  isLoading?: boolean;
  city?: 'gandhinagar' | 'ahmedabad';
  onCityChange?: (city: 'gandhinagar' | 'ahmedabad') => void;
}

const DynamicMap = dynamic(() => import('./StoreBranchMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] sm:h-[380px] bg-[#121216] border border-zinc-800 flex flex-col items-center justify-center space-y-2 text-zinc-400">
      <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
      <span className="text-xs font-semibold">Loading Gandhinagar &amp; Ahmedabad detailed street map...</span>
    </div>
  ),
});

export const StoreBranchMap: React.FC<StoreBranchMapProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  isLoading,
  city = 'gandhinagar',
  onCityChange,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#121216] shadow-xl">
      {/* Top Banner on Map: City Switcher & Status */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* City Toggle Buttons */}
        <div className="bg-[#121216]/95 backdrop-blur-md border border-zinc-700/80 p-1 rounded-xl shadow-lg flex items-center gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => onCityChange && onCityChange('gandhinagar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              city === 'gandhinagar'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>Gandhinagar</span>
          </button>

          <button
            type="button"
            onClick={() => onCityChange && onCityChange('ahmedabad')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              city === 'ahmedabad'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Navigation className="h-3 w-3" />
            <span>Ahmedabad</span>
          </button>
        </div>

        {/* Counter Badge */}
        <div className="bg-[#121216]/95 backdrop-blur-md border border-zinc-700 px-2.5 py-1 rounded-xl shadow flex items-center gap-1.5 text-[11px] text-zinc-300 pointer-events-auto">
          {isLoading ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">
                {branches.length > 0 ? `${branches.length} Branches on Map` : 'Explore Corridors'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="w-full h-[320px] sm:h-[380px]">
        <DynamicMap
          branches={branches}
          selectedBranch={selectedBranch}
          onSelectBranch={onSelectBranch}
          city={city}
        />
      </div>
    </div>
  );
};

export default StoreBranchMap;
