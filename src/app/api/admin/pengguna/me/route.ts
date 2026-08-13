import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });

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
    const dup = await queryOne('SELECT id FROM users WHERE email = $1 AND id != $2', [email, user.id]);
    if (dup) {
      return NextResponse.json({ ok: false, error: 'Email sudah digunakan.' }, { status: 409 });
    }
    push('email', email);
  }

  if (typeof body.password === 'string' && body.password.length > 0) {
    if (body.password.length < 10) {
      return NextResponse.json({ ok: false, error: 'Kata sandi minimal 10 karakter.' }, { status: 422 });
    }
    push('password_hash', await hashPassword(body.password));
  }

  if (!sets.length) {
    return NextResponse.json({ ok: true, message: 'Tidak ada perubahan.' });
  }

  try {
    await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${vals.length + 1}`, [...vals, user.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/pengguna/me PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan perubahan.' }, { status: 500 });
  }
}
