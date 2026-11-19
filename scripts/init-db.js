const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = (match[2] || '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  });
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:TapBroDb2026MasterKey@crossover.proxy.rlwy.net:41125/railway';
const pool = new Pool({ connectionString });

async function run() {
  console.log('Connecting to PostgreSQL...');
  const client = await pool.connect();
  console.log('Connected!');

  await client.query(`
    CREATE TABLE IF NOT EXISTS tapbro_restaurants (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(128) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(64),
      email VARCHAR(255),
      admin_pin VARCHAR(64),
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_tapbro_restaurants_slug ON tapbro_restaurants (LOWER(slug));
    CREATE INDEX IF NOT EXISTS idx_tapbro_restaurants_email ON tapbro_restaurants (LOWER(email));

    CREATE TABLE IF NOT EXISTS tapbro_invites (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      temp_pass VARCHAR(64) NOT NULL,
      status VARCHAR(32) DEFAULT 'pending',
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_tapbro_invites_email ON tapbro_invites (LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_tapbro_invites_temp_pass ON tapbro_invites (UPPER(temp_pass));

    CREATE TABLE IF NOT EXISTS tapbro_reviews (
      id VARCHAR(64) PRIMARY KEY,
      restaurant_slug VARCHAR(128) NOT NULL,
      overall_rating INT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_tapbro_reviews_slug ON tapbro_reviews (restaurant_slug);

    CREATE TABLE IF NOT EXISTS tapbro_config (
      key VARCHAR(64) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Schema & indexes created successfully.');

  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('Database tables:', res.rows.map(r => r.table_name));

  client.release();
  await pool.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
