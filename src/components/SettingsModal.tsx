'use client';

import React, { useState } from 'react';
import { X, Store, Link as LinkIcon, Save, RotateCcw, ShieldCheck } from 'lucide-react';
import { RestaurantConfig } from '@/types/review';
import { DEFAULT_RESTAURANT_CONFIG } from '@/config/restaurantConfig';

interface SettingsModalProps {
  isOpen: boolean;
  config: RestaurantConfig;
  onSave: (newConfig: RestaurantConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(config.name);
  const [tagline, setTagline] = useState(config.tagline);
  const [cuisine, setCuisine] = useState(config.cuisine);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(config.googleReviewUrl);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      name: name.trim() || DEFAULT_RESTAURANT_CONFIG.name,
      tagline: tagline.trim() || DEFAULT_RESTAURANT_CONFIG.tagline,
      cuisine: cuisine.trim() || DEFAULT_RESTAURANT_CONFIG.cuisine,
      googleReviewUrl: googleReviewUrl.trim() || DEFAULT_RESTAURANT_CONFIG.googleReviewUrl,
    });
    onClose();
  };

  const handleReset = () => {
    setName(DEFAULT_RESTAURANT_CONFIG.name);
    setTagline(DEFAULT_RESTAURANT_CONFIG.tagline);
    setCuisine(DEFAULT_RESTAURANT_CONFIG.cuisine);
    setGoogleReviewUrl(DEFAULT_RESTAURANT_CONFIG.googleReviewUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-5 sm:p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Restaurant Setup</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 text-text-secondary hover:text-white hover:bg-surface-highlight transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
              placeholder="e.g. Saffron & Spice Bistro"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Cuisine / Specialty
            </label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
              placeholder="e.g. North Indian & Chaat Bistro"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
              placeholder="e.g. Artisanal Indian Cuisine & Heritage Chaat"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <LinkIcon className="h-3 w-3 text-amber-400" />
              <span>Direct Google Review URL</span>
            </label>
            <input
              type="url"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none font-mono"
              placeholder="https://search.google.com/local/writereview?placeid=..."
            />
            <p className="mt-1 text-[11px] text-zinc-400 leading-tight">
              Get your direct review link from your Google Business Profile (&quot;Ask for reviews&quot; link).
            </p>
          </div>

          <div className="rounded-xl bg-surface-raised p-3 border border-border/80 text-[11px] text-text-secondary flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              All configuration is saved in local browser state. No sensitive credentials or API keys are exposed to the client.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-page hover:bg-amber-300 transition shadow-md shadow-amber-400/20"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
