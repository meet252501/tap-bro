import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantBySlug, saveRestaurant } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = getRestaurantBySlug(params.slug);

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Do not leak adminPin to public diner query
    const { adminPin, customApiKey, ...publicData } = restaurant;

    return NextResponse.json({
      success: true,
      restaurant: publicData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching restaurant' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = getRestaurantBySlug(params.slug);

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const body = await req.json();
    const { adminPin, name, tagline, cuisine, location, googleReviewUrl, menuCategories, aiProvider, customApiKey } = body;

    // Verify PIN
    if (adminPin !== restaurant.adminPin && adminPin !== restaurant.id) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    if (name) restaurant.name = name.trim();
    if (tagline !== undefined) restaurant.tagline = tagline.trim();
    if (cuisine !== undefined) restaurant.cuisine = cuisine.trim();
    if (location !== undefined) restaurant.location = location.trim();
    if (googleReviewUrl) restaurant.googleReviewUrl = googleReviewUrl.trim();
    if (menuCategories && Array.isArray(menuCategories)) restaurant.menuCategories = menuCategories;
    if (aiProvider && ['free-gemini', 'free-groq', 'zero-cost'].includes(aiProvider)) {
      restaurant.aiProvider = aiProvider;
    }
    if (customApiKey !== undefined) restaurant.customApiKey = customApiKey.trim();

    saveRestaurant(restaurant);

    return NextResponse.json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating restaurant' }, { status: 500 });
  }
}
