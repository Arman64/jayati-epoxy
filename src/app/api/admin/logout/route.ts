import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await destroySession();
  const res = NextResponse.redirect(new URL('/admin/login?keluar=1', request.url), { status: 303 });
  res.headers.append('Set-Cookie', 'jayati_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');
  return res;
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
