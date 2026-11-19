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
      <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <UtensilsCrossed className="h-3 w-3 text-zinc-400" />
            <span>Step 2 of 3 • Select Dishes</span>
          </span>
          <span className="text-[10px] text-zinc-300 font-mono bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 rounded-full">
            {selectedDishes.length} {selectedDishes.length === 1 ? 'dish' : 'dishes'} picked
          </span>
        </div>
        <h2 className="mt-2 text-lg sm:text-xl font-bold text-white tracking-tight">
          What did you taste today?
        </h2>
        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
          Tap the dishes you ordered so Tap-Bro AI crafts an authentic review.
        </p>
      </div>

      {/* Menu Categories & Chips */}
      <div className="space-y-3.5">
        {config.menuCategories.map((category) => (
          <div key={category.name} className="rounded-2xl border border-zinc-800 bg-[#121216] p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
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
                    className={`chip-item flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? 'bg-white text-black border border-white font-semibold'
                        : 'bg-[#18181B] text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5] text-black" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span>{dish}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Dish Adder */}
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4">
          {!showAddCustom ? (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="flex w-full items-center justify-center gap-2 text-xs font-medium text-zinc-300 hover:text-white py-1 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Ordered something not listed? Add custom dish</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustomDish} className="space-y-2.5">
              <label className="block text-xs font-medium text-zinc-200">
                Add unlisted item:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDishInput}
                  onChange={(e) => setCustomDishInput(e.target.value)}
                  placeholder="e.g. Sizzling Brownie, Iced Tea"
                  className="flex-1 rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customDishInput.trim()}
                  className="rounded-xl btn-gold px-4 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Optional Diner Notes */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4">
          <label htmlFor="customerNotes" className="flex items-center gap-1.5 text-xs font-semibold text-white mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
            <span>Special Highlights or Memories (Optional)</span>
          </label>
          <input
            id="customerNotes"
            type="text"
            value={customerNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. Celebrated birthday, server Rahul was great, rooftop view"
            maxLength={180}
            className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-3 text-base sm:text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-xl btn-gold py-3.5 px-6 font-semibold text-sm sm:text-base transition-all duration-150 active:scale-[0.98]"
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
