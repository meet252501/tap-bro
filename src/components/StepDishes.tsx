'use client';

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Plus, Check, Utensils, MessageSquare } from 'lucide-react';
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
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-surface-card to-surface-card/80 p-4 sm:p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Step 2 of 3 • Select Dishes
          </span>
          <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            {selectedDishes.length} {selectedDishes.length === 1 ? 'dish' : 'dishes'} picked
          </span>
        </div>
        <h2 className="mt-1 text-base sm:text-lg font-extrabold text-white">
          What did you taste today?
        </h2>
        <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
          Tap the dishes you ordered so Tap-Bro AI crafts an authentic review.
        </p>
      </div>

      {/* Menu Categories & Chips */}
      <div className="space-y-3.5">
        {config.menuCategories.map((category) => (
          <div key={category.name} className="rounded-2xl border border-border/80 bg-surface-card/70 p-3.5 sm:p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-2.5">
              <span className="text-sm">{category.icon}</span>
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
                    className={`chip-item flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400 text-page font-bold shadow-md shadow-amber-400/25 ring-1 ring-amber-300'
                        : 'bg-surface text-zinc-300 border border-border/70 hover:border-amber-400/50 hover:text-white'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 stroke-[3] text-page" />
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
        <div className="rounded-2xl border border-dashed border-border/90 bg-surface-card/40 p-3.5">
          {!showAddCustom ? (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 py-1 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Ordered something not listed? Add custom dish</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustomDish} className="space-y-2.5">
              <label className="block text-xs font-medium text-zinc-300">
                Add unlisted item:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDishInput}
                  onChange={(e) => setCustomDishInput(e.target.value)}
                  placeholder="e.g. Sizzling Brownie, Iced Tea"
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customDishInput.trim()}
                  className="rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-page hover:bg-amber-300 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="rounded-xl border border-border px-3 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Optional Diner Notes */}
        <div className="rounded-2xl border border-border/80 bg-surface-card/70 p-3.5 sm:p-4">
          <label htmlFor="customerNotes" className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5">
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
            className="w-full rounded-xl border border-border/80 bg-surface px-3.5 py-3 text-base sm:text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 px-6 font-extrabold text-sm sm:text-base text-page shadow-xl shadow-amber-500/20 transition-all duration-150 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4 fill-current" />
          <span>Generate AI Review Draft ➔</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-text-secondary hover:text-white transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to star ratings</span>
        </button>
      </div>
    </div>
  );
};
