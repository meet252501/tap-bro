const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:TapBroDb2026MasterKey@crossover.proxy.rlwy.net:41125/railway';

async function resetDatabase() {
  console.log('--- RESETTING TAPBRO DATABASE ---');
  console.log('Connecting to PostgreSQL database...');

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Truncate application data tables
    console.log('Truncating tables: tapbro_restaurants, tapbro_invites, tapbro_reviews...');
    await client.query('TRUNCATE TABLE tapbro_restaurants CASCADE;');
    await client.query('TRUNCATE TABLE tapbro_invites CASCADE;');
    await client.query('TRUNCATE TABLE tapbro_reviews CASCADE;');

    // 2. Ensure system config table exists with active super admin credentials
    await client.query(`
      CREATE TABLE IF NOT EXISTS tapbro_config (
        key VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure superadmin config is preserved/set
    const defaultConfig = {
      superAdminEmail: 'princesharma9955a@gmail.com',
      superAdminPassword: 'prince@777',
      smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        user: 'friendlygaming2525@gmail.com',
        pass: 'vbymqlsccuhzrzgf',
        from: 'Tap-Bro Team <friendlygaming2525@gmail.com>',
        secure: true,
      },
    };

    await client.query(
      `INSERT INTO tapbro_config (key, data, updated_at)
       VALUES ('superadmin_config', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = NOW();`,
      [JSON.stringify(defaultConfig)]
    );

    await client.query('COMMIT');
    console.log('✓ PostgreSQL tables truncated and schema reset successfully.');

    // 3. Verify row counts in PostgreSQL
    const restCount = await client.query('SELECT COUNT(*) FROM tapbro_restaurants;');
    const inviteCount = await client.query('SELECT COUNT(*) FROM tapbro_invites;');
    const reviewCount = await client.query('SELECT COUNT(*) FROM tapbro_reviews;');
    const configCount = await client.query('SELECT COUNT(*) FROM tapbro_config;');

    console.log('\n--- VERIFIED POSTGRESQL ROW COUNTS ---');
    console.log('tapbro_restaurants:', restCount.rows[0].count);
    console.log('tapbro_invites:    ', inviteCount.rows[0].count);
    console.log('tapbro_reviews:    ', reviewCount.rows[0].count);
    console.log('tapbro_config:     ', configCount.rows[0].count);

    // 4. Reset local data files in data/
    const dataDir = path.join(__dirname, '..', 'data');
    if (fs.existsSync(dataDir)) {
      console.log('\nResetting local JSON fallback files...');
      fs.writeFileSync(path.join(dataDir, 'restaurants.json'), '[]', 'utf8');
      fs.writeFileSync(path.join(dataDir, 'invites.json'), '[]', 'utf8');
      fs.writeFileSync(path.join(dataDir, 'sent-emails.json'), '[]', 'utf8');
      fs.writeFileSync(
        path.join(dataDir, 'config.json'),
        JSON.stringify(defaultConfig, null, 2),
        'utf8'
      );
      console.log('✓ Local files in data/ reset to clean empty state.');
    }

    console.log('\n=========================================');
    console.log(' DATABASE RESET COMPLETE: 100% CLEAN SLATE ');
    console.log(' Ready for fresh restaurant onboarding! ');
    console.log('=========================================');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Database reset failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
