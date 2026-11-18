'use client';

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Plus, Check, Utensils, MessageSquare, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-border bg-surface-card/90 p-5 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2 text-amber-400">
          <Utensils className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Step 2 of 3</span>
        </div>
        <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
          What did you try during your visit?
        </h2>
        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
          Select items you ordered so your draft specifically mentions what you actually experienced.
        </p>
      </div>

      {/* Menu Categories & Chips */}
      <div className="space-y-5">
        {config.menuCategories.map((category) => (
          <div key={category.name} className="rounded-2xl border border-border/80 bg-surface-card/50 p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-3">
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
                    className={`chip-item flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-page font-semibold shadow-sm shadow-amber-400/30 ring-1 ring-amber-300'
                        : 'bg-surface-raised text-zinc-300 border border-border hover:border-amber-400/40 hover:text-white'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    <span>{dish}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Dish Adder */}
        <div className="rounded-2xl border border-dashed border-border/80 bg-surface-card/30 p-4">
          {!showAddCustom ? (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="flex items-center gap-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Didn&apos;t see what you had? Add a custom item</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustomDish} className="flex gap-2">
              <input
                type="text"
                value={customDishInput}
                onChange={(e) => setCustomDishInput(e.target.value)}
                placeholder="e.g. Samosa Chaat, Masala Soda..."
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-page hover:bg-amber-300 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="rounded-xl border border-border px-3 py-2 text-xs text-text-secondary hover:text-white"
              >
                Cancel
              </button>
            </form>
          )}

          {/* List of custom-added items not in main categories */}
          {selectedDishes.filter(
            (d) => !config.menuCategories.some((cat) => cat.items.includes(d))
          ).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/40">
              <span className="text-[11px] text-text-secondary self-center">Added items:</span>
              {selectedDishes
                .filter((d) => !config.menuCategories.some((cat) => cat.items.includes(d)))
                .map((dish) => (
                  <button
                    key={dish}
                    type="button"
                    onClick={() => toggleDish(dish)}
                    className="flex items-center gap-1 rounded-full bg-amber-400 text-page px-3 py-1 text-xs font-semibold"
                  >
                    <span>{dish}</span>
                    <span className="text-[10px] ml-1 opacity-70">✕</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Free-text Detail Box */}
      <div className="rounded-2xl border border-border bg-surface-card/60 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="customerNotes" className="flex items-center gap-2 text-xs font-semibold text-white">
            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
            <span>Specific compliments or suggestions (Optional)</span>
          </label>
          <span className="text-[11px] text-text-secondary">
            {customerNotes.length}/500
          </span>
        </div>
        <textarea
          id="customerNotes"
          rows={3}
          maxLength={500}
          value={customerNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. The green chutney was perfectly spiced! The table was ready on time, but wait time for breads was slightly high."
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <p className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <AlertCircle className="h-3 w-3 text-amber-400/70 shrink-0" />
          <span>Honest praise and constructive feedback are both welcome. Avoid sharing personal phone numbers or private data.</span>
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-raised py-3.5 px-4 text-xs font-semibold text-text-secondary hover:text-white hover:bg-surface-highlight transition active:scale-[0.99]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-6 text-xs sm:text-sm font-semibold text-page shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate Review Draft</span>
        </button>
      </div>
    </div>
  );
};
