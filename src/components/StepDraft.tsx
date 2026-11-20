'use client';

import React, { useState, useEffect } from 'react';
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
  Star,
  ArrowRight,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  RestaurantConfig,
  ReviewLanguage,
  ReviewTone,
  GenderGrammar,
  ExperienceRatings,
} from '@/types/review';

interface StepDraftProps {
  config: RestaurantConfig;
  restaurantSlug?: string;
  selectedDishes?: string[];
  ratings?: ExperienceRatings;
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
  restaurantSlug,
  selectedDishes,
  ratings,
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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showGuideModal && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showGuideModal && redirectCountdown === 0) {
      const reviewUrl =
        config.googleReviewUrl && config.googleReviewUrl.trim().length > 0
          ? config.googleReviewUrl.trim()
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              [config.name, config.location].filter(Boolean).join(' ') || 'restaurant'
            )}`;
      window.location.href = /^https?:\/\//i.test(reviewUrl) ? reviewUrl : `https://${reviewUrl}`;
    }
    return () => clearTimeout(timer);
  }, [showGuideModal, redirectCountdown, config]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#F5C84C', '#E5A93C', '#10B981', '#FFFFFF'],
    });
  };

  const performRobustCopy = async (text: string): Promise<boolean> => {
    if (!text || !text.trim()) return false;

    let success = false;

    // Layer 1: Synchronous textarea execution (100% reliable on iOS & Android touch gestures)
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      el.style.opacity = '0';
      el.setAttribute('readonly', '');
      document.body.appendChild(el);

      el.focus();
      el.select();
      el.setSelectionRange(0, 999999);

      success = document.execCommand('copy');
      document.body.removeChild(el);
    } catch (e) {
      console.warn('execCommand copy fallback failed:', e);
    }

    // Layer 2: Modern Navigator Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('navigator.clipboard write failed:', err);
      }
    }

    // Layer 3: Direct selection fallback on visible draft textarea
    if (!success) {
      try {
        const visibleEl = document.getElementById('reviewDraftTextarea') as HTMLTextAreaElement | null;
        if (visibleEl) {
          visibleEl.focus();
          visibleEl.select();
          visibleEl.setSelectionRange(0, 999999);
          success = document.execCommand('copy');
        }
      } catch (e) {}
    }

    return success;
  };

  const copyToClipboard = async (): Promise<boolean> => {
    const ok = await performRobustCopy(draftText);
    if (ok) triggerConfetti();
    return ok;
  };

  const handleCopyOnly = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCopyAndOpenGoogle = async () => {
    // 1. Resolve effective Google Maps target (Direct 5-star review popup or search fallback)
    let reviewUrl =
      config.googleReviewUrl && config.googleReviewUrl.trim().length > 0
        ? config.googleReviewUrl.trim()
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [config.name, config.location].filter(Boolean).join(' ') || 'restaurant'
          )}`;

    if (!/^https?:\/\//i.test(reviewUrl)) {
      reviewUrl = `https://${reviewUrl}`;
    }

    // 2. Perform bulletproof synchronous + async copy before page navigation
    await performRobustCopy(draftText);
    triggerConfetti();
    setCopiedAndOpened(true);

    // Record review event to database (fire and forget beacon or fetch)
    if (restaurantSlug) {
      try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(
            `/api/restaurants/${restaurantSlug}/post-review`,
            JSON.stringify({
              reviewDraft: draftText,
              selectedDishes: selectedDishes || [],
              ratings: ratings || { overall: 5 },
              tone,
              locale,
            })
          );
        } else {
          fetch(`/api/restaurants/${restaurantSlug}/post-review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reviewDraft: draftText,
              selectedDishes: selectedDishes || [],
              ratings: ratings || { overall: 5 },
              tone,
              locale,
            }),
          }).catch((e) => console.warn('Could not record review post event:', e));
        }
      } catch {}
    }

    // Launch instant tactile 2-step guide modal with auto-redirect countdown
    setRedirectCountdown(3);
    setShowGuideModal(true);
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
      <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-zinc-400" />
            <span>Step 3 of 3 • Review Draft</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300">
            <Sparkles className="h-2.5 w-2.5 text-zinc-400" />
            <span>{source === 'ai' ? 'Tap-Bro AI' : 'Smart Draft Engine'}</span>
          </span>
        </div>
        <h2 className="mt-1 text-base sm:text-lg font-bold text-white relative z-10 tracking-tight">
          Your Personal Review Draft
        </h2>
        <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed relative z-10">
          Review is generated and ready to post. Tap below to copy and open Google Reviews!
        </p>
      </div>

      {/* Editable Draft Area - Shown FIRST so diner sees review immediately */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-3 relative shadow-md">
        <div className="flex items-center justify-between">
          <label htmlFor="reviewDraftTextarea" className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Tap Below to Edit Review</span>
          </label>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyOnly}
              disabled={isGenerating || !draftText.trim()}
              className="flex items-center gap-1 text-[11px] font-semibold text-zinc-200 hover:text-white transition active:scale-95 disabled:opacity-50 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white transition active:scale-95 disabled:opacity-50 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Refreshing...' : 'New Drafts'}</span>
            </button>
          </div>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="relative">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
              <Sparkles className="h-4 w-4 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs font-medium text-zinc-300">
              Generating review variations for you...
            </p>
          </div>
        ) : (
          <textarea
            id="reviewDraftTextarea"
            rows={4}
            value={draftText}
            onChange={(e) => onDraftTextChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-3 text-sm text-white placeholder-zinc-500 leading-relaxed focus:border-amber-400 focus:outline-none transition font-sans"
            placeholder="Your draft will appear here..."
          />
        )}

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5 font-medium">
          <span>{draftText.length} characters</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Ready to post</span>
          </span>
        </div>
      </div>

      {/* Instant Controls: Language & Tone (Compact below draft) */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-3.5 space-y-3">
        {/* Language Segmented Pill */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
            <Globe className="h-3 w-3 text-zinc-400" />
            <span>Language</span>
          </span>

          <div className="inline-flex p-0.5 rounded-lg bg-[#0A0A0C] border border-zinc-800">
            <button
              type="button"
              onClick={() => onLocaleChange('en')}
              className={`rounded-md py-1 px-2.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                locale === 'en'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange('hinglish')}
              className={`rounded-md py-1 px-2.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                locale === 'hinglish'
                  ? 'bg-white text-black shadow-sm'
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
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
              <SlidersHorizontal className="h-3 w-3 text-zinc-400" />
              <span>Tone Style</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">0ms switch</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {toneOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = tone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToneChange(opt.id)}
                  className={`flex items-center gap-1.5 rounded-xl py-2 px-2.5 text-left border transition-all duration-150 active:scale-[0.97] ${
                    isSelected
                      ? 'bg-[#18181B] border-amber-400/70 text-white font-semibold'
                      : 'bg-[#0A0A0C] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span className="text-xs font-medium leading-none truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hinglish Verb Agreement (Only when Hinglish active) */}
        {locale === 'hinglish' && (
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Hindi grammar:</span>
            <div className="flex gap-1.5">
              {(['neutral', 'masculine', 'feminine'] as GenderGrammar[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onGenderGrammarChange(g)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold capitalize border transition ${
                    genderGrammar === g
                      ? 'bg-white text-black border-white'
                      : 'bg-[#0A0A0C] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How to Post Quick Guide */}
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>How to Post Your Review</span>
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">1-Tap Copy ➔ Paste</span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Google security policy blocks all external apps from auto-typing into Google reviews to prevent spam bots. Tap-Bro copies your draft to your phone clipboard instantly:
        </p>
        <div className="rounded-xl bg-[#0A0A0C] border border-zinc-800 p-2.5 space-y-1.5 text-[11px]">
          <p className="text-white font-medium flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
            <span>Tap button below ➔ Your review is <strong className="text-emerald-400">auto-copied</strong> to clipboard.</span>
          </p>
          <p className="text-white font-medium flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
            <span>Google dialog opens ➔ Tap <strong className="text-amber-400">5 Stars ⭐⭐⭐⭐⭐</strong></span>
          </p>
          <p className="text-white font-medium flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
            <span>Tap the review box ➔ Tap <strong className="text-amber-300">Paste</strong> (or keyboard chip) ➔ Tap <strong className="text-white">Post</strong>! 🎉</span>
          </p>
        </div>
      </div>

      {/* Sticky Mobile-First CTA Action Bar (Always docked at bottom of phone screen) */}
      <div className="sticky bottom-0 z-30 bg-[#0A0A0C]/95 backdrop-blur-xl border-t border-zinc-800/80 -mx-4 px-4 py-3 space-y-2">
        {/* Super Button: 1-Tap Copy & Open Google Reviews */}
        <button
          type="button"
          onClick={handleCopyAndOpenGoogle}
          disabled={!draftText.trim() || isGenerating}
          className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 px-6 font-semibold text-sm sm:text-base transition-all duration-150 active:scale-[0.98] ${
            copiedAndOpened
              ? 'bg-zinc-800 text-white border border-zinc-600'
              : 'btn-gold'
          }`}
        >
          {copiedAndOpened ? (
            <>
              <Check className="h-5 w-5 stroke-[2.5]" />
              <span>Copied! Opening Google Reviews...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 fill-current" />
              <span>Copy & Open Google Reviews 🚀</span>
            </>
          )}
        </button>

        {/* Fallback Toast (Appears when customer taps button) */}
        {copiedAndOpened && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center text-xs text-emerald-300 animate-fade-in flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Review copied! Redirecting to Google...</span>
          </div>
        )}

        {/* Fallback Toast & Visible Direct Link for customer phones & in-app QR scanners */}
        <div className="text-center pt-0.5 pb-1">
          <a
            href={
              config.googleReviewUrl && config.googleReviewUrl.trim().length > 0
                ? config.googleReviewUrl.trim()
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [config.name, config.location].filter(Boolean).join(' ') || 'restaurant'
                  )}`
            }
            className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2 transition inline-flex items-center gap-1"
          >
            <span>Didn&apos;t open automatically? Tap here</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Secondary: Copy Only & Open Google */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyOnly}
            disabled={!draftText.trim() || isGenerating}
            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold transition active:scale-95 ${
              copied
                ? 'border-zinc-500 bg-zinc-800 text-white'
                : 'border-zinc-800 bg-[#18181B] text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
            <span>{copied ? 'Copied!' : 'Copy Text Only'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const reviewUrl =
                config.googleReviewUrl && config.googleReviewUrl.trim().length > 0
                  ? config.googleReviewUrl.trim()
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [config.name, config.location].filter(Boolean).join(' ') || 'restaurant'
                    )}`;
              window.location.href = reviewUrl;
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#18181B] py-2.5 px-3 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            <span>Open Google Only</span>
          </button>
        </div>

        {/* Back Link */}
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1 py-1 text-xs font-medium text-zinc-400 hover:text-white transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to edit dishes or ratings</span>
        </button>
      </div>

      {/* 2-Step Mobile Paste Guidance Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-700/80 bg-[#121216] p-5 sm:p-6 space-y-4 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Review Copied to Clipboard!
                </h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  Ready to post for {config.name}
                </p>
              </div>
            </div>

            {/* 2-Step Instructions */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0A0A0C] p-3.5 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 font-mono">
                  1
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <span>Select 5 Stars</span>
                    <div className="flex text-amber-400 ml-1">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <Star className="h-3 w-3 fill-amber-400" />
                      <Star className="h-3 w-3 fill-amber-400" />
                      <Star className="h-3 w-3 fill-amber-400" />
                      <Star className="h-3 w-3 fill-amber-400" />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Tap the 5th star on Google to leave a top rating.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-zinc-800/80">
                <div className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 font-mono">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span>Tap Box &amp; Tap &quot;Paste&quot;</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">or keyboard chip</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    Google security policy blocks all external apps from auto-typing into reviews to prevent spam bots. Simply tap the text box and select <strong>Paste</strong>!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const reviewUrl =
                    config.googleReviewUrl && config.googleReviewUrl.trim().length > 0
                      ? config.googleReviewUrl.trim()
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          [config.name, config.location].filter(Boolean).join(' ') || 'restaurant'
                        )}`;
                  window.location.href = /^https?:\/\//i.test(reviewUrl) ? reviewUrl : `https://${reviewUrl}`;
                }}
                className="w-full btn-gold rounded-xl py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <span>Open Google Reviews Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
                <span>
                  Redirecting in <strong className="text-white font-mono">{redirectCountdown}s</strong>...
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await performRobustCopy(draftText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-amber-400 hover:underline font-medium"
                >
                  {copied ? '✓ Copied Again!' : '📋 Copy Text Again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
