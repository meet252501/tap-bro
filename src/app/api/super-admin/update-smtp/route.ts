import { NextRequest, NextResponse } from 'next/server';
import { authenticateSuperAdmin, updateSuperAdminEmailConfig } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const {
      superAdminEmail,
      superAdminPin,
      emailProvider,
      brevoApiKey,
      brevoFromEmail,
      brevoFromName,
      resendApiKey,
      resendFrom,
      sendgridApiKey,
      gmail,
      smtp,
    } = await req.json();

    if (!authenticateSuperAdmin(superAdminEmail, superAdminPin)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 401 });
    }

    const success = await updateSuperAdminEmailConfig({
      emailProvider: emailProvider || 'brevo',
      brevoApiKey,
      brevoFromEmail,
      brevoFromName,
      resendApiKey,
      resendFrom,
      sendgridApiKey,
      gmail,
      smtp,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email service configuration saved and hard-saved successfully!',
      });
    } else {
      return NextResponse.json({ error: 'Failed to save email settings' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating email settings' }, { status: 500 });
  }
}
