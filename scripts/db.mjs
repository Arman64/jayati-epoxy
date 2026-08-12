#!/usr/bin/env node
/**
 * Alat database Jayati Epoxy.
 *   node scripts/db.mjs migrate          — buat/perbarui tabel
 *   node scripts/db.mjs seed <email> <nama> <password> [owner|staff]
 *   node scripts/db.mjs import-jsonl [path]  — pindahkan lead lama dari .data/leads.jsonl
 *   node scripts/db.mjs status           — ringkasan isi database
 *   node scripts/db.mjs purge-test       — hapus lead uji coba (Audit Test/Uji/Budi Santoso)
 */
import { readFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import pg from 'pg';
import bcrypt from 'bcryptjs';

// Muat .env.local secara manual (skrip ini jalan di luar Next.js).
for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL belum diset (cek .env.local).');
  process.exit(1);
}

const needsSsl = /sslmode=require|neon\.tech|supabase\.co/.test(url);
const pool = new pg.Pool({
  connectionString: url,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

const cmd = process.argv[2];

async function migrate() {
  for (const f of ['schema.sql', 'schema-cms.sql', 'schema-blocks.sql', 'schema-pagecopy.sql']) {
    const file = path.join(process.cwd(), 'db', f);
    if (!existsSync(file)) continue;
    await pool.query(readFileSync(file, 'utf8'));
    console.log(`✓ ${f} diterapkan.`);
  }
}

async function seed() {
  const [email, name, password, role = 'owner'] = process.argv.slice(3);
  if (!email || !name || !password) {
    console.error('Pakai: node scripts/db.mjs seed <email> <nama> <password> [owner|staff]');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('Password minimal 10 karakter.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, name, password_hash, role)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           is_active = TRUE`,
    [email.toLowerCase(), name, hash, role],
  );
  console.log(`✓ Pengguna ${email} (${role}) siap dipakai.`);
}

async function importJsonl() {
  const file = process.argv[3] || path.join(process.cwd(), '.data', 'leads.jsonl');
  if (!existsSync(file)) {
    console.log(`Tidak ada file ${file}, lewati.`);
    return;
  }
  const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  let ok = 0;
  let skip = 0;
  for (const line of lines) {
    let d;
    try {
      d = JSON.parse(line);
    } catch {
      skip++;
      continue;
    }
    if (!d.name || !d.phone) {
      skip++;
      continue;
    }
    const res = await pool.query(
      `INSERT INTO leads
         (public_id, name, phone, city, building_type, area_sqm, floor_condition,
          need_type, message, source, ip, user_agent, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (public_id) DO NOTHING
       RETURNING id`,
      [
        d.id && /^[0-9a-f-]{36}$/i.test(d.id) ? d.id : randomUUID(),
        String(d.name).slice(0, 200),
        String(d.phone).slice(0, 40),
        d.city || null,
        d.buildingType || null,
        Number.isFinite(Number(d.areaSqm)) && d.areaSqm !== '' ? Number(d.areaSqm) : null,
        d.floorCondition || null,
        d.needType || null,
        d.message || null,
        d.source || 'website',
        d.ip || null,
        d.userAgent ? String(d.userAgent).slice(0, 300) : null,
        d.status === 'new' || !d.status ? 'baru' : d.status,
        d.createdAt ? new Date(d.createdAt) : new Date(),
      ],
    );
    if (res.rowCount) ok++;
    else skip++;
  }
  console.log(`✓ Impor selesai: ${ok} lead masuk, ${skip} dilewati (duplikat/tidak valid).`);
}

async function status() {
  const t = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)       AS users,
      (SELECT COUNT(*) FROM leads)       AS leads,
      (SELECT COUNT(*) FROM lead_notes)  AS notes,
      (SELECT COUNT(*) FROM lead_events) AS events,
      (SELECT COUNT(*) FROM sessions)    AS sessions`);
  console.table(t.rows[0]);
  const s = await pool.query(
    'SELECT status, COUNT(*)::int AS n FROM leads GROUP BY status ORDER BY n DESC',
  );
  if (s.rows.length) console.table(s.rows);
}

async function purgeTest() {
  const res = await pool.query(
    `DELETE FROM leads
      WHERE name ~* '^(audit test|uji |budi santoso|test|tes )'
         OR phone IN ('081234567890', '081298765432')
      RETURNING id`,
  );
  console.log(`✓ ${res.rowCount} lead uji coba dihapus.`);

  // Akun yang dibuat suite pengujian (admincheck membuat pengguna baru tiap
  // kali jalan). Akun owner/staff asli tidak tersentuh karena polanya khusus.
  const users = await pool.query(
    `DELETE FROM users
      WHERE email ~ '^tes[0-9]+@jayatiepoxy\\.id$'
      RETURNING id`,
  );
  console.log(`✓ ${users.rowCount} akun uji coba dihapus.`);

  // Teks & gambar yang mungkin tertinggal dari uji CMS.
  const copy = await pool.query(
    `DELETE FROM page_copy WHERE title ILIKE '%uji%' OR title ILIKE '%percobaan%' RETURNING id`,
  );
  const media = await pool.query(
    `DELETE FROM media WHERE alt ILIKE 'Foto uji%' RETURNING id`,
  );
  // Sesi kedaluwarsa hanya menumpuk tanpa guna.
  const sess = await pool.query('DELETE FROM sessions WHERE expires_at < now() RETURNING id');
  if (sess.rowCount) console.log(`✓ ${sess.rowCount} sesi kedaluwarsa dihapus.`);

  if (copy.rowCount || media.rowCount) {
    console.log(`✓ ${copy.rowCount} teks uji & ${media.rowCount} gambar uji dihapus.`);
  }
}

const table = {
  migrate,
  seed,
  'import-jsonl': importJsonl,
  status,
  'purge-test': purgeTest,
};

if (!table[cmd]) {
  console.error('Perintah: migrate | seed | import-jsonl | status | purge-test');
  process.exit(1);
}

try {
  await table[cmd]();
} catch (err) {
  console.error('Gagal:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
