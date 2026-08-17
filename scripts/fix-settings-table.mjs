#!/usr/bin/env node
/**
 * Fix tabel settings: drop schema lama (id/company/hero) dan buat yang baru (key/value).
 */
import { readFileSync, existsSync } from 'node:fs';
import pg from 'pg';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Step 1: Drop tabel settings lama (schema berbeda)...');
  await pool.query('DROP TABLE IF EXISTS settings CASCADE');
  console.log('OK');

  console.log('Step 2: Buat tabel settings baru (key/value schema)...');
  await pool.query(`
    CREATE TABLE settings (
      key        TEXT PRIMARY KEY,
      value      JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  console.log('OK');

  console.log('Step 3: Verifikasi kolom...');
  const cols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='settings' ORDER BY ordinal_position"
  );
  cols.rows.forEach(r => console.log(` - ${r.column_name}: ${r.data_type}`));

  await pool.end();
  console.log('\nSELESAI - settings siap dipakai!');
}

main().catch(async e => {
  console.error('ERROR:', e.message);
  await pool.end();
  process.exit(1);
});
