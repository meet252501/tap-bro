'use client';

import React from 'react';
import { UtensilsCrossed, Sliders, MapPin, Sparkles } from 'lucide-react';
import { RestaurantConfig } from '@/types/review';

interface HeaderProps {
  config: RestaurantConfig;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ config, onOpenSettings }) => {
  return (
    <header className="relative w-full border-b border-border/60 bg-surface/80 backdrop-blur-md px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        {/* Brand and Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
            <UtensilsCrossed className="h-6 w-6 text-page" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {config.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/20">
                <img src="/tap-bro-logo.png" alt="Tap-Bro" className="h-3.5 w-3.5 rounded-full object-cover" />
                Tap-Bro
              </span>
            </div>
            <p className="flex items-center gap-1 text-xs text-text-secondary sm:text-sm">
              <MapPin className="h-3.5 w-3.5 text-amber-400/80 inline" />
              <span>{config.cuisine}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="Configure Restaurant & Review URL"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-surface-raised text-text-secondary transition hover:border-amber-400/50 hover:text-white hover:bg-surface-highlight active:scale-95"
            aria-label="Settings and configuration"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
