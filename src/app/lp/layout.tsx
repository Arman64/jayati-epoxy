import Image from 'next/image';
import { site, waLink, defaultWaMessage } from '@/lib/site';
import { IconPhone, IconWhatsApp } from '@/components/Icons';
import { LpViewTracker } from '@/components/LpViewTracker';

/**
 * Layout khusus landing page iklan — PRD §6.
 * Navigasi keluar diminimalkan: tidak ada menu utama dan tidak ada footer
 * navigasi lengkap, hanya kontak dan legal.
 */
export default function LpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LpViewTracker />

      <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/img/logo-jayati-transparent.png"
              alt={`Logo ${site.legalName}`}
              width={40}
              height={40}
              priority
              className="h-9 w-9 object-contain"
            />
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-extrabold tracking-tight text-forest-700">
                JAYATI <span className="text-navy-900">EPOXY</span>
              </span>
              <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-leaf-600">
                Semesta Bumi Jayati
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${site.phoneE164}`}
              className="btn-outline !px-3.5 !py-2 text-[13px] max-sm:hidden"
              aria-label={`Telepon ${site.phoneDisplay}`}
            >
              <IconPhone className="h-4 w-4" />
              {site.phoneDisplay}
            </a>
            <a
              href={waLink(defaultWaMessage, 'lp-header')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-4 !py-2.5 text-[13px]"
            >
              <IconWhatsApp className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main id="konten-utama" className="flex-1 pb-20 lg:pb-0">{children}</main>

      <footer className="border-t border-navy-900/10 bg-cream-100 py-8">
        <div className="container-page text-center">
          <p className="text-sm font-bold text-navy-900">{site.legalName}</p>
          <p className="mt-1.5 text-[13px] text-slate-600">
            {site.address.locality}, {site.address.region} · {site.openingHours}
          </p>
          <p className="mt-1.5 text-[13px] text-slate-600">
            {site.phoneDisplay} · {site.email}
          </p>
          <p className="mt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} {site.legalName}.{' '}
            <a href="/privacy-policy" className="underline hover:text-forest-700">Kebijakan Privasi</a>
            {' · '}
            <a href="/terms" className="underline hover:text-forest-700">Syarat & Ketentuan</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
