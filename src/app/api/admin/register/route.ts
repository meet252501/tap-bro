import { NextRequest, NextResponse } from 'next/server';
import { createRestaurant } from '@/lib/db';
import { sendOnboardingEmails } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, adminPin, cuisine, tagline, googleReviewUrl } = await req.json();

    if (!name || !phone || !adminPin) {
      return NextResponse.json(
        { error: 'Restaurant Name, Phone Number, and Admin PIN are required' },
        { status: 400 }
      );
    }

    const restaurant = createRestaurant({
      name,
      phone,
      email,
      adminPin,
      cuisine,
      tagline,
      googleReviewUrl,
    });

    // Send Onboarding & Super Admin Alert Emails asynchronously
    try {
      await sendOnboardingEmails(restaurant);
    } catch (emailErr) {
      console.warn('Failed to dispatch onboarding emails:', emailErr);
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        phone: restaurant.phone,
        email: restaurant.email,
        adminPin: restaurant.adminPin,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration error' }, { status: 500 });
  }
}
