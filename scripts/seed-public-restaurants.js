require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const eatPunjab = {
  id: "REST_EATPUNJAB",
  name: "Eat Punjab",
  slug: "eat-punjab-gandhinagar-gujarat",
  email: "meetsutariya.2008@gmail.com",
  phone: "7016499300",
  cuisine: "North Indian & Punjabi Cuisine",
  tagline: "Authentic Punjabi Flavors & Hospitality",
  adminPin: "25012008",
  location: "Kudasan, Gandhinagar, Gujarat",
  googleReviewUrl: "https://maps.google.com/?cid=3682833924407842058",
  placeId: "ChIJJ-nuYQArXDkRClUWF_ENHDM",
  cid: "3682833924407842058",
  aiProvider: "nvidia",
  totalReviewsGenerated: 1,
  tableCount: 12,
  createdAt: "2026-11-19T16:38:46.023Z",
  updatedAt: new Date().toISOString(),
  cycleStartDate: "2026-11-19T16:38:46.023Z",
  menuCategories: [
    {
      icon: "🍲",
      name: "Starters & Chaat",
      items: [
        "Crispy Veg Spring Roll",
        "Paneer Tikka",
        "Crispy Corn Chaat",
        "Dahi Ke Kebab"
      ]
    },
    {
      icon: "🍛",
      name: "Main Courses",
      items: [
        "Dal Makhani",
        "Paneer Butter Masala",
        "Butter Garlic Naan",
        "Amritsari Kulcha",
        "Veg Biryani"
      ]
    },
    {
      icon: "🍧",
      name: "Desserts & Beverages",
      items: [
        "Hot Gulab Jamun",
        "Masala Kulhad Chai",
        "Fresh Mango Lassi",
        "Punjabi Sweet Lassi"
      ]
    }
  ],
  reviewsLog: [
    {
      id: "REV_seed_eatpunjab",
      tone: "flavorful",
      locale: "en",
      ratings: {
        food: 5,
        service: 5,
        ambiance: 5,
        overall: 5
      },
      timestamp: new Date().toISOString(),
      reviewDraft: "Outstanding Punjabi food at Eat Punjab Kudasan! The Dal Makhani and Paneer Butter Masala were rich, flavorful, and paired perfectly with hot garlic naan. Warm hospitality and quick service. Highly recommended!",
      overallRating: 5,
      postedToGoogle: true,
      selectedDishes: ["Dal Makhani", "Paneer Butter Masala"]
    }
  ]
};

const honestRestaurant = {
  id: "REST_HONESTKUDASAN",
  name: "Honest Restaurant",
  slug: "honest-restaurant-kudasan",
  email: "meetsutariya.2008@gmail.com",
  phone: "7016499300",
  cuisine: "Fast Food & Multi-Cuisine",
  tagline: "World Famous Bhaji Pav & North Indian",
  adminPin: "25012008",
  location: "Kudasan, Gandhinagar, Gujarat",
  googleReviewUrl: "https://maps.google.com/?cid=15017142005634115862",
  placeId: "ChIJA0fxfgApXDkRFilrAxebZ9A",
  cid: "15017142005634115862",
  aiProvider: "nvidia",
  totalReviewsGenerated: 1,
  tableCount: 15,
  createdAt: "2026-11-19T16:38:46.023Z",
  updatedAt: new Date().toISOString(),
  cycleStartDate: "2026-11-19T16:38:46.023Z",
  menuCategories: [
    {
      icon: "🥪",
      name: "Famous Honest Specials",
      items: [
        "Honest Special Bhaji Pav",
        "Cheese Butter Pav Bhaji",
        "Honest Special Pulao",
        "Cheese Masala Dosa"
      ]
    },
    {
      icon: "🍛",
      name: "Main Courses & Breads",
      items: [
        "Paneer Toofani",
        "Kaju Curry",
        "Dal Fry Jeera Rice",
        "Butter Roti"
      ]
    },
    {
      icon: "🍧",
      name: "Beverages & Desserts",
      items: [
        "Cold Coffee with Ice Cream",
        "Fresh Lime Soda",
        "Chocolate Milkshake"
      ]
    }
  ],
  reviewsLog: []
};

async function seed() {
  const restaurants = [eatPunjab, honestRestaurant];
  
  // 1. Write to data/restaurants.json
  const dataPath = path.resolve('data/restaurants.json');
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(restaurants, null, 2), 'utf-8');
  console.log(`Saved ${restaurants.length} restaurants to ${dataPath}`);

  // 2. Write to PostgreSQL tapbro_restaurants
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
      const client = await pool.connect();
      console.log('Connected to PostgreSQL successfully.');
      
      for (const r of restaurants) {
        // Delete by slug first so unique constraint on slug is satisfied
        await client.query('DELETE FROM tapbro_restaurants WHERE slug = $1 OR id = $2', [r.slug, r.id]);

        const query = `
          INSERT INTO tapbro_restaurants (id, slug, name, phone, email, admin_pin, data, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `;
        await client.query(query, [
          r.id,
          r.slug,
          r.name,
          r.phone,
          r.email,
          r.adminPin,
          JSON.stringify(r),
        ]);
        console.log(`Synced ${r.name} (${r.slug}) into tapbro_restaurants.`);
      }

      client.release();
    } catch (err) {
      console.error('PostgreSQL seed error:', err);
    } finally {
      await pool.end();
    }
  } else {
    console.warn('DATABASE_URL not set, skipped Postgres sync.');
  }
}

seed().catch(console.error);
