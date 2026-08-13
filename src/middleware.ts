import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'jayati_session';

/**
 * Middleware sekarang validasi JWT langsung di Edge runtime.
 * Tidak perlu DB query — jose bekerja di Edge.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isLogin = pathname === '/admin/login';
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  // Validasi JWT kalau ada token
  let hasValidSession = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'jayati-epoxy-default-secret-change-in-production',
      );
      await jwtVerify(token, secret, { algorithms: ['HS256'] });
      hasValidSession = true;
    } catch {
      // Token invalid/expired — hapus cookie
      hasValidSession = false;
    }
  }

  if (!isLogin && !hasValidSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isLogin && hasValidSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
