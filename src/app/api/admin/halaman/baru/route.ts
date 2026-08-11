import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createCustomPage, getCustomPages, normalizePath } from '@/lib/page-sections';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Membuat halaman baru buatan Owner. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat membuat halaman.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const label = String(body.label ?? '').trim();
  if (!label) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'label', message: 'Nama halaman wajib diisi.' }] },
      { status: 422 },
    );
  }
  if (label.length > 120) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'label', message: 'Nama halaman maksimal 120 karakter.' }] },
      { status: 422 },
    );
  }

  const norm = normalizePath(String(body.path ?? ''));
  if (!norm.ok) return NextResponse.json({ ok: false, problems: norm.problems }, { status: 422 });

  // Cegah bentrok dengan halaman lain yang sudah tercatat di CMS.
  const existing = await getCustomPages();
  if (existing.some((p) => p.path === norm.path)) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'path', message: `Alamat "${norm.path}" sudah dipakai halaman lain.` }] },
      { status: 422 },
    );
  }

  try {
    const page = await createCustomPage(
      {
        path: norm.path,
        label,
        title: String(body.title ?? '').trim(),
        description: String(body.description ?? '').trim(),
        h1: String(body.h1 ?? '').trim(),
      },
      user.id,
    );
    await logCmsEvent('page', page.id, 'create', { path: page.path, label }, 'admin', user.id);
    return NextResponse.json({ ok: true, page }, { status: 201 });
  } catch (err) {
    // Kolisi UNIQUE dengan halaman bawaan yang sudah ada di tabel.
    const message = err instanceof Error && /unique/i.test(err.message)
      ? `Alamat "${norm.path}" sudah dipakai halaman lain.`
      : 'Halaman gagal dibuat.';
    return NextResponse.json({ ok: false, problems: [{ field: 'path', message }] }, { status: 422 });
  }
}
