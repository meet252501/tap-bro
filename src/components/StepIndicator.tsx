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
                      ? 'bg-amber-400 text-page shadow-amber-400/20'
                      : isActive
                      ? 'bg-surface-raised border-2 border-amber-400 text-amber-400 shadow-amber-400/30 ring-4 ring-amber-400/10'
                      : 'bg-surface-raised border border-border text-text-secondary'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5 stroke-[2.5]" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors sm:text-xs ${
                    isActive ? 'text-amber-400 font-semibold' : isCompleted ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {step.title}
                </span>
              </button>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 bg-border relative top-[-10px]">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
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
