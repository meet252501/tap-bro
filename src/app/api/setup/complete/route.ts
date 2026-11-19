import { NextRequest, NextResponse } from 'next/server';
import { getInviteStatusByEmailAndTempPass, createRestaurant, markInviteCompleted } from '@/lib/db';
import { sendOnboardingEmails, resolvePublicBaseUrl } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      tempPass,
      restaurantName,
      phone,
      adminPin,
      cuisine,
      tagline,
      location,
      googleReviewUrl,
      customDishes,
    } = await req.json();

    if (!email || !tempPass || !restaurantName || !phone || !adminPin) {
      return NextResponse.json(
        { error: 'Email, Temporary Pass, Restaurant Name, Phone, and Admin PIN are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = tempPass.trim().toUpperCase();

    // Verify invite in database
    const inviteResult = await getInviteStatusByEmailAndTempPass(cleanEmail, cleanPass);

    if (inviteResult.status === 'completed') {
      return NextResponse.json(
        { error: 'This temporary pass has already been used. Temporary passes are strictly one-time use. Please log in using your permanent Admin PIN.' },
        { status: 409 }
      );
    }

    if (inviteResult.status !== 'valid' || !inviteResult.invite) {
      return NextResponse.json(
        { error: 'Invalid or expired temporary password for this email. Passes are single-use and valid for 48 hours.' },
        { status: 403 }
      );
    }

    const invite = inviteResult.invite;

    // Create the restaurant
    const newRestaurant = await createRestaurant({
      name: restaurantName,
      phone,
      email,
      adminPin,
      cuisine: cuisine || 'Multi-Cuisine',
      tagline: tagline || 'Delightful Dining & Hospitality',
      location: location || '',
      googleReviewUrl: googleReviewUrl || '',
      customDishes,
    });

    // Mark invite as completed (strictly single-use: invalidated immediately)
    await markInviteCompleted(invite.id, newRestaurant.id, newRestaurant.slug);

    // Send confirmation alert
    try {
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
      const proto = req.headers.get('x-forwarded-proto') || 'https';
      const requestUrl = host && !host.includes('localhost') && !host.includes('127.0.0.1') ? `${proto}://${host}` : undefined;
      const baseUrl = resolvePublicBaseUrl(requestUrl);
      await sendOnboardingEmails(newRestaurant, baseUrl);
    } catch (e) {
      console.warn('Failed to dispatch alert emails:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant setup completed successfully!',
      restaurant: {
        id: newRestaurant.id,
        slug: newRestaurant.slug,
        name: newRestaurant.name,
        adminPin: newRestaurant.adminPin,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Setup completion error' }, { status: 500 });
  }
}
