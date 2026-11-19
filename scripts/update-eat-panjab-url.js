const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const directReviewUrl = 'https://maps.google.com/?cid=3682833924407842058';
    
    // Fetch existing
    const res = await pool.query('SELECT data FROM tapbro_restaurants WHERE slug = $1', ['eat-panjab']);
    if (res.rows.length === 0) {
      console.log('eat-panjab not found');
      return;
    }
    
    const data = res.rows[0].data;
    data.googleReviewUrl = directReviewUrl;
    
    await pool.query('UPDATE tapbro_restaurants SET data = $1, updated_at = NOW() WHERE slug = $2', [JSON.stringify(data), 'eat-panjab']);
    console.log('Successfully updated eat-panjab googleReviewUrl to:', directReviewUrl);
  } catch (err) {
    console.error('Update error:', err);
  } finally {
    await pool.end();
  }
}

run();
