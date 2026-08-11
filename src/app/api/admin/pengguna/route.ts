import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (actor.role !== 'owner') {
    return NextResponse.json(
      { ok: false, error: 'Hanya pemilik yang dapat menambah pengguna.' },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = body.role === 'owner' ? 'owner' : 'staff';

  if (!name) return NextResponse.json({ ok: false, error: 'Nama wajib diisi.' }, { status: 422 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Format email tidak valid.' }, { status: 422 });
  }
  if (password.length < 10) {
    return NextResponse.json(
      { ok: false, error: 'Kata sandi minimal 10 karakter.' },
      { status: 422 },
    );
  }

  const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (exists) {
    return NextResponse.json({ ok: false, error: 'Email sudah terdaftar.' }, { status: 409 });
  }

  try {
    const hash = await hashPassword(password);
    await query(
      'INSERT INTO users (email, name, password_hash, role) VALUES ($1,$2,$3,$4)',
      [email, name, hash, role],
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[admin/pengguna POST]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan pengguna.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
