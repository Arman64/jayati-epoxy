import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getSessionUser } from '@/lib/auth';
import { deleteMedia, getMedia, updateMediaAlt } from '@/lib/page-copy';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function guard(params: { id: string }) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 }) };
  if (user.role !== 'owner') {
    return { error: NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengelola gambar.' }, { status: 403 }) };
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return { error: NextResponse.json({ ok: false, error: 'ID gambar tidak valid.' }, { status: 400 }) };
  }
  const media = await getMedia(id);
  if (!media) return { error: NextResponse.json({ ok: false, error: 'Gambar tidak ditemukan.' }, { status: 404 }) };
  return { user, media };
}

/** Ubah teks alternatif. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, media } = g;

  let body: { alt?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const alt = String(body.alt ?? '').trim();
  if (!alt) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'alt', message: 'Teks alternatif wajib diisi.' }] },
      { status: 422 },
    );
  }
  if (alt.length > 200) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'alt', message: 'Teks alternatif maksimal 200 karakter.' }] },
      { status: 422 },
    );
  }

  const updated = await updateMediaAlt(media.id, alt);
  await logCmsEvent('media', media.id, 'update', { alt }, 'admin', user.id);
  return NextResponse.json({ ok: true, media: updated });
}

/** Hapus gambar beserta berkasnya. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, media } = g;

  await deleteMedia(media.id);

  // Berkas fisik menyusul. Bila gagal dihapus, catatan basis data sudah hilang
  // sehingga gambar tidak lagi dipakai di mana pun.
  try {
    const rel = media.path.replace(/^\/+/, '');
    await unlink(path.join(process.cwd(), 'public', rel));
  } catch {
    /* berkas sudah tidak ada — abaikan */
  }

  await logCmsEvent('media', media.id, 'delete', { path: media.path }, 'admin', user.id);
  return NextResponse.json({ ok: true });
}
