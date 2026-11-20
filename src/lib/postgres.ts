import { Pool, PoolClient } from 'pg';
import { Restaurant, BusinessInvite } from '@/types/restaurant';

let globalPool: Pool | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function getPool(): Pool | null {
  if (!isDatabaseConfigured()) return null;

  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL!;
    globalPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    globalPool.on('error', (err) => {
      console.error('[TapBro Postgres] Unexpected pool error on idle client:', err);
    });
  }

  return globalPool;
}

export async function initDatabase(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const pool = getPool();
    if (!pool) return;

    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Restaurants table
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
      `);

      // 2. Invites table
      await client.query(`
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
      `);

      // 3. Reviews table
      await client.query(`
        CREATE TABLE IF NOT EXISTS tapbro_reviews (
          id VARCHAR(64) PRIMARY KEY,
          restaurant_slug VARCHAR(128) NOT NULL,
          overall_rating INT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_tapbro_reviews_slug ON tapbro_reviews (restaurant_slug);
      `);

      // 4. System config table
      await client.query(`
        CREATE TABLE IF NOT EXISTS tapbro_config (
          key VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      await client.query('COMMIT');
      initialized = true;
      console.log('[TapBro Postgres] Schema initialized successfully.');
    } catch (err) {
      if (client) await client.query('ROLLBACK').catch(() => {});
      console.error('[TapBro Postgres] Schema initialization error:', err);
      throw err;
    } finally {
      if (client) client.release();
    }
  })();

  return initPromise;
}

export async function checkDatabaseHealth(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'DATABASE_URL is not configured' };
  }

  const pool = getPool();
  if (!pool) {
    return { ok: false, error: 'Failed to create Postgres connection pool' };
  }

  const start = Date.now();
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    const latencyMs = Date.now() - start;
    return { ok: true, latencyMs };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Database connection query failed' };
  } finally {
    if (client) client.release();
  }
}

// ----------------- RESTAURANT CRUD -----------------

export async function pgGetAllRestaurants(): Promise<Restaurant[]> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return [];

  try {
    const res = await pool.query('SELECT data FROM tapbro_restaurants ORDER BY created_at DESC');
    return res.rows.map((row) => row.data as Restaurant);
  } catch (err) {
    console.error('[TapBro Postgres] pgGetAllRestaurants error:', err);
    return [];
  }
}

export async function pgGetRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return null;

  try {
    const res = await pool.query(
      'SELECT data FROM tapbro_restaurants WHERE LOWER(slug) = LOWER($1) LIMIT 1',
      [slug.trim()]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0].data as Restaurant;
  } catch (err) {
    console.error('[TapBro Postgres] pgGetRestaurantBySlug error:', err);
    return null;
  }
}

export async function pgGetRestaurantById(id: string): Promise<Restaurant | null> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return null;

  try {
    const res = await pool.query(
      'SELECT data FROM tapbro_restaurants WHERE id = $1 LIMIT 1',
      [id.trim()]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0].data as Restaurant;
  } catch (err) {
    console.error('[TapBro Postgres] pgGetRestaurantById error:', err);
    return null;
  }
}

export async function pgSaveRestaurant(restaurant: Restaurant): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return false;

  try {
    const { id, slug, name, phone, email, adminPin } = restaurant;
    const query = `
      INSERT INTO tapbro_restaurants (id, slug, name, phone, email, admin_pin, data, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        admin_pin = EXCLUDED.admin_pin,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    await pool.query(query, [
      id,
      slug,
      name,
      phone || null,
      email || null,
      adminPin || null,
      JSON.stringify(restaurant),
    ]);
    return true;
  } catch (err) {
    console.error('[TapBro Postgres] pgSaveRestaurant error:', err);
    return false;
  }
}

export async function pgDeleteRestaurant(idOrSlug: string): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return false;

  try {
    const query = `
      DELETE FROM tapbro_restaurants
      WHERE id = $1 OR LOWER(slug) = LOWER($1);
    `;
    await pool.query(query, [idOrSlug.trim()]);
    return true;
  } catch (err) {
    console.error('[TapBro Postgres] pgDeleteRestaurant error:', err);
    return false;
  }
}

// ----------------- INVITE CRUD -----------------

export async function pgGetAllInvites(): Promise<BusinessInvite[]> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return [];

  try {
    const res = await pool.query(
      'SELECT id, email, temp_pass, status, data, created_at, completed_at FROM tapbro_invites ORDER BY created_at DESC'
    );
    return res.rows.map((row) => {
      const parsedData = (row.data && typeof row.data === 'object') ? row.data : {};
      return {
        ...parsedData,
        id: row.id,
        email: row.email || parsedData.email || '',
        tempPass: row.temp_pass || parsedData.tempPass || '',
        status: row.status || parsedData.status || 'pending',
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : parsedData.createdAt || new Date().toISOString(),
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : parsedData.completedAt,
      } as BusinessInvite;
    });
  } catch (err) {
    console.error('[TapBro Postgres] pgGetAllInvites error:', err);
    return [];
  }
}

export async function pgSaveInvite(invite: BusinessInvite): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return false;

  try {
    const { id, email, tempPass, status, createdAt, completedAt } = invite;
    const query = `
      INSERT INTO tapbro_invites (id, email, temp_pass, status, data, created_at, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        data = EXCLUDED.data,
        completed_at = EXCLUDED.completed_at;
    `;
    await pool.query(query, [
      id,
      email.toLowerCase(),
      tempPass.toUpperCase(),
      status || 'pending',
      JSON.stringify(invite),
      createdAt ? new Date(createdAt) : new Date(),
      completedAt ? new Date(completedAt) : null,
    ]);
    return true;
  } catch (err) {
    console.error('[TapBro Postgres] pgSaveInvite error:', err);
    return false;
  }
}

export async function pgDeleteInvite(id: string): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return false;

  try {
    await pool.query('DELETE FROM tapbro_invites WHERE id = $1', [id.trim()]);
    return true;
  } catch (err) {
    console.error('[TapBro Postgres] pgDeleteInvite error:', err);
    return false;
  }
}

// ----------------- CONFIG CRUD -----------------

export async function pgGetConfig<T>(key: string): Promise<T | null> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return null;

  try {
    const res = await pool.query('SELECT data FROM tapbro_config WHERE key = $1 LIMIT 1', [key]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data as T;
  } catch (err) {
    console.error('[TapBro Postgres] pgGetConfig error:', err);
    return null;
  }
}

export async function pgSaveConfig<T>(key: string, data: T): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return false;

  try {
    const query = `
      INSERT INTO tapbro_config (key, data, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    await pool.query(query, [key, JSON.stringify(data)]);
    return true;
  } catch (err) {
    console.error('[TapBro Postgres] pgSaveConfig error:', err);
    return false;
  }
}

// ----------------- REVIEWS AUDIT CRUD -----------------

export async function pgRecordReview(
  slug: string,
  review: {
    id: string;
    overallRating: number;
    [key: string]: any;
  }
): Promise<boolean> {
  await initDatabase();
  const pool = getPool();
  if (!pool) return false;

  try {
    const query = `
      INSERT INTO tapbro_reviews (id, restaurant_slug, overall_rating, data, created_at)
      VALUES ($1, $2, $3, $4, NOW());
    `;
    await pool.query(query, [
      review.id,
      slug,
      review.overallRating,
      JSON.stringify(review),
    ]);
    return true;
  } catch (err) {
    console.error('[TapBro Postgres] pgRecordReview error:', err);
    return false;
  }
}
