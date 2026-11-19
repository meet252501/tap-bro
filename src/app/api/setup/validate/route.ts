import { NextRequest, NextResponse } from 'next/server';
import { getInviteByEmailAndTempPass } from '@/lib/db';
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

    const invite = getInviteByEmailAndTempPass(email, tempPass);

    if (!invite) {
      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'Invalid or expired temporary password for this email address.' },
        { status: 404 }
      );
    }

    // Clear failed attempts on valid code
    resetRateLimit(limitKey);

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        tempPass: invite.tempPass,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation error' }, { status: 500 });
  }
}
