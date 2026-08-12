'use client';

import Link from 'next/link';
import { telHref, waHref, type ContactInfo } from '@/lib/contact';
import { IconPhone, IconWhatsApp } from './Icons';
import { track } from '@/lib/analytics';

/** CTA sticky mobile — PRD §5.2. Nomor datang dari Pengaturan Kontak. */
export function StickyCta({ contact }: { contact: ContactInfo }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-900/10 bg-white/95 p-2.5 shadow-[0_-4px_20px_rgba(1,30,70,.10)] backdrop-blur lg:hidden">
      <div className="flex items-center gap-2">
        <a
          href={telHref(contact)}
          onClick={() => track('phone_click', { cta_position: 'sticky_mobile' })}
          className="btn-outline flex-1 !px-3 !py-3 text-[13px]"
          aria-label={`Telepon ${contact.phoneDisplay}`}
        >
          <IconPhone className="h-4 w-4" />
          Telepon
        </a>
        <a
          href={waHref(contact, undefined, 'sticky-mobile')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click', { cta_position: 'sticky_mobile' })}
          className="btn-primary flex-[1.4] !px-3 !py-3 text-[13px]"
        >
          <IconWhatsApp className="h-4 w-4" />
          WhatsApp
        </a>
        <Link
          href="/kontak"
          onClick={() => track('cta_click', { cta_position: 'sticky_mobile', cta: 'penawaran' })}
          className="btn-navy flex-1 !px-3 !py-3 text-[13px]"
        >
          Penawaran
        </Link>
      </div>
    </div>
  );
}
