#!/usr/bin/env node
// Script cek schema Neon DB — jalankan dari root project
import { readFileSync, existsSync } from 'node:fs';
import pg from 'pg';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  const ver = await pool.query('SELECT version()');
  console.log('DB:', ver.rows[0].version.split(',')[0]);

  console.log('\n=== SEMUA TABEL ===');
  const tables = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
  );
  tables.rows.forEach(r => console.log(' -', r.tablename));

  for (const tbl of ['leads', 'users', 'lead_notes', 'lead_events', 'sessions']) {
    console.log(`\n=== KOLOM [${tbl}] ===`);
    try {
      const cols = await pool.query(
        "SELECT column_name, data_type, is_nullable, column_default " +
        "FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position",
        [tbl]
      );
      if (!cols.rows.length) { console.log('  (tabel belum ada)'); continue; }
      cols.rows.forEach(r => {
        const def = r.column_default ? ' [def: '+r.column_default.slice(0,30)+']' : '';
        const nn  = r.is_nullable === 'NO' ? ' NOT NULL' : '';
        console.log(`  ${r.column_name}: ${r.data_type}${nn}${def}`);
      });
    } catch(e) { console.log('  ERROR:', e.message); }
  }

  await pool.end();
}
main().catch(async e => { console.error('ERROR:', e.message); await pool.end(); process.exit(1); });
