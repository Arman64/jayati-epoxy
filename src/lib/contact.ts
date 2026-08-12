import type { ContactSettings } from '@/lib/settings';

/**
 * Alat bantu kontak yang aman dipakai di client component.
 *
 * Berkas ini sengaja TIDAK mengimpor `getSettings()` (yang server-only) maupun
 * `site.ts`. Semua fungsi di sini menerima objek `contact` dari pemanggil,
 * sehingga nomor yang dipakai selalu berasal dari satu sumber: pengaturan di
 * basis data. Sebelumnya Header/Footer/StickyCta membaca nomor langsung dari
 * konstanta di `site.ts`, sehingga perubahan lewat Pengaturan Kontak tidak
 * pernah muncul di web.
 */

/** Bentuk minimal yang dibutuhkan komponen — memudahkan pengiriman lewat props. */
export type ContactInfo = {
  phoneDisplay: string;
  phoneE164: string;
  whatsappDisplay: string;
  whatsappE164: string;
  email: string;
  waMessage: string;
};

/** Ambil hanya bagian yang dipakai komponen dari pengaturan lengkap. */
export function toContactInfo(c: ContactSettings): ContactInfo {
  return {
    phoneDisplay: c.phoneDisplay,
    phoneE164: c.phoneE164,
    whatsappDisplay: c.whatsappDisplay,
    whatsappE164: c.whatsappE164,
    email: c.email,
    waMessage: c.waMessage,
  };
}

/**
 * Susun tautan WhatsApp dari nomor yang tersimpan di pengaturan.
 *
 * `whatsappE164` boleh ditulis dengan atau tanpa tanda `+` oleh Owner; wa.me
 * hanya menerima angka, jadi karakter selain digit dibuang di sini.
 */
export function waHref(contact: ContactInfo, message?: string, source = 'website'): string {
  const number = (contact.whatsappE164 || '').replace(/\D/g, '');
  const text = encodeURIComponent(message ?? contact.waMessage);
  return `https://wa.me/${number}?text=${text}&utm_source=${source}`;
}

/** Tautan telepon. */
export function telHref(contact: ContactInfo): string {
  return `tel:${contact.phoneE164}`;
}
