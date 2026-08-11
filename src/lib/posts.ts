import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { query, queryOne, transaction } from './db';
import { POST_STATUSES, type PostStatus } from './postStatus';

/**
 * Repositori artikel blog. Hanya status 'published' yang tampil publik —
 * gate ini ditegakkan di query, bukan di komponen (PRD §9).
 */

export type PostSection = { h2: string; body: string[]; list?: string[] };
export type PostFaq = { q: string; a: string };

export type ValidationIssue = { level: 'error' | 'warning'; code: string; message: string };
export type ValidationResult = {
  ok: boolean;
  checkedAt: string;
  issues: ValidationIssue[];
  wordCount: number;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  reviewer: string;
  intro: string;
  sections: PostSection[];
  faqs: PostFaq[];
  readMinutes: number;
  coverImage: string | null;
  status: PostStatus;
  source: 'manual' | 'mcp';
  briefId: number | null;
  validation: ValidationResult | Record<string, never>;
  reviewNotes: string | null;
  reviewedBy: number | null;
  reviewerName: string | null;
  publishedAt: string | null;
  scheduledFor: string | null;
  noindex: boolean;
  createdAt: string;
  updatedAt: string;
};

type Row = Record<string, unknown>;

function toPost(r: Row): Post {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    title: String(r.title),
    description: String(r.description ?? ''),
    category: String(r.category ?? 'Umum'),
    author: String(r.author ?? ''),
    reviewer: String(r.reviewer ?? ''),
    intro: String(r.intro ?? ''),
    sections: (r.sections as PostSection[]) ?? [],
    faqs: (r.faqs as PostFaq[]) ?? [],
    readMinutes: Number(r.read_minutes ?? 5),
    coverImage: (r.cover_image as string) ?? null,
    status: r.status as PostStatus,
    source: (r.source as 'manual' | 'mcp') ?? 'manual',
    briefId: r.brief_id === null || r.brief_id === undefined ? null : Number(r.brief_id),
    validation: (r.validation as ValidationResult) ?? {},
    reviewNotes: (r.review_notes as string) ?? null,
    reviewedBy: r.reviewed_by === null || r.reviewed_by === undefined ? null : Number(r.reviewed_by),
    reviewerName: (r.reviewer_name as string) ?? null,
    publishedAt: r.published_at ? new Date(r.published_at as string).toISOString() : null,
    scheduledFor: r.scheduled_for ? new Date(r.scheduled_for as string).toISOString() : null,
    noindex: Boolean(r.noindex),
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

const TAG = 'posts';
const SELECT = `SELECT p.*, u.name AS reviewer_name FROM posts p
                LEFT JOIN users u ON u.id = p.reviewed_by`;

/* ================= VALIDATOR (PRD §9 langkah 4) ================= */

const PRICE_PATTERN = /\b(rp\s?\d|harga\s+(mulai|hanya|cuma)|diskon\s+\d+%)/i;
const WARRANTY_PATTERN = /\bgaransi\s+\d+\s*(tahun|bulan)\b/i;
const STAT_PATTERN = /\b\d{1,3}([.,]\d+)?\s?%\s+(dari|pelanggan|klien|proyek|kasus)/i;

export function validatePost(
  p: Pick<Post, 'slug' | 'title' | 'description' | 'intro' | 'sections' | 'faqs' | 'author' | 'reviewer'>,
  opts: { existingSlugs?: string[]; primaryKeyword?: string } = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const err = (code: string, message: string) => issues.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => issues.push({ level: 'warning', code, message });

  const bodyText = [
    p.intro,
    ...p.sections.flatMap((s) => [s.h2, ...(s.body ?? []), ...(s.list ?? [])]),
    ...p.faqs.flatMap((f) => [f.q, f.a]),
  ].join(' ');
  const words = bodyText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Metadata wajib
  if (!p.title.trim()) err('title_kosong', 'Judul wajib diisi.');
  else if (p.title.length > 65) warn('title_panjang', `Judul ${p.title.length} karakter, sebaiknya ≤ 65.`);

  if (!p.description.trim()) err('desc_kosong', 'Meta description wajib diisi.');
  else if (p.description.length < 70 || p.description.length > 165)
    warn('desc_panjang', `Meta description ${p.description.length} karakter, idealnya 70–165.`);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) err('slug_invalid', 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.');
  if (opts.existingSlugs?.includes(p.slug)) err('slug_duplikat', `Slug "${p.slug}" sudah dipakai artikel lain.`);

  // Author & reviewer (E-E-A-T)
  if (!p.author.trim()) err('author_kosong', 'Penulis wajib diisi.');
  if (!p.reviewer.trim()) err('reviewer_kosong', 'Peninjau wajib diisi.');

  // Struktur konten
  if (!p.intro.trim()) err('intro_kosong', 'Paragraf pembuka wajib diisi.');
  if (p.sections.length < 2) err('section_kurang', 'Artikel minimal memiliki 2 bagian H2.');
  if (p.sections.some((s) => !s.h2?.trim())) err('h2_kosong', 'Ada bagian tanpa judul H2.');
  if (p.sections.some((s) => !(s.body ?? []).some((b) => b.trim())))
    warn('body_kosong', 'Ada bagian H2 tanpa isi paragraf.');
  if (wordCount < 320) err('konten_pendek', `Artikel hanya ${wordCount} kata, minimal 320.`);

  // Klaim tanpa sumber (PRD §19)
  if (PRICE_PATTERN.test(bodyText))
    err('klaim_harga', 'Ada klaim harga di dalam artikel. Arahkan ke halaman harga, jangan tulis angka di blog.');
  if (WARRANTY_PATTERN.test(bodyText))
    err('klaim_garansi', 'Ada klaim lama garansi. Hapus sampai ketentuan tertulis tersedia.');
  if (STAT_PATTERN.test(bodyText))
    err('statistik_tanpa_sumber', 'Ada statistik persentase tanpa sumber. Hapus atau sertakan rujukan.');

  // Keyword stuffing
  if (opts.primaryKeyword) {
    const kw = opts.primaryKeyword.toLowerCase();
    const hits = (bodyText.toLowerCase().match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
    const density = wordCount ? (hits * kw.split(/\s+/).length) / wordCount : 0;
    if (density > 0.03)
      err('keyword_stuffing', `Kepadatan kata kunci ${(density * 100).toFixed(1)}%, maksimal 3%.`);
    if (hits === 0) warn('keyword_absen', `Kata kunci "${opts.primaryKeyword}" tidak muncul di artikel.`);
  }

  // Internal link & CTA
  const hasInternalLink = /\]\(\/|href="\//.test(bodyText) || /\/(jasa|harga|portofolio|kontak)/.test(bodyText);
  if (!hasInternalLink) warn('tanpa_internal_link', 'Belum ada tautan internal ke halaman layanan/harga.');

  // FAQ
  if (p.faqs.length === 0) warn('tanpa_faq', 'Belum ada FAQ. FAQ membantu tampil di hasil pencarian.');
  if (p.faqs.some((f) => !f.q?.trim() || !f.a?.trim())) err('faq_tidak_lengkap', 'Ada FAQ dengan pertanyaan atau jawaban kosong.');

  return {
    ok: !issues.some((i) => i.level === 'error'),
    checkedAt: new Date().toISOString(),
    issues,
    wordCount,
  };
}

/* ================= BACA ================= */

async function loadPublished(): Promise<Post[]> {
  try {
    const rows = await query(
      `${SELECT} WHERE p.status = 'published'
         AND (p.published_at IS NULL OR p.published_at <= now())
       ORDER BY p.published_at DESC NULLS LAST, p.id DESC`,
    );
    return rows.map(toPost);
  } catch {
    return [];
  }
}

/** Untuk halaman publik: hanya artikel terbit. */
export const getPublishedPosts = unstable_cache(loadPublished, ['published-posts'], {
  tags: [TAG],
  revalidate: 300,
});

export async function getPublishedPost(slug: string): Promise<Post | null> {
  const all = await getPublishedPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listPosts(filter: { status?: PostStatus | 'semua' } = {}): Promise<Post[]> {
  const where =
    filter.status && filter.status !== 'semua' ? 'WHERE p.status = $1' : '';
  const params = where ? [filter.status] : [];
  const rows = await query(`${SELECT} ${where} ORDER BY p.updated_at DESC`, params);
  return rows.map(toPost);
}

export async function getPostById(id: number): Promise<Post | null> {
  const row = await queryOne(`${SELECT} WHERE p.id = $1`, [id]);
  return row ? toPost(row) : null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const row = await queryOne(`${SELECT} WHERE p.slug = $1`, [slug]);
  return row ? toPost(row) : null;
}

export async function countPostsByStatus(): Promise<Record<string, number>> {
  const rows = await query<{ status: string; n: string }>(
    'SELECT status, COUNT(*)::text AS n FROM posts GROUP BY status',
  );
  const out: Record<string, number> = { total: 0 };
  for (const s of POST_STATUSES) out[s] = 0;
  for (const r of rows) {
    out[r.status] = Number(r.n);
    out.total += Number(r.n);
  }
  return out;
}

export async function allSlugs(exceptId?: number): Promise<string[]> {
  const rows = await query<{ slug: string }>(
    exceptId ? 'SELECT slug FROM posts WHERE id <> $1' : 'SELECT slug FROM posts',
    exceptId ? [exceptId] : [],
  );
  return rows.map((r) => r.slug);
}

/* ================= TULIS ================= */

export type PostInput = Partial<
  Pick<
    Post,
    | 'slug' | 'title' | 'description' | 'category' | 'author' | 'reviewer'
    | 'intro' | 'sections' | 'faqs' | 'readMinutes' | 'coverImage' | 'noindex'
    | 'scheduledFor'
  >
>;

export async function createPost(
  input: PostInput & { slug: string; title: string },
  opts: { userId?: number | null; source?: 'manual' | 'mcp'; briefId?: number | null } = {},
): Promise<Post> {
  const row = await queryOne(
    `INSERT INTO posts
       (slug, title, description, category, author, reviewer, intro, sections, faqs,
        read_minutes, cover_image, noindex, source, brief_id, created_by, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'draft')
     RETURNING *`,
    [
      input.slug,
      input.title,
      input.description ?? '',
      input.category ?? 'Umum',
      input.author ?? '',
      input.reviewer ?? '',
      input.intro ?? '',
      JSON.stringify(input.sections ?? []),
      JSON.stringify(input.faqs ?? []),
      input.readMinutes ?? 5,
      input.coverImage ?? null,
      input.noindex ?? false,
      opts.source ?? 'manual',
      opts.briefId ?? null,
      opts.userId ?? null,
    ],
  );
  revalidateTag(TAG);
  return toPost(row!);
}

export async function updatePost(
  id: number,
  input: PostInput,
  userId: number | null,
  note = 'Perubahan konten',
): Promise<Post | null> {
  return transaction(async (q) => {
    const before = (await q('SELECT * FROM posts WHERE id = $1 FOR UPDATE', [id]))[0];
    if (!before) return null;

    // Simpan snapshot sebelum menimpa
    await q('INSERT INTO post_revisions (post_id, snapshot, note, user_id) VALUES ($1,$2,$3,$4)', [
      id,
      JSON.stringify(before),
      note,
      userId,
    ]);

    const sets: string[] = [];
    const params: unknown[] = [];
    const push = (col: string, val: unknown) => {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    };

    if (input.slug !== undefined) push('slug', input.slug);
    if (input.title !== undefined) push('title', input.title);
    if (input.description !== undefined) push('description', input.description);
    if (input.category !== undefined) push('category', input.category);
    if (input.author !== undefined) push('author', input.author);
    if (input.reviewer !== undefined) push('reviewer', input.reviewer);
    if (input.intro !== undefined) push('intro', input.intro);
    if (input.sections !== undefined) push('sections', JSON.stringify(input.sections));
    if (input.faqs !== undefined) push('faqs', JSON.stringify(input.faqs));
    if (input.readMinutes !== undefined) push('read_minutes', input.readMinutes);
    if (input.coverImage !== undefined) push('cover_image', input.coverImage || null);
    if (input.noindex !== undefined) push('noindex', input.noindex);
    if (input.scheduledFor !== undefined) push('scheduled_for', input.scheduledFor);

    if (!sets.length) return toPost(before);

    params.push(id);
    const rows = await q(
      `UPDATE posts SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params,
    );
    revalidateTag(TAG);
    return rows[0] ? toPost(rows[0]) : null;
  });
}

/** Simpan hasil validator. */
export async function setValidation(id: number, result: ValidationResult): Promise<void> {
  await query('UPDATE posts SET validation = $1 WHERE id = $2', [JSON.stringify(result), id]);
  revalidateTag(TAG);
}

export async function setStatus(
  id: number,
  status: PostStatus,
  opts: { userId?: number | null; notes?: string | null } = {},
): Promise<Post | null> {
  const sets = ['status = $1'];
  const params: unknown[] = [status];

  if (status === 'published') {
    sets.push('published_at = COALESCE(published_at, now())');
  }
  if (status === 'approved' || status === 'rejected') {
    params.push(opts.userId ?? null);
    sets.push(`reviewed_by = $${params.length}`);
    sets.push('reviewed_at = now()');
  }
  if (opts.notes !== undefined) {
    params.push(opts.notes);
    sets.push(`review_notes = $${params.length}`);
  }

  params.push(id);
  const rows = await query(
    `UPDATE posts SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  revalidateTag(TAG);
  return rows[0] ? toPost(rows[0]) : null;
}

export async function deletePost(id: number): Promise<boolean> {
  const rows = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
  revalidateTag(TAG);
  return rows.length > 0;
}

export type Revision = {
  id: number;
  note: string | null;
  authorName: string | null;
  createdAt: string;
};

export async function listRevisions(postId: number): Promise<Revision[]> {
  const rows = await query<Row>(
    `SELECT r.id, r.note, r.created_at, u.name AS author
       FROM post_revisions r LEFT JOIN users u ON u.id = r.user_id
      WHERE r.post_id = $1 ORDER BY r.created_at DESC LIMIT 30`,
    [postId],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    note: (r.note as string) ?? null,
    authorName: (r.author as string) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

/** Terbitkan artikel terjadwal yang waktunya sudah tiba. */
export async function publishDueScheduled(): Promise<number> {
  const rows = await query(
    `UPDATE posts SET status = 'published', published_at = COALESCE(published_at, scheduled_for)
      WHERE status = 'approved' AND scheduled_for IS NOT NULL AND scheduled_for <= now()
      RETURNING id`,
  );
  if (rows.length) revalidateTag(TAG);
  return rows.length;
}
