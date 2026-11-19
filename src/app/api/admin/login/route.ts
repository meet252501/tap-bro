import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/db';
import { isRateLimited, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitKey = `admin-login:${ip}`;

    // Rate limit: max 6 failed login attempts per 5 minutes per IP
    const { limited, resetSeconds } = isRateLimited(limitKey, 6, 300);
    if (limited) {
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${resetSeconds}s before trying again.` },
        { status: 429 }
      );
    }

    const { phone, pinOrId } = await req.json();

    if (!phone || !pinOrId) {
      return NextResponse.json(
        { error: 'Phone number and Admin PIN / Restaurant ID are required' },
        { status: 400 }
      );
    }

    const restaurant = authenticateAdmin(phone, pinOrId);

    if (!restaurant) {
      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'Invalid Phone Number or PIN / Restaurant ID' },
        { status: 401 }
      );
    }

    // Clear failed attempts on valid login
    resetRateLimit(limitKey);

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        phone: restaurant.phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login error' }, { status: 500 });
  }
}
