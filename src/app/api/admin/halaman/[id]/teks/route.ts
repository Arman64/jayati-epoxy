import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getPageRow } from '@/lib/page-sections';
import { clearPageImage, resetCopy, saveCopy, setPageImage, getMedia } from '@/lib/page-copy';
import { slotDef } from '@/lib/page-slots';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX = { eyebrow: 60, title: 140, lead: 600, body: 4000 };

async function guard(params: { id: string }) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 }) };
  if (user.role !== 'owner') {
    return { error: NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengubah teks halaman.' }, { status: 403 }) };
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return { error: NextResponse.json({ ok: false, error: 'ID halaman tidak valid.' }, { status: 400 }) };
  }
  const page = await getPageRow(id);
  if (!page) return { error: NextResponse.json({ ok: false, error: 'Halaman tidak ditemukan.' }, { status: 404 }) };
  return { user, page };
}

/** Simpan teks satu bagian, dan/atau pasang gambarnya. */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, page } = g;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const slot = String(body.slot ?? '').trim();
  const def = slotDef(page.path, slot);
  if (!def) {
    return NextResponse.json(
      { ok: false, error: `Bagian "${slot}" tidak dikenal pada halaman ini.` },
      { status: 422 },
    );
  }

  // --- gambar ---
  if ('mediaId' in body) {
    if (!def.image) {
      return NextResponse.json(
        { ok: false, error: 'Bagian ini tidak memuat gambar.' },
        { status: 422 },
      );
    }
    const raw = body.mediaId;
    if (raw === null || raw === '' || raw === 0) {
      await clearPageImage(page.path, slot);
      await logCmsEvent('page_copy', page.id, 'reset_image', { slot }, 'admin', user.id);
      return NextResponse.json({ ok: true });
    }
    const mediaId = Number(raw);
    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return NextResponse.json({ ok: false, error: 'ID gambar tidak valid.' }, { status: 422 });
    }
    if (!(await getMedia(mediaId))) {
      return NextResponse.json({ ok: false, error: 'Gambar tidak ditemukan di pustaka.' }, { status: 404 });
    }
    await setPageImage(page.path, slot, mediaId, user.id);
    await logCmsEvent('page_copy', page.id, 'set_image', { slot, mediaId }, 'admin', user.id);
    return NextResponse.json({ ok: true });
  }

  // --- teks ---
  const problems: Array<{ field: string; message: string }> = [];
  const pick = (k: 'eyebrow' | 'title' | 'lead' | 'body') => {
    const v = body[k];
    const s = typeof v === 'string' ? v.trim() : '';
    if (s.length > MAX[k]) {
      problems.push({ field: k, message: `Maksimal ${MAX[k]} karakter (saat ini ${s.length}).` });
    }
    return s;
  };

  const data = {
    eyebrow: pick('eyebrow'),
    title: pick('title'),
    lead: pick('lead'),
    body: pick('body'),
    isHidden: Boolean(body.isHidden),
  };

  if (problems.length) return NextResponse.json({ ok: false, problems }, { status: 422 });

  await saveCopy(page.path, slot, data, user.id);
  await logCmsEvent('page_copy', page.id, 'update', { slot }, 'admin', user.id);
  return NextResponse.json({ ok: true });
}

/** Kembalikan satu bagian ke teks bawaan. */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const { user, page } = g;

  const slot = new URL(request.url).searchParams.get('slot') ?? '';
  if (!slotDef(page.path, slot)) {
    return NextResponse.json({ ok: false, error: 'Bagian tidak dikenal.' }, { status: 422 });
  }

  await resetCopy(page.path, slot);
  await clearPageImage(page.path, slot);
  await logCmsEvent('page_copy', page.id, 'reset', { slot }, 'admin', user.id);
  return NextResponse.json({ ok: true });
}
