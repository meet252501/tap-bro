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
    <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-surface/95 backdrop-blur-xl px-4 py-2.5 sm:px-6 shadow-sm">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        {/* Brand and Restaurant Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/25 border border-amber-300/40">
            <UtensilsCrossed className="h-5 w-5 text-page" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-sm font-extrabold tracking-tight text-white truncate">
                {config.name}
              </h1>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>Verified</span>
              </span>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-zinc-400 truncate">
              <MapPin className="h-3 w-3 text-amber-400/90 shrink-0" />
              <span className="truncate">{config.cuisine || 'Dining & Hospitality'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Tap-Bro Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-1 text-[10px] font-bold text-amber-300">
            <img src="/tap-bro-logo.png" alt="Tap-Bro" className="h-3.5 w-3.5 rounded-full object-cover" />
            <span className="hidden min-[380px]:inline">Tap-Bro</span>
          </div>
          <button
            onClick={onOpenSettings}
            title="Restaurant Admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-surface-raised text-zinc-400 transition hover:border-amber-400/50 hover:text-white active:scale-95"
            aria-label="Manager portal"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
