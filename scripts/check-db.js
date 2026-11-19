const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res = await pool.query('SELECT slug, name, data->>\'googleReviewUrl\' as "googleReviewUrl", data->>\'placeId\' as "placeId" FROM tapbro_restaurants');
    console.log('Restaurants in DB:');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await pool.end();
  }
}

run();
