import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { deleteItem, getItem, setItemActive, updateItem } from '@/lib/content-db';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function guard(id: string) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 }) };
  if (user.role !== 'owner') {
    return { error: NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengubah konten.' }, { status: 403 }) };
  }
  if (!/^\d+$/.test(id)) {
    return { error: NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 }) };
  }
  return { user };
}

/** Ubah isi satu item. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id);
  if (g.error) return g.error;

  let body: { data?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }
  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return NextResponse.json({ ok: false, error: 'Data tidak valid.' }, { status: 422 });
  }

  const result = await updateItem(Number(params.id), body.data as Record<string, unknown>, g.user!.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, problems: result.problems }, { status: result.status ?? 422 });
  }

  await logCmsEvent('content', result.item.id, 'update', { collection: result.item.collection, slug: result.item.slug }, 'admin', g.user!.id);
  return NextResponse.json({ ok: true, item: result.item });
}

/** Tampilkan atau sembunyikan tanpa menghapus. */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id);
  if (g.error) return g.error;

  let body: { isActive?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }
  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'Nilai isActive wajib true atau false.' }, { status: 422 });
  }

  const item = await getItem(Number(params.id));
  if (!item) return NextResponse.json({ ok: false, error: 'Item tidak ditemukan.' }, { status: 404 });

  await setItemActive(item.id, body.isActive);
  await logCmsEvent('content', item.id, body.isActive ? 'show' : 'hide', { collection: item.collection }, 'admin', g.user!.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_r: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id);
  if (g.error) return g.error;

  const item = await getItem(Number(params.id));
  if (!item) return NextResponse.json({ ok: false, error: 'Item tidak ditemukan.' }, { status: 404 });

  await deleteItem(item.id);
  await logCmsEvent('content', item.id, 'delete', { collection: item.collection, slug: item.slug }, 'admin', g.user!.id);
  return NextResponse.json({ ok: true });
}
