import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SessionUser } from '@/lib/auth';

const links = [
  { href: '/admin', label: 'Dasbor' },
  { href: '/admin/leads', label: 'Prospek' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/konten', label: 'Konten', ownerOnly: true },
  { href: '/admin/halaman', label: 'Halaman', ownerOnly: true },
  { href: '/admin/pengaturan', label: 'Pengaturan', ownerOnly: true },
  { href: '/admin/mcp', label: 'Otomasi', ownerOnly: true },
  { href: '/admin/pengguna', label: 'Pengguna', ownerOnly: true },
];

export function AdminShell({
  user,
  active,
  children,
}: {
  user: SessionUser;
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="border-b border-navy-900/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/img/logo-jayati-transparent.png"
              alt="Logo CV Semesta Bumi Jayati"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-extrabold tracking-tight text-forest-700">
                JAYATI <span className="text-navy-900">EPOXY</span>
              </span>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Panel Admin
              </span>
            </span>
          </Link>

          <nav aria-label="Navigasi admin" className="order-3 w-full sm:order-none sm:w-auto">
            <ul className="flex flex-wrap items-center gap-1">
              {links
                .filter((l) => !l.ownerOnly || user.role === 'owner')
                .map((l) => {
                  const isActive =
                    l.href === '/admin' ? active === '/admin' : active.startsWith(l.href);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-leaf-50 text-forest-700'
                            : 'text-slate-700 hover:bg-cream-100'
                        }`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-bold text-navy-900">{user.name}</span>
              <span className="block text-slate-500">
                {user.role === 'owner' ? 'Pemilik' : 'Staf'}
              </span>
            </span>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-cream-100"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-7">{children}</main>
    </div>
  );
}
