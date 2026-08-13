import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { randomBytes } from 'crypto';

const SECRET_RAW = process.env.JWT_SECRET || 'jayati-epoxy-default-secret-change-in-production-' + randomBytes(16).toString('hex');
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
    .setJti(randomBytes(8).toString('hex'))
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

/** Decode tanpa verifikasi (untuk debug). */
export function decodeJwtUnsafe(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split('.');
    return JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as JwtPayload;
  } catch {
    return null;
  }
}
