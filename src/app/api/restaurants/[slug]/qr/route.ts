import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getRestaurantBySlug } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = getRestaurantBySlug(params.slug);

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Determine host from request headers
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const destinationUrl = `${proto}://${host}/r/${restaurant.slug}`;

    // Generate high-resolution QR Code
    const qrDataUrl = await QRCode.toDataURL(destinationUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#0B0C10',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    return NextResponse.json({
      success: true,
      destinationUrl,
      qrDataUrl,
      restaurantName: restaurant.name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'QR generation error' }, { status: 500 });
  }
}
