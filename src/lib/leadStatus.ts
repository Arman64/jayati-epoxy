/**
 * Konstanta status prospek — sengaja dipisah dari `leads.ts` yang berisi
 * akses database (server-only), supaya komponen klien boleh mengimpornya.
 */

export const LEAD_STATUSES = [
  'baru',
  'dihubungi',
  'survei',
  'penawaran',
  'menang',
  'kalah',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  survei: 'Survei',
  penawaran: 'Penawaran',
  menang: 'Menang',
  kalah: 'Kalah',
};
