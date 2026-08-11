import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { getSessionUser } from '@/lib/auth';
import { createMedia, listMedia } from '@/lib/page-copy';
import { imageSize } from '@/lib/image-size';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'img', 'unggahan');

/** Daftar gambar di pustaka. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengelola gambar.' }, { status: 403 });
  }
  return NextResponse.json({ ok: true, media: await listMedia() });
}

/** Unggah gambar baru. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengunggah gambar.' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const file = form.get('file');
  const alt = String(form.get('alt') ?? '').trim();

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'file', message: 'Pilih berkas gambar terlebih dahulu.' }] },
      { status: 422 },
    );
  }
  if (!alt) {
    return NextResponse.json(
      {
        ok: false,
        problems: [{
          field: 'alt',
          message: 'Teks alternatif wajib diisi — dibaca pembaca layar dan membantu SEO.',
        }],
      },
      { status: 422 },
    );
  }
  if (alt.length > 200) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'alt', message: 'Teks alternatif maksimal 200 karakter.' }] },
      { status: 422 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        problems: [{
          field: 'file',
          message: `Ukuran berkas ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 8 MB.`,
        }],
      },
      { status: 422 },
    );
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'file', message: 'Format harus JPG, PNG, atau WebP.' }] },
      { status: 422 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // Jangan percaya `file.type` dari peramban — periksa isi berkasnya.
  const size = imageSize(buf);
  if (!size) {
    return NextResponse.json(
      { ok: false, problems: [{ field: 'file', message: 'Berkas ini bukan gambar JPG/PNG/WebP yang sah.' }] },
      { status: 422 },
    );
  }
  if (size.width < 200 || size.height < 200) {
    return NextResponse.json(
      {
        ok: false,
        problems: [{
          field: 'file',
          message: `Gambar terlalu kecil (${size.width}×${size.height} piksel). Minimal 200×200.`,
        }],
      },
      { status: 422 },
    );
  }

  // Nama berkas dibuat sendiri; nama asli dari pengguna tidak pernah dipakai
  // sebagai path, sehingga tidak ada risiko path traversal.
  const ext = size.mime === 'image/png' ? 'png' : size.mime === 'image/webp' ? 'webp' : 'jpg';
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${ext}`;

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), buf);
  } catch {
    return NextResponse.json({ ok: false, error: 'Gambar gagal disimpan di server.' }, { status: 500 });
  }

  const media = await createMedia(
    {
      path: `/img/unggahan/${name}`,
      alt,
      width: size.width,
      height: size.height,
      bytes: buf.length,
      mime: size.mime,
    },
    user.id,
  );

  await logCmsEvent('media', media.id, 'upload', { path: media.path, bytes: media.bytes }, 'admin', user.id);
  return NextResponse.json({ ok: true, media }, { status: 201 });
}
