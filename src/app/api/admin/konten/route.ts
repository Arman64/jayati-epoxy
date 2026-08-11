import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createItem } from '@/lib/content-db';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengubah konten.' }, { status: 403 });
  }

  let body: { collection?: unknown; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const collection = String(body.collection ?? '');
  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return NextResponse.json({ ok: false, error: 'Data tidak valid.' }, { status: 422 });
  }

  const result = await createItem(collection, body.data as Record<string, unknown>, user.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, problems: result.problems }, { status: 422 });
  }

  await logCmsEvent('content', result.item.id, 'create', { collection, slug: result.item.slug }, 'admin', user.id);
  return NextResponse.json({ ok: true, item: result.item }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
