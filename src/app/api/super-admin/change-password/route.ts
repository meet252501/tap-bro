import { NextRequest, NextResponse } from 'next/server';
import { authenticateSuperAdmin, updateSuperAdminPassword } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { superAdminEmail, currentPassword, newPassword } = await req.json();

    if (!superAdminEmail || !newPassword?.trim()) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!authenticateSuperAdmin(superAdminEmail, currentPassword)) {
      return NextResponse.json({ error: 'Current password does not match' }, { status: 401 });
    }

    const success = updateSuperAdminPassword(newPassword.trim());

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Master Super Admin password updated and hard-saved successfully!',
        newPassword: newPassword.trim(),
      });
    } else {
      return NextResponse.json({ error: 'Failed to save new password' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating password' }, { status: 500 });
  }
}
