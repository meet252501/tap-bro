import { NextRequest, NextResponse } from 'next/server';
import { getInviteStatusByEmailAndTempPass } from '@/lib/db';
import { isRateLimited, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitKey = `setup-validate:${ip}`;

    // Rate limit: max 8 failed validation attempts per 5 minutes per IP
    const { limited, resetSeconds } = isRateLimited(limitKey, 8, 300);
    if (limited) {
      return NextResponse.json(
        { error: `Too many failed validation attempts. Please wait ${resetSeconds}s before trying again.` },
        { status: 429 }
      );
    }

    const { email, tempPass } = await req.json();

    if (!email || !tempPass) {
      return NextResponse.json({ error: 'Email and temporary password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = tempPass.trim().toUpperCase();

    // Query database for invite state
    const inviteResult = await getInviteStatusByEmailAndTempPass(cleanEmail, cleanPass);

    // 1. Single-use enforcement: if already completed, block immediately
    if (inviteResult.status === 'completed') {
      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'This temporary pass has already been used. Temporary passes are strictly one-time use. Please log in using your permanent Admin PIN.' },
        { status: 409 }
      );
    }

    // 2. Expiration check
    if (inviteResult.status === 'expired') {
      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'This temporary pass has expired (passes are valid for 48 hours). Please request a fresh invite from Super Admin.' },
        { status: 410 }
      );
    }

    // 3. Invalid pass check
    if (inviteResult.status !== 'valid' || !inviteResult.invite) {
      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'Invalid temporary password for this email address. Please check your invitation email.' },
        { status: 404 }
      );
    }

    // Pass is active and pending
    resetRateLimit(limitKey);

    return NextResponse.json({
      success: true,
      invite: {
        id: inviteResult.invite.id,
        email: inviteResult.invite.email,
        tempPass: inviteResult.invite.tempPass,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation error' }, { status: 500 });
  }
}
