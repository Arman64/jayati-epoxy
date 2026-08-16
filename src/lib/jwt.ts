import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// KEAMANAN: JWT_SECRET WAJIB diset di environment variables.
// Jangan pernah gunakan fallback hardcoded di production.
// Set JWT_SECRET di Vercel Dashboard → Settings → Environment Variables.
if (!process.env.JWT_SECRET) {
  // Di development (localhost), izinkan fallback dev-only dengan peringatan.
  // Di production (Vercel), ini akan menyebabkan build gagal dengan pesan yang jelas.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[SECURITY] JWT_SECRET environment variable tidak diset! ' +
      'Tambahkan JWT_SECRET ke Vercel Dashboard → Settings → Environment Variables. ' +
      'Generate dengan: openssl rand -hex 32',
    );
  }
  console.warn(
    '[SECURITY WARNING] JWT_SECRET tidak diset. Menggunakan dev-only fallback. ' +
    'Jangan deploy ke production tanpa menyetel JWT_SECRET!',
  );
}

const SECRET_RAW =
  process.env.JWT_SECRET ?? 'dev-only-insecure-fallback-do-not-use-in-production-2026';
const SECRET = new TextEncoder().encode(SECRET_RAW);

const EXPIRY = '14d'; // Dikurangi dari 30d → 14d untuk memperkecil jendela penyalahgunaan token
const ALG = 'HS256';

export type JwtPayload = JWTPayload & {
  userId: number;
  email: string;
  name: string;
  role: 'owner' | 'staff';
};

/** Buat JWT token baru. */
export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp' | 'jti'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .setJti(crypto.randomUUID())
    .sign(SECRET);
}

/** Verifikasi dan decode JWT. Return null kalau invalid/expired. */
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] });
    return payload as JwtPayload;
  } catch {
    return null;
  }
}
