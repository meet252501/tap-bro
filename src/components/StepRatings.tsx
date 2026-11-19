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
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-surface-card to-surface-card/80 p-4 sm:p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Step 1 of 3 • Quick Ratings
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">10-sec review</span>
        </div>
        <h2 className="mt-1 text-base sm:text-lg font-extrabold text-white">
          How was your meal today?
        </h2>
        <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
          Tap the stars below to share your genuine experience.
        </p>
      </div>

      {/* Rating Cards with Large Touch Targets */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const selectedValue = ratings[cat.key] || 0;

          return (
            <div
              key={cat.key}
              className="rounded-2xl border border-border/80 bg-surface-card/70 p-3.5 sm:p-4 backdrop-blur-sm transition-all shadow-md hover:border-amber-500/30"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-raised border border-border text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">{cat.title}</h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{cat.subtitle}</p>
                  </div>
                </div>

                {/* Selected Status Badge */}
                {selectedValue > 0 && (
                  <span className="shrink-0 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-300 border border-amber-400/20 animate-fade-in">
                    {RATING_DESCRIPTIONS[selectedValue]}
                  </span>
                )}
              </div>

              {/* Big Touch-Friendly Star Rating Buttons */}
              <div className="mt-3 pt-2.5 border-t border-border/40">
                <div className="flex items-center justify-between gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= selectedValue;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(cat.key, star)}
                        className={`star-btn flex-1 flex h-11 items-center justify-center rounded-xl transition-all duration-150 active:scale-95 focus:outline-none ${
                          isFilled
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40 shadow-sm shadow-amber-400/15'
                            : 'bg-surface text-zinc-600 hover:text-zinc-400 border border-border/70'
                        }`}
                        aria-label={`Rate ${cat.title} ${star} out of 5 stars`}
                      >
                        <Star
                          className={`h-5 w-5 transition-transform ${
                            isFilled ? 'fill-amber-400 stroke-amber-400 scale-110' : 'stroke-current'
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

      {/* Prominent Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 px-6 font-extrabold text-sm sm:text-base text-page shadow-xl shadow-amber-500/20 transition-all duration-150 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98]"
        >
          <span>Continue to Dishes &amp; Notes ➔</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        {!hasAtLeastOneRating && (
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            You can proceed even without rating all categories.
          </p>
        )}
      </div>
    </div>
  );
};
