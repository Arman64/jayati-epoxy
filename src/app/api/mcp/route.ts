import { NextResponse } from 'next/server';
import {
  authenticate,
  createBrief,
  finishRequest,
  findExisting,
  getBrief,
  hasScope,
  listBriefs,
  logCmsEvent,
  logRequest,
  setBriefStatus,
  type McpToken,
  type Scope,
} from '@/lib/mcp';
import {
  allSlugs,
  createPost,
  getPostById,
  getPostBySlug,
  listPosts,
  setStatus,
  setValidation,
  updatePost,
  validatePost,
  type PostSection,
} from '@/lib/posts';
import { getSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint MCP internal — PRD §9.
 *
 * POST /api/mcp
 *   Authorization: Bearer <token>
 *   { "tool": "...", "request_id": "uuid", "params": { ... } }
 *
 * Semua tool idempotent lewat request_id, dicatat di mcp_requests,
 * dan publish menolak apa pun yang statusnya bukan 'approved'.
 */

const TIMEOUT_MS = 20_000;

type Ctx = { token: McpToken };
type Handler = { scope: Scope; run: (params: Record<string, unknown>, ctx: Ctx) => Promise<unknown> };

const str = (v: unknown, max = 500): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * ID artikel. Menerima `draft_id` maupun `post_id` supaya klien MCP tidak
 * gagal hanya karena beda penamaan, dan melempar pesan yang jelas bila kosong.
 */
function postIdOf(p: Record<string, unknown>): number {
  const raw = p.draft_id ?? p.post_id ?? p.id;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('Parameter "draft_id" (atau "post_id") wajib berupa angka ID artikel.');
  }
  return n;
}
const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => (x as string).trim()) : [];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const TOOLS: Record<string, Handler> = {
  /* ---------- 1. brief ---------- */
  create_content_brief: {
    scope: 'write',
    async run(p, ctx) {
      const topic = str(p.topic, 200);
      const primaryKeyword = str(p.keyword_cluster ?? p.primary_keyword, 120);
      if (!topic) throw new Error('Parameter "topic" wajib diisi.');
      if (!primaryKeyword) throw new Error('Parameter "primary_keyword" wajib diisi.');

      const brief = await createBrief(
        {
          topic,
          intent: ['informational', 'commercial', 'transactional', 'navigational'].includes(
            str(p.intent),
          )
            ? str(p.intent)
            : 'informational',
          primaryKeyword,
          keywordCluster: arr(p.keyword_cluster),
          entities: arr(p.entities),
          questions: arr(p.questions),
          internalLinks: arr(p.internal_links),
          sources: arr(p.sources),
        },
        null,
      );
      await logCmsEvent('brief', brief.id, 'create', { topic }, 'mcp', null);
      return { brief_id: brief.id, status: brief.status };
    },
  },

  list_content_briefs: {
    scope: 'read',
    async run() {
      const briefs = await listBriefs();
      return { count: briefs.length, briefs };
    },
  },

  /* ---------- 2. draft ---------- */
  generate_blog_draft: {
    scope: 'write',
    async run(p) {
      const briefId = Number(p.brief_id);
      if (!Number.isInteger(briefId)) throw new Error('Parameter "brief_id" wajib berupa angka.');

      const brief = await getBrief(briefId);
      if (!brief) throw new Error(`Brief ${briefId} tidak ditemukan.`);

      // Konten boleh dikirim penuh oleh klien MCP (hasil model bahasa).
      // Bila tidak, sistem membuat kerangka dari brief — bukan mengarang isi.
      const title = str(p.title, 200) || brief.topic;
      const slug = slugify(str(p.slug, 90) || title);

      const taken = await allSlugs();
      const uniqueSlug = taken.includes(slug) ? `${slug}-${Date.now().toString(36).slice(-4)}` : slug;

      const sections: PostSection[] = Array.isArray(p.sections)
        ? (p.sections as PostSection[]).slice(0, 20).map((s) => ({
            h2: str(s?.h2, 200),
            body: arr(s?.body).slice(0, 20),
            list: arr(s?.list).slice(0, 20),
          }))
        : brief.questions.slice(0, 5).map((q) => ({ h2: q, body: [], list: [] }));

      const faqs = Array.isArray(p.faqs)
        ? (p.faqs as Array<{ q: string; a: string }>).slice(0, 10).map((f) => ({
            q: str(f?.q, 300),
            a: str(f?.a, 1500),
          }))
        : [];

      const post = await createPost(
        {
          slug: uniqueSlug,
          title,
          description: str(p.description, 300),
          category: str(p.category, 80) || 'Umum',
          author: str(p.author, 120) || 'Tim Teknis Jayati Epoxy',
          reviewer: str(p.reviewer, 120),
          intro: str(p.intro, 2000),
          sections,
          faqs,
          readMinutes: Number(p.read_minutes) > 0 ? Number(p.read_minutes) : 5,
        },
        { source: 'mcp', briefId },
      );

      await setBriefStatus(briefId, 'drafted');
      await logCmsEvent('post', post.id, 'create', { source: 'mcp', slug: post.slug }, 'mcp', null);

      return { draft_id: post.id, slug: post.slug, status: post.status };
    },
  },

  /* ---------- 3. validasi ---------- */
  validate_content: {
    scope: 'read',
    async run(p) {
      const id = postIdOf(p);
      const post = await getPostById(id);
      if (!post) throw new Error(`Draft ${id} tidak ditemukan.`);

      const brief = post.briefId ? await getBrief(post.briefId) : null;
      const result = validatePost(post, {
        existingSlugs: await allSlugs(post.id),
        primaryKeyword: brief?.primaryKeyword,
      });
      await setValidation(post.id, result);
      return result;
    },
  },

  /* ---------- 4. saran internal link ---------- */
  create_internal_link_suggestions: {
    scope: 'read',
    async run(p) {
      const id = postIdOf(p);
      const post = await getPostById(id);
      if (!post) throw new Error(`Draft ${id} tidak ditemukan.`);

      const text = [post.intro, ...post.sections.flatMap((s) => [s.h2, ...s.body])]
        .join(' ')
        .toLowerCase();

      const catalog: Array<{ path: string; label: string; cues: string[] }> = [
        { path: '/jasa-epoxy-lantai', label: 'Jasa Epoxy Lantai', cues: ['jasa', 'pemasangan', 'kontraktor', 'aplikator'] },
        { path: '/harga-epoxy-lantai', label: 'Harga Epoxy Lantai', cues: ['harga', 'biaya', 'estimasi', 'anggaran', 'm²'] },
        { path: '/epoxy-lantai-rumah', label: 'Epoxy Lantai Rumah', cues: ['rumah', 'garasi', 'carport', 'hunian'] },
        { path: '/epoxy-lantai-industri', label: 'Epoxy Lantai Industri', cues: ['pabrik', 'gudang', 'industri', 'forklift'] },
        { path: '/portofolio', label: 'Portofolio', cues: ['proyek', 'dokumentasi', 'hasil', 'sppg'] },
        { path: '/kontak', label: 'Kontak', cues: ['survei', 'konsultasi', 'hubungi', 'penawaran'] },
      ];

      const suggestions = catalog
        .map((c) => ({
          path: c.path,
          label: c.label,
          score: c.cues.filter((cue) => text.includes(cue)).length,
          matched: c.cues.filter((cue) => text.includes(cue)),
        }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return { draft_id: id, suggestions };
    },
  },

  /* ---------- 5. ajukan review ---------- */
  submit_for_review: {
    scope: 'write',
    async run(p) {
      const id = postIdOf(p);
      const post = await getPostById(id);
      if (!post) throw new Error(`Draft ${id} tidak ditemukan.`);

      const brief = post.briefId ? await getBrief(post.briefId) : null;
      const result = validatePost(post, {
        existingSlugs: await allSlugs(post.id),
        primaryKeyword: brief?.primaryKeyword,
      });
      await setValidation(post.id, result);

      if (!result.ok) {
        return {
          submitted: false,
          reason: 'Validasi gagal. Perbaiki dulu sebelum diajukan.',
          validation: result,
        };
      }

      await setStatus(post.id, 'pending_review');
      await logCmsEvent('post', post.id, 'submit_for_review', {}, 'mcp', null);
      return { submitted: true, draft_id: post.id, status: 'pending_review', validation: result };
    },
  },

  /* ---------- 6. publish (hard gate) ---------- */
  publish_approved_post: {
    scope: 'publish',
    async run(p) {
      const id = postIdOf(p);
      const post = await getPostById(id);
      if (!post) throw new Error(`Draft ${id} tidak ditemukan.`);

      // Gerbang wajib PRD §9: tolak apa pun selain 'approved'.
      if (post.status !== 'approved') {
        throw new Error(
          `Publikasi ditolak. Status saat ini "${post.status}", wajib "approved" (disetujui manusia).`,
        );
      }

      const result = validatePost(post, { existingSlugs: await allSlugs(post.id) });
      if (!result.ok) {
        await setValidation(post.id, result);
        throw new Error('Publikasi ditolak: validasi konten gagal.');
      }

      const published = await setStatus(post.id, 'published');
      await logCmsEvent('post', post.id, 'publish', { slug: post.slug }, 'mcp', null);
      return { published: true, slug: published?.slug, published_at: published?.publishedAt };
    },
  },

  /* ---------- 7. sitemap ---------- */
  refresh_sitemap: {
    scope: 'write',
    async run() {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/sitemap.xml');
      revalidatePath('/blog');
      const settings = await getSettings();
      await logCmsEvent('sitemap', null, 'refresh', {}, 'mcp', null);
      return { refreshed: true, sitemap_url: `${settings.seo.siteUrl}/sitemap.xml` };
    },
  },

  /* ---------- 8. performa Search Console ---------- */
  get_search_console_performance: {
    scope: 'read',
    async run() {
      // Belum tersambung ke Google Search Console. Kembalikan status jujur,
      // jangan mengarang angka.
      return {
        connected: false,
        message:
          'Google Search Console belum tersambung. Hubungkan service account dan isi GSC_* di environment untuk mengaktifkan tool ini.',
        data: null,
      };
    },
  },

  /* ---------- utilitas ---------- */
  list_posts: {
    scope: 'read',
    async run(p) {
      const status = str(p.status) || 'semua';
      const posts = await listPosts({ status: status as never });
      return {
        count: posts.length,
        posts: posts.map((x) => ({
          id: x.id,
          slug: x.slug,
          title: x.title,
          status: x.status,
          source: x.source,
          updated_at: x.updatedAt,
        })),
      };
    },
  },

  update_draft: {
    scope: 'write',
    async run(p) {
      const id = postIdOf(p);
      const post = await getPostById(id);
      if (!post) throw new Error(`Draft ${id} tidak ditemukan.`);
      if (post.status === 'published')
        throw new Error('Artikel yang sudah terbit tidak boleh diubah lewat MCP.');

      const updated = await updatePost(
        id,
        {
          ...(p.title !== undefined ? { title: str(p.title, 200) } : {}),
          ...(p.description !== undefined ? { description: str(p.description, 300) } : {}),
          ...(p.intro !== undefined ? { intro: str(p.intro, 2000) } : {}),
          ...(Array.isArray(p.sections) ? { sections: p.sections as PostSection[] } : {}),
          ...(Array.isArray(p.faqs) ? { faqs: p.faqs as Array<{ q: string; a: string }> } : {}),
        },
        null,
        'Diperbarui via MCP',
      );
      return { updated: true, draft_id: updated?.id };
    },
  },

  get_post: {
    scope: 'read',
    async run(p) {
      const slug = str(p.slug, 120);
      const post = slug ? await getPostBySlug(slug) : await getPostById(postIdOf(p));
      if (!post) throw new Error('Artikel tidak ditemukan.');
      return post;
    },
  },
};

export async function POST(request: Request) {
  const started = Date.now();

  const token = await authenticate(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Token MCP tidak valid atau sudah dicabut.' },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const tool = str(body.tool, 80);
  const requestId = str(body.request_id, 100);
  const params = (body.params ?? {}) as Record<string, unknown>;

  if (!tool) return NextResponse.json({ ok: false, error: 'Field "tool" wajib diisi.' }, { status: 422 });
  if (!requestId)
    return NextResponse.json(
      { ok: false, error: 'Field "request_id" wajib diisi untuk idempotency.' },
      { status: 422 },
    );

  const handler = TOOLS[tool];
  if (!handler) {
    return NextResponse.json(
      { ok: false, error: `Tool "${tool}" tidak dikenal.`, available: Object.keys(TOOLS) },
      { status: 404 },
    );
  }

  if (!hasScope(token, handler.scope)) {
    return NextResponse.json(
      { ok: false, error: `Token tidak memiliki scope "${handler.scope}".` },
      { status: 403 },
    );
  }

  // Idempotency: request_id yang sama mengembalikan hasil lama.
  const existing = await findExisting(requestId);
  if (existing !== null) {
    return NextResponse.json(
      { ok: true, tool, request_id: requestId, idempotent_replay: true, result: existing },
      { status: 200 },
    );
  }

  await logRequest(requestId, tool, params, token.id);

  try {
    const result = await Promise.race([
      handler.run(params, { token }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout tool MCP.')), TIMEOUT_MS)),
    ]);
    const ms = Date.now() - started;
    await finishRequest(requestId, 'success', result, null, ms);
    return NextResponse.json({ ok: true, tool, request_id: requestId, duration_ms: ms, result });
  } catch (err) {
    const ms = Date.now() - started;
    const message = err instanceof Error ? err.message : 'Kesalahan tidak diketahui.';
    await finishRequest(requestId, 'error', null, message, ms);
    return NextResponse.json(
      { ok: false, tool, request_id: requestId, duration_ms: ms, error: message },
      { status: 400 },
    );
  }
}

/** Daftar tool — memudahkan klien MCP menemukan kemampuan server. */
export async function GET(request: Request) {
  const token = await authenticate(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Token MCP tidak valid.' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    server: 'jayati-epoxy-cms',
    tools: Object.entries(TOOLS).map(([name, h]) => ({ name, scope: h.scope })),
    your_scopes: token.scopes,
  });
}
