import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { reorderItems } from '@/lib/content-db';
import { collectionDef } from '@/lib/collections';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengubah urutan.' }, { status: 403 });
  }

  let body: { collection?: unknown; ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const collection = String(body.collection ?? '');
  if (!collectionDef(collection)) {
    return NextResponse.json({ ok: false, error: 'Koleksi tidak dikenal.' }, { status: 422 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];
  if (!ids.length) {
    return NextResponse.json({ ok: false, error: 'Daftar urutan kosong.' }, { status: 422 });
  }

  await reorderItems(collection, ids);
  await logCmsEvent('content', null, 'reorder', { collection, count: ids.length }, 'admin', user.id);
  return NextResponse.json({ ok: true });
}
