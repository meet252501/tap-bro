import { NextRequest, NextResponse } from 'next/server';
import { authenticateSuperAdmin } from '@/lib/db';
import { testUnifiedEmailDelivery } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const {
      superAdminEmail,
      superAdminPin,
      provider = 'brevo',
      targetEmail,
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

    const result = await testUnifiedEmailDelivery({
      provider,
      targetEmail: targetEmail || superAdminEmail,
      brevoApiKey,
      brevoFromEmail,
      brevoFromName,
      resendApiKey,
      resendFrom,
      sendgridApiKey,
      gmail,
      smtp,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error executing email test' },
      { status: 500 }
    );
  }
}
