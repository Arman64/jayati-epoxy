import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL('/admin/login?keluar=1', request.url), { status: 303 });
  // Hapus JWT cookie — tidak perlu hapus session di DB
  res.headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
  return res;
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
