import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { query, queryOne } from './db';

/**
 * Pengaturan SEO per halaman. Halaman tetap dirender oleh kode (struktur,
 * komponen, JSON-LD), tetapi title/description/H1/intro dapat ditimpa Owner.
 */

export type PageSetting = {
  id: number;
  path: string;
  label: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  intro: string | null;
  ogImage: string | null;
  noindex: boolean;
  inSitemap: boolean;
  sitemapPriority: number;
  updatedAt: string;
};

type Row = Record<string, unknown>;

function toPage(r: Row): PageSetting {
  return {
    id: Number(r.id),
    path: String(r.path),
    label: String(r.label),
    title: (r.title as string) ?? null,
    description: (r.description as string) ?? null,
    h1: (r.h1 as string) ?? null,
    intro: (r.intro as string) ?? null,
    ogImage: (r.og_image as string) ?? null,
    noindex: Boolean(r.noindex),
    inSitemap: Boolean(r.in_sitemap),
    sitemapPriority: Number(r.sitemap_priority),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

const TAG = 'pages';

/** Daftar halaman yang dikelola CMS. Dipakai saat seed. */
export const MANAGED_PAGES: Array<{ path: string; label: string; priority: number }> = [
  { path: '/', label: 'Beranda', priority: 1.0 },
  { path: '/jasa-epoxy-lantai', label: 'Jasa Epoxy Lantai', priority: 0.9 },
  { path: '/harga-epoxy-lantai', label: 'Harga Epoxy Lantai', priority: 0.9 },
  { path: '/epoxy-lantai-rumah', label: 'Epoxy Lantai Rumah', priority: 0.8 },
  { path: '/epoxy-lantai-industri', label: 'Epoxy Lantai Industri', priority: 0.8 },
  { path: '/epoxy-floor-coating', label: 'Epoxy Floor Coating', priority: 0.7 },
  { path: '/portofolio', label: 'Portofolio', priority: 0.8 },
  { path: '/area-layanan', label: 'Area Layanan', priority: 0.7 },
  { path: '/blog', label: 'Blog', priority: 0.7 },
  { path: '/tentang-kami', label: 'Tentang Kami', priority: 0.6 },
  { path: '/kontak', label: 'Kontak', priority: 0.8 },
  { path: '/privacy-policy', label: 'Kebijakan Privasi', priority: 0.3 },
  { path: '/terms', label: 'Syarat & Ketentuan', priority: 0.3 },
];

async function loadAll(): Promise<Record<string, PageSetting>> {
  try {
    const rows = await query('SELECT * FROM pages ORDER BY path');
    const map: Record<string, PageSetting> = {};
    for (const r of rows) {
      const p = toPage(r);
      map[p.path] = p;
    }
    return map;
  } catch {
    return {};
  }
}

export const getPageMap = unstable_cache(loadAll, ['page-settings'], {
  tags: [TAG],
  revalidate: 300,
});

export async function listPages(): Promise<PageSetting[]> {
  const rows = await query('SELECT * FROM pages ORDER BY sitemap_priority DESC, path');
  return rows.map(toPage);
}

export async function getPage(path: string): Promise<PageSetting | null> {
  const row = await queryOne('SELECT * FROM pages WHERE path = $1', [path]);
  return row ? toPage(row) : null;
}

/**
 * Ambil override untuk sebuah path. Mengembalikan objek kosong bila
 * belum diatur, sehingga pemanggil bisa pakai `?? nilaiDefault`.
 */
export async function pageOverride(path: string): Promise<Partial<PageSetting>> {
  const map = await getPageMap();
  return map[path] ?? {};
}

export async function updatePage(
  id: number,
  data: Partial<Omit<PageSetting, 'id' | 'path' | 'updatedAt'>>,
  userId: number,
): Promise<PageSetting | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  const push = (col: string, val: unknown) => {
    params.push(val);
    sets.push(`${col} = $${params.length}`);
  };

  if (data.label !== undefined) push('label', data.label);
  if (data.title !== undefined) push('title', data.title || null);
  if (data.description !== undefined) push('description', data.description || null);
  if (data.h1 !== undefined) push('h1', data.h1 || null);
  if (data.intro !== undefined) push('intro', data.intro || null);
  if (data.ogImage !== undefined) push('og_image', data.ogImage || null);
  if (data.noindex !== undefined) push('noindex', data.noindex);
  if (data.inSitemap !== undefined) push('in_sitemap', data.inSitemap);
  if (data.sitemapPriority !== undefined) push('sitemap_priority', data.sitemapPriority);

  if (!sets.length) return getPageById(id);

  push('updated_by', userId);
  params.push(id);

  const rows = await query(
    `UPDATE pages SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  revalidateTag(TAG);
  return rows[0] ? toPage(rows[0]) : null;
}

export async function getPageById(id: number): Promise<PageSetting | null> {
  const row = await queryOne('SELECT * FROM pages WHERE id = $1', [id]);
  return row ? toPage(row) : null;
}
