'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { PlaceSuggestion } from '@/app/api/places/autocomplete/route';
import { MapPin, RefreshCw } from 'lucide-react';

interface StoreBranchMapProps {
  branches: PlaceSuggestion[];
  selectedBranch: PlaceSuggestion | null;
  onSelectBranch: (branch: PlaceSuggestion) => void;
  isLoading?: boolean;
}

const DynamicMap = dynamic(() => import('./StoreBranchMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] sm:h-[360px] bg-[#121216] border border-zinc-800 flex flex-col items-center justify-center space-y-2 text-zinc-400">
      <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
      <span className="text-xs font-semibold">Loading interactive street map...</span>
    </div>
  ),
});

export const StoreBranchMap: React.FC<StoreBranchMapProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  isLoading,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#121216] shadow-xl">
      {/* Top Banner on Map */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="bg-[#121216]/95 backdrop-blur-md border border-zinc-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto">
          <MapPin className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-bold text-white">
            {branches.length > 0
              ? `${branches.length} Store Location${branches.length > 1 ? 's' : ''} on Map`
              : 'Interactive Store Map'}
          </span>
        </div>

        {isLoading && (
          <div className="bg-[#121216]/95 backdrop-blur-md border border-zinc-700 px-2.5 py-1 rounded-xl shadow flex items-center gap-1.5 text-[11px] text-zinc-300 pointer-events-auto">
            <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
            <span>Scanning branches...</span>
          </div>
        )}
      </div>

      <div className="w-full h-[300px] sm:h-[360px]">
        <DynamicMap
          branches={branches}
          selectedBranch={selectedBranch}
          onSelectBranch={onSelectBranch}
        />
      </div>
    </div>
  );
};
export default StoreBranchMap;
