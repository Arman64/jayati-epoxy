/**
 * Katalog seksi yang bisa disusun Owner pada tiap halaman.
 *
 * Pendekatannya hybrid (bukan block editor bebas): Owner memilih dari daftar
 * seksi yang sudah dirancang, mengatur urutannya, menyembunyikannya, dan
 * mengisi beberapa kolom teks. Struktur, kelas Tailwind, dan JSON-LD tetap
 * dipegang kode agar tampilan tidak bisa rusak dan target PRD §11 (CLS, LCP)
 * tetap terjaga.
 *
 * Tanpa `server-only`: file ini juga dipakai komponen admin di sisi klien.
 */

export type SectionFieldType = 'text' | 'textarea' | 'select' | 'boolean' | 'number';

export type SectionField = {
  name: string;
  label: string;
  type: SectionFieldType;
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  max?: number;
};

export type SectionKind = {
  kind: string;
  label: string;
  description: string;
  /** Seksi ini hanya masuk akal sekali dalam satu halaman. */
  singleton?: boolean;
  fields: SectionField[];
};

const CTA_STYLE_OPTIONS = [
  { value: 'gradient', label: 'Blok gradien (mencolok)' },
  { value: 'soft', label: 'Blok lembut (krem)' },
];

/**
 * Daftar seksi. `kind` disimpan di kolom `page_sections.kind` — jangan
 * mengubah nilainya setelah dipakai, karena akan memutus data lama.
 */
export const SECTION_KINDS: SectionKind[] = [
  {
    kind: 'hero',
    label: 'Hero (kepala halaman)',
    description: 'Judul H1, paragraf pembuka, dan dua tombol ajakan.',
    singleton: true,
    fields: [
      { name: 'eyebrow', label: 'Teks kecil di atas judul', type: 'text', placeholder: 'Jasa Epoxy Lantai' },
      { name: 'title', label: 'Judul utama (H1)', type: 'text', required: true, max: 90 },
      { name: 'lead', label: 'Paragraf pembuka', type: 'textarea', help: 'Idealnya 40–60 kata agar langsung menjawab maksud pengunjung.' },
      { name: 'primaryLabel', label: 'Tombol utama — teks', type: 'text', placeholder: 'Minta Penawaran' },
      { name: 'primaryHref', label: 'Tombol utama — tautan', type: 'text', placeholder: '/kontak' },
      { name: 'secondaryLabel', label: 'Tombol kedua — teks', type: 'text', placeholder: 'Lihat Portofolio' },
      { name: 'secondaryHref', label: 'Tombol kedua — tautan', type: 'text', placeholder: '/portofolio' },
    ],
  },
  {
    kind: 'answer',
    label: 'Jawaban singkat',
    description: 'Kotak jawaban langsung di awal halaman. Baik untuk SEO.',
    singleton: true,
    fields: [
      { name: 'body', label: 'Isi jawaban', type: 'textarea', required: true, help: 'Tulis 40–60 kata yang langsung menjawab pertanyaan utama halaman ini.' },
    ],
  },
  {
    kind: 'rich_text',
    label: 'Teks bebas',
    description: 'Satu judul H2 dan beberapa paragraf.',
    fields: [
      { name: 'eyebrow', label: 'Teks kecil di atas judul', type: 'text' },
      { name: 'title', label: 'Judul (H2)', type: 'text', required: true },
      { name: 'body', label: 'Isi', type: 'textarea', required: true, help: 'Pisahkan antarparagraf dengan baris kosong.' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'checklist',
    label: 'Daftar centang',
    description: 'Judul dengan daftar poin bertanda centang.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', required: true },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'items', label: 'Poin (satu per baris)', type: 'textarea', required: true },
      { name: 'twoColumns', label: 'Tampilkan dua kolom', type: 'boolean' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'systems',
    label: 'Kartu sistem epoxy',
    description: 'Menarik data langsung dari Konten → Sistem Epoxy, lengkap dengan harga.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Sistem epoxy dan penggunaannya' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'limit', label: 'Jumlah kartu (0 = semua)', type: 'number' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'work_steps',
    label: 'Tahapan pengerjaan',
    description: 'Menarik data dari Konten → Tahapan Kerja.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Proses Kerja' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'why_us',
    label: 'Alasan memilih kami',
    description: 'Menarik data dari Konten → Alasan Memilih Kami.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Kenapa memilih kami' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'services',
    label: 'Kartu layanan',
    description: 'Menarik data dari Konten → Layanan Utama.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Layanan kami' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'projects',
    label: 'Galeri proyek',
    description: 'Foto proyek asli dari dokumentasi perusahaan.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Proyek yang pernah kami kerjakan' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'limit', label: 'Jumlah proyek (0 = semua)', type: 'number' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'price_table',
    label: 'Tabel harga',
    description: 'Pricelist resmi per m² menurut tier luas, otomatis dari Konten → Sistem Epoxy.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Pricelist per meter persegi' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'calculator',
    label: 'Kalkulator estimasi',
    description: 'Kalkulator biaya interaktif berdasarkan luas dan sistem.',
    singleton: true,
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Hitung estimasi biaya' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'faq',
    label: 'Daftar FAQ',
    description: 'Menarik data dari Konten → FAQ Umum atau FAQ Harga. Menghasilkan JSON-LD FAQPage.',
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Pertanyaan yang Sering Diajukan' },
      {
        name: 'source',
        label: 'Sumber pertanyaan',
        type: 'select',
        options: [
          { value: 'general', label: 'FAQ Umum' },
          { value: 'price', label: 'FAQ Harga' },
        ],
      },
      { name: 'limit', label: 'Jumlah pertanyaan (0 = semua)', type: 'number' },
    ],
  },
  {
    kind: 'stats',
    label: 'Angka kepercayaan',
    description: 'Menarik data dari Konten → Angka Kepercayaan.',
    fields: [
      { name: 'muted', label: 'Latar krem', type: 'boolean' },
    ],
  },
  {
    kind: 'form',
    label: 'Formulir penawaran',
    description: 'Formulir minta penawaran lengkap dengan unggah foto. Prospek masuk ke menu Prospek.',
    singleton: true,
    fields: [
      { name: 'title', label: 'Judul (H2)', type: 'text', placeholder: 'Kirim detail area Anda' },
      { name: 'lead', label: 'Kalimat pengantar', type: 'textarea' },
    ],
  },
  {
    kind: 'cta',
    label: 'Ajakan bertindak',
    description: 'Blok ajakan dengan tombol.',
    fields: [
      { name: 'title', label: 'Judul', type: 'text', required: true },
      { name: 'body', label: 'Isi', type: 'textarea' },
      { name: 'primaryLabel', label: 'Tombol — teks', type: 'text', placeholder: 'Minta Penawaran' },
      { name: 'primaryHref', label: 'Tombol — tautan', type: 'text', placeholder: '/kontak' },
      { name: 'style', label: 'Gaya', type: 'select', options: CTA_STYLE_OPTIONS },
    ],
  },
];

export const SECTION_BY_KIND: Record<string, SectionKind> = Object.fromEntries(
  SECTION_KINDS.map((s) => [s.kind, s]),
);

export function sectionLabel(kind: string): string {
  return SECTION_BY_KIND[kind]?.label ?? kind;
}

export type SectionConfig = Record<string, unknown>;

export type PageSectionRow = {
  id: number;
  pageId: number;
  kind: string;
  sortOrder: number;
  isVisible: boolean;
  config: SectionConfig;
};

/* ------------------------------------------------------------- validasi */

export type SectionProblem = { field: string; message: string };

export function validateSection(
  kind: string,
  raw: unknown,
): { ok: true; config: SectionConfig } | { ok: false; problems: SectionProblem[] } {
  const def = SECTION_BY_KIND[kind];
  if (!def) return { ok: false, problems: [{ field: 'kind', message: `Jenis seksi "${kind}" tidak dikenal.` }] };

  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const problems: SectionProblem[] = [];
  const config: SectionConfig = {};

  for (const f of def.fields) {
    const v = input[f.name];

    if (f.type === 'boolean') {
      config[f.name] = Boolean(v);
      continue;
    }

    if (f.type === 'number') {
      if (v === '' || v === undefined || v === null) {
        config[f.name] = 0;
        continue;
      }
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) {
        problems.push({ field: f.name, message: `${f.label} harus berupa angka nol atau lebih.` });
        continue;
      }
      config[f.name] = Math.floor(n);
      continue;
    }

    const s = typeof v === 'string' ? v.trim() : v === undefined || v === null ? '' : String(v).trim();

    if (f.required && !s) {
      problems.push({ field: f.name, message: `${f.label} wajib diisi.` });
      continue;
    }
    if (f.max && s.length > f.max) {
      problems.push({ field: f.name, message: `${f.label} maksimal ${f.max} karakter (saat ini ${s.length}).` });
      continue;
    }
    if (f.type === 'select' && s && f.options && !f.options.some((o) => o.value === s)) {
      problems.push({ field: f.name, message: `${f.label} berisi pilihan yang tidak dikenal.` });
      continue;
    }
    // Tautan internal harus relatif atau http(s) — mencegah javascript: URL.
    if (f.name.endsWith('Href') && s && !/^(\/|https?:\/\/|#|tel:|mailto:)/i.test(s)) {
      problems.push({ field: f.name, message: `${f.label} harus diawali "/", "#", atau "https://".` });
      continue;
    }

    config[f.name] = s;
  }

  if (problems.length) return { ok: false, problems };
  return { ok: true, config };
}

/** Pecah textarea "satu per baris" menjadi array bersih. */
export function linesOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v !== 'string') return [];
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Pecah teks menjadi paragraf berdasarkan baris kosong. */
export function paragraphsOf(v: unknown): string[] {
  if (typeof v !== 'string') return [];
  return v
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Ambil string dari config dengan nilai cadangan. */
export function str(config: SectionConfig, key: string, fallback = ''): string {
  const v = config[key];
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

export function num(config: SectionConfig, key: string, fallback = 0): number {
  const v = Number(config[key]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export function bool(config: SectionConfig, key: string): boolean {
  return Boolean(config[key]);
}
