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
  Flame,
  Zap,
  HeartHandshake,
  Scale,
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
  const [copiedAndOpened, setCopiedAndOpened] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#F5C84C', '#E5A93C', '#10B981', '#FFFFFF'],
    });
  };

  const copyToClipboard = async (): Promise<boolean> => {
    if (!draftText.trim()) return false;
    try {
      await navigator.clipboard.writeText(draftText);
      triggerConfetti();
      return true;
    } catch {
      const el = document.getElementById('reviewDraftTextarea') as HTMLTextAreaElement | null;
      if (el) {
        el.focus();
        el.select();
      }
      return false;
    }
  };

  const handleCopyOnly = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCopyAndOpenGoogle = async () => {
    await copyToClipboard();
    setCopiedAndOpened(true);

    if (config.googleReviewUrl) {
      setTimeout(() => {
        window.open(config.googleReviewUrl, '_blank', 'noopener,noreferrer');
      }, 300);
    }

    setTimeout(() => setCopiedAndOpened(false), 4000);
  };

  const toneOptions: { id: ReviewTone; label: string; desc: string; icon: React.ElementType }[] = [
    { id: 'flavorful', label: 'Foodie', desc: 'Flavors & tastes', icon: Flame },
    { id: 'concise', label: 'Crisp', desc: 'Short & punchy', icon: Zap },
    { id: 'hospitality', label: 'Hospitality', desc: 'Warm staff & care', icon: HeartHandshake },
    { id: 'constructive', label: 'Balanced', desc: 'Honest & helpful', icon: Scale },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-10">
      {/* Top Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-surface-card to-surface-card/80 p-4 sm:p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Step 3 of 3 • Review Draft
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 text-[10px] font-medium text-amber-300">
            <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            {source === 'ai' ? 'Tap-Bro AI' : 'Smart Draft Engine'}
          </span>
        </div>
        <h2 className="mt-1.5 text-base sm:text-lg font-extrabold text-white">
          Your Personal Review Draft
        </h2>
        <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
          Switch language or tone instantly below. You can also edit any words before posting.
        </p>
      </div>

      {/* Instant Segmented Controls: Language & Tone */}
      <div className="rounded-2xl border border-border/80 bg-surface-card/70 p-3.5 sm:p-4 space-y-3.5 backdrop-blur-sm shadow-md">
        {/* Language Segmented Pill */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
              <Globe className="h-3 w-3 text-amber-400" />
              <span>Language</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">1-tap switch</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface border border-border/60">
            <button
              type="button"
              onClick={() => onLocaleChange('en')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                locale === 'en'
                  ? 'bg-amber-400 text-page shadow-sm shadow-amber-400/20 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange('hinglish')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                locale === 'hinglish'
                  ? 'bg-amber-400 text-page shadow-sm shadow-amber-400/20 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 Hinglish</span>
            </button>
          </div>
        </div>

        {/* Tone Selector: 4 Instant Tactile Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
              <SlidersHorizontal className="h-3 w-3 text-amber-400" />
              <span>Tone Style</span>
            </span>
            <span className="text-[10px] text-amber-400/80">Instant switch (0ms)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {toneOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = tone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToneChange(opt.id)}
                  className={`flex flex-col items-start rounded-xl p-2.5 text-left border transition-all duration-150 active:scale-[0.97] ${
                    isSelected
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/30 shadow-sm'
                      : 'bg-surface border-border/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="text-xs font-bold leading-none">{opt.label}</span>
                  </div>
                  <span className="text-[10px] text-text-secondary leading-tight line-clamp-1">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hinglish Verb Agreement (Only when Hinglish active) */}
        {locale === 'hinglish' && (
          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Hindi grammar:</span>
            <div className="flex gap-1.5">
              {(['neutral', 'masculine', 'feminine'] as GenderGrammar[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onGenderGrammarChange(g)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-medium capitalize border transition ${
                    genderGrammar === g
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-surface border-border/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editable Draft Area */}
      <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-3 shadow-xl relative">
        <div className="flex items-center justify-between">
          <label htmlFor="reviewDraftTextarea" className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Tap Below to Edit Review</span>
          </label>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Refreshing...' : 'New Drafts'}</span>
          </button>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="relative">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" />
              <Sparkles className="h-4 w-4 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs font-medium text-amber-300">
              Generating review variations for you...
            </p>
          </div>
        ) : (
          <textarea
            id="reviewDraftTextarea"
            rows={5}
            value={draftText}
            onChange={(e) => onDraftTextChange(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-surface px-3.5 py-3 text-[15px] sm:text-sm text-white placeholder-zinc-500 leading-relaxed focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
            placeholder="Your draft will appear here..."
          />
        )}

        <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
          <span>{draftText.length} characters</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>Ready to post</span>
          </span>
        </div>
      </div>

      {/* Prominent Mobile-First CTA Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Super Button: 1-Tap Copy & Open Google Reviews */}
        <button
          type="button"
          onClick={handleCopyAndOpenGoogle}
          disabled={!draftText.trim() || isGenerating}
          className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 px-6 font-extrabold text-sm sm:text-base transition-all duration-150 active:scale-[0.98] shadow-xl ${
            copiedAndOpened
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-page shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400'
          }`}
        >
          {copiedAndOpened ? (
            <>
              <Check className="h-5 w-5 stroke-[3]" />
              <span>Copied! Opening Google Reviews...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 fill-current" />
              <span>Copy & Open Google Reviews 🚀</span>
            </>
          )}
        </button>

        {/* Secondary: Copy Only */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyOnly}
            disabled={!draftText.trim() || isGenerating}
            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold transition active:scale-95 ${
              copied
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-border bg-surface-raised text-zinc-300 hover:text-white hover:border-amber-400/50'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 text-amber-400" />}
            <span>{copied ? 'Copied!' : 'Copy Text Only'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (config.googleReviewUrl) {
                window.open(config.googleReviewUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-raised py-2.5 px-3 text-xs font-semibold text-zinc-300 hover:text-white hover:border-amber-400/50 transition active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
            <span>Open Google Only</span>
          </button>
        </div>

        {/* Back Link */}
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-text-secondary hover:text-white transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to edit dishes or ratings</span>
        </button>
      </div>

      {/* How to Post Card */}
      <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3.5 space-y-2 text-xs">
        <h3 className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>How to post your review in 10 seconds</span>
        </h3>
        <ol className="text-zinc-300 space-y-1 list-decimal list-inside leading-relaxed text-[11px]">
          <li>Tap <strong className="text-white">Copy &amp; Open Google Reviews</strong> above.</li>
          <li>Google will open. Tap your star rating (e.g. 5★).</li>
          <li>Paste your copied review text and tap <strong className="text-white">Post</strong>. Done! 🎉</li>
        </ol>
      </div>
    </div>
  );
};
