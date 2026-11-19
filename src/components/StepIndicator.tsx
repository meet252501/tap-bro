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
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : isActive
                      ? 'bg-white text-black border border-white font-bold'
                      : 'bg-[#121216] border border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : ''}`} />}
                </div>
                <span
                  className={`text-[11px] sm:text-xs transition-colors tracking-tight ${
                    isActive ? 'text-white font-semibold' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {step.title}
                </span>
              </button>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 bg-zinc-800 rounded-full relative top-[-10px] overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-200"
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
