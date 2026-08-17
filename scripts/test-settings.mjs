#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import pg from 'pg';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  // Simulasikan saveSettingGroup persis seperti di settings.ts
  const key = 'contact';
  const value = { phoneDisplay: '0812-3046-9914', phoneE164: '+6281230469914' };
  const userId = 1;

  await pool.query(
    `INSERT INTO settings (key, value, updated_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value,
           updated_by = EXCLUDED.updated_by,
           updated_at = now()`,
    [key, JSON.stringify(value), userId]
  );
  console.log('INSERT berhasil!');

  const r = await pool.query('SELECT key, value FROM settings');
  console.log('Data tersimpan:', JSON.stringify(r.rows));

  // Cleanup
  await pool.query('DELETE FROM settings WHERE key = $1', [key]);
  console.log('Test data dibersihkan. Settings table BERFUNGSI NORMAL!');

  await pool.end();
}

main().catch(async e => {
  console.error('ERROR:', e.message);
  await pool.end();
  process.exit(1);
});
