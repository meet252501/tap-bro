'use client';

import React from 'react';
import { UtensilsCrossed, Sliders, MapPin, CheckCircle2 } from 'lucide-react';
import { RestaurantConfig } from '@/types/review';

interface HeaderProps {
  config: RestaurantConfig;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ config, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800 bg-[#0A0A0C]/95 backdrop-blur-xl px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        {/* Brand and Restaurant Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#18181B] border border-zinc-700/80 p-2">
            <UtensilsCrossed className="h-5 w-5 text-white stroke-[2]" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0A0A0C] flex items-center justify-center">
              <CheckCircle2 className="h-2 w-2 text-white stroke-[3]" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                {config.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Verified</span>
              </span>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-zinc-400 truncate mt-0.5">
              <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
              <span className="truncate">{config.cuisine || 'Dining & Hospitality'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Tap-Bro Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1 text-[10px] font-medium text-zinc-300">
            <img src="/tap-bro-logo.png" alt="Tap-Bro" className="h-3.5 w-3.5 rounded-full object-cover ring-1 ring-zinc-700" />
            <span className="hidden min-[380px]:inline tracking-wide">Tap-Bro</span>
          </div>
          <button
            onClick={onOpenSettings}
            title="Restaurant Admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-[#121216] text-zinc-400 transition hover:border-zinc-700 hover:text-white active:scale-95"
            aria-label="Manager portal"
          >
            <Sliders className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
