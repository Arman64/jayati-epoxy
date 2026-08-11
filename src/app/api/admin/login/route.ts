import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import {
  clearLoginAttempts,
  createSession,
  loginRateLimited,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Hash tiruan agar waktu respons login sama untuk email ada / tidak ada. */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.aQF5rCBLpQXWH6uZ0aJ3lQyGZ3qYyPu';

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (loginRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Terlalu banyak percobaan masuk. Coba lagi dalam 10 menit.' },
      { status: 429 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: 'Email dan kata sandi wajib diisi.' },
      { status: 422 },
    );
  }

  try {
    const user = await queryOne<{
      id: string;
      password_hash: string;
      is_active: boolean;
    }>('SELECT id, password_hash, is_active FROM users WHERE email = $1', [email]);

    // Selalu jalankan bcrypt, walau user tidak ada, untuk mencegah user enumeration.
    const okPassword = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !user.is_active || !okPassword) {
      return NextResponse.json(
        { ok: false, error: 'Email atau kata sandi salah.' },
        { status: 401 },
      );
    }

    await createSession(Number(user.id));
    clearLoginAttempts(ip);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[admin/login] gagal:', err);
    return NextResponse.json(
      { ok: false, error: 'Server bermasalah. Coba lagi sebentar lagi.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
