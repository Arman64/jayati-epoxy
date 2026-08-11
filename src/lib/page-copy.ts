import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { query, queryOne } from './db';
import type { CopyMap } from './page-slots';

/**
 * Teks per bagian pada halaman bawaan, serta gambar yang dipasang Owner.
 *
 * Semua getter mengembalikan peta kosong bila basis data belum siap, sehingga
 * halaman publik tetap tampil memakai teks bawaan dari kode.
 */

const TAG = 'page-copy';
const MEDIA_TAG = 'media';

type Row = Record<string, unknown>;

/* ----------------------------------------------------------------- teks */

async function loadCopy(path: string): Promise<CopyMap> {
  try {
    const rows = await query('SELECT * FROM page_copy WHERE page_path = $1', [path]);
    const map: CopyMap = {};
    for (const r of rows) {
      map[String(r.slot)] = {
        eyebrow: (r.eyebrow as string) ?? undefined,
        title: (r.title as string) ?? undefined,
        lead: (r.lead as string) ?? undefined,
        body: (r.body as string) ?? undefined,
        isHidden: Boolean(r.is_hidden),
      };
    }
    return map;
  } catch {
    return {};
  }
}

/** Dipakai halaman publik. Hasilnya di-cache dan disegarkan saat Owner menyimpan. */
export const getPageCopy = unstable_cache(loadCopy, ['page-copy'], {
  tags: [TAG],
  revalidate: 300,
});

/** Dipakai admin — selalu membaca langsung tanpa cache. */
export async function listCopy(path: string): Promise<CopyMap> {
  return loadCopy(path);
}

export async function saveCopy(
  path: string,
  slot: string,
  data: { eyebrow?: string; title?: string; lead?: string; body?: string; isHidden?: boolean },
  userId: number,
): Promise<void> {
  // String kosong disimpan sebagai NULL supaya halaman kembali ke teks bawaan.
  const norm = (v?: string) => {
    const s = (v ?? '').trim();
    return s ? s : null;
  };

  await query(
    `INSERT INTO page_copy (page_path, slot, eyebrow, title, lead, body, is_hidden, updated_by, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (page_path, slot) DO UPDATE SET
       eyebrow = EXCLUDED.eyebrow,
       title = EXCLUDED.title,
       lead = EXCLUDED.lead,
       body = EXCLUDED.body,
       is_hidden = EXCLUDED.is_hidden,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()`,
    [
      path,
      slot,
      norm(data.eyebrow),
      norm(data.title),
      norm(data.lead),
      norm(data.body),
      Boolean(data.isHidden),
      userId,
    ],
  );
  revalidateTag(TAG);
}

/** Kembalikan satu bagian ke teks bawaan kode. */
export async function resetCopy(path: string, slot: string): Promise<void> {
  await query('DELETE FROM page_copy WHERE page_path = $1 AND slot = $2', [path, slot]);
  revalidateTag(TAG);
}

/* --------------------------------------------------------------- gambar */

export type MediaItem = {
  id: number;
  path: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
  bytes: number;
  mime: string;
  createdAt: string;
};

function toMedia(r: Row): MediaItem {
  return {
    id: Number(r.id),
    path: String(r.path),
    alt: String(r.alt ?? ''),
    caption: (r.caption as string) ?? null,
    width: Number(r.width),
    height: Number(r.height),
    bytes: Number(r.bytes),
    mime: String(r.mime),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function listMedia(): Promise<MediaItem[]> {
  try {
    const rows = await query('SELECT * FROM media ORDER BY created_at DESC');
    return rows.map(toMedia);
  } catch {
    return [];
  }
}

export async function getMedia(id: number): Promise<MediaItem | null> {
  const row = await queryOne('SELECT * FROM media WHERE id = $1', [id]);
  return row ? toMedia(row) : null;
}

export async function createMedia(
  m: { path: string; alt: string; width: number; height: number; bytes: number; mime: string },
  userId: number,
): Promise<MediaItem> {
  const rows = await query(
    `INSERT INTO media (path, alt, width, height, bytes, mime, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [m.path, m.alt, m.width, m.height, m.bytes, m.mime, userId],
  );
  revalidateTag(MEDIA_TAG);
  return toMedia(rows[0]!);
}

export async function updateMediaAlt(id: number, alt: string): Promise<MediaItem | null> {
  const rows = await query('UPDATE media SET alt = $1 WHERE id = $2 RETURNING *', [alt, id]);
  revalidateTag(MEDIA_TAG);
  revalidateTag(TAG);
  return rows[0] ? toMedia(rows[0]) : null;
}

/** Hapus gambar. Penempatannya ikut terhapus lewat ON DELETE CASCADE. */
export async function deleteMedia(id: number): Promise<MediaItem | null> {
  const rows = await query('DELETE FROM media WHERE id = $1 RETURNING *', [id]);
  revalidateTag(MEDIA_TAG);
  revalidateTag(TAG);
  return rows[0] ? toMedia(rows[0]) : null;
}

/* ------------------------------------------------------ penempatan foto */

export type PlacedImage = { src: string; alt: string; width: number; height: number; caption?: string };

async function loadImages(path: string): Promise<Record<string, PlacedImage>> {
  try {
    const rows = await query(
      `SELECT pi.slot, m.path, m.alt, m.width, m.height, m.caption
       FROM page_images pi JOIN media m ON m.id = pi.media_id
       WHERE pi.page_path = $1`,
      [path],
    );
    const map: Record<string, PlacedImage> = {};
    for (const r of rows) {
      map[String(r.slot)] = {
        src: String(r.path),
        alt: String(r.alt ?? ''),
        width: Number(r.width),
        height: Number(r.height),
        caption: (r.caption as string) ?? undefined,
      };
    }
    return map;
  } catch {
    return {};
  }
}

export const getPageImages = unstable_cache(loadImages, ['page-images'], {
  tags: [TAG, MEDIA_TAG],
  revalidate: 300,
});

export async function listPageImages(path: string): Promise<Record<string, PlacedImage>> {
  return loadImages(path);
}

export async function setPageImage(
  path: string,
  slot: string,
  mediaId: number,
  userId: number,
): Promise<void> {
  await query(
    `INSERT INTO page_images (page_path, slot, media_id, updated_by, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (page_path, slot) DO UPDATE SET
       media_id = EXCLUDED.media_id, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [path, slot, mediaId, userId],
  );
  revalidateTag(TAG);
}

/** Kembalikan slot ke foto bawaan kode. */
export async function clearPageImage(path: string, slot: string): Promise<void> {
  await query('DELETE FROM page_images WHERE page_path = $1 AND slot = $2', [path, slot]);
  revalidateTag(TAG);
}

/**
 * Ambil foto untuk sebuah slot, dengan cadangan foto bawaan dari kode.
 * Selalu mengembalikan width/height agar tidak terjadi pergeseran tata letak.
 */
export function imageOr(
  map: Record<string, PlacedImage> | undefined,
  slot: string,
  fallback: PlacedImage,
): PlacedImage {
  return map?.[slot] ?? fallback;
}
