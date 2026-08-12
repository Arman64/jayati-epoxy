/**
 * Memindahkan konten terstruktur dari src/lib/content.ts ke tabel content_items.
 *
 * Aman dijalankan berulang: memakai ON CONFLICT DO NOTHING sehingga
 * perubahan yang sudah dibuat Owner lewat admin tidak akan tertimpa.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const connectionString =
  process.env.DATABASE_URL ??
  (() => {
    try {
      const env = readFileSync(join(root, '.env.local'), 'utf8');
      const m = env.match(/^DATABASE_URL=(.+)$/m);
      return m ? m[1].trim() : null;
    } catch {
      return null;
    }
  })();

if (!connectionString) {
  console.error('DATABASE_URL tidak ditemukan.');
  process.exit(1);
}

const src = readFileSync(join(root, 'src/lib/content.ts'), 'utf8');

/**
 * Mengambil literal array dari sumber TypeScript.
 *
 * PENTING: pencarian '[' harus dimulai SETELAH tanda '=', karena anotasi
 * tipe seperti `: Post[]` juga mengandung kurung siku dan pernah membuat
 * parser mengembalikan array kosong secara diam-diam.
 */
function arrayLiteral(name) {
  const decl = new RegExp(`export const ${name}\\s*(?::[^=]+)?=\\s*`);
  const m = src.match(decl);
  if (!m) throw new Error(`Deklarasi "${name}" tidak ditemukan.`);

  const start = src.indexOf('[', m.index + m[0].length - 1);
  if (start === -1) throw new Error(`Awal array "${name}" tidak ditemukan.`);

  let depth = 0;
  let inStr = null;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];
    if (inStr) {
      if (ch === inStr && prev !== '\\') inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        const literal = src.slice(start, i + 1);
        // eslint-disable-next-line no-new-func
        const value = new Function(`return (${literal});`)();
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error(`Array "${name}" kosong setelah diurai — parser gagal.`);
        }
        return value;
      }
    }
  }
  throw new Error(`Kurung penutup "${name}" tidak ditemukan.`);
}

function slugify(input, fallback = 'item') {
  const s = String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || fallback;
}

const epoxySystems = arrayLiteral('epoxySystems');
const coreServices = arrayLiteral('coreServices');
const otherServices = arrayLiteral('otherServices');
const workSteps = arrayLiteral('workSteps');
const whyChooseUs = arrayLiteral('whyChooseUs');
const generalFaqs = arrayLiteral('generalFaqs');
const priceFaqs = arrayLiteral('priceFaqs');
const cities = arrayLiteral('cities');
const projects = arrayLiteral('projects');

const clientCountMatch = src.match(/clientGroups\.reduce/);
const stats = [
  { eyebrow: 'Proyek tercatat', value: '78+ Unit', note: 'Daftar klien company profile 2026' },
  { eyebrow: 'Standar material', value: 'ISO 9001', note: 'Material produksi standar mutu' },
  { eyebrow: 'Spesifikasi', value: 'SNI', note: 'Warna, ketebalan & model sesuai pesanan' },
  { eyebrow: 'Layanan', value: 'Bergaransi', note: 'Garansi resmi tertulis' },
];

const plan = [
  {
    collection: 'epoxy_systems',
    items: epoxySystems.map((s) => ({
      slug: s.slug,
      data: {
        name: s.name,
        micron: s.micron,
        thicknessLabel: s.thicknessLabel,
        family: s.family,
        bestFor: s.bestFor,
        priceUnder100: s.priceUnder100,
        priceOver100: s.priceOver100,
        priceOver500: s.priceOver500,
        highlights: s.highlights ?? [],
        unverified: Boolean(s.unverified),
      },
    })),
  },
  {
    collection: 'core_services',
    items: coreServices.map((s) => ({
      slug: s.slug,
      data: { title: s.title, short: s.short, icon: s.icon, href: `/${s.slug}` },
    })),
  },
  {
    collection: 'other_services',
    items: otherServices.map((s) => ({
      slug: slugify(s.name),
      data: { name: s.name, body: s.body, points: s.points ?? [] },
    })),
  },
  {
    collection: 'work_steps',
    items: workSteps.map((s) => ({
      slug: slugify(s.title),
      data: { title: s.title, body: s.body },
    })),
  },
  {
    collection: 'why_choose_us',
    items: whyChooseUs.map((s) => ({
      slug: slugify(s.title),
      data: { title: s.title, body: s.body },
    })),
  },
  {
    collection: 'faqs_general',
    items: generalFaqs.map((f) => ({ slug: slugify(f.q), data: { q: f.q, a: f.a } })),
  },
  {
    collection: 'faqs_price',
    items: priceFaqs.map((f) => ({ slug: slugify(f.q), data: { q: f.q, a: f.a } })),
  },
  {
    collection: 'cities',
    items: cities.map((c) => ({ slug: c.slug, data: { name: c.name, region: c.region } })),
  },
  {
    collection: 'stats',
    items: stats.map((s) => ({ slug: slugify(s.eyebrow), data: s })),
  },
  {
    collection: 'projects',
    items: projects.map((p) => ({
      slug: p.slug,
      data: {
        name: p.name,
        category: p.category,
        city: p.city,
        buildingType: p.buildingType ?? '',
        system: p.system ?? '',
        thickness: p.thickness ?? '',
        summary: p.summary,
        scope: p.scope ?? [],
        detail: p.detail ?? [],
        photos: (p.photos ?? []).map((f) => ({
          src: f.src,
          alt: f.alt,
          width: f.width,
          height: f.height,
          ...(f.caption ? { caption: f.caption } : {}),
        })),
        hasRealPhoto: Boolean(p.hasRealPhoto),
      },
    })),
  },
];

const pool = new pg.Pool({ connectionString });

try {
  let total = 0;
  for (const group of plan) {
    let n = 0;
    let order = 0;
    for (const item of group.items) {
      order++;
      const res = await pool.query(
        `INSERT INTO content_items (collection, slug, data, sort_order)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (collection, slug) DO NOTHING`,
        [group.collection, item.slug, JSON.stringify(item.data), order],
      );
      n += res.rowCount;
    }
    total += n;
    console.log(`  ${group.collection.padEnd(16)} ${n} baru / ${group.items.length} total`);
  }

  const counts = await pool.query(
    'SELECT collection, count(*)::int AS n FROM content_items GROUP BY collection ORDER BY collection',
  );
  console.log('\nIsi tabel content_items:');
  for (const r of counts.rows) console.log(`  ${r.collection.padEnd(16)} ${r.n}`);
  console.log(`\n✓ ${total} item baru ditambahkan.`);
} catch (err) {
  console.error('Gagal seed konten:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
