import { readFileSync } from 'node:fs';
/**
 * Audit SEO & kualitas otomatis — memvalidasi Acceptance Criteria PRD §15.
 * Menjalankan crawl terhadap server produksi lokal.
 */
const BASE = process.env.BASE || 'http://localhost:3000';

// Slug halaman diturunkan dari source of truth agar audit tidak memakai
// daftar usang saat konten diperbarui.
const src = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
const slugsOf = (file, key) => {
  const body = src(file);
  const re = new RegExp(`${key}:\\s*'([^']+)'`, 'g');
  return [...body.matchAll(re)].map((m) => m[1]);
};

/** Ambil slug hanya dari satu blok array bernama `name` di file sumber. */
const slugsInArray = (file, arrayName) => {
  const body = src(file);
  const start = body.indexOf(`export const ${arrayName}`);
  if (start === -1) throw new Error(`array ${arrayName} tidak ditemukan di ${file}`);
  const end = body.indexOf('\n];', start);
  const block = body.slice(start, end);
  return [...block.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
};

const PORTFOLIO_SLUGS = slugsInArray('src/lib/content.ts', 'projects');
const CITY_SLUGS = slugsInArray('src/lib/cityContent.ts', 'cityContents');
const POST_SLUGS = slugsInArray('src/lib/content.ts', 'posts');

// Nomor telepon resmi diambil langsung dari site.ts
const PHONE_DISPLAY = /phoneDisplay:\s*'([^']+)'/.exec(src('src/lib/site.ts'))[1];

const PUBLIC_PAGES = [
  '/', '/jasa-epoxy-lantai', '/harga-epoxy-lantai', '/epoxy-lantai-rumah',
  '/epoxy-lantai-industri', '/epoxy-floor-coating', '/portofolio',
  ...PORTFOLIO_SLUGS.map((sl) => `/portofolio/${sl}`),
  '/area-layanan',
  ...CITY_SLUGS.map((sl) => `/area-layanan/${sl}`),
  '/blog',
  ...POST_SLUGS.map((sl) => `/blog/${sl}`),
  '/tentang-kami', '/kontak', '/privacy-policy', '/terms',
];

const NOINDEX_PAGES = ['/terima-kasih', '/lp/jasa-epoxy-lantai', '/lp/harga-epoxy-lantai', '/lp/epoxy-lantai-rumah', '/lp/epoxy-lantai-industri'];

const fails = [];
const warns = [];
const seenTitles = new Map();
const seenDescs = new Map();
let checks = 0;

const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };
const warn = (cond, msg) => { checks++; if (!cond) warns.push(msg); };

function m(html, re) { const x = html.match(re); return x ? x[1] : null; }
function all(html, re) { return [...html.matchAll(re)]; }

async function fetchPage(path) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const html = res.status === 200 ? await res.text() : '';
  return { status: res.status, html, headers: res.headers };
}

console.log(`\n=== AUDIT SEO & KUALITAS — ${BASE} ===\n`);

for (const path of PUBLIC_PAGES) {
  const { status, html } = await fetchPage(path);
  ok(status === 200, `[${path}] status ${status}, harusnya 200`);
  if (status !== 200) continue;

  // H1 tunggal
  const h1s = all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g);
  ok(h1s.length === 1, `[${path}] jumlah H1 = ${h1s.length}, harus tepat 1`);

  // Title unik & panjang wajar
  const title = m(html, /<title>([^<]*)<\/title>/);
  ok(!!title, `[${path}] tidak ada <title>`);
  if (title) {
    if (seenTitles.has(title)) fails.push(`[${path}] title duplikat dengan ${seenTitles.get(title)}: "${title}"`);
    seenTitles.set(title, path);
    checks++;
    warn(title.length >= 20 && title.length <= 75, `[${path}] panjang title ${title.length} char (ideal 20–75): "${title}"`);
  }

  // Meta description unik
  const desc = m(html, /<meta name="description" content="([^"]*)"/);
  ok(!!desc && desc.length > 0, `[${path}] tidak ada meta description`);
  if (desc) {
    if (seenDescs.has(desc)) fails.push(`[${path}] description duplikat dengan ${seenDescs.get(desc)}`);
    seenDescs.set(desc, path);
    checks++;
    warn(desc.length >= 70 && desc.length <= 185, `[${path}] panjang description ${desc.length} char (ideal 70–185)`);
  }

  // Canonical absolut + https
  const canon = m(html, /<link rel="canonical" href="([^"]*)"/);
  ok(!!canon, `[${path}] tidak ada canonical`);
  ok(canon?.startsWith('https://'), `[${path}] canonical bukan absolut https: ${canon}`);

  // Halaman publik TIDAK boleh noindex
  ok(!/<meta name="robots"[^>]*noindex/i.test(html), `[${path}] halaman publik ter-set NOINDEX`);

  // Open Graph
  ok(!!m(html, /<meta property="og:title" content="([^"]*)"/), `[${path}] tidak ada og:title`);
  ok(!!m(html, /<meta property="og:description" content="([^"]*)"/), `[${path}] tidak ada og:description`);
  ok(!!m(html, /<meta property="og:image" content="([^"]*)"/), `[${path}] tidak ada og:image`);

  // lang
  ok(/<html[^>]*lang="id"/.test(html), `[${path}] atribut lang bukan "id"`);

  // Semua <img> punya alt
  const imgs = all(html, /<img\b[^>]*>/g).map((x) => x[0]);
  const noAlt = imgs.filter((t) => !/\balt=/.test(t));
  ok(noAlt.length === 0, `[${path}] ${noAlt.length} <img> tanpa alt`);
  const emptyAlt = imgs.filter((t) => /\balt=""/.test(t));
  warn(emptyAlt.length === 0, `[${path}] ${emptyAlt.length} <img> dengan alt kosong`);

  // JSON-LD valid
  const lds = all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  ok(lds.length > 0, `[${path}] tidak ada JSON-LD`);
  for (const [, raw] of lds) {
    try { JSON.parse(raw.replace(/\\u003c/g, '<')); }
    catch (e) { fails.push(`[${path}] JSON-LD tidak valid: ${e.message}`); }
    checks++;
  }

  // Breadcrumb pada halaman non-home
  if (path !== '/') {
    ok(/"@type":"BreadcrumbList"/.test(html), `[${path}] tidak ada BreadcrumbList schema`);
  }

  // FAQPage schema hanya jika FAQ terlihat di halaman
  if (/"@type":"FAQPage"/.test(html)) {
    ok(/<summary/.test(html), `[${path}] ada FAQPage schema tapi FAQ tidak terlihat di halaman`);
  }

  // Konten cukup (bukan halaman tipis)
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  warn(words > 320, `[${path}] konten tipis: ~${words} kata`);

  // Konten ter-render server-side (crawlable tanpa JS)
  ok(/<h1/.test(html), `[${path}] H1 tidak ada di HTML server-side`);

  // Tidak ada nomor/alamat hardcoded yang beda dari site.ts
  const phoneCount = (html.match(new RegExp(PHONE_DISPLAY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (path === '/kontak') ok(phoneCount > 0, `[${path}] NAP telepon tidak muncul di halaman kontak`);
}

// Halaman yang WAJIB noindex
for (const path of NOINDEX_PAGES) {
  const { status, html, headers } = await fetchPage(path);
  ok(status === 200, `[${path}] status ${status}`);
  if (status !== 200) continue;
  const meta = /<meta name="robots"[^>]*noindex/i.test(html);
  const hdr = (headers.get('x-robots-tag') || '').includes('noindex');
  ok(meta || hdr, `[${path}] WAJIB noindex tetapi tidak ter-set`);
  const h1s = all(html, /<h1[^>]*>/g);
  ok(h1s.length === 1, `[${path}] jumlah H1 = ${h1s.length}, harus 1`);
}

// robots.txt
{
  const res = await fetch(BASE + '/robots.txt');
  const txt = await res.text();
  ok(res.status === 200, 'robots.txt tidak 200');
  ok(/Sitemap:/i.test(txt), 'robots.txt tidak mencantumkan Sitemap');
  ok(/Disallow: \/api\//.test(txt), 'robots.txt tidak men-disallow /api/');
  ok(/\/terima-kasih/.test(txt), 'robots.txt tidak men-disallow /terima-kasih');
}

// sitemap.xml — hanya URL canonical & indexable
{
  const res = await fetch(BASE + '/sitemap.xml');
  const xml = await res.text();
  ok(res.status === 200, 'sitemap.xml tidak 200');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
  ok(urls.length > 0, 'sitemap kosong');
  ok(!urls.some((u) => u.includes('/lp/')), 'sitemap memuat halaman LP iklan (harus dikecualikan)');
  ok(!urls.some((u) => u.includes('/terima-kasih')), 'sitemap memuat /terima-kasih (noindex)');
  ok(urls.every((u) => u.startsWith('https://')), 'ada URL sitemap non-https');
  ok(new Set(urls).size === urls.length, 'ada URL duplikat di sitemap');

  // Setiap URL sitemap harus 200 & tidak noindex
  for (const u of urls) {
    const p = new URL(u).pathname;
    const { status, html } = await fetchPage(p === '' ? '/' : p);
    ok(status === 200, `sitemap: ${p} mengembalikan ${status}`);
    if (status === 200) ok(!/<meta name="robots"[^>]*noindex/i.test(html), `sitemap: ${p} ter-noindex`);
  }
  console.log(`  · sitemap memuat ${urls.length} URL, semuanya 200 & indexable`);
}

// Redirect manager — tidak boleh loop
{
  const redirects = [
    ['/jasa-epoxy', '/jasa-epoxy-lantai'],
    ['/harga', '/harga-epoxy-lantai'],
    ['/epoxy-rumah', '/epoxy-lantai-rumah'],
    ['/epoxy-industri', '/epoxy-lantai-industri'],
    ['/kontak-kami', '/kontak'],
  ];
  for (const [from, to] of redirects) {
    const res = await fetch(BASE + from, { redirect: 'manual' });
    ok(res.status === 308 || res.status === 301, `redirect ${from} status ${res.status}`);
    const loc = res.headers.get('location') || '';
    ok(loc.endsWith(to), `redirect ${from} -> ${loc}, harusnya ${to}`);
    const follow = await fetch(BASE + to, { redirect: 'manual' });
    ok(follow.status === 200, `target redirect ${to} tidak 200 (potensi loop)`);
  }
}

// 404
{
  const res = await fetch(BASE + '/halaman-yang-tidak-ada-xyz');
  ok(res.status === 404, `URL tidak dikenal mengembalikan ${res.status}, harusnya 404`);
}

// Security headers
{
  const res = await fetch(BASE + '/');
  for (const h of ['x-content-type-options', 'referrer-policy', 'strict-transport-security']) {
    ok(!!res.headers.get(h), `header keamanan hilang: ${h}`);
  }
  ok(!res.headers.get('x-powered-by'), 'header x-powered-by masih terekspos');
}

// API lead: validasi, honeypot, rate limit
{
  // IP unik per run agar rate limiter tidak terpicu oleh audit sebelumnya
  const ip = `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  const post = (body, xff = ip) =>
    fetch(BASE + '/api/leads', { method: 'POST', body, headers: { 'x-forwarded-for': xff } });

  const bad = new FormData();
  bad.append('name', 'a');
  bad.append('phone', 'xx');
  bad.append('city', '');
  const r1 = await post(bad);
  ok(r1.status === 422, `API menerima data invalid (status ${r1.status}, harusnya 422)`);

  const hp = new FormData();
  hp.append('name', 'Bot');
  hp.append('phone', '081234567890');
  hp.append('city', 'Jakarta');
  hp.append('company_website', 'spam');
  const r2 = await post(hp);
  const j2 = await r2.json();
  ok(r2.status === 200 && j2.id === 'ok', 'honeypot tidak berfungsi');

  const mk = (n) => {
    const f = new FormData();
    f.append('name', `Audit Test ${n}`);
    f.append('phone', '081234567890');
    f.append('city', 'Malang');
    f.append('areaSqm', '120');
    return f;
  };
  const r3 = await post(mk(1));
  ok(r3.status === 201, `submit valid gagal (status ${r3.status})`);
  const j3 = await r3.json();
  ok(!!j3.id && !!j3.autoReply, 'respons lead tidak memuat id/autoReply');
  ok(!/harga final|pasti/i.test(j3.autoReply || ''), 'auto-reply menjanjikan harga final');

  // File tidak sesuai MIME harus ditolak
  const badFile = mk(2);
  badFile.append('photo', new File(['#!/bin/sh\necho hi'], 'evil.sh', { type: 'application/x-sh' }));
  const r5 = await post(badFile);
  ok(r5.status === 422, `upload file berbahaya diterima (status ${r5.status})`);

  // Rate limit harus aktif setelah melewati ambang
  const rlIp = '10.55.55.55';
  let limited = false;
  for (let i = 0; i < 9; i++) {
    const r = await post(mk(100 + i), rlIp);
    if (r.status === 429) { limited = true; break; }
  }
  ok(limited, 'rate limit tidak aktif setelah banyak submit');

  const r4 = await fetch(BASE + '/api/leads');
  ok(r4.status === 405, `GET /api/leads harusnya 405, dapat ${r4.status}`);
}

console.log(`\nTotal pengecekan: ${checks}`);
if (warns.length) {
  console.log(`\n⚠️  PERINGATAN (${warns.length}):`);
  warns.forEach((w) => console.log('   - ' + w));
}
if (fails.length) {
  console.log(`\n❌ GAGAL (${fails.length}):`);
  fails.forEach((f) => console.log('   - ' + f));
  process.exit(1);
}
console.log('\n✅ SEMUA PENGECEKAN KRITIS LULUS\n');
