import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, getInviteByEmailAndTempPass } from '@/lib/db';
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
        { error: 'Authorized Email or Phone and Temporary Pass / PIN are required' },
        { status: 400 }
      );
    }

    const restaurant = authenticateAdmin(phone, pinOrId);

    if (!restaurant) {
      // Check if user has an authorized pending invite with this email and temporary pass
      const cleanEmail = phone.trim().toLowerCase();
      const invite = getInviteByEmailAndTempPass(cleanEmail, pinOrId.trim());
      if (invite) {
        resetRateLimit(limitKey);
        return NextResponse.json({
          success: true,
          pendingSetup: true,
          setupUrl: `/setup?email=${encodeURIComponent(cleanEmail)}&pass=${encodeURIComponent(pinOrId.trim())}`
        });
      }

      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'Access Denied: Unauthorized account. Manager portal is strictly invite-only. Please use the link or temporary pass sent to your email.' },
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
