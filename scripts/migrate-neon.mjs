#!/usr/bin/env node
/**
 * Migration satu kali: drop tabel leads lama (schema berbeda) lalu jalankan
 * seluruh schema SQL yang benar. Aman karena leads = 0 baris.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

// Baca .env.local
for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL tidak diset'); process.exit(1); }

const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('=== CEK DATA SEBELUM MIGRASI ===');
  const check = await pool.query('SELECT COUNT(*) FROM leads');
  console.log(`leads saat ini: ${check.rows[0].count} baris`);
  if (Number(check.rows[0].count) > 0) {
    console.error('BATALKAN: tabel leads tidak kosong! Backup data dulu sebelum migrasi.');
    process.exit(1);
  }

  console.log('\n=== DROP TABEL LAMA (schema berbeda) ===');
  // DROP CASCADE untuk hapus constraint FK yang bergantung
  await pool.query('DROP TABLE IF EXISTS leads CASCADE');
  console.log('✓ leads di-drop');
  await pool.query('DROP TABLE IF EXISTS lead_notes CASCADE');
  console.log('✓ lead_notes di-drop');
  await pool.query('DROP TABLE IF EXISTS lead_events CASCADE');
  console.log('✓ lead_events di-drop');

  console.log('\n=== JALANKAN SCHEMA TERBARU ===');
  const files = [
    'db/schema.sql',
    'db/schema-cms.sql',
    'db/schema-blocks.sql',
    'db/schema-pagecopy.sql',
    'db/migrate-v2.sql',
  ];

  for (const f of files) {
    const filePath = path.join(process.cwd(), f);
    if (!existsSync(filePath)) { console.log(`  (skip: ${f} tidak ditemukan)`); continue; }
    try {
      await pool.query(readFileSync(filePath, 'utf8'));
      console.log(`✓ ${f} diterapkan`);
    } catch (e) {
      // Beberapa statement mungkin sudah ada (tabel CMS sudah ada), lanjutkan
      console.warn(`⚠ ${f}: ${e.message.slice(0, 120)}`);
    }
  }

  console.log('\n=== VERIFIKASI KOLOM leads SETELAH MIGRASI ===');
  const cols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='leads' ORDER BY ordinal_position"
  );
  cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  console.log('\n=== SELESAI ✓ ===');
  await pool.end();
}

main().catch(async e => {
  console.error('\nFATAL:', e.message);
  await pool.end();
  process.exit(1);
});
