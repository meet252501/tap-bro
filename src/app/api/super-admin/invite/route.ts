import { NextRequest, NextResponse } from 'next/server';
import { createBusinessInvite, authenticateSuperAdmin } from '@/lib/db';
import { sendOwnerInviteEmail } from '@/lib/email';

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

    // Determine dynamic base URL based on incoming request
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.APP_URL || `${proto}://${host}`;

    // Create invite with unique temp pass
    const invite = createBusinessInvite(targetEmail, notes);

    // Send invitation email with temporary password
    await sendOwnerInviteEmail({
      email: invite.email,
      tempPass: invite.tempPass,
      notes: invite.notes,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Invitation with temporary password dispatched to ${invite.email}`,
      invite,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invite error' }, { status: 500 });
  }
}
