#!/usr/bin/env node
/**
 * Mengisi tabel CMS dari konten yang saat ini ada di kode.
 *   node scripts/seed-cms.mjs
 * Aman diulang: memakai ON CONFLICT DO NOTHING.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

/* ---------- 1. Halaman ---------- */
const PAGES = [
  ['/', 'Beranda', 1.0],
  ['/jasa-epoxy-lantai', 'Jasa Epoxy Lantai', 0.9],
  ['/harga-epoxy-lantai', 'Harga Epoxy Lantai', 0.9],
  ['/epoxy-lantai-rumah', 'Epoxy Lantai Rumah', 0.8],
  ['/epoxy-lantai-industri', 'Epoxy Lantai Industri', 0.8],
  ['/epoxy-floor-coating', 'Epoxy Floor Coating', 0.7],
  ['/portofolio', 'Portofolio', 0.8],
  ['/area-layanan', 'Area Layanan', 0.7],
  ['/blog', 'Blog', 0.7],
  ['/tentang-kami', 'Tentang Kami', 0.6],
  ['/kontak', 'Kontak', 0.8],
  ['/privacy-policy', 'Kebijakan Privasi', 0.3],
  ['/terms', 'Syarat & Ketentuan', 0.3],
];

async function seedPages() {
  let n = 0;
  for (const [p, label, prio] of PAGES) {
    const r = await pool.query(
      `INSERT INTO pages (path, label, sitemap_priority)
       VALUES ($1,$2,$3) ON CONFLICT (path) DO NOTHING RETURNING id`,
      [p, label, prio],
    );
    if (r.rowCount) n++;
  }
  console.log(`✓ Halaman: ${n} baru, ${PAGES.length - n} sudah ada.`);
}

/* ---------- 2. Pengaturan ---------- */
async function seedSettings() {
  // Nilai dibiarkan kosong: lapisan aplikasi memakai default dari site.ts
  // sehingga tidak ada duplikasi sumber kebenaran.
  const groups = ['company', 'contact', 'social', 'cta', 'seo'];
  let n = 0;
  for (const g of groups) {
    const r = await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, '{}'::jsonb)
       ON CONFLICT (key) DO NOTHING RETURNING key`,
      [g],
    );
    if (r.rowCount) n++;
  }
  console.log(`✓ Grup pengaturan: ${n} baru, ${groups.length - n} sudah ada.`);
}

/* ---------- 3. Blog dari content.ts ---------- */
async function seedPosts() {
  const file = path.join(process.cwd(), 'src', 'lib', 'content.ts');
  const src = readFileSync(file, 'utf8');

  // Ambil blok `export const posts: Post[] = [ ... ];`
  const start = src.indexOf('export const posts');
  if (start === -1) {
    console.log('! Blok posts tidak ditemukan di content.ts, lewati.');
    return;
  }
  // Cari '[' SETELAH tanda '=', bukan '[' dari anotasi tipe `Post[]`.
  const eq = src.indexOf('=', start);
  const arrStart = src.indexOf('[', eq);
  let depth = 0;
  let end = arrStart;
  for (let i = arrStart; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  const literal = src.slice(arrStart, end);
  // Evaluasi literal TypeScript sebagai JS. Aman: file milik proyek sendiri.
  let posts;
  try {
    posts = new Function(`return ${literal};`)();
  } catch (e) {
    throw new Error(`Gagal membaca posts dari content.ts: ${e.message}`);
  }
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('Parser posts menghasilkan array kosong — periksa content.ts.');
  }

  let n = 0;
  for (const p of posts) {
    const r = await pool.query(
      `INSERT INTO posts
         (slug, title, description, category, author, reviewer, intro, sections, faqs,
          read_minutes, status, source, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'published','manual',$11)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [
        p.slug,
        p.title,
        p.description ?? '',
        p.category ?? 'Umum',
        p.author ?? '',
        p.reviewer ?? '',
        p.intro ?? '',
        JSON.stringify(p.sections ?? []),
        JSON.stringify(p.faqs ?? []),
        p.readMinutes ?? 5,
        p.published ? new Date(p.published) : new Date(),
      ],
    );
    if (r.rowCount) n++;
  }
  console.log(`✓ Artikel blog: ${n} baru, ${posts.length - n} sudah ada.`);
}

try {
  await seedPages();
  await seedSettings();
  await seedPosts();
  const t = await pool.query(`
    SELECT (SELECT COUNT(*) FROM pages) AS pages,
           (SELECT COUNT(*) FROM settings) AS settings,
           (SELECT COUNT(*) FROM posts) AS posts`);
  console.table(t.rows[0]);
} catch (err) {
  console.error('Gagal:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
