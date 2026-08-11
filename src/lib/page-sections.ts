import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { query, queryOne } from './db';
import type { PageSectionRow, SectionConfig } from './sections';

/**
 * Susunan seksi per halaman dan halaman buatan Owner.
 *
 * Halaman bawaan (`is_custom = false`) tetap dirender oleh file rute
 * masing-masing; susunan seksi di sini hanya dipakai halaman kustom yang
 * dirender lewat rute tangkap-semua `/[...slug]`.
 */

const TAG = 'page-sections';
const PAGES_TAG = 'pages';

type Row = Record<string, unknown>;

function toSection(r: Row): PageSectionRow {
  return {
    id: Number(r.id),
    pageId: Number(r.page_id),
    kind: String(r.kind),
    sortOrder: Number(r.sort_order),
    isVisible: Boolean(r.is_visible),
    config: (r.config ?? {}) as SectionConfig,
  };
}

export type CustomPage = {
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
  isCustom: boolean;
  isPublished: boolean;
  updatedAt: string;
};

function toPage(r: Row): CustomPage {
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
    isCustom: Boolean(r.is_custom),
    isPublished: Boolean(r.is_published),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

/* --------------------------------------------------------------- membaca */

async function loadCustomPages(): Promise<CustomPage[]> {
  try {
    const rows = await query(
      'SELECT * FROM pages WHERE is_custom = true ORDER BY path',
    );
    return rows.map(toPage);
  } catch {
    return [];
  }
}

/** Semua halaman kustom, termasuk yang belum terbit. Dipakai admin. */
export const getCustomPages = unstable_cache(loadCustomPages, ['custom-pages'], {
  tags: [PAGES_TAG],
  revalidate: 300,
});

/** Halaman kustom yang sudah terbit — dipakai sitemap. */
export async function publishedCustomPages(): Promise<CustomPage[]> {
  const all = await getCustomPages();
  return all.filter((p) => p.isPublished);
}

async function loadSections(pageId: number): Promise<PageSectionRow[]> {
  try {
    const rows = await query(
      'SELECT * FROM page_sections WHERE page_id = $1 ORDER BY sort_order, id',
      [pageId],
    );
    return rows.map(toSection);
  } catch {
    return [];
  }
}

/** Seluruh seksi sebuah halaman, termasuk yang tersembunyi. Dipakai admin. */
export async function listSections(pageId: number): Promise<PageSectionRow[]> {
  return loadSections(pageId);
}

/** Seksi yang tampil saja, sudah terurut. Dipakai perender publik. */
export const getVisibleSections = unstable_cache(
  async (pageId: number) => (await loadSections(pageId)).filter((s) => s.isVisible),
  ['visible-page-sections'],
  { tags: [TAG], revalidate: 300 },
);

export async function getCustomPageByPath(path: string): Promise<CustomPage | null> {
  const all = await getCustomPages();
  return all.find((p) => p.path === path) ?? null;
}

export async function getPageRow(id: number): Promise<CustomPage | null> {
  const row = await queryOne('SELECT * FROM pages WHERE id = $1', [id]);
  return row ? toPage(row) : null;
}

export async function getSection(id: number): Promise<PageSectionRow | null> {
  const row = await queryOne('SELECT * FROM page_sections WHERE id = $1', [id]);
  return row ? toSection(row) : null;
}

/* ---------------------------------------------------------------- menulis */

function bust() {
  revalidateTag(TAG);
  revalidateTag(PAGES_TAG);
}

/** Path yang tidak boleh dipakai halaman kustom karena sudah ada rutenya. */
export const RESERVED_PATHS = [
  '/',
  '/admin',
  '/api',
  '/blog',
  '/portofolio',
  '/area-layanan',
  '/kontak',
  '/tentang-kami',
  '/jasa-epoxy-lantai',
  '/harga-epoxy-lantai',
  '/epoxy-lantai-rumah',
  '/epoxy-lantai-industri',
  '/epoxy-floor-coating',
  '/privacy-policy',
  '/terms',
  '/terima-kasih',
  '/lp',
  '/sitemap.xml',
  '/robots.txt',
];

export type PathProblem = { field: string; message: string };

/**
 * Normalkan dan periksa path halaman baru.
 * Menghasilkan path berawalan "/" tanpa garis miring di akhir.
 */
export function normalizePath(raw: string): { ok: true; path: string } | { ok: false; problems: PathProblem[] } {
  const trimmed = String(raw ?? '').trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, problems: [{ field: 'path', message: 'Alamat halaman wajib diisi.' }] };
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const path = withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;

  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(path)) {
    return {
      ok: false,
      problems: [{
        field: 'path',
        message: 'Alamat hanya boleh berisi huruf kecil, angka, dan tanda hubung. Contoh: /epoxy-gudang.',
      }],
    };
  }

  const first = `/${path.split('/')[1]}`;
  if (RESERVED_PATHS.includes(path) || RESERVED_PATHS.includes(first)) {
    return {
      ok: false,
      problems: [{ field: 'path', message: `Alamat "${path}" sudah dipakai halaman bawaan. Pilih alamat lain.` }],
    };
  }

  return { ok: true, path };
}

export async function createCustomPage(
  input: { path: string; label: string; title?: string; description?: string; h1?: string },
  userId: number,
): Promise<CustomPage> {
  const rows = await query(
    `INSERT INTO pages (path, label, title, description, h1, is_custom, is_published, in_sitemap, sitemap_priority, updated_by)
     VALUES ($1, $2, $3, $4, $5, true, false, true, 0.5, $6)
     RETURNING *`,
    [
      input.path,
      input.label,
      input.title || null,
      input.description || null,
      input.h1 || null,
      userId,
    ],
  );
  bust();
  return toPage(rows[0]!);
}

export async function setPagePublished(id: number, isPublished: boolean, userId: number): Promise<CustomPage | null> {
  const rows = await query(
    'UPDATE pages SET is_published = $1, updated_by = $2, updated_at = now() WHERE id = $3 AND is_custom = true RETURNING *',
    [isPublished, userId, id],
  );
  bust();
  return rows[0] ? toPage(rows[0]) : null;
}

export async function deleteCustomPage(id: number): Promise<boolean> {
  const rows = await query(
    'DELETE FROM pages WHERE id = $1 AND is_custom = true RETURNING id',
    [id],
  );
  bust();
  return rows.length > 0;
}

export async function addSection(
  pageId: number,
  kind: string,
  config: SectionConfig,
): Promise<PageSectionRow> {
  const maxRow = await queryOne(
    'SELECT COALESCE(MAX(sort_order), 0) AS m FROM page_sections WHERE page_id = $1',
    [pageId],
  );
  const next = Number(maxRow?.m ?? 0) + 1;
  const rows = await query(
    `INSERT INTO page_sections (page_id, kind, sort_order, is_visible, config)
     VALUES ($1, $2, $3, true, $4) RETURNING *`,
    [pageId, kind, next, JSON.stringify(config)],
  );
  bust();
  return toSection(rows[0]!);
}

export async function updateSection(id: number, config: SectionConfig): Promise<PageSectionRow | null> {
  const rows = await query(
    'UPDATE page_sections SET config = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [JSON.stringify(config), id],
  );
  bust();
  return rows[0] ? toSection(rows[0]) : null;
}

export async function setSectionVisible(id: number, isVisible: boolean): Promise<PageSectionRow | null> {
  const rows = await query(
    'UPDATE page_sections SET is_visible = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [isVisible, id],
  );
  bust();
  return rows[0] ? toSection(rows[0]) : null;
}

export async function deleteSection(id: number): Promise<boolean> {
  const rows = await query('DELETE FROM page_sections WHERE id = $1 RETURNING id', [id]);
  bust();
  return rows.length > 0;
}

/**
 * Susun ulang seksi. Hanya id milik halaman tersebut yang diproses,
 * sehingga permintaan nakal tidak bisa memindahkan seksi halaman lain.
 */
export async function reorderSections(pageId: number, ids: number[]): Promise<PageSectionRow[]> {
  const current = await loadSections(pageId);
  const valid = new Set(current.map((s) => s.id));
  const ordered = ids.filter((id) => valid.has(id));
  for (const id of current.map((s) => s.id)) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  for (let i = 0; i < ordered.length; i += 1) {
    await query('UPDATE page_sections SET sort_order = $1, updated_at = now() WHERE id = $2 AND page_id = $3', [
      i + 1,
      ordered[i],
      pageId,
    ]);
  }
  bust();
  return loadSections(pageId);
}
