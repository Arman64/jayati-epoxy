import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { updatePage } from '@/lib/pages';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json(
      { ok: false, error: 'Hanya pemilik yang dapat mengubah halaman.' },
      { status: 403 },
    );
  }
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const str = (v: unknown, max: number) =>
    typeof v === 'string' ? v.trim().slice(0, max) : undefined;

  const prio = Number(body.sitemapPriority);
  if (body.sitemapPriority !== undefined && (!Number.isFinite(prio) || prio < 0 || prio > 1)) {
    return NextResponse.json(
      { ok: false, error: 'Prioritas sitemap harus antara 0 dan 1.' },
      { status: 422 },
    );
  }

  try {
    const page = await updatePage(
      Number(params.id),
      {
        title: str(body.title, 200),
        description: str(body.description, 400),
        h1: str(body.h1, 200),
        intro: str(body.intro, 2000),
        ogImage: str(body.ogImage, 300),
        noindex: typeof body.noindex === 'boolean' ? body.noindex : undefined,
        inSitemap: typeof body.inSitemap === 'boolean' ? body.inSitemap : undefined,
        sitemapPriority: body.sitemapPriority !== undefined ? prio : undefined,
      },
      user.id,
    );
    if (!page) {
      return NextResponse.json({ ok: false, error: 'Halaman tidak ditemukan.' }, { status: 404 });
    }
    await logCmsEvent('page', page.id, 'update', { path: page.path }, 'admin', user.id);
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    console.error('[admin/halaman PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan halaman.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
