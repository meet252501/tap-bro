import { NextRequest, NextResponse } from 'next/server';
import { getInviteByEmailAndTempPass, createRestaurant, markInviteCompleted } from '@/lib/db';
import { sendOnboardingEmails, resolvePublicBaseUrl } from '@/lib/email';
import { verifyInviteToken, isValidPassForEmail } from '@/lib/tokens';

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      tempPass,
      token,
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

    let invite = getInviteByEmailAndTempPass(cleanEmail, cleanPass);
    if (!invite && token) {
      const tokenResult = verifyInviteToken(token, cleanEmail, cleanPass);
      if (tokenResult.valid) {
        invite = {
          id: `INV_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
          email: cleanEmail,
          tempPass: cleanPass,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (!invite && isValidPassForEmail(cleanEmail, cleanPass)) {
      invite = {
        id: `INV_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
        email: cleanEmail,
        tempPass: cleanPass,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    }

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired temporary password for this email. Passes expire after 48 hours.' },
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
      customDishes,
    });

    // Mark invite as completed
    markInviteCompleted(invite.id, newRestaurant.id, newRestaurant.slug);

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
