import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// KEAMANAN: JWT_SECRET WAJIB diset di environment variables.
// Set JWT_SECRET di Vercel Dashboard → Settings → Environment Variables.
// Pengecekan dilakukan di dalam fungsi (bukan module-level) agar server
// tidak crash saat startup — melainkan redirect graceful ke halaman login.
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[SECURITY WARNING] JWT_SECRET tidak diset. Menggunakan dev-only fallback. ' +
    'Jangan deploy ke production tanpa menyetel JWT_SECRET di Vercel Dashboard!',
  );
}

const EXPIRY = '14d'; // Dikurangi dari 30d → 14d
const ALG   = 'HS256';

/** Ambil SECRET — throw hanya di dalam fungsi agar server tidak crash saat modul dimuat. */
function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      // Ini hanya akan tercapai saat sign/verify dipanggil, BUKAN saat modul dimuat.
      // verifyJwt menangkap exception ini dan mengembalikan null (→ redirect ke login).
      throw new Error(
        '[SECURITY] JWT_SECRET tidak diset di Vercel Environment Variables! ' +
        'Tambahkan JWT_SECRET di Vercel Dashboard → Settings → Environment Variables.',
      );
    }
    // Development: gunakan fallback agar dev server tetap berjalan
    return new TextEncoder().encode('dev-only-insecure-fallback-do-not-use-in-production-2026');
  }
  return new TextEncoder().encode(raw);
}

export type JwtPayload = JWTPayload & {
  userId: number;
  email: string;
  name: string;
  role: 'owner' | 'staff';
};

/** Buat JWT token baru. Melempar Error jika JWT_SECRET tidak diset di production. */
export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp' | 'jti'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .setJti(crypto.randomUUID())
    .sign(getSecret());
}

/**
 * Verifikasi dan decode JWT.
 * Return null jika token invalid, expired, ATAU JWT_SECRET tidak diset
 * (graceful degradation: dianggap belum login → middleware redirect ke login).
 */
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    return payload as JwtPayload;
  } catch {
    // Termasuk kasus JWT_SECRET tidak diset → return null → redirect ke login
    return null;
  }
}
