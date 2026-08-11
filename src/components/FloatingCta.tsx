'use client';

import { useEffect, useState } from 'react';
import { IconClose, IconPhone, IconWhatsApp } from './Icons';
import { track } from '@/lib/analytics';

type Props = {
  waHref: string;
  phoneHref: string;
  phoneDisplay: string;
  label: string;
  showWhatsapp: boolean;
  showPhone: boolean;
  delayMs: number;
  /** Sisakan ruang untuk sticky bar di mobile. */
  liftOnMobile: boolean;
};

/**
 * Tombol mengambang WhatsApp + Telepon.
 * Muncul setelah jeda singkat agar tidak menutupi hero saat halaman dibuka,
 * dan dapat ditutup pengunjung (pilihan disimpan selama sesi).
 */
export function FloatingCta({
  waHref,
  phoneHref,
  phoneDisplay,
  label,
  showWhatsapp,
  showPhone,
  delayMs,
  liftOnMobile,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // sessionStorage: kalau ditutup, jangan muncul lagi sampai tab ditutup.
    const hidden = sessionStorage.getItem('jyt-fab-hidden') === '1';
    setDismissed(hidden);
    if (hidden) return;
    const t = setTimeout(() => setVisible(true), Math.max(delayMs, 0));
    return () => clearTimeout(t);
  }, [delayMs]);

  // Label pengantar hanya ditampilkan sebentar, lalu mengecil jadi ikon.
  useEffect(() => {
    if (!visible) return;
    setExpanded(true);
    const t = setTimeout(() => setExpanded(false), 5000);
    return () => clearTimeout(t);
  }, [visible]);

  if (dismissed || (!showWhatsapp && !showPhone)) return null;

  function hide() {
    sessionStorage.setItem('jyt-fab-hidden', '1');
    setDismissed(true);
    track('cta_click', { cta_position: 'floating', cta: 'tutup' });
  }

  return (
    <div
      data-testid="floating-cta"
      className={`pointer-events-none fixed right-3 z-40 flex flex-col items-end gap-2.5 transition-all duration-300 sm:right-5 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      } ${liftOnMobile ? 'bottom-[76px] lg:bottom-6' : 'bottom-5'}`}
    >
      {/* Tombol tutup, muncul bersama label */}
      {expanded ? (
        <button
          type="button"
          onClick={hide}
          aria-label="Sembunyikan tombol kontak"
          className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full border border-navy-900/12 bg-white text-slate-500 shadow-md transition-colors hover:text-navy-900"
        >
          <IconClose className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {showPhone ? (
        <a
          href={phoneHref}
          onClick={() => track('phone_click', { cta_position: 'floating' })}
          aria-label={`Telepon ${phoneDisplay}`}
          className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-navy-900 text-white shadow-lg shadow-navy-900/25 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
        >
          <IconPhone className="h-5 w-5" />
        </a>
      ) : null}

      {showWhatsapp ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click', { cta_position: 'floating' })}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-[#25D366] py-3 pl-3.5 pr-4 text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
          aria-label={label}
        >
          <span className="relative grid h-6 w-6 shrink-0 place-items-center">
            {/* Denyut halus untuk menarik perhatian tanpa mengganggu */}
            <span className="absolute inset-0 animate-ping rounded-full bg-white/40" aria-hidden="true" />
            <IconWhatsApp className="relative h-6 w-6" />
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 ${
              expanded ? 'max-w-[220px] opacity-100' : 'max-w-0 opacity-0'
            }`}
          >
            {label}
          </span>
        </a>
      ) : null}
    </div>
  );
}
