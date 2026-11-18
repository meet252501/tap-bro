import { NextRequest, NextResponse } from 'next/server';
import { getInviteByEmailAndTempPass } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
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
