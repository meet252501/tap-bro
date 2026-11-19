import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, getInviteStatusByEmailAndTempPass } from '@/lib/db';
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

    const restaurant = await authenticateAdmin(phone, pinOrId);

    if (!restaurant) {
      const cleanEmail = phone.trim().toLowerCase();
      const inviteResult = await getInviteStatusByEmailAndTempPass(cleanEmail, pinOrId.trim());

      // Single-use check: If temporary pass was already used to onboard, reject login and instruct to use PIN
      if (inviteResult.status === 'completed') {
        recordFailedAttempt(limitKey);
        return NextResponse.json(
          { error: 'This temporary pass has already been used. Please log in using your restaurant phone or email and your permanent Admin PIN.' },
          { status: 401 }
        );
      }

      // If pass is an active pending invite, redirect them to complete onboarding
      if (inviteResult.status === 'valid' && inviteResult.invite) {
        resetRateLimit(limitKey);
        return NextResponse.json({
          success: true,
          pendingSetup: true,
          setupUrl: `/setup?email=${encodeURIComponent(cleanEmail)}&pass=${encodeURIComponent(pinOrId.trim())}`
        });
      }

      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'Access Denied: Invalid credentials or expired temporary pass. Manager portal is strictly invite-only.' },
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
