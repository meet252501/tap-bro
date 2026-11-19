import { NextRequest, NextResponse } from 'next/server';
import { createBusinessInvite, authenticateSuperAdmin } from '@/lib/db';
import { sendOwnerInviteEmail, resolvePublicBaseUrl } from '@/lib/email';
import { createInviteToken } from '@/lib/tokens';

export async function POST(req: NextRequest) {
  try {
    const { superAdminEmail, superAdminPin, targetEmail, notes } = await req.json();

    if (!superAdminEmail || !superAdminPin) {
      return NextResponse.json({ error: 'Super Admin credentials required' }, { status: 401 });
    }

    if (!authenticateSuperAdmin(superAdminEmail, superAdminPin)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 403 });
    }

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid business owner email is required' }, { status: 400 });
    }

    // Determine public base URL (never send localhost in outgoing invites)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const requestUrl = host && !host.includes('localhost') && !host.includes('127.0.0.1') ? `${proto}://${host}` : undefined;
    const baseUrl = resolvePublicBaseUrl(requestUrl);

    // Create invite with unique temp pass
    const invite = createBusinessInvite(targetEmail, notes);
    const token = createInviteToken(invite.email, invite.tempPass, 48);

    // Send invitation email with temporary password
    const emailResult = await sendOwnerInviteEmail({
      email: invite.email,
      tempPass: invite.tempPass,
      notes: invite.notes,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      message: emailResult?.message || `Invitation dispatched to ${invite.email}`,
      invite: {
        ...invite,
        token,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invite error' }, { status: 500 });
  }
}
