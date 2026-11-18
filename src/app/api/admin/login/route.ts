import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { phone, pinOrId } = await req.json();

    if (!phone || !pinOrId) {
      return NextResponse.json(
        { error: 'Phone number and Admin PIN / Restaurant ID are required' },
        { status: 400 }
      );
    }

    const restaurant = authenticateAdmin(phone, pinOrId);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Invalid Phone Number or PIN / Restaurant ID' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        phone: restaurant.phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login error' }, { status: 500 });
  }
}
