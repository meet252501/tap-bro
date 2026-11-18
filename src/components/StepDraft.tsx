'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  Globe,
  SlidersHorizontal,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  RestaurantConfig,
  ReviewLanguage,
  ReviewTone,
  GenderGrammar,
} from '@/types/review';

interface StepDraftProps {
  config: RestaurantConfig;
  draftText: string;
  isGenerating: boolean;
  locale: ReviewLanguage;
  tone: ReviewTone;
  genderGrammar: GenderGrammar;
  source: 'ai' | 'fallback' | null;
  onDraftTextChange: (text: string) => void;
  onLocaleChange: (locale: ReviewLanguage) => void;
  onToneChange: (tone: ReviewTone) => void;
  onGenderGrammarChange: (g: GenderGrammar) => void;
  onRegenerate: () => void;
  onBack: () => void;
}

export const StepDraft: React.FC<StepDraftProps> = ({
  config,
  draftText,
  isGenerating,
  locale,
  tone,
  genderGrammar,
  source,
  onDraftTextChange,
  onLocaleChange,
  onToneChange,
  onGenderGrammarChange,
  onRegenerate,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [googleOpened, setGoogleOpened] = useState(false);

  const handleCopy = async () => {
    if (!draftText.trim()) return;

    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F5C84C', '#E5A93C', '#10B981', '#FFFFFF'],
      });

      setTimeout(() => setCopied(false), 3500);
    } catch (err) {
      console.warn('Clipboard write failed; falling back to manual copy prompt:', err);
      // Select the textarea so user can manual copy
      const el = document.getElementById('reviewDraftTextarea') as HTMLTextAreaElement | null;
      if (el) {
        el.focus();
        el.select();
      }
    }
  };

  const handleOpenGoogle = () => {
    if (config.googleReviewUrl) {
      window.open(config.googleReviewUrl, '_blank', 'noopener,noreferrer');
      setGoogleOpened(true);
      setTimeout(() => setGoogleOpened(false), 5000);
    }
  };

  const toneOptions: { id: ReviewTone; label: string; desc: string }[] = [
    { id: 'flavorful', label: 'Foodie & Flavorful', desc: 'Focus on taste & textures' },
    { id: 'concise', label: 'Quick & Crisp', desc: 'Short, punchy 2-3 sentences' },
    { id: 'hospitality', label: 'Warm & Gracious', desc: 'Highlights hospitality & service' },
    { id: 'constructive', label: 'Balanced & Honest', desc: 'Equitable pros & suggestions' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Step Header */}
      <div className="rounded-2xl border border-amber-500/20 bg-surface-card/90 p-5 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Step 3 of 3 • Review Draft
          </span>
          {source && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised border border-border px-2 py-0.5 text-[10px] text-text-secondary">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
              {source === 'ai' ? 'Gemini AI Powered' : 'Smart Draft Engine'}
            </span>
          )}
        </div>
        <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
          Your Personal Review Draft
        </h2>
        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
          Review, customize, and edit the wording below. You are in full control of your review before posting.
        </p>
      </div>

      {/* Language & Tone Preferences */}
      <div className="rounded-2xl border border-border bg-surface-card/60 p-4 space-y-4">
        {/* Language Selection */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-white mb-2">
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>Review Language</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onLocaleChange('en')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                locale === 'en'
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-semibold shadow-sm'
                  : 'bg-surface-raised border-border text-text-secondary hover:text-white'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange('hinglish')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                locale === 'hinglish'
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-semibold shadow-sm'
                  : 'bg-surface-raised border-border text-text-secondary hover:text-white'
              }`}
            >
              <span>🇮🇳 Hinglish (Conversational)</span>
            </button>
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-white mb-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <span>Writing Tone</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {toneOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToneChange(opt.id)}
                className={`flex flex-col items-start rounded-xl p-2.5 text-left border transition-all ${
                  tone === opt.id
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-semibold shadow-sm'
                    : 'bg-surface-raised border-border text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] text-text-secondary mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hinglish Gender Grammar (Neutral, Masculine, Feminine per PRD) */}
        {locale === 'hinglish' && (
          <div className="pt-2 border-t border-border/40">
            <span className="text-[11px] text-text-secondary font-medium block mb-1.5">
              Hindi verb agreement (Optional):
            </span>
            <div className="flex gap-2">
              {(['neutral', 'masculine', 'feminine'] as GenderGrammar[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onGenderGrammarChange(g)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] capitalize border transition ${
                    genderGrammar === g
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-semibold'
                      : 'bg-surface border-border text-text-secondary hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Draft Text Editor Card */}
      <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-3 shadow-xl relative">
        <div className="flex items-center justify-between">
          <label htmlFor="reviewDraftTextarea" className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Editable Review Draft</span>
          </label>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate Draft'}</span>
          </button>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="relative">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" />
              <Sparkles className="h-4 w-4 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs font-medium text-amber-300">
              Crafting your culinary review draft...
            </p>
          </div>
        ) : (
          <textarea
            id="reviewDraftTextarea"
            rows={5}
            value={draftText}
            onChange={(e) => onDraftTextChange(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-surface px-3.5 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 leading-relaxed focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
            placeholder="Your draft will appear here..."
          />
        )}

        <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
          <span>{draftText.length} characters</span>
          <span className="flex items-center gap-1 text-emerald-400/90">
            <ShieldCheck className="h-3 w-3" />
            <span>Ready to copy & edit</span>
          </span>
        </div>
      </div>

      {/* Post & Action Guide Card */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>How to post your review on Google</span>
        </h3>
        <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>
            Click <strong className="text-white">Copy Review</strong> to save the text to your clipboard.
          </li>
          <li>
            Click <strong className="text-white">Open Google Reviews</strong> to launch the official Google page.
          </li>
          <li>
            Paste your draft, rate your stars, and tap <strong className="text-white">Post</strong>.
          </li>
        </ol>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!draftText.trim() || isGenerating}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-semibold transition-all active:scale-[0.99] shadow-lg ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-page shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Review Copied to Clipboard! 🎉</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Review Text</span>
            </>
          )}
        </button>

        {/* Open Google Reviews Button */}
        <button
          type="button"
          onClick={handleOpenGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-raised py-3.5 px-6 font-semibold text-white transition hover:border-amber-400/50 hover:bg-surface-highlight active:scale-[0.99]"
        >
          <ExternalLink className="h-4 w-4 text-amber-400" />
          <span>{googleOpened ? 'Google Reviews Opened in New Tab' : 'Open Google Reviews'}</span>
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-text-secondary hover:text-white transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to edit dishes or ratings</span>
        </button>
      </div>

      {/* Ethical Transparency Disclaimer */}
      <div className="pt-2 text-center text-[11px] text-zinc-500 leading-normal">
        <p>
          Honesty First: Review AI provides suggested wording based solely on your visit details.
          Reviews are submitted by you directly on Google Reviews.
        </p>
      </div>
    </div>
  );
};
