import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import {
  addSection,
  getPageRow,
  reorderSections,
  setPagePublished,
  deleteCustomPage,
} from '@/lib/page-sections';
import { SECTION_BY_KIND, validateSection } from '@/lib/sections';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function guard(params: { id: string }) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 }) };
  if (user.role !== 'owner') {
    return { error: NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengubah halaman.' }, { status: 403 }) };
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return { error: NextResponse.json({ ok: false, error: 'ID halaman tidak valid.' }, { status: 400 }) };
  }
  const page = await getPageRow(id);
  if (!page) return { error: NextResponse.json({ ok: false, error: 'Halaman tidak ditemukan.' }, { status: 404 }) };
  return { user, page };
}

/** Tambah seksi baru ke halaman. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, page } = g;

  let body: { kind?: unknown; config?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const kind = String(body.kind ?? '');
  const def = SECTION_BY_KIND[kind];
  if (!def) {
    return NextResponse.json({ ok: false, error: `Jenis seksi "${kind}" tidak dikenal.` }, { status: 422 });
  }

  // Seksi singleton tidak boleh dobel dalam satu halaman.
  if (def.singleton) {
    const { listSections } = await import('@/lib/page-sections');
    const existing = await listSections(page.id);
    if (existing.some((s) => s.kind === kind)) {
      return NextResponse.json(
        { ok: false, error: `Seksi "${def.label}" hanya boleh ada satu dalam satu halaman.` },
        { status: 422 },
      );
    }
  }

  const v = validateSection(kind, body.config ?? {});
  if (!v.ok) return NextResponse.json({ ok: false, problems: v.problems }, { status: 422 });

  const section = await addSection(page.id, kind, v.config);
  await logCmsEvent('page_section', section.id, 'create', { pageId: page.id, kind }, 'admin', user.id);
  return NextResponse.json({ ok: true, section }, { status: 201 });
}

/** Susun ulang seksi, terbitkan/tarik halaman. */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, page } = g;

  let body: { ids?: unknown; isPublished?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  if (typeof body.isPublished === 'boolean') {
    if (!page.isCustom) {
      return NextResponse.json(
        { ok: false, error: 'Halaman bawaan tidak dapat ditarik dari publikasi.' },
        { status: 422 },
      );
    }
    const updated = await setPagePublished(page.id, body.isPublished, user.id);
    await logCmsEvent('page', page.id, body.isPublished ? 'publish' : 'unpublish', { path: page.path }, 'admin', user.id);
    return NextResponse.json({ ok: true, page: updated });
  }

  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];
  if (!ids.length) {
    return NextResponse.json({ ok: false, error: 'Daftar urutan kosong.' }, { status: 422 });
  }

  const sections = await reorderSections(page.id, ids);
  await logCmsEvent('page', page.id, 'reorder_sections', { count: ids.length }, 'admin', user.id);
  return NextResponse.json({ ok: true, sections });
}

/** Hapus halaman kustom beserta seksinya. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, page } = g;

  if (!page.isCustom) {
    return NextResponse.json(
      { ok: false, error: 'Halaman bawaan tidak dapat dihapus karena punya rute sendiri.' },
      { status: 422 },
    );
  }

  const done = await deleteCustomPage(page.id);
  if (!done) return NextResponse.json({ ok: false, error: 'Halaman tidak ditemukan.' }, { status: 404 });
  await logCmsEvent('page', page.id, 'delete', { path: page.path }, 'admin', user.id);
  return NextResponse.json({ ok: true });
}
