/**
 * Definisi koleksi konten terstruktur.
 *
 * File ini SENGAJA bebas dari `server-only` dan tidak menyentuh database,
 * karena skema field-nya juga dipakai komponen klien untuk membangun form.
 * Akses database ada di `src/lib/content-db.ts`.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'rupiah'
  | 'list'
  | 'select'
  | 'boolean'
  /** Kumpulan foto dari pustaka gambar, lengkap dengan teks alternatif. */
  | 'photos';

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  required?: boolean;
  options?: string[];
  /** Batas untuk number/rupiah — mencegah salah ketik nol berlebih. */
  min?: number;
  max?: number;
  maxLength?: number;
};

export type CollectionDef = {
  id: string;
  label: string;
  /** Kalimat singkat: apa yang berubah di website kalau ini diedit. */
  description: string;
  /** Field yang dipakai sebagai judul baris di daftar admin. */
  titleField: string;
  fields: FieldDef[];
  /** Owner boleh menambah/menghapus item, bukan cuma mengedit. */
  allowCreate: boolean;
  allowDelete: boolean;
  /** Peringatan ekstra sebelum menyimpan (mis. data berdampak harga). */
  sensitive?: string;
};

export const COLLECTIONS: CollectionDef[] = [
  {
    id: 'epoxy_systems',
    label: 'Sistem & Harga Epoxy',
    description:
      'Tabel harga per m² untuk setiap ketebalan. Dipakai di halaman Harga, kalkulator estimasi, beranda, dan halaman layanan.',
    titleField: 'name',
    allowCreate: true,
    allowDelete: true,
    sensitive:
      'Angka di sini langsung tampil sebagai harga resmi di website dan dipakai kalkulator estimasi. Periksa ulang sebelum menyimpan.',
    fields: [
      { key: 'name', label: 'Nama sistem', type: 'text', required: true, maxLength: 120 },
      { key: 'micron', label: 'Ketebalan (micron)', type: 'number', required: true, min: 1, max: 100000 },
      { key: 'thicknessLabel', label: 'Label ketebalan', type: 'text', hint: 'Contoh: 1.000 micron (± 1 mm)', maxLength: 80 },
      {
        key: 'family',
        label: 'Keluarga material',
        type: 'select',
        options: ['Self Leveling', 'PU Crete'],
        required: true,
      },
      { key: 'bestFor', label: 'Paling cocok untuk', type: 'textarea', maxLength: 400 },
      { key: 'priceUnder100', label: 'Harga < 100 m² (Rp/m²)', type: 'rupiah', required: true, min: 0, max: 100000000 },
      { key: 'priceOver100', label: 'Harga > 100 m² (Rp/m²)', type: 'rupiah', required: true, min: 0, max: 100000000 },
      { key: 'priceOver500', label: 'Harga > 500 m² (Rp/m²)', type: 'rupiah', required: true, min: 0, max: 100000000 },
      { key: 'highlights', label: 'Keunggulan', type: 'list', hint: 'Satu poin per baris.' },
      {
        key: 'unverified',
        label: 'Tandai sebagai perkiraan',
        type: 'boolean',
        hint: 'Centang bila angka belum bersumber dari pricelist resmi. Website akan menampilkan catatan.',
      },
    ],
  },

  {
    id: 'core_services',
    label: 'Layanan Utama',
    description: 'Kartu layanan di beranda dan tautan layanan di footer.',
    titleField: 'title',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'title', label: 'Nama layanan', type: 'text', required: true, maxLength: 120 },
      { key: 'short', label: 'Keterangan singkat', type: 'textarea', required: true, maxLength: 300 },
      {
        key: 'icon',
        label: 'Ikon',
        type: 'select',
        options: ['home', 'factory', 'shield', 'layers', 'droplet', 'ruler'],
        required: true,
      },
      {
        key: 'href',
        label: 'Tautan halaman',
        type: 'text',
        hint: 'Contoh: /epoxy-lantai-industri. Kosongkan bila belum punya halaman sendiri.',
        maxLength: 200,
      },
    ],
  },

  {
    id: 'other_services',
    label: 'Layanan Pendukung',
    description: 'Layanan non-epoxy: clean room, ducting HVAC, konstruksi, repaint.',
    titleField: 'name',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'name', label: 'Nama layanan', type: 'text', required: true, maxLength: 120 },
      { key: 'body', label: 'Penjelasan', type: 'textarea', required: true, maxLength: 1200 },
      { key: 'points', label: 'Poin lingkup kerja', type: 'list' },
    ],
  },

  {
    id: 'work_steps',
    label: 'Tahapan Pengerjaan',
    description: 'Alur kerja bernomor di beranda, halaman Jasa, dan Tentang Kami.',
    titleField: 'title',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'title', label: 'Nama tahap', type: 'text', required: true, maxLength: 120 },
      { key: 'body', label: 'Penjelasan', type: 'textarea', required: true, maxLength: 800 },
    ],
  },

  {
    id: 'why_choose_us',
    label: 'Alasan Memilih Kami',
    description: 'Daftar keunggulan bernomor di beranda.',
    titleField: 'title',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'title', label: 'Judul', type: 'text', required: true, maxLength: 120 },
      { key: 'body', label: 'Penjelasan', type: 'textarea', required: true, maxLength: 800 },
    ],
  },

  {
    id: 'faqs_general',
    label: 'FAQ Umum',
    description: 'Pertanyaan umum di beranda dan halaman Jasa. Ikut tampil sebagai FAQ di Google.',
    titleField: 'q',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'q', label: 'Pertanyaan', type: 'text', required: true, maxLength: 300 },
      { key: 'a', label: 'Jawaban', type: 'textarea', required: true, maxLength: 2000 },
    ],
  },

  {
    id: 'faqs_price',
    label: 'FAQ Harga',
    description: 'Pertanyaan seputar biaya di halaman Harga dan landing page harga.',
    titleField: 'q',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'q', label: 'Pertanyaan', type: 'text', required: true, maxLength: 300 },
      { key: 'a', label: 'Jawaban', type: 'textarea', required: true, maxLength: 2000 },
    ],
  },

  {
    id: 'stats',
    label: 'Angka Sorotan',
    description: 'Empat angka di bawah hero beranda, misalnya jumlah proyek dan standar material.',
    titleField: 'value',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'eyebrow', label: 'Label atas', type: 'text', required: true, maxLength: 60 },
      { key: 'value', label: 'Angka / teks besar', type: 'text', required: true, maxLength: 40 },
      { key: 'note', label: 'Keterangan bawah', type: 'text', maxLength: 120 },
    ],
  },

  {
    id: 'cities',
    label: 'Area Layanan',
    description: 'Kota yang ditonjolkan di halaman Area Layanan dan footer.',
    titleField: 'name',
    allowCreate: true,
    allowDelete: true,
    fields: [
      { key: 'name', label: 'Nama kota', type: 'text', required: true, maxLength: 80 },
      { key: 'region', label: 'Provinsi', type: 'text', required: true, maxLength: 80 },
    ],
  },
  {
    id: 'projects',
    label: 'Proyek Portofolio',
    description:
      'Daftar proyek beserta fotonya. Tampil di halaman Portofolio, halaman detail tiap proyek, galeri di beranda, dan halaman layanan.',
    titleField: 'name',
    allowCreate: true,
    allowDelete: true,
    sensitive:
      'Jangan mencantumkan nama klien, luas area, atau durasi pengerjaan yang tidak tertulis di dokumen resmi perusahaan.',
    fields: [
      { key: 'name', label: 'Nama proyek', type: 'text', required: true, maxLength: 140 },
      {
        key: 'category',
        label: 'Kategori',
        type: 'text',
        required: true,
        hint: 'Contoh: Dapur SPPG, Clean Room, Gudang.',
        maxLength: 60,
      },
      { key: 'city', label: 'Kota', type: 'text', required: true, maxLength: 60 },
      { key: 'buildingType', label: 'Jenis bangunan', type: 'text', maxLength: 120 },
      { key: 'system', label: 'Sistem yang dipakai', type: 'text', maxLength: 120 },
      { key: 'thickness', label: 'Ketebalan', type: 'text', maxLength: 80 },
      {
        key: 'summary',
        label: 'Ringkasan',
        type: 'textarea',
        required: true,
        hint: 'Satu sampai dua kalimat. Tampil di kartu daftar portofolio.',
        maxLength: 400,
      },
      { key: 'scope', label: 'Lingkup pekerjaan', type: 'list', hint: 'Satu poin per baris.' },
      {
        key: 'detail',
        label: 'Penjelasan',
        type: 'list',
        hint: 'Satu paragraf per baris. Tampil di halaman detail proyek.',
      },
      {
        key: 'photos',
        label: 'Foto proyek',
        type: 'photos',
        required: true,
        hint: 'Foto pertama dipakai sebagai gambar utama di kartu dan halaman detail.',
      },
      {
        key: 'hasRealPhoto',
        label: 'Foto asli dokumentasi perusahaan',
        type: 'boolean',
        hint: 'Kosongkan bila foto masih berupa contoh sementara.',
      },
    ],
  },
];

export function collectionDef(id: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}

/** Ubah teks bebas menjadi slug yang aman untuk URL dan kunci basis data. */
export function slugify(input: string, fallback = 'item'): string {
  const s = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || fallback;
}

export type ValidationProblem = { field: string; message: string };

/**
 * Memvalidasi satu item terhadap definisi koleksinya.
 * Mengembalikan data yang sudah dibersihkan, atau daftar masalah.
 */
export function validateItem(
  def: CollectionDef,
  input: Record<string, unknown>,
): { ok: true; data: Record<string, unknown> } | { ok: false; problems: ValidationProblem[] } {
  const problems: ValidationProblem[] = [];
  const data: Record<string, unknown> = {};

  for (const f of def.fields) {
    const raw = input[f.key];

    switch (f.type) {
      case 'text':
      case 'textarea': {
        const v = typeof raw === 'string' ? raw.trim() : '';
        if (f.required && !v) problems.push({ field: f.key, message: `${f.label} wajib diisi.` });
        if (f.maxLength && v.length > f.maxLength) {
          problems.push({ field: f.key, message: `${f.label} maksimal ${f.maxLength} karakter.` });
        }
        data[f.key] = v.slice(0, f.maxLength ?? 5000);
        break;
      }
      case 'number':
      case 'rupiah': {
        if (raw === '' || raw === null || raw === undefined) {
          if (f.required) problems.push({ field: f.key, message: `${f.label} wajib diisi.` });
          data[f.key] = 0;
          break;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) {
          problems.push({ field: f.key, message: `${f.label} harus berupa angka.` });
          data[f.key] = 0;
          break;
        }
        if (f.min !== undefined && n < f.min) {
          problems.push({ field: f.key, message: `${f.label} tidak boleh kurang dari ${f.min}.` });
        }
        if (f.max !== undefined && n > f.max) {
          problems.push({ field: f.key, message: `${f.label} tidak boleh lebih dari ${f.max}.` });
        }
        data[f.key] = n;
        break;
      }
      case 'list': {
        const arr = Array.isArray(raw)
          ? raw.map((x) => String(x).trim()).filter(Boolean)
          : typeof raw === 'string'
            ? raw.split('\n').map((x) => x.trim()).filter(Boolean)
            : [];
        data[f.key] = arr.slice(0, 30);
        break;
      }
      case 'select': {
        const v = typeof raw === 'string' ? raw : '';
        if (f.options && !f.options.includes(v)) {
          if (f.required) {
            problems.push({ field: f.key, message: `${f.label} harus salah satu dari: ${f.options.join(', ')}.` });
          }
          data[f.key] = f.options?.[0] ?? '';
        } else {
          data[f.key] = v;
        }
        break;
      }
      case 'boolean': {
        data[f.key] = Boolean(raw);
        break;
      }
      case 'photos': {
        // Setiap foto wajib punya ukuran (agar tata letak tidak bergeser) dan
        // teks alternatif (dibaca pembaca layar serta mesin pencari).
        const arr = Array.isArray(raw) ? raw : [];
        const clean: Array<Record<string, unknown>> = [];

        arr.slice(0, 12).forEach((item, i) => {
          const o = (item ?? {}) as Record<string, unknown>;
          const src = String(o.src ?? '').trim();
          const alt = String(o.alt ?? '').trim();
          const w = Number(o.width);
          const h = Number(o.height);

          if (!src) return;
          // avif = format hasil konversi otomatis saat unggah; webp/jpg/png
          // tetap diterima karena foto lama masih memakainya.
          if (!/^\/[\w\-./]+\.(avif|webp|jpg|jpeg|png)$/i.test(src)) {
            problems.push({ field: f.key, message: `Foto ke-${i + 1}: alamat berkas tidak sah.` });
            return;
          }
          if (!alt) {
            problems.push({
              field: f.key,
              message: `Foto ke-${i + 1}: teks alternatif wajib diisi.`,
            });
            return;
          }
          if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
            problems.push({ field: f.key, message: `Foto ke-${i + 1}: ukuran gambar tidak diketahui.` });
            return;
          }

          const caption = String(o.caption ?? '').trim();
          clean.push({
            src,
            alt: alt.slice(0, 200),
            width: Math.round(w),
            height: Math.round(h),
            ...(caption ? { caption: caption.slice(0, 300) } : {}),
          });
        });

        if (f.required && clean.length === 0) {
          problems.push({ field: f.key, message: `${f.label} minimal satu foto.` });
        }
        data[f.key] = clean;
        break;
      }
    }
  }

  // Pemeriksaan silang khusus harga: tier lebih besar tidak boleh lebih mahal.
  if (def.id === 'epoxy_systems') {
    const u = Number(data.priceUnder100);
    const o1 = Number(data.priceOver100);
    const o5 = Number(data.priceOver500);
    if (o1 > u) {
      problems.push({
        field: 'priceOver100',
        message: 'Harga di atas 100 m² sebaiknya tidak lebih mahal daripada harga di bawah 100 m².',
      });
    }
    if (o5 > o1) {
      problems.push({
        field: 'priceOver500',
        message: 'Harga di atas 500 m² sebaiknya tidak lebih mahal daripada harga di atas 100 m².',
      });
    }
  }

  return problems.length ? { ok: false, problems } : { ok: true, data };
}
