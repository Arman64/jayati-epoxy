import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { query, queryOne } from './db';
import { collectionDef, slugify, validateItem, type ValidationProblem } from './collections';
import * as fallback from './content';

const TAG = 'content-items';

export type ContentItem = {
  id: number;
  collection: string;
  slug: string;
  data: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

type Row = Record<string, unknown>;

function toItem(r: Row): ContentItem {
  return {
    id: Number(r.id),
    collection: String(r.collection),
    slug: String(r.slug),
    data: (r.data as Record<string, unknown>) ?? {},
    sortOrder: Number(r.sort_order),
    isActive: Boolean(r.is_active),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

/* ---------------- baca ---------------- */

async function loadAll(): Promise<Record<string, ContentItem[]>> {
  try {
    const rows = await query<Row>(
      'SELECT * FROM content_items ORDER BY collection, sort_order, id',
    );
    const map: Record<string, ContentItem[]> = {};
    for (const r of rows) {
      const item = toItem(r);
      (map[item.collection] ??= []).push(item);
    }
    return map;
  } catch {
    // Database bermasalah — halaman tetap tampil dengan data bawaan.
    return {};
  }
}

/**
 * Apakah basis data bisa dihubungi saat ini.
 *
 * Dibutuhkan panel admin: bila koneksi putus, daftar konten akan terlihat
 * kosong dan Owner bisa mengira datanya terhapus. Lebih baik berkata terus
 * terang bahwa basis data sedang tidak bisa dibaca.
 */
export async function contentDbReachable(): Promise<boolean> {
  try {
    await query('SELECT 1 FROM content_items LIMIT 1');
    return true;
  } catch {
    return false;
  }
}

export const getAllContent = unstable_cache(loadAll, ['content-items'], {
  tags: [TAG],
  revalidate: 300,
});

/** Item aktif sebuah koleksi, sudah terurut. Untuk halaman publik. */
export async function activeItems(collection: string): Promise<Array<Record<string, unknown>>> {
  const all = await getAllContent();
  const rows = all[collection];
  if (!rows?.length) return [];
  return rows.filter((r) => r.isActive).map((r) => ({ slug: r.slug, ...r.data }));
}

/** Semua item termasuk yang nonaktif. Untuk panel admin. */
export async function listItems(collection: string): Promise<ContentItem[]> {
  const all = await getAllContent();
  return all[collection] ?? [];
}

export async function getItem(id: number): Promise<ContentItem | null> {
  const r = await queryOne<Row>('SELECT * FROM content_items WHERE id = $1', [id]);
  return r ? toItem(r) : null;
}

/* ---------------- tulis ---------------- */

export async function createItem(
  collection: string,
  input: Record<string, unknown>,
  userId: number | null,
): Promise<{ ok: true; item: ContentItem } | { ok: false; problems: ValidationProblem[] }> {
  const def = collectionDef(collection);
  if (!def) return { ok: false, problems: [{ field: '_', message: 'Koleksi tidak dikenal.' }] };
  if (!def.allowCreate) {
    return { ok: false, problems: [{ field: '_', message: 'Koleksi ini tidak menerima item baru.' }] };
  }

  const check = validateItem(def, input);
  if (!check.ok) return check;

  const base = slugify(String(check.data[def.titleField] ?? ''), collection);
  const existing = await query<{ slug: string }>(
    'SELECT slug FROM content_items WHERE collection = $1',
    [collection],
  );
  const taken = new Set(existing.map((e) => e.slug));
  let slug = base;
  let n = 1;
  while (taken.has(slug)) slug = `${base}-${++n}`;

  const maxRow = await queryOne<{ m: number | null }>(
    'SELECT MAX(sort_order) AS m FROM content_items WHERE collection = $1',
    [collection],
  );
  const sort = (maxRow?.m ?? 0) + 1;

  const row = await queryOne<Row>(
    `INSERT INTO content_items (collection, slug, data, sort_order, updated_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [collection, slug, JSON.stringify(check.data), sort, userId],
  );
  revalidateTag(TAG);
  return { ok: true, item: toItem(row!) };
}

export async function updateItem(
  id: number,
  input: Record<string, unknown>,
  userId: number | null,
): Promise<
  { ok: true; item: ContentItem } | { ok: false; problems: ValidationProblem[]; status?: number }
> {
  const current = await getItem(id);
  if (!current) {
    return { ok: false, problems: [{ field: '_', message: 'Item tidak ditemukan.' }], status: 404 };
  }
  const def = collectionDef(current.collection);
  if (!def) {
    return { ok: false, problems: [{ field: '_', message: 'Koleksi tidak dikenal.' }], status: 422 };
  }

  const check = validateItem(def, input);
  if (!check.ok) return check;

  // Simpan versi lama supaya perubahan harga yang keliru bisa dikembalikan.
  await query(
    `INSERT INTO content_revisions (item_id, collection, slug, data, note, user_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, current.collection, current.slug, JSON.stringify(current.data), 'Sebelum perubahan', userId],
  );

  const row = await queryOne<Row>(
    `UPDATE content_items SET data = $1, updated_by = $2 WHERE id = $3 RETURNING *`,
    [JSON.stringify(check.data), userId, id],
  );
  revalidateTag(TAG);
  return { ok: true, item: toItem(row!) };
}

export async function setItemActive(id: number, active: boolean): Promise<boolean> {
  const r = await query('UPDATE content_items SET is_active = $1 WHERE id = $2', [active, id]);
  revalidateTag(TAG);
  return r.length >= 0;
}

export async function deleteItem(id: number): Promise<boolean> {
  const row = await queryOne<{ id: number }>(
    'DELETE FROM content_items WHERE id = $1 RETURNING id',
    [id],
  );
  revalidateTag(TAG);
  return Boolean(row);
}

/** Menyusun ulang urutan berdasarkan daftar id. */
export async function reorderItems(collection: string, ids: number[]): Promise<void> {
  if (!ids.length) return;
  const values = ids.map((id, i) => `(${Number(id)}::bigint, ${i + 1})`).join(',');
  await query(
    `UPDATE content_items AS c SET sort_order = v.ord
       FROM (VALUES ${values}) AS v(id, ord)
      WHERE c.id = v.id AND c.collection = $1`,
    [collection],
  );
  revalidateTag(TAG);
}

export type ContentRevision = {
  id: number;
  data: Record<string, unknown>;
  note: string | null;
  authorName: string | null;
  createdAt: string;
};

export async function itemRevisions(itemId: number): Promise<ContentRevision[]> {
  const rows = await query<Row>(
    `SELECT r.id, r.data, r.note, r.created_at, u.name AS author
       FROM content_revisions r LEFT JOIN users u ON u.id = r.user_id
      WHERE r.item_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
    [itemId],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    data: (r.data as Record<string, unknown>) ?? {},
    note: (r.note as string) ?? null,
    authorName: (r.author as string) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

/* ---------------- pembaca khusus untuk halaman publik ----------------
 *
 * Tiap fungsi mengembalikan bentuk yang SAMA PERSIS dengan konstanta di
 * `content.ts`, dan jatuh ke nilai bawaan bila tabel kosong. Dengan begitu
 * halaman tidak pernah tampil kosong walau database belum di-seed.
 */

export async function getEpoxySystems(): Promise<typeof fallback.epoxySystems> {
  const rows = await activeItems('epoxy_systems');
  if (!rows.length) return fallback.epoxySystems;
  return rows.map((r) => ({
    slug: String(r.slug),
    name: String(r.name ?? ''),
    micron: Number(r.micron ?? 0),
    thicknessLabel: String(r.thicknessLabel ?? ''),
    family: (r.family === 'PU Crete' ? 'PU Crete' : 'Self Leveling') as 'Self Leveling' | 'PU Crete',
    bestFor: String(r.bestFor ?? ''),
    priceUnder100: Number(r.priceUnder100 ?? 0),
    priceOver100: Number(r.priceOver100 ?? 0),
    priceOver500: Number(r.priceOver500 ?? 0),
    highlights: Array.isArray(r.highlights) ? (r.highlights as string[]) : [],
    unverified: Boolean(r.unverified),
  }));
}

export async function getCoreServices(): Promise<
  Array<{ slug: string; title: string; short: string; icon: string; href: string }>
> {
  const rows = await activeItems('core_services');
  if (!rows.length) {
    return fallback.coreServices.map((s) => ({ ...s, href: `/${s.slug}` }));
  }
  return rows.map((r) => ({
    slug: String(r.slug),
    title: String(r.title ?? ''),
    short: String(r.short ?? ''),
    icon: String(r.icon ?? 'layers'),
    href: String(r.href ?? '') || `/${r.slug}`,
  }));
}

export async function getOtherServices(): Promise<typeof fallback.otherServices> {
  const rows = await activeItems('other_services');
  if (!rows.length) return fallback.otherServices;
  return rows.map((r) => ({
    name: String(r.name ?? ''),
    body: String(r.body ?? ''),
    points: Array.isArray(r.points) ? (r.points as string[]) : [],
  }));
}

export async function getWorkSteps(): Promise<typeof fallback.workSteps> {
  const rows = await activeItems('work_steps');
  if (!rows.length) return fallback.workSteps;
  return rows.map((r, i) => ({
    n: i + 1,
    title: String(r.title ?? ''),
    body: String(r.body ?? ''),
  }));
}

export async function getWhyChooseUs(): Promise<typeof fallback.whyChooseUs> {
  const rows = await activeItems('why_choose_us');
  if (!rows.length) return fallback.whyChooseUs;
  return rows.map((r, i) => ({
    n: i + 1,
    title: String(r.title ?? ''),
    body: String(r.body ?? ''),
  }));
}

export async function getGeneralFaqs(): Promise<typeof fallback.generalFaqs> {
  const rows = await activeItems('faqs_general');
  if (!rows.length) return fallback.generalFaqs;
  return rows.map((r) => ({ q: String(r.q ?? ''), a: String(r.a ?? '') }));
}

export async function getPriceFaqs(): Promise<typeof fallback.priceFaqs> {
  const rows = await activeItems('faqs_price');
  if (!rows.length) return fallback.priceFaqs;
  return rows.map((r) => ({ q: String(r.q ?? ''), a: String(r.a ?? '') }));
}

export async function getCities(): Promise<typeof fallback.cities> {
  const rows = await activeItems('cities');
  if (!rows.length) return fallback.cities;
  return rows.map((r) => ({
    slug: String(r.slug),
    name: String(r.name ?? ''),
    region: String(r.region ?? ''),
  }));
}

export type Stat = { eyebrow: string; value: string; note: string };

export async function getStats(): Promise<Stat[]> {
  const rows = await activeItems('stats');
  return rows.map((r) => ({
    eyebrow: String(r.eyebrow ?? ''),
    value: String(r.value ?? ''),
    note: String(r.note ?? ''),
  }));
}

/**
 * Proyek portofolio. Bila basis data kosong atau bermasalah, kembali ke
 * daftar bawaan di `content.ts` supaya halaman portofolio tidak pernah
 * tampil kosong.
 */
export async function getProjects(): Promise<typeof fallback.projects> {
  const rows = await activeItems('projects');
  if (!rows.length) return fallback.projects;

  return rows.map((r) => ({
    slug: String(r.slug),
    name: String(r.name ?? ''),
    category: String(r.category ?? ''),
    city: String(r.city ?? ''),
    buildingType: String(r.buildingType ?? ''),
    system: String(r.system ?? ''),
    thickness: String(r.thickness ?? ''),
    summary: String(r.summary ?? ''),
    scope: Array.isArray(r.scope) ? r.scope.map(String) : [],
    detail: Array.isArray(r.detail) ? r.detail.map(String) : [],
    photos: Array.isArray(r.photos)
      ? (r.photos as Array<Record<string, unknown>>).map((f) => ({
          src: String(f.src ?? ''),
          alt: String(f.alt ?? ''),
          width: Number(f.width) || 1200,
          height: Number(f.height) || 900,
          ...(f.caption ? { caption: String(f.caption) } : {}),
        }))
      : [],
    hasRealPhoto: Boolean(r.hasRealPhoto),
  }));
}

/* ── Client groups ────────────────────────────────────────── */
type ClientGroup = { category: string; note: string; clients: string[] };

export async function clientGroups(): Promise<ClientGroup[]> {
  try {
    const rows = await query('SELECT * FROM client_groups ORDER BY sort_order, id');
    return rows.map((r: Record<string, unknown>) => ({
      category: String(r.category ?? ''),
      note: String(r.note ?? ''),
      clients: Array.isArray(r.clients) ? r.clients.map(String) : [],
    }));
  } catch {
    return [];
  }
}

export async function clientCount(): Promise<number> {
  const groups = await clientGroups();
  return groups.reduce((n, g) => n + g.clients.length, 0);
}
