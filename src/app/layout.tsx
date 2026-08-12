import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { JsonLd } from '@/components/JsonLd';
import { organizationSchema } from '@/lib/seo';
import { getSettings } from '@/lib/settings';
import { site } from '@/lib/site';
import { ScrollTracker } from '@/components/ScrollTracker';

/** Satu font family, subset latin, display swap — PRD §11 */
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#011E46',
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Jasa Epoxy Lantai Profesional — Jayati Epoxy',
    template: '%s | Jayati Epoxy',
  },
  description: site.description,
  applicationName: site.brand,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  publisher: site.legalName,
  formatDetection: { telephone: true, address: false, email: false },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/img/logo-180.png' }],
  },
  manifest: '/site.webmanifest',
  alternates: { canonical: site.url },
};

/**
 * Root layout hanya memuat html/body, font, dan schema Organization.
 * Chrome situs (Header/Footer/StickyCta) berada di route group (site),
 * sedangkan landing page iklan memakai layout minimal di /lp — PRD §6.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD ikut Pengaturan Kontak supaya nomor di hasil pencarian Google
  // tidak tertinggal saat Owner mengganti nomor.
  const { contact } = await getSettings();
  return (
    <html lang="id" className={sans.variable}>
      <body className="bg-white">
        <JsonLd
          data={organizationSchema({
            telephone: contact.phoneE164,
            email: contact.email,
            streetAddress: contact.addressStreet,
            addressLocality: contact.addressCity,
            addressRegion: contact.addressRegion,
            postalCode: contact.addressPostal,
          })}
        />
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Lompat ke konten utama
        </a>
        {children}
        <ScrollTracker />
      </body>
    </html>
  );
}
