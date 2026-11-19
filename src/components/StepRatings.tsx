'use client';

import React from 'react';
import { Star, ChevronRight, Soup, UserCheck, Sparkles, Award } from 'lucide-react';
import { ExperienceRatings } from '@/types/review';

interface StepRatingsProps {
  ratings: ExperienceRatings;
  onChange: (updated: ExperienceRatings) => void;
  onNext: () => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Disappointing 😞',
  2: 'Needs Improvement 😕',
  3: 'Average / Fair 🙂',
  4: 'Tasty & Well Made 😋',
  5: 'Loved it! Exceptional 😍',
};

interface RatingCategory {
  key: keyof ExperienceRatings;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const CATEGORIES: RatingCategory[] = [
  {
    key: 'food',
    title: 'Food & Flavors',
    subtitle: 'Taste, temperature, seasoning & freshness',
    icon: Soup,
  },
  {
    key: 'service',
    title: 'Hospitality & Staff',
    subtitle: 'Attentiveness, greeting & service speed',
    icon: UserCheck,
  },
  {
    key: 'ambiance',
    title: 'Ambiance & Cleanliness',
    subtitle: 'Comfortable seating, music & vibes',
    icon: Sparkles,
  },
  {
    key: 'overall',
    title: 'Overall Satisfaction',
    subtitle: 'Your general dining experience',
    icon: Award,
  },
];

export const StepRatings: React.FC<StepRatingsProps> = ({ ratings, onChange, onNext }) => {
  const handleStarClick = (category: keyof ExperienceRatings, value: number) => {
    const currentVal = ratings[category];
    onChange({
      ...ratings,
      [category]: currentVal === value ? undefined : value,
    });
  };

  const hasAtLeastOneRating = Object.values(ratings).some((val) => typeof val === 'number' && val > 0);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-8">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-zinc-400" />
            <span>Step 1 of 3 • Quick Ratings</span>
          </span>
          <span className="text-[10px] text-zinc-300 font-mono bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 rounded-full">
            10-sec review
          </span>
        </div>
        <h2 className="mt-2 text-lg sm:text-xl font-bold text-white tracking-tight">
          How was your meal today?
        </h2>
        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
          Tap the stars below to share your genuine dining experience.
        </p>
      </div>

      {/* Rating Cards with Large Touch Targets */}
      <div className="space-y-3.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const selectedValue = ratings[cat.key] || 0;
          const isRated = selectedValue > 0;

          return (
            <div
              key={cat.key}
              className={`rounded-2xl p-4 transition-all duration-150 ${
                isRated
                  ? 'border border-zinc-600 bg-[#18181B]'
                  : 'border border-zinc-800 bg-[#121216]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    isRated
                      ? 'bg-zinc-800 border-zinc-600 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate tracking-tight">{cat.title}</h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{cat.subtitle}</p>
                  </div>
                </div>

                {/* Selected Status Badge */}
                {selectedValue > 0 && (
                  <span className="shrink-0 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-zinc-200 animate-fade-in">
                    {RATING_DESCRIPTIONS[selectedValue]}
                  </span>
                )}
              </div>

              {/* Big Touch-Friendly Star Rating Buttons */}
              <div className="mt-3.5 pt-3 border-t border-zinc-800/80">
                <div className="flex items-center justify-between gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= selectedValue;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(cat.key, star)}
                        className={`star-btn flex-1 flex h-11 items-center justify-center rounded-xl transition-all duration-150 active:scale-95 focus:outline-none ${
                          isFilled ? 'star-tile-filled' : 'star-tile-empty'
                        }`}
                        aria-label={`Rate ${cat.title} ${star} out of 5 stars`}
                      >
                        <Star
                          className={`h-5 w-5 transition-transform ${
                            isFilled
                              ? 'fill-white stroke-white scale-105'
                              : 'stroke-zinc-500 opacity-40'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Mobile-First Action CTA */}
      <div className="sticky bottom-0 z-20 bg-[#0A0A0C]/95 backdrop-blur-xl border-t border-zinc-800/80 -mx-4 px-4 py-3 pt-3">
        <button
          type="button"
          onClick={onNext}
          className="group flex w-full items-center justify-center gap-2 rounded-xl btn-gold py-3.5 px-6 font-semibold text-sm sm:text-base transition-all duration-150 active:scale-[0.98]"
        >
          <span>Continue to Dishes &amp; Notes ➔</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
        </button>

        {!hasAtLeastOneRating && (
          <p className="mt-1.5 text-center text-[10px] text-zinc-400 font-medium">
            Tap stars above or tap continue to proceed.
          </p>
        )}
      </div>
    </div>
  );
};
