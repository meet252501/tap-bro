import { NextRequest, NextResponse } from 'next/server';
import { ReviewDraftRequest } from '@/types/review';
import { generateUniversalReview } from '@/lib/aiProvider';
import { getRestaurantBySlug, incrementReviewCount } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Defense: Rate limit max 15 review requests per minute per IP to protect AI token quota
    const rateCheck = checkRateLimit(`review-draft:${ip}`, 15, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `AI request limit reached. Please wait ${rateCheck.resetSeconds}s before generating another draft.` },
        { status: 429 }
      );
    }

    const body = await req.json();

    const {
      locale,
      tone,
      ratings,
      selectedDishes,
      customerNotes,
      restaurantName,
      restaurantSlug,
      genderGrammar,
    } = body;

    // Check if restaurant slug is provided to lookup its preferences and track analytics
    const targetSlug = (restaurantSlug || body.slug);
    let matchedRest = null;
    if (targetSlug && typeof targetSlug === 'string') {
      matchedRest = getRestaurantBySlug(targetSlug);
      if (matchedRest) {
        incrementReviewCount(targetSlug);
      }
    }

    const validLocale = locale === 'hinglish' ? 'hinglish' : 'en';
    const validTone = ['flavorful', 'concise', 'hospitality', 'constructive'].includes(tone)
      ? tone
      : 'flavorful';

    const cleanRatings: Record<string, number> = {};
    if (ratings && typeof ratings === 'object') {
      ['food', 'service', 'ambiance', 'overall'].forEach((key) => {
        const val = ratings[key];
        if (typeof val === 'number' && val >= 1 && val <= 5) {
          cleanRatings[key] = Math.round(val);
        }
      });
    }

    const cleanDishes: string[] = Array.isArray(selectedDishes)
      ? selectedDishes
          .filter((item): item is string => typeof item === 'string')
          .map((s) => s.trim().slice(0, 100))
          .filter((s) => s.length > 0)
          .slice(0, 20)
      : [];

    const cleanNotes = typeof customerNotes === 'string' ? customerNotes.trim().slice(0, 500) : '';

    const effectiveRestName =
      matchedRest?.name ||
      (typeof restaurantName === 'string' && restaurantName.trim()
        ? restaurantName.trim().slice(0, 100)
        : 'The Restaurant');

    const draftRequest: ReviewDraftRequest = {
      locale: validLocale,
      tone: validTone,
      genderGrammar: ['masculine', 'feminine'].includes(genderGrammar) ? genderGrammar : 'neutral',
      ratings: cleanRatings,
      selectedDishes: cleanDishes,
      customerNotes: cleanNotes,
      restaurantName: effectiveRestName,
    };

    const aiProvider = matchedRest?.aiProvider || 'zero-cost';
    const customKey = matchedRest?.customApiKey;

    const result = await generateUniversalReview(draftRequest, aiProvider, customKey);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('API Error in /api/review-draft:', error);
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message: error?.message || 'Unable to generate review draft. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
