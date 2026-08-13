import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const SECRET_RAW = process.env.JWT_SECRET || 'jayati-epoxy-jwt-fallback-2026-change-me';
const SECRET = new TextEncoder().encode(SECRET_RAW);

const EXPIRY = '30d';
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
