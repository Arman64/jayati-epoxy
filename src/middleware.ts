import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'jayati_session';

/**
 * Penjaga lapis pertama. Middleware berjalan di Edge runtime sehingga tidak
 * bisa membuka koneksi Postgres — di sini hanya dicek ada/tidaknya cookie.
 * Validasi sesi yang sebenarnya dilakukan ulang di setiap halaman & API admin
 * lewat requireUser(), jadi cookie palsu tetap tidak bisa menembus.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isLogin = pathname === '/admin/login';
  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (!isLogin && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isLogin && hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  // Seluruh area admin tidak boleh diindeks mesin pencari.
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
