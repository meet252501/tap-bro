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
  1: 'Needs Improvement',
  2: 'Below Expectations',
  3: 'Average / Fair',
  4: 'Tasty & Well Prepared',
  5: 'Exceptional / Loved it!',
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
    subtitle: 'Taste, temperature, authenticity & presentation',
    icon: Soup,
  },
  {
    key: 'service',
    title: 'Hospitality & Staff',
    subtitle: 'Warm welcome, attentiveness & speed',
    icon: UserCheck,
  },
  {
    key: 'ambiance',
    title: 'Ambiance & Hygiene',
    subtitle: 'Atmosphere, seating comfort & cleanliness',
    icon: Sparkles,
  },
  {
    key: 'overall',
    title: 'Overall Impression',
    subtitle: 'Your general dining satisfaction',
    icon: Award,
  },
];

export const StepRatings: React.FC<StepRatingsProps> = ({ ratings, onChange, onNext }) => {
  const handleStarClick = (category: keyof ExperienceRatings, value: number) => {
    // If user clicks the currently selected star, toggle to unset or keep
    const currentVal = ratings[category];
    onChange({
      ...ratings,
      [category]: currentVal === value ? undefined : value,
    });
  };

  const hasAtLeastOneRating = Object.values(ratings).some((val) => typeof val === 'number' && val > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-surface-card/90 p-5 backdrop-blur-sm shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />
        <h2 className="text-lg font-bold text-white sm:text-xl">
          How was your dining experience?
        </h2>
        <p className="mt-1 text-xs text-text-secondary sm:text-sm leading-relaxed">
          Rate each aspect honestly. No ratings are preselected—your genuine thoughts guide your draft.
        </p>
      </div>

      {/* Rating Cards */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const selectedValue = ratings[cat.key] || 0;

          return (
            <div
              key={cat.key}
              className="rounded-2xl border border-border bg-surface-card/60 p-4 transition-all hover:border-border-bright hover:bg-surface-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-raised border border-border text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cat.title}</h3>
                    <p className="text-[11px] text-text-secondary sm:text-xs">{cat.subtitle}</p>
                  </div>
                </div>

                {/* Selected Status Badge */}
                {selectedValue > 0 && (
                  <span className="shrink-0 rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-400/20">
                    {RATING_DESCRIPTIONS[selectedValue]}
                  </span>
                )}
              </div>

              {/* Star Rating Buttons */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-xs text-text-secondary font-medium">
                  {selectedValue > 0 ? `${selectedValue} of 5 Stars` : 'Tap to rate'}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= selectedValue;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(cat.key, star)}
                        className={`star-btn flex h-9 w-9 items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                          isFilled
                            ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30 shadow-sm'
                            : 'bg-surface-raised text-zinc-500 hover:text-zinc-300 border border-border/60 hover:border-border'
                        }`}
                        aria-label={`Rate ${cat.title} ${star} out of 5 stars`}
                      >
                        <Star
                          className={`h-5 w-5 transition-transform ${
                            isFilled ? 'fill-amber-400 stroke-amber-400' : 'stroke-current'
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

      {/* Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-6 font-semibold text-page shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-[0.99]"
        >
          <span>Continue to Dishes & Notes</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
        {!hasAtLeastOneRating && (
          <p className="mt-2 text-center text-[11px] text-text-secondary">
            Tip: You can continue even without rating all categories.
          </p>
        )}
      </div>
    </div>
  );
};
