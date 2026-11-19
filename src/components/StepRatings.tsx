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
      <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#241E15]/95 via-[#181514]/90 to-[#0F0E12]/95 p-5 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(245,186,66,0.12)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            <span>Step 1 of 3 • Quick Ratings</span>
          </span>
          <span className="text-[10px] text-amber-300/80 font-mono bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
            10-sec review
          </span>
        </div>
        <h2 className="mt-2 text-lg sm:text-xl font-black text-white relative z-10 tracking-tight">
          How was your meal today?
        </h2>
        <p className="mt-1 text-xs text-zinc-300 leading-relaxed relative z-10">
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
              className={`rounded-2xl p-4 backdrop-blur-xl transition-all duration-200 ${
                isRated
                  ? 'border border-amber-400/40 bg-gradient-to-br from-[#1E1912]/90 to-[#12131C]/95 shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(245,186,66,0.12)]'
                  : 'border border-white/[0.08] bg-gradient-to-br from-[#161822]/80 to-[#0F1118]/90 shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    isRated
                      ? 'bg-gradient-to-br from-amber-400/30 to-amber-600/15 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,186,66,0.25)]'
                      : 'bg-white/[0.04] border-white/[0.08] text-amber-400/80'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">{cat.title}</h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{cat.subtitle}</p>
                  </div>
                </div>

                {/* Selected Status Badge */}
                {selectedValue > 0 && (
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-400/15 px-2.5 py-1 text-[10px] sm:text-[11px] font-extrabold text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(245,186,66,0.2)] animate-fade-in">
                    {RATING_DESCRIPTIONS[selectedValue]}
                  </span>
                )}
              </div>

              {/* Big Touch-Friendly Star Rating Buttons */}
              <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
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
                              ? 'fill-amber-400 stroke-amber-300 drop-shadow-[0_2px_8px_rgba(245,186,66,0.6)] scale-110'
                              : 'stroke-current opacity-40'
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
      <div className="pt-3">
        <button
          type="button"
          onClick={onNext}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl btn-gold py-4 px-6 font-black text-sm sm:text-base shadow-xl transition-all duration-200 active:scale-[0.98]"
        >
          <span>Continue to Dishes &amp; Notes ➔</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 stroke-[3]" />
        </button>

        {!hasAtLeastOneRating && (
          <p className="mt-2.5 text-center text-[11px] text-zinc-500 font-medium">
            You can proceed even without rating all categories.
          </p>
        )}
      </div>
    </div>
  );
};
