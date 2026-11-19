import { NextRequest, NextResponse } from 'next/server';
import { getInviteByEmailAndTempPass } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: max 8 code validation attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(`setup-validate:${ip}`, 8, 300);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many validation attempts. Please wait ${rateCheck.resetSeconds}s before trying again.` },
        { status: 429 }
      );
    }

    const { email, tempPass } = await req.json();

    if (!email || !tempPass) {
      return NextResponse.json({ error: 'Email and temporary password are required' }, { status: 400 });
    }

    const invite = getInviteByEmailAndTempPass(email, tempPass);

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired temporary password for this email address.' },
        { status: 404 }
      );
    }

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
