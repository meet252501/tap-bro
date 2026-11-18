import { NextRequest, NextResponse } from 'next/server';
import { getInviteByEmailAndTempPass, createRestaurant, markInviteCompleted } from '@/lib/db';
import { sendOnboardingEmails } from '@/lib/email';

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
    } = await req.json();

    if (!email || !tempPass || !restaurantName || !phone || !adminPin) {
      return NextResponse.json(
        { error: 'Email, Temporary Pass, Restaurant Name, Phone, and Admin PIN are required.' },
        { status: 400 }
      );
    }

    const invite = getInviteByEmailAndTempPass(email, tempPass);
    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired temporary password for this email.' },
        { status: 403 }
      );
    }

    // Create the restaurant
    const newRestaurant = createRestaurant({
      name: restaurantName,
      phone,
      email,
      adminPin,
      cuisine: cuisine || 'Multi-Cuisine',
      tagline: tagline || 'Delightful Dining & Hospitality',
      location: location || '',
      googleReviewUrl: googleReviewUrl || '',
    });

    // Mark invite as completed
    markInviteCompleted(invite.id, newRestaurant.id, newRestaurant.slug);

    // Send confirmation alert
    try {
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
      const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const baseUrl = process.env.APP_URL || `${proto}://${host}`;
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
