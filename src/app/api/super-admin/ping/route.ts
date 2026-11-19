import { NextRequest, NextResponse } from 'next/server';
import { sendTapBroEmail, resolvePublicBaseUrl } from '@/lib/email';
import { getAllRestaurants, getAllInvites } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const superAdmin = process.env.SUPER_ADMIN_EMAIL || 'princesharma9955a@gmail.com';
    const restaurants = await getAllRestaurants();
    const invites = await getAllInvites();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const requestUrl = host && !host.includes('localhost') && !host.includes('127.0.0.1') ? `${proto}://${host}` : undefined;
    const baseUrl = resolvePublicBaseUrl(requestUrl);
    const superAdminUrl = `${baseUrl}/super-admin`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0C10; color: #F8F9FA; border: 1px solid #2E323D; border-radius: 16px; padding: 24px;">
        <div style="text-align: center; border-bottom: 1px solid #2E323D; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background: #F5C84C; color: #000; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">Super Admin Ping</span>
          <h1 style="color: #FFFFFF; margin: 10px 0 0; font-size: 22px;">Tap-Bro System Status: Online 🟢</h1>
          <p style="color: #A0A5B5; font-size: 13px; margin: 4px 0 0;">Tabletop NFC & QR AI Review Assistant</p>
        </div>

        <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
          Hello Prince, this is an automated system ping from your <strong>Tap-Bro</strong> master server. Your super admin configuration and connected AI Foundation Models are operational!
        </p>

        <div style="background: #15171F; border: 1px solid #3E4452; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #F5C84C; font-size: 13px; margin: 0 0 10px; text-transform: uppercase;">Live System Metrics:</h3>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Super Admin Target:</strong> ${superAdmin}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Active Businesses:</strong> ${restaurants.length} restaurants onboarded</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Pending Invitations:</strong> ${invites.filter((i) => i.status === 'pending').length} pending owner setups</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>AI Engine:</strong> NVIDIA AI Foundation Models (Active)</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Server Time:</strong> ${timestamp} IST</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${superAdminUrl}" style="background: #F5C84C; color: #0B0C10; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 14px; display: inline-block;">
            Open Tap-Bro Super Admin Panel
          </a>
        </div>

        <p style="color: #9CA3AF; font-size: 11px; border-top: 1px solid #2E323D; padding-top: 12px; margin-top: 20px; text-align: center;">
          Tap-Bro Tabletop Stand SaaS • Delivered to Authorized Master: ${superAdmin}
        </p>
      </div>
    `;

    const result = await sendTapBroEmail({
      to: superAdmin,
      subject: `🚀 [Tap-Bro Super Admin Ping] Master Control Verified (${timestamp})`,
      text: `Hello Prince! Tap-Bro master status is online. Active restaurants: ${restaurants.length}. Time: ${timestamp}. Admin URL: ${superAdminUrl}`,
      html,
      type: 'superadmin-notification',
    });

    return NextResponse.json({
      success: true,
      to: superAdmin,
      subject: `🚀 [Tap-Bro Super Admin Ping] Master Control Verified (${timestamp})`,
      deliveryStatus: result.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ping failed' }, { status: 500 });
  }
}
