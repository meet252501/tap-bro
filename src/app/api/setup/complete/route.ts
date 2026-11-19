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

    if (!restaurantName || !phone || !adminPin) {
      return NextResponse.json(
        { error: 'Restaurant Name, Contact Phone Number, and Manager PIN are required.' },
        { status: 400 }
      );
    }

    let verifiedInviteId: string | null = null;

    // If an invite pass was provided, verify it strictly
    if (tempPass && email) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = tempPass.trim().toUpperCase();

      const inviteResult = await getInviteStatusByEmailAndTempPass(cleanEmail, cleanPass);

      if (inviteResult.status === 'completed') {
        return NextResponse.json(
          { error: 'This temporary pass has already been used. Please log in using your permanent Admin PIN.' },
          { status: 409 }
        );
      }

      if (inviteResult.status !== 'valid' || !inviteResult.invite) {
        return NextResponse.json(
          { error: 'Invalid or expired temporary password for this email.' },
          { status: 403 }
        );
      }

      verifiedInviteId = inviteResult.invite.id;
    }

    // Create the restaurant in PostgreSQL
    const newRestaurant = await createRestaurant({
      name: restaurantName,
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      adminPin: adminPin.trim(),
      cuisine: cuisine || 'Restaurant & Cafe',
      tagline: tagline || 'Delightful Dining & Hospitality',
      location: location || '',
      googleReviewUrl: googleReviewUrl || '',
      customDishes,
    });

    // Mark invite as completed if one was used
    if (verifiedInviteId) {
      await markInviteCompleted(verifiedInviteId, newRestaurant.id, newRestaurant.slug);
    }

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
