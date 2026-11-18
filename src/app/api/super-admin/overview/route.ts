import { NextRequest, NextResponse } from 'next/server';
import { getAllRestaurants, getAllInvites, authenticateSuperAdmin, getSuperAdminConfig } from '@/lib/db';
import { getSentEmails } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { superAdminEmail, superAdminPin } = await req.json();

    if (!authenticateSuperAdmin(superAdminEmail, superAdminPin)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 401 });
    }

    const restaurants = getAllRestaurants();
    const invites = getAllInvites();
    const sentEmails = getSentEmails();
    const config = getSuperAdminConfig();

    const totalReviews = restaurants.reduce((acc, r) => acc + (r.totalReviewsGenerated || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalRestaurants: restaurants.length,
        totalInvites: invites.length,
        pendingInvites: invites.filter((i) => i.status === 'pending').length,
        totalReviewsDrafted: totalReviews,
      },
      restaurants,
      invites,
      sentEmails: sentEmails.slice(0, 20),
      config: {
        superAdminEmail: config.superAdminEmail,
        superAdminPassword: config.superAdminPassword,
        emailProvider: config.emailProvider || 'brevo',
        brevoApiKey: config.brevoApiKey || '',
        brevoFromEmail: config.brevoFromEmail || config.superAdminEmail,
        brevoFromName: config.brevoFromName || 'Tap-Bro Team',
        resendApiKey: config.resendApiKey || '',
        resendFrom: config.resendFrom || 'Tap-Bro <onboarding@resend.dev>',
        sendgridApiKey: config.sendgridApiKey || '',
        smtp: config.smtp,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching overview' }, { status: 500 });
  }
}
