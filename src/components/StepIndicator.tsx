'use client';

import React from 'react';
import { Star, Utensils, Send, Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1, 2, or 3
  onStepClick: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: 1, title: 'Rate Experience', icon: Star },
    { id: 2, title: 'Dishes Tried', icon: Utensils },
    { id: 3, title: 'Draft & Share', icon: Send },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <button
                type="button"
                onClick={() => {
                  if (step.id < currentStep) {
                    onStepClick(step.id);
                  }
                }}
                disabled={isPending}
                className={`group flex flex-col items-center gap-1.5 focus:outline-none transition-all ${
                  isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                      : isActive
                      ? 'bg-gradient-to-br from-[#FFE48E] via-[#F5BA42] to-[#D97706] text-[#140E02] border border-amber-200 shadow-[0_0_22px_rgba(245,186,66,0.6),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-4 ring-amber-400/25 scale-110'
                      : 'bg-white/[0.03] border border-white/[0.08] text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5 stroke-[2.5]" /> : <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : ''}`} />}
                </div>
                <span
                  className={`text-[11px] font-bold transition-colors sm:text-xs tracking-tight ${
                    isActive ? 'text-amber-300 font-extrabold drop-shadow-[0_0_8px_rgba(245,186,66,0.4)]' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'
                  }`}
                >
                  {step.title}
                </span>
              </button>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-1 bg-white/[0.06] rounded-full relative top-[-10px] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,186,66,0.7)] transition-all duration-300"
                    style={{
                      width: currentStep > step.id ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
