import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { query, queryOne } from './db';
import { signJwt, verifyJwt, type JwtPayload } from './jwt';

export const SESSION_COOKIE = 'jayati_session';

export type Role = 'owner' | 'staff';

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

/* ---------------- password ---------------- */

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* ---------------- sesi (JWT) ---------------- */

/** Buat JWT token dan update last_login_at user. */
export async function createSession(userId: number, user: { email: string; name: string; role: Role }): Promise<string> {
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
  const token = await signJwt({ userId, email: user.email, name: user.name, role: user.role });
  return token;
}

/** Hanya clear cookie — tidak perlu hapus session di DB. */
export async function destroySession(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}

/**
 * Sumber kebenaran autentikasi — sekarang pakai JWT.
 * Tidak perlu query database! Decode token langsung.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload) return null;

  // Validasi extra: pastikan user masih active di DB (sekali query, ringan)
  const row = await queryOne<{ is_active: boolean }>(
    'SELECT is_active FROM users WHERE id = $1',
    [payload.userId],
  );

  if (!row || !row.is_active) return null;

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

/** Dipakai di halaman admin: lempar ke login bila belum masuk. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return user;
}

export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'owner') redirect('/admin?error=akses-ditolak');
  return user;
}

/* ---------------- rate limit login ---------------- */

type Attempt = { count: number; first: number };
const attempts = new Map<string, Attempt>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60_000;

export function loginRateLimited(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}

/** Perbandingan waktu-tetap untuk token non-hash. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Mendeteksi apakah kata sandi demo dari ADMIN.md masih terpasang.
 */
export async function demoCredentialsInUse(): Promise<string[]> {
  const demo: Array<[string, string]> = [
    ['owner@jayatiepoxy.id', 'JayatiDemo2026!'],
    ['staff@jayatiepoxy.id', 'StafDemo2026!'],
  ];

  const found: string[] = [];
  for (const [email, password] of demo) {
    try {
      const row = await queryOne('SELECT password_hash FROM users WHERE email = $1', [email]);
      if (!row) continue;
      if (await verifyPassword(password, String(row.password_hash))) found.push(email);
    } catch {
      // Basis data tidak siap — jangan sampai dasbor ikut gagal.
    }
  }
  return found;
}
