import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { addNote, getLead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });

  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }
  const id = Number(params.id);

  let body: { body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const text = typeof body.body === 'string' ? body.body.trim().slice(0, 2000) : '';
  if (!text) {
    return NextResponse.json({ ok: false, error: 'Catatan tidak boleh kosong.' }, { status: 422 });
  }

  const lead = await getLead(id);
  if (!lead) {
    return NextResponse.json({ ok: false, error: 'Prospek tidak ditemukan.' }, { status: 404 });
  }

  try {
    const note = await addNote(id, user.id, text);
    return NextResponse.json({ ok: true, note }, { status: 201 });
  } catch (err) {
    console.error('[admin/notes POST]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan catatan.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
