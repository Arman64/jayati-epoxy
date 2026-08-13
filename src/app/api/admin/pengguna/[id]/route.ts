import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (actor.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengubah pengguna.' }, { status: 403 });
  }

  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }
  const id = Number(params.id);

  if (id === actor.id) {
    return NextResponse.json({ ok: false, error: 'Tidak bisa mengubah akun sendiri dari halaman ini.' }, { status: 422 });
  }

  const user = await queryOne('SELECT id, email FROM users WHERE id = $1', [id]);
  if (!user) return NextResponse.json({ ok: false, error: 'Pengguna tidak ditemukan.' }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  const push = (col: string, val: unknown) => { vals.push(val); sets.push(`${col} = $${vals.length}`); };

  if (typeof body.name === 'string' && body.name.trim()) {
    push('name', body.name.trim().slice(0, 120));
  }

  if (typeof body.email === 'string' && body.email.trim()) {
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Format email tidak valid.' }, { status: 422 });
    }
    const dup = await queryOne('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (dup) {
      return NextResponse.json({ ok: false, error: 'Email sudah digunakan pengguna lain.' }, { status: 409 });
    }
    push('email', email);
  }

  if (typeof body.password === 'string' && body.password.length > 0) {
    if (body.password.length < 10) {
      return NextResponse.json({ ok: false, error: 'Kata sandi minimal 10 karakter.' }, { status: 422 });
    }
    push('password_hash', await hashPassword(body.password));
  }

  if (body.role === 'owner' || body.role === 'staff') {
    push('role', body.role);
  }

  if (typeof body.is_active === 'boolean') {
    push('is_active', body.is_active);
  }

  if (!sets.length) {
    return NextResponse.json({ ok: true, message: 'Tidak ada perubahan.' });
  }

  try {
    await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${vals.length + 1}`, [...vals, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/pengguna PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan perubahan.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (actor.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat menghapus pengguna.' }, { status: 403 });
  }

  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }
  const id = Number(params.id);

  if (id === actor.id) {
    return NextResponse.json({ ok: false, error: 'Tidak bisa menghapus akun sendiri.' }, { status: 422 });
  }

  const user = await queryOne('SELECT id FROM users WHERE id = $1', [id]);
  if (!user) return NextResponse.json({ ok: false, error: 'Pengguna tidak ditemukan.' }, { status: 404 });

  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/pengguna DELETE]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
