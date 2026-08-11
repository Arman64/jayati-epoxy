import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { deleteSection, getSection, setSectionVisible, updateSection } from '@/lib/page-sections';
import { validateSection } from '@/lib/sections';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function guard(params: { id: string }) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 }) };
  if (user.role !== 'owner') {
    return { error: NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengubah seksi.' }, { status: 403 }) };
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return { error: NextResponse.json({ ok: false, error: 'ID seksi tidak valid.' }, { status: 400 }) };
  }
  const section = await getSection(id);
  if (!section) return { error: NextResponse.json({ ok: false, error: 'Seksi tidak ditemukan.' }, { status: 404 }) };
  return { user, section };
}

/** Simpan isi seksi. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, section } = g;

  let body: { config?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const v = validateSection(section.kind, body.config ?? {});
  if (!v.ok) return NextResponse.json({ ok: false, problems: v.problems }, { status: 422 });

  const updated = await updateSection(section.id, v.config);
  await logCmsEvent('page_section', section.id, 'update', { kind: section.kind }, 'admin', user.id);
  return NextResponse.json({ ok: true, section: updated });
}

/** Tampilkan atau sembunyikan seksi. */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, section } = g;

  let body: { isVisible?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  if (typeof body.isVisible !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'Nilai isVisible harus true atau false.' }, { status: 422 });
  }

  const updated = await setSectionVisible(section.id, body.isVisible);
  await logCmsEvent(
    'page_section',
    section.id,
    body.isVisible ? 'show' : 'hide',
    { kind: section.kind },
    'admin',
    user.id,
  );
  return NextResponse.json({ ok: true, section: updated });
}

/** Hapus seksi. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, section } = g;

  await deleteSection(section.id);
  await logCmsEvent('page_section', section.id, 'delete', { kind: section.kind }, 'admin', user.id);
  return NextResponse.json({ ok: true });
}
