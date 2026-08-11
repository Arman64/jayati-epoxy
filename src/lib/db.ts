import { Pool } from 'pg';

/**
 * Satu pool per proses. Di dev, Next.js melakukan hot-reload modul sehingga
 * pool bisa dibuat berkali-kali dan koneksi Postgres cepat habis — karena itu
 * pool disimpan di globalThis.
 */
const globalForDb = globalThis as unknown as { __jayatiPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL belum diset. Salin .env.example menjadi .env.local lalu isi koneksi Postgres.',
    );
  }

  // Neon/Supabase/Vercel Postgres memerlukan SSL; Postgres lokal tidak.
  const needsSsl =
    /sslmode=require/.test(connectionString) ||
    /\.neon\.tech|supabase\.co|vercel-storage\.com|render\.com/.test(connectionString);

  return new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.PGPOOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getPool(): Pool {
  if (!globalForDb.__jayatiPool) globalForDb.__jayatiPool = createPool();
  return globalForDb.__jayatiPool;
}

/** Query berparameter. Jangan pernah menyusun SQL lewat penggabungan string. */
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const res = await getPool().query(text, params as unknown[]);
  return res.rows as T[];
}

/** Ambil satu baris, atau null. */
export async function queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Jalankan beberapa query dalam satu transaksi. */
export async function transaction<T>(
  fn: (q: (text: string, params?: readonly unknown[]) => Promise<Record<string, unknown>[]>) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(async (text, params = []) => {
      const r = await client.query(text, params as unknown[]);
      return r.rows as Record<string, unknown>[];
    });
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Dipakai health-check admin. */
export async function dbHealthy(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
