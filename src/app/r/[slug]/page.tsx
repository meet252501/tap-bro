'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { StepRatings } from '@/components/StepRatings';
import { StepDishes } from '@/components/StepDishes';
import { StepDraft } from '@/components/StepDraft';
import { Footer } from '@/components/Footer';
import {
  ExperienceRatings,
  RestaurantConfig,
  ReviewLanguage,
  ReviewTone,
  GenderGrammar,
  ReviewDraftRequest,
  ReviewDraftResponse,
  MultiReviewDrafts,
} from '@/types/review';
import { UtensilsCrossed, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function RestaurantDinerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3-Step Review State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [ratings, setRatings] = useState<ExperienceRatings>({});
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [customerNotes, setCustomerNotes] = useState<string>('');

  const [locale, setLocale] = useState<ReviewLanguage>('en');
  const [tone, setTone] = useState<ReviewTone>('flavorful');
  const [genderGrammar, setGenderGrammar] = useState<GenderGrammar>('neutral');
  const [draftText, setDraftText] = useState<string>('');
  const [draftsBundle, setDraftsBundle] = useState<MultiReviewDrafts | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [draftSource, setDraftSource] = useState<'ai' | 'fallback' | null>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/restaurants/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.restaurant) {
          const rest = data.restaurant;
          const config: RestaurantConfig = {
            name: rest.name,
            tagline: rest.tagline,
            cuisine: rest.cuisine,
            location: rest.location || '',
            googleReviewUrl: rest.googleReviewUrl,
            menuCategories: rest.menuCategories || [],
          };
          setRestaurant(config);
          // Pre-select first 1-2 dishes as an inviting starting point
          const firstCategory = config.menuCategories[0];
          if (firstCategory && firstCategory.items.length > 0) {
            setSelectedDishes([firstCategory.items[0]]);
          }
        } else {
          setError(data.error || 'Restaurant not found');
        }
      })
      .catch((err) => {
        setError('Failed to load restaurant details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const generateDraft = async (
    targetLocale: ReviewLanguage = locale,
    targetTone: ReviewTone = tone,
    targetGender: GenderGrammar = genderGrammar,
    forceRefresh: boolean = false
  ) => {
    if (!restaurant) return;
    setIsGenerating(true);

    try {
      const payload: ReviewDraftRequest & { restaurantSlug?: string } = {
        locale: targetLocale,
        tone: targetTone,
        genderGrammar: targetGender,
        ratings,
        selectedDishes,
        customerNotes,
        restaurantName: restaurant.name,
        restaurantSlug: slug,
      };

      const res = await fetch('/api/review-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data: ReviewDraftResponse = await res.json();
      setDraftText(data.draft);
      setDraftSource(data.source);
      if (data.drafts) {
        setDraftsBundle(data.drafts);
      }
    } catch (err) {
      const dishesStr = selectedDishes.length > 0 ? selectedDishes.join(', ') : 'great dishes';
      setDraftText(
        `Visited ${restaurant.name} and really enjoyed the ${dishesStr}. The overall dining experience was pleasant and worth recommending.`
      );
      setDraftSource('fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToStep2 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep3 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    generateDraft(locale, tone, genderGrammar);
  };

  // 1-call multi-draft architecture: Instant 0ms switch without network requests!
  const handleLocaleChange = (newLocale: ReviewLanguage) => {
    setLocale(newLocale);
    if (draftsBundle && draftsBundle[newLocale]?.[tone]) {
      setDraftText(draftsBundle[newLocale][tone]);
    } else {
      generateDraft(newLocale, tone, genderGrammar);
    }
  };

  const handleToneChange = (newTone: ReviewTone) => {
    setTone(newTone);
    if (draftsBundle && draftsBundle[locale]?.[newTone]) {
      setDraftText(draftsBundle[locale][newTone]);
    } else {
      generateDraft(locale, newTone, genderGrammar);
    }
  };

  const handleGenderGrammarChange = (newGrammar: GenderGrammar) => {
    setGenderGrammar(newGrammar);
    generateDraft(locale, tone, newGrammar, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-400/20 border-t-indigo-400" />
          <p className="text-xs font-medium text-indigo-300">Loading restaurant review station...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-6 text-center shadow-xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-white">Table Stand Not Found</h2>
          <p className="text-xs text-text-secondary">
            This QR code or link does not appear to be linked to an active restaurant profile.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-raised border border-border px-4 py-2.5 text-xs font-semibold text-white hover:bg-surface-highlight transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-page flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Dynamic Restaurant Header */}
        <Header config={restaurant} onOpenSettings={() => router.push(`/admin/${slug}`)} />

        <main className="mx-auto w-full max-w-md px-4 py-4 flex-1">
          {/* Stepper */}
          <StepIndicator currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />

          {/* Step 1: Ratings */}
          {currentStep === 1 && (
            <StepRatings
              ratings={ratings}
              onChange={setRatings}
              onNext={handleProceedToStep2}
            />
          )}

          {/* Step 2: Dishes */}
          {currentStep === 2 && (
            <StepDishes
              config={restaurant}
              selectedDishes={selectedDishes}
              customerNotes={customerNotes}
              onDishesChange={setSelectedDishes}
              onNotesChange={setCustomerNotes}
              onBack={() => setCurrentStep(1)}
              onNext={handleProceedToStep3}
            />
          )}

          {/* Step 3: AI Draft & Google Share */}
          {currentStep === 3 && (
            <StepDraft
              config={restaurant}
              draftText={draftText}
              isGenerating={isGenerating}
              locale={locale}
              tone={tone}
              genderGrammar={genderGrammar}
              source={draftSource}
              onDraftTextChange={setDraftText}
              onLocaleChange={handleLocaleChange}
              onToneChange={handleToneChange}
              onGenderGrammarChange={handleGenderGrammarChange}
              onRegenerate={() => generateDraft(locale, tone, genderGrammar, true)}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
