'use client';

import React from 'react';
import { UtensilsCrossed, Sliders, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { RestaurantConfig } from '@/types/review';

interface HeaderProps {
  config: RestaurantConfig;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ config, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-surface/90 backdrop-blur-md px-3.5 py-3 sm:px-6 shadow-sm">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
        {/* Brand and Restaurant Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20 border border-amber-300/30">
            <UtensilsCrossed className="h-5 w-5 text-page" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white truncate max-w-[190px] sm:max-w-xs">
                {config.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>Verified</span>
              </span>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-zinc-400 truncate mt-0.5">
              <MapPin className="h-3 w-3 text-amber-400/90 shrink-0" />
              <span className="truncate">{config.cuisine || 'Dining & Hospitality'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Tap-Bro Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xs:flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            <img src="/tap-bro-logo.png" alt="Tap-Bro" className="h-3.5 w-3.5 rounded-full object-cover" />
            <span>Tap-Bro</span>
          </div>
          <button
            onClick={onOpenSettings}
            title="Restaurant Admin"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-surface-raised text-zinc-400 transition hover:border-amber-400/50 hover:text-white active:scale-95"
            aria-label="Manager portal"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
