import { NextRequest, NextResponse } from 'next/server';
import { deleteInvite, authenticateSuperAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { superAdminEmail, superAdminPin, inviteId } = await req.json();

    if (!authenticateSuperAdmin(superAdminEmail, superAdminPin)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 401 });
    }

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
    }

    const success = await deleteInvite(inviteId);

    return NextResponse.json({
      success,
      message: success ? 'Invite deleted successfully' : 'Failed to delete invite',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting invite' }, { status: 500 });
  }
}
