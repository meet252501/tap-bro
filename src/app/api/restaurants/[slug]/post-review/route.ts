import { NextRequest, NextResponse } from 'next/server';
import { recordConfirmedPostedReview } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Missing restaurant slug' }, { status: 400 });
    }

    const body = await req.json();
    const { ratings, selectedDishes, reviewDraft, tone, locale } = body;

    if (!reviewDraft || typeof reviewDraft !== 'string') {
      return NextResponse.json({ error: 'Review draft text is required' }, { status: 400 });
    }

    const record = await recordConfirmedPostedReview(slug, {
      ratings: ratings || { overall: 5 },
      selectedDishes: Array.isArray(selectedDishes) ? selectedDishes : [],
      reviewDraft: reviewDraft.trim(),
      tone: tone || 'flavorful',
      locale: locale || 'en',
    });

    if (!record) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review successfully recorded as posted to Google',
      review: record,
    });
  } catch (error: any) {
    console.error('Error recording posted review:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record posted review' },
      { status: 500 }
    );
  }
}
