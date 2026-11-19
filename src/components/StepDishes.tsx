'use client';

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Plus, Check, Utensils, UtensilsCrossed, MessageSquare } from 'lucide-react';
import { RestaurantConfig } from '@/types/review';

interface StepDishesProps {
  config: RestaurantConfig;
  selectedDishes: string[];
  customerNotes: string;
  onDishesChange: (dishes: string[]) => void;
  onNotesChange: (notes: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepDishes: React.FC<StepDishesProps> = ({
  config,
  selectedDishes,
  customerNotes,
  onDishesChange,
  onNotesChange,
  onBack,
  onNext,
}) => {
  const [customDishInput, setCustomDishInput] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const toggleDish = (dish: string) => {
    if (selectedDishes.includes(dish)) {
      onDishesChange(selectedDishes.filter((d) => d !== dish));
    } else {
      onDishesChange([...selectedDishes, dish]);
    }
  };

  const handleAddCustomDish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDishInput.trim();
    if (trimmed && !selectedDishes.includes(trimmed)) {
      onDishesChange([...selectedDishes, trimmed]);
      setCustomDishInput('');
      setShowAddCustom(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-8">
      {/* Intro Banner */}
      <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#241E15]/95 via-[#181514]/90 to-[#0F0E12]/95 p-5 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(245,186,66,0.12)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <UtensilsCrossed className="h-3 w-3 text-amber-400 animate-pulse" />
            <span>Step 2 of 3 • Select Dishes</span>
          </span>
          <span className="text-[10px] text-amber-300 font-extrabold bg-gradient-to-r from-amber-500/20 to-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 shadow-[0_0_10px_rgba(245,186,66,0.2)]">
            {selectedDishes.length} {selectedDishes.length === 1 ? 'dish' : 'dishes'} picked
          </span>
        </div>
        <h2 className="mt-2 text-lg sm:text-xl font-black text-white relative z-10 tracking-tight">
          What did you taste today?
        </h2>
        <p className="mt-1 text-xs text-zinc-300 leading-relaxed relative z-10">
          Tap the dishes you ordered so Tap-Bro AI crafts an authentic review.
        </p>
      </div>

      {/* Menu Categories & Chips */}
      <div className="space-y-3.5">
        {config.menuCategories.map((category) => (
          <div key={category.name} className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161822]/80 to-[#0F1118]/90 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300 mb-3">
              <span className="text-base">{category.icon}</span>
              <span>{category.name}</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {category.items.map((dish) => {
                const isSelected = selectedDishes.includes(dish);
                return (
                  <button
                    key={dish}
                    type="button"
                    onClick={() => toggleDish(dish)}
                    className={`chip-item flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FFE082] via-[#F5BA42] to-[#E59A1A] text-[#140F02] shadow-[0_4px_16px_rgba(245,186,66,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-amber-200 scale-[1.02]'
                        : 'bg-white/[0.04] text-zinc-300 border border-white/[0.08] hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-white'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 stroke-[3] text-[#140F02]" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-zinc-500" />
                    )}
                    <span>{dish}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Dish Adder */}
        <div className="rounded-2xl border border-dashed border-amber-400/25 bg-amber-400/[0.03] p-4 backdrop-blur-md">
          {!showAddCustom ? (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="flex w-full items-center justify-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 py-1 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Ordered something not listed? Add custom dish</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustomDish} className="space-y-2.5">
              <label className="block text-xs font-bold text-zinc-200">
                Add unlisted item:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDishInput}
                  onChange={(e) => setCustomDishInput(e.target.value)}
                  placeholder="e.g. Sizzling Brownie, Iced Tea"
                  className="flex-1 rounded-xl border border-white/[0.1] bg-[#0E1017] px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customDishInput.trim()}
                  className="rounded-xl btn-gold px-4 py-2 text-xs font-black disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Optional Diner Notes */}
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161822]/80 to-[#0F1118]/90 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <label htmlFor="customerNotes" className="flex items-center gap-1.5 text-xs font-bold text-white mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
            <span>Special Highlights or Memories (Optional)</span>
          </label>
          <input
            id="customerNotes"
            type="text"
            value={customerNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. Celebrated birthday, server Rahul was great, rooftop view"
            maxLength={180}
            className="w-full rounded-xl border border-white/[0.1] bg-[#0E1017] px-3.5 py-3 text-base sm:text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl btn-gold py-4 px-6 font-black text-sm sm:text-base shadow-xl transition-all duration-200 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4 fill-current" />
          <span>Generate AI Review Draft ➔</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to star ratings</span>
        </button>
      </div>
    </div>
  );
};
