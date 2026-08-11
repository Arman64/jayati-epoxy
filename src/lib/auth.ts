import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomUUID, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { query, queryOne } from './db';

export const SESSION_COOKIE = 'jayati_session';
const SESSION_DAYS = 7;

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

/* ---------------- sesi ---------------- */

export async function createSession(userId: number): Promise<string> {
  const id = randomUUID();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await query('INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)', [
    id,
    userId,
    expires,
  ]);
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);

  cookies().set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  });

  return id;
}

export async function destroySession(): Promise<void> {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (id) await query('DELETE FROM sessions WHERE id = $1', [id]);
  cookies().delete(SESSION_COOKIE);
}

/**
 * Sumber kebenaran autentikasi. Middleware hanya mengecek keberadaan cookie
 * (Edge runtime tidak bisa akses Postgres) — validasi sebenarnya ada di sini
 * dan dipanggil ulang di setiap halaman & API admin.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) return null;

  // Format UUID divalidasi dulu supaya query tidak error untuk cookie sampah.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;

  const row = await queryOne<{
    id: string;
    email: string;
    name: string;
    role: Role;
    is_active: boolean;
  }>(
    `SELECT u.id, u.email, u.name, u.role, u.is_active
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > now()`,
    [id],
  );

  if (!row || !row.is_active) return null;
  return { id: Number(row.id), email: row.email, name: row.name, role: row.role };
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
 * Kata sandi tersebut tertulis di repositori, jadi harus dianggap bocor.
 * Dipakai untuk memunculkan peringatan di dasbor, bukan untuk memblokir login
 * agar pemilik tidak terkunci dari panelnya sendiri.
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
