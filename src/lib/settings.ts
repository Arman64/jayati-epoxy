import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { query, queryOne } from './db';
import { site as fallbackSite } from './site';

/**
 * Pengaturan situs yang dapat diubah Owner lewat /admin/pengaturan.
 * Nilai default diambil dari `site.ts` supaya situs tetap benar
 * walaupun database belum pernah diisi.
 */

export type CompanyProfile = {
  legalName: string;
  brand: string;
  tagline: string;
  about: string;
  vision: string;
  missions: string[];
  values: string[];
};

export type ContactSettings = {
  phoneDisplay: string;
  phoneE164: string;
  whatsappDisplay: string;
  whatsappE164: string;
  email: string;
  addressStreet: string;
  addressCity: string;
  addressRegion: string;
  addressPostal: string;
  mapsUrl: string;
  serviceArea: string;
  hours: string;
  waMessage: string;
};

export type SocialSettings = {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
};

export type CtaSettings = {
  floatingEnabled: boolean;
  floatingWhatsapp: boolean;
  floatingPhone: boolean;
  floatingLabel: string;
  floatingDelayMs: number;
  stickyMobileEnabled: boolean;
};

export type SeoSettings = {
  siteUrl: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultOgImage: string;
  gtmId: string;
  ga4Id: string;
};

export type AllSettings = {
  company: CompanyProfile;
  contact: ContactSettings;
  social: SocialSettings;
  cta: CtaSettings;
  seo: SeoSettings;
};

const CACHE_TAG = 'settings';

/** Nilai bawaan — sumbernya company profile asli. */
export function defaultSettings(): AllSettings {
  return {
    company: {
      legalName: fallbackSite.legalName,
      brand: fallbackSite.brand,
      tagline: fallbackSite.tagline,
      about:
        'CV Semesta Bumi Jayati adalah penyedia jasa epoxy lantai untuk sektor industri, manufaktur, fasilitas kesehatan, dan pengolahan makanan di seluruh Indonesia.',
      vision: 'Be a solution for the Construction Industries of Indonesian',
      missions: [
        'Memberikan solusi konstruksi yang tepat guna dan sesuai kebutuhan klien.',
        'Menjaga mutu pekerjaan melalui material berstandar dan tenaga ahli terampil.',
        'Menyelesaikan pekerjaan tepat waktu dengan komunikasi yang transparan.',
      ],
      values: ['Integritas', 'Transparan', 'Service Excellence', 'Profesional', 'Solutif'],
    },
    contact: {
      phoneDisplay: fallbackSite.phoneDisplay,
      phoneE164: fallbackSite.phoneE164,
      whatsappDisplay: fallbackSite.whatsappDisplay,
      whatsappE164: fallbackSite.whatsappE164,
      email: fallbackSite.email,
      addressStreet: fallbackSite.address.street,
      addressCity: fallbackSite.address.locality,
      addressRegion: fallbackSite.address.region,
      addressPostal: fallbackSite.address.postalCode,
      mapsUrl: '',
      serviceArea: fallbackSite.serviceArea,
      hours: fallbackSite.openingHours,
      waMessage:
        'Halo Semesta Bumi Jayati, saya ingin konsultasi dan minta penawaran untuk pekerjaan epoxy lantai.',
    },
    social: {
      instagram: fallbackSite.social?.instagram ?? '',
      facebook: '',
      tiktok: '',
      youtube: '',
      linkedin: '',
    },
    cta: {
      floatingEnabled: true,
      floatingWhatsapp: true,
      floatingPhone: true,
      floatingLabel: 'Konsultasi gratis via WhatsApp',
      floatingDelayMs: 1200,
      stickyMobileEnabled: true,
    },
    seo: {
      siteUrl: fallbackSite.url,
      titleTemplate: '%s | Jayati Epoxy',
      defaultDescription:
        'Jasa epoxy lantai industri, dapur SPPG, dan clean room. Self-leveling & PU Crete, ketebalan 1.000–9.000 micron, bergaransi resmi.',
      defaultOgImage: '/img/og-default.png',
      gtmId: '',
      ga4Id: '',
    },
  };
}

/** Gabung nilai database di atas nilai bawaan (per grup, dangkal). */
function merge(rows: Array<{ key: string; value: unknown }>): AllSettings {
  const base = defaultSettings();
  for (const r of rows) {
    const k = r.key as keyof AllSettings;
    if (k in base && r.value && typeof r.value === 'object') {
      base[k] = { ...(base[k] as object), ...(r.value as object) } as never;
    }
  }
  return base;
}

async function loadFromDb(): Promise<AllSettings> {
  try {
    const rows = await query<{ key: string; value: unknown }>('SELECT key, value FROM settings');
    return merge(rows);
  } catch {
    // Database belum siap / belum dimigrasi — situs tetap tampil dengan default.
    return defaultSettings();
  }
}

/** Dipakai seluruh halaman publik. Di-cache dan di-invalidate saat disimpan. */
export const getSettings = unstable_cache(loadFromDb, ['site-settings'], {
  tags: [CACHE_TAG],
  revalidate: 300,
});

/** Tanpa cache — untuk halaman admin agar selalu menampilkan nilai terbaru. */
export const getSettingsFresh = loadFromDb;

export async function saveSettingGroup(
  key: keyof AllSettings,
  value: Record<string, unknown>,
  userId: number,
): Promise<void> {
  await query(
    `INSERT INTO settings (key, value, updated_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value,
           updated_by = EXCLUDED.updated_by,
           updated_at = now()`,
    [key, JSON.stringify(value), userId],
  );
  revalidateTag(CACHE_TAG);
}

export async function getSettingGroup<K extends keyof AllSettings>(
  key: K,
): Promise<AllSettings[K]> {
  const row = await queryOne<{ value: unknown }>('SELECT value FROM settings WHERE key = $1', [key]);
  const base = defaultSettings()[key];
  if (!row?.value || typeof row.value !== 'object') return base;
  return { ...(base as object), ...(row.value as object) } as AllSettings[K];
}

/** Bentuk link WhatsApp dari pengaturan kontak. */
export function buildWaLink(contact: ContactSettings, message?: string, source = 'website'): string {
  const text = encodeURIComponent(message || contact.waMessage);
  return `https://wa.me/${contact.whatsappE164.replace(/\D/g, '')}?text=${text}&utm_source=${source}`;
}
