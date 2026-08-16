import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import {
  clearLoginAttempts,
  createSession,
  loginRateLimited,
  verifyPassword,
  SESSION_COOKIE,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Domain yang diizinkan mengakses admin login — CSRF protection
const ALLOWED_ADMIN_ORIGINS = [
  'https://jayatiepoxy.id',
  'https://www.jayatiepoxy.id',
  'https://jayati-epoxy.vercel.app',
];

function isAllowedAdminOrigin(origin: string | null): boolean {
  if (!origin) return true; // Izinkan server-side/curl tanpa origin (monitoring tools)
  if (ALLOWED_ADMIN_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/jayati-epoxy(-git-[a-z0-9-]+)?-[a-z0-9]+\.vercel\.app$/.test(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

/** Hash tiruan agar waktu respons login sama untuk email ada / tidak ada. */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.aQF5rCBLpQXWH6uZ0aJ3lQyGZ3qYyPu';

export async function POST(request: Request) {
  // CSRF protection: validasi Origin header
  const origin = request.headers.get('origin');
  if (!isAllowedAdminOrigin(origin)) {
    return NextResponse.json(
      { ok: false, error: 'Permintaan ditolak.' },
      { status: 403 },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (loginRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Terlalu banyak percobaan masuk. Coba lagi dalam 10 menit.' },
      {
        status: 429,
        headers: { 'Retry-After': '600' }, // 10 menit dalam detik
      },
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
      name: string;
      email: string;
      role: string;
      password_hash: string;
      is_active: boolean;
    }>('SELECT id, name, email, role, password_hash, is_active FROM users WHERE email = $1', [email]);

    // Selalu jalankan bcrypt, walau user tidak ada, untuk mencegah user enumeration.
    const okPassword = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !user.is_active || !okPassword) {
      return NextResponse.json(
        { ok: false, error: 'Email atau kata sandi salah.' },
        { status: 401 },
      );
    }

    // Buat JWT token
    const token = await createSession(Number(user.id), {
      email: user.email,
      name: user.name,
      role: user.role as 'owner' | 'staff',
    });
    clearLoginAttempts(ip);

    const res = NextResponse.json({ ok: true }, { status: 200 });
    // Set JWT cookie — single source of truth, tidak ada DB session
    const expires = new Date(Date.now() + 30 * 86_400_000);
    res.headers.append(
      'Set-Cookie',
      `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${expires.toUTCString()}`,
    );
    return res;
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
