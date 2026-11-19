import { NextRequest, NextResponse } from 'next/server';
import { deleteRestaurant, authenticateSuperAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { superAdminEmail, superAdminPin, restaurantId } = await req.json();

    if (!authenticateSuperAdmin(superAdminEmail, superAdminPin)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 401 });
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }

    const success = await deleteRestaurant(restaurantId);

    return NextResponse.json({
      success,
      message: success ? 'Restaurant removed from platform' : 'Failed to delete restaurant',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Delete error' }, { status: 500 });
  }
}
