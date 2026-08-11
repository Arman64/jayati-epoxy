/**
 * SINGLE SOURCE OF TRUTH untuk fakta bisnis.
 * PRD §12 (Entity/NAP) + §19 mewajibkan konsistensi data di seluruh halaman,
 * schema, dan footer. JANGAN hardcode nomor/alamat di komponen lain.
 *
 * SUMBER DATA: "COMPANY PROFILE - SEMESTA BUMI JAYATI" (PDF resmi perusahaan,
 * diterima 11 Agustus 2026). Halaman 5 & 13 = NAP, halaman 2 & 4 = layanan,
 * halaman 11 = pricelist, halaman 12 = daftar proyek.
 */

/** Semua NAP inti sudah bersumber dari company profile resmi. */
export const IS_PLACEHOLDER_DATA = false;

export const site = {
  /** Nama merek dagang untuk website (domain jayatiepoxy.id). */
  brand: 'Jayati Epoxy',
  legalName: 'CV Semesta Bumi Jayati', // Sumber: company profile hal. 1, 5, 13
  /** Nama perusahaan sebagaimana tertulis di company profile & logo. */
  companyName: 'Semesta Bumi Jayati',
  tagline: 'Construction & Industrial Solutions',
  description:
    'CV Semesta Bumi Jayati (Jayati Epoxy) adalah kontraktor epoxy lantai, clean room, sandwich panel, dan ducting HVAC untuk fasilitas industri, dapur SPPG, rumah sakit, dan pengolahan makanan di seluruh Indonesia.',
  url: 'https://jayatiepoxy.id',
  locale: 'id-ID',

  // NAP — Sumber: company profile hal. 5 & 13
  phoneDisplay: '0857-858-22-695',
  phoneE164: '+6285785822695',
  whatsappDisplay: '0857-858-22-695',
  whatsappE164: '6285785822695',
  email: 'semestabumijayati@gmail.com',
  address: {
    street: 'Jalan Tambora, Bandar Lor, Kec. Mojoroto',
    locality: 'Kota Kediri',
    region: 'Jawa Timur',
    postalCode: '64114',
    country: 'ID',
  },
  /** Nama listing Google Maps sesuai company profile hal. 5 */
  mapsLabel: 'CV SEMESTA BUMI JAYATI - KONTRAKTOR EPOXY JAWA TIMUR',
  /** Fasilitas tambahan yang disebut company profile hal. 5 */
  facilities: ['Kantor Manajemen', 'Training Center Tenaga Ahli', 'Mess Pekerja'],

  openingHours: 'Senin–Sabtu, 08.00–17.00 WIB',
  openingHoursSpec: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '08:00', closes: '17:00' },
  ],
  serviceArea: 'Seluruh Indonesia',
  social: {
    instagram: 'https://www.instagram.com/semestabumijayati/', // Sumber: handle @semestabumijayati di setiap halaman company profile
  },

  // Tanggal berlaku pricelist — PRD §12 "data diberi konteks & tanggal berlaku"
  priceValidFrom: '2026-01-01',
  priceLastReviewed: '11 Agustus 2026',
  priceSource: 'Pricelist Epoxy — Company Profile CV Semesta Bumi Jayati',
} as const;

export type NavChild = {
  label: string;
  href: string;
  desc: string;
};

export type NavItem = {
  label: string;
  /** Kosong bila item hanya menjadi induk dropdown (bukan halaman). */
  href?: string;
  children?: readonly NavChild[];
};

export const nav: readonly NavItem[] = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Layanan',
    children: [
      {
        label: 'Jasa Epoxy Lantai',
        href: '/jasa-epoxy-lantai',
        desc: 'Layanan inti: self-leveling & PU Crete',
      },
      {
        label: 'Epoxy Lantai Rumah',
        href: '/epoxy-lantai-rumah',
        desc: 'Garasi, carport, dapur, ruang usaha',
      },
      {
        label: 'Epoxy Lantai Industri',
        href: '/epoxy-lantai-industri',
        desc: 'Pabrik, gudang, dapur SPPG, clean room',
      },
      {
        label: 'Area Layanan',
        href: '/area-layanan',
        desc: 'Jangkauan seluruh Indonesia',
      },
    ],
  },
  { label: 'Harga', href: '/harga-epoxy-lantai' },
  { label: 'Portofolio', href: '/portofolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Tentang', href: '/tentang-kami' },
];

/** Link WhatsApp dengan UTM internal / lead source — PRD §13 */
export function waLink(message: string, source = 'website'): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${site.whatsappE164}?text=${text}&utm_source=${source}`;
}

export const defaultWaMessage =
  'Halo Semesta Bumi Jayati, saya ingin konsultasi dan minta penawaran untuk pekerjaan epoxy lantai.';
