import { NextRequest, NextResponse } from 'next/server';
import { getInviteByEmailAndTempPass } from '@/lib/db';
import { isRateLimited, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyInviteToken, isValidPassForEmail } from '@/lib/tokens';

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

    const { email, tempPass, token } = await req.json();

    if (!email || !tempPass) {
      return NextResponse.json({ error: 'Email and temporary password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = tempPass.trim().toUpperCase();

    // 1. Check signed cryptographic token first (stateless resilience across serverless instances)
    if (token) {
      const tokenResult = verifyInviteToken(token, cleanEmail, cleanPass);
      if (tokenResult.valid) {
        resetRateLimit(limitKey);
        return NextResponse.json({
          success: true,
          invite: {
            id: `INV_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
            email: cleanEmail,
            tempPass: cleanPass,
          },
        });
      } else if (tokenResult.expired) {
        return NextResponse.json(
          { error: 'This temporary pass has expired (passes are valid for 48 hours). Please request a new invite from Super Admin.' },
          { status: 410 }
        );
      }
    }

    // 2. Check 48-hour deterministic cryptographic slot (works across cold restarts and manual pass entry)
    if (isValidPassForEmail(cleanEmail, cleanPass)) {
      resetRateLimit(limitKey);
      return NextResponse.json({
        success: true,
        invite: {
          id: `INV_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
          email: cleanEmail,
          tempPass: cleanPass,
        },
      });
    }

    // 3. Check database record
    const invite = await getInviteByEmailAndTempPass(cleanEmail, cleanPass);

    if (!invite) {
      recordFailedAttempt(limitKey);
      return NextResponse.json(
        { error: 'Invalid or expired temporary password for this email address. Passes are valid for 48 hours.' },
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
