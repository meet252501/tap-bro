import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantBySlug, resetRestaurantMonthlyCycle, computeReviewAnalytics } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Missing restaurant slug' }, { status: 400 });
    }

    const rest = await getRestaurantBySlug(slug);
    if (!rest) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const reviews = rest.reviewsLog || [];
    const analytics = computeReviewAnalytics(reviews, rest.cycleStartDate);

    return NextResponse.json({
      success: true,
      analytics,
      cycleStartDate: rest.cycleStartDate || rest.createdAt,
      lastMonthlyReportSentAt: rest.lastMonthlyReportSentAt || null,
      monthlyArchivedCount: rest.monthlyArchivedCount || 0,
      totalCurrentReviews: reviews.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Missing restaurant slug' }, { status: 400 });
    }

    const result = await resetRestaurantMonthlyCycle(slug);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
