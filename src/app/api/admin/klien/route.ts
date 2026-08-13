import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await query('SELECT * FROM client_groups ORDER BY sort_order, id');
  return NextResponse.json({ ok: true, groups: rows });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Akses ditolak.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  const clients = Array.isArray(body.clients) ? body.clients.map(String) : [];
  const sortOrder = Number(body.sort_order) || 0;

  if (!category) {
    return NextResponse.json({ ok: false, error: 'Nama kategori wajib diisi.' }, { status: 422 });
  }

  try {
    const rows = await query(
      'INSERT INTO client_groups (category, note, clients, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
      [category, note, JSON.stringify(clients), sortOrder],
    );
    return NextResponse.json({ ok: true, group: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[admin/klien POST]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Akses ditolak.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID wajib diisi.' }, { status: 422 });
  }

  const existing = await queryOne('SELECT id FROM client_groups WHERE id = $1', [id]);
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Grup tidak ditemukan.' }, { status: 404 });
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  const push = (col: string, val: unknown) => { vals.push(val); sets.push(`${col} = $${vals.length}`); };

  if (typeof body.category === 'string') push('category', body.category.trim());
  if (typeof body.note === 'string') push('note', body.note.trim());
  if (Array.isArray(body.clients)) push('clients', JSON.stringify(body.clients.map(String)));
  if (typeof body.sort_order === 'number') push('sort_order', body.sort_order);

  if (!sets.length) {
    return NextResponse.json({ ok: true, message: 'Tidak ada perubahan.' });
  }

  sets.push('updated_at = NOW()');

  try {
    await query(`UPDATE client_groups SET ${sets.join(', ')} WHERE id = $${vals.length + 1}`, [...vals, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/klien PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Akses ditolak.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID wajib diisi.' }, { status: 422 });
  }

  try {
    await query('DELETE FROM client_groups WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/klien DELETE]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menghapus.' }, { status: 500 });
  }
}
