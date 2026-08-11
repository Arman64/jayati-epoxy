/**
 * Peta bagian ("slot") pada tiap halaman bawaan yang teksnya boleh diubah Owner.
 *
 * Halaman bawaan tetap dirender kode agar struktur, JSON-LD, dan kecepatannya
 * terjaga. Yang dibuka untuk diedit hanyalah teks: teks kecil di atas judul
 * (eyebrow), judul bagian, dan kalimat pengantar — plus gambar pada slot yang
 * memang berisi foto.
 *
 * Nilai `default*` di sini WAJIB sama persis dengan yang tertulis di komponen
 * halaman. Itulah yang tampil bila Owner belum mengubah apa pun, dan yang
 * ditampilkan sebagai placeholder di kolom admin.
 *
 * Tanpa `server-only`: dipakai juga oleh komponen admin di sisi klien.
 */

export type SlotDef = {
  slot: string;
  /** Nama bagian dalam bahasa manusia, tampil di admin. */
  label: string;
  hint?: string;
  defaultEyebrow?: string;
  defaultTitle?: string;
  defaultLead?: string;
  /** Slot ini memuat foto yang bisa diganti. */
  image?: {
    label: string;
    /** Foto bawaan bila Owner belum mengunggah penggantinya. */
    defaultSrc: string;
    defaultAlt: string;
  };
  /** Bagian ini boleh disembunyikan seluruhnya. */
  hidable?: boolean;
};

export type PageSlots = {
  path: string;
  label: string;
  slots: SlotDef[];
};

export const PAGE_SLOTS: PageSlots[] = [
  {
    path: '/',
    label: 'Beranda',
    slots: [
      {
        slot: 'ringkasan',
        label: 'Ringkasan',
        defaultEyebrow: 'Ringkasan',
        defaultTitle: 'Apa itu jasa epoxy lantai?',
      },
      {
        slot: 'layanan-kami',
        label: 'Layanan Kami',
        defaultEyebrow: 'Layanan Kami',
        defaultTitle: 'Solusi konstruksi industri yang kami kerjakan',
        defaultLead: 'Selain epoxy flooring, kami menangani clean room, sandwich panel, ducting HVAC, serta konstruksi dan renovasi industri.',
      },
      {
        slot: 'sistem-harga',
        label: 'Sistem & Harga',
        defaultEyebrow: 'Sistem & Harga',
        defaultTitle: 'Pilihan ketebalan dan harga per meter persegi',
        defaultLead: 'Angka berikut diambil dari pricelist resmi perusahaan. Harga per m² turun seiring bertambahnya luas area.',
      },
      {
        slot: 'portofolio',
        label: 'Portofolio',
        defaultEyebrow: 'Portofolio',
        defaultTitle: 'Dokumentasi proyek terbaru',
      },
      {
        slot: 'mengapa-kami',
        label: 'Mengapa Kami',
        defaultEyebrow: 'Mengapa Kami',
        defaultTitle: '(dari data: `Mengapa memilih ${site.legalName}?`)',
        defaultLead: 'Lima hal yang menjadi komitmen kerja kami, sebagaimana tercantum dalam company profile perusahaan.',
      },
      {
        slot: 'area-layanan',
        label: 'Area Layanan',
        defaultEyebrow: 'Area Layanan',
        defaultTitle: 'Melayani proyek di seluruh Indonesia',
        defaultLead: 'Kantor kami di Kediri, Jawa Timur, dengan proyek tersebar di Jawa Timur, Madura, Jawa Tengah, hingga Jakarta. Untuk lokasi lain, biaya mobilisasi dikonfirmasi terlebih dahulu.',
      },
    ],
  },
  {
    path: '/jasa-epoxy-lantai',
    label: 'Jasa Epoxy Lantai',
    slots: [
      {
        slot: 'jenis-sistem',
        label: 'Jenis Sistem',
        defaultEyebrow: 'Jenis Sistem',
        defaultTitle: 'Sistem epoxy dan penggunaannya',
        defaultLead: 'Pemilihan sistem menentukan biaya sekaligus umur pakai. Sistem terlalu tipis untuk area berat akan cepat aus, sedangkan sistem berlebihan membuat anggaran tidak efisien.',
      },
      {
        slot: 'tahapan-kerja',
        label: 'Tahapan Kerja',
        defaultEyebrow: 'Tahapan Kerja',
        defaultTitle: 'Dari survei sampai serah terima',
      },
      {
        slot: 'portofolio',
        label: 'Portofolio',
        defaultEyebrow: 'Portofolio',
        defaultTitle: 'Contoh proyek yang kami tangani',
      },
      {
        slot: 'area-layanan',
        label: 'Area Layanan',
        defaultEyebrow: 'Area Layanan',
        defaultTitle: 'Kota yang paling sering kami layani',
        defaultLead: 'Layanan tersedia untuk seluruh Indonesia. Untuk luar kota, biaya mobilisasi dikonfirmasi sebelum penawaran.',
      },
      {
        slot: 'minta-penawaran',
        label: 'Minta Penawaran',
        defaultEyebrow: 'Minta Penawaran',
        defaultTitle: 'Kirim detail area Anda',
        defaultLead: 'Isi data berikut agar kami dapat menyiapkan estimasi awal dan menjadwalkan survei.',
      },
    ],
  },
  {
    path: '/harga-epoxy-lantai',
    label: 'Harga Epoxy Lantai',
    slots: [
      {
        slot: 'pricelist-resmi',
        label: 'Pricelist Resmi',
        defaultEyebrow: 'Pricelist Resmi',
        defaultTitle: 'Harga epoxy lantai per m² menurut ketebalan',
        defaultLead: 'Tiga kolom harga di bawah mengikuti luas area yang dikerjakan dalam satu proyek.',
      },
      {
        slot: 'hitung-sendiri',
        label: 'Hitung Sendiri',
        defaultEyebrow: 'Hitung Sendiri',
        defaultTitle: 'Perkirakan anggaran sebelum survei',
        defaultLead: 'Masukkan luas area dan pilih ketebalan yang sesuai. Kalkulator memakai angka pricelist resmi di atas, termasuk penyesuaian tier luas area.',
      },
      {
        slot: 'faktor-harga',
        label: 'Faktor Harga',
        defaultEyebrow: 'Faktor Harga',
        defaultTitle: 'Enam hal yang mengubah angka penawaran',
      },
      {
        slot: 'estimasi-dari-foto',
        label: 'Estimasi dari Foto',
        defaultEyebrow: 'Estimasi dari Foto',
        defaultTitle: 'Kirim foto lantai, terima estimasi awal',
        defaultLead: 'Foto membantu kami menilai kondisi permukaan sehingga estimasi lebih mendekati angka final.',
      },
    ],
  },
  {
    path: '/epoxy-lantai-rumah',
    label: 'Epoxy Lantai Rumah',
    slots: [
      {
        slot: 'hero-foto',
        label: 'Foto utama',
        image: {
          label: 'Foto di samping judul',
          defaultSrc: '/img/proyek/dapur-komersial-self-leveling/3.webp',
          defaultAlt: 'Ruangan dengan lantai epoxy self-leveling putih mengilap tanpa sambungan',
        },
      },
      {
        slot: 'area-di-rumah',
        label: 'Area di Rumah',
        defaultEyebrow: 'Area di Rumah',
        defaultTitle: 'Setiap ruangan punya kebutuhan berbeda',
        defaultLead: 'Menggunakan satu sistem untuk semua ruangan adalah kesalahan umum. Kamar mandi dan garasi menghadapi tantangan yang tidak sama.',
      },
      {
        slot: 'keramik',
        label: 'Keramik',
        defaultEyebrow: 'Keramik',
        defaultTitle: 'Melapisi lantai keramik tanpa dibongkar',
      },
      {
        slot: 'perbandingan',
        label: 'Perbandingan',
        defaultEyebrow: 'Perbandingan',
        defaultTitle: 'Epoxy dibanding keramik untuk area rumah',
      },
      {
        slot: 'estimasi',
        label: 'Estimasi',
        defaultEyebrow: 'Estimasi',
        defaultTitle: 'Perkiraan biaya untuk area rumah',
      },
      {
        slot: 'konsultasi-rumah',
        label: 'Konsultasi Rumah',
        defaultEyebrow: 'Konsultasi Rumah',
        defaultTitle: 'Ceritakan area yang ingin dikerjakan',
        defaultLead: 'Sertakan foto lantai saat ini agar kami dapat menilai kondisi permukaan dan menyarankan sistem yang sesuai.',
      },
    ],
  },
  {
    path: '/epoxy-lantai-industri',
    label: 'Epoxy Lantai Industri',
    slots: [
      {
        slot: 'pemilihan-sistem',
        label: 'Pemilihan Sistem',
        defaultEyebrow: 'Pemilihan Sistem',
        defaultTitle: 'Cocokkan sistem dengan beban dan aktivitas area',
        defaultLead: 'Tabel berikut membantu menyempitkan pilihan sebelum survei. Keputusan akhir tetap memerlukan pemeriksaan kondisi lantai di lokasi.',
      },
      {
        slot: 'persiapan-permukaan',
        label: 'Persiapan Permukaan',
        defaultEyebrow: 'Persiapan Permukaan',
        defaultTitle: 'Tahap yang paling menentukan umur lapisan',
      },
      {
        slot: 'downtime',
        label: 'Downtime',
        defaultEyebrow: 'Downtime',
        defaultTitle: 'Menyusun jadwal tanpa menghentikan produksi',
      },
      {
        slot: 'dokumentasi-b2b',
        label: 'Dokumentasi B2B',
        defaultEyebrow: 'Dokumentasi B2B',
        defaultTitle: 'Contoh proyek industri',
      },
      {
        slot: 'survei-teknis',
        label: 'Survei Teknis',
        defaultEyebrow: 'Survei Teknis',
        defaultTitle: 'Ajukan survei untuk area produksi Anda',
        defaultLead: 'Sertakan informasi jenis beban, bahan kimia yang digunakan, dan jam operasional agar kami dapat menyiapkan rekomendasi yang tepat.',
      },
    ],
  },
  {
    path: '/epoxy-floor-coating',
    label: 'Epoxy Floor Coating',
    slots: [
      {
        slot: 'hero-foto',
        label: 'Foto utama',
        image: {
          label: 'Foto di samping judul',
          defaultSrc: '/img/proyek/clean-room-cold-storage/3.webp',
          defaultAlt: 'Pekerja meratakan lapisan pelapis lantai di ruang berdinding panel',
        },
      },
      {
        slot: 'kapan-tepat',
        label: 'Kapan Tepat',
        defaultEyebrow: 'Kapan Tepat',
        defaultTitle: 'Coating cocok untuk area seperti ini',
      },
      {
        slot: 'kapan-kurang-tepat',
        label: 'Kapan Kurang Tepat',
        defaultEyebrow: 'Kapan Kurang Tepat',
        defaultTitle: 'Sebaiknya naik ke sistem lebih tebal',
      },
      {
        slot: 'harga',
        label: 'Harga',
        defaultEyebrow: 'Harga',
        defaultTitle: 'Rentang biaya epoxy floor coating',
      },
      {
        slot: 'penawaran',
        label: 'Penawaran',
        defaultEyebrow: 'Penawaran',
        defaultTitle: 'Kirim detail area yang akan dilapisi',
      },
    ],
  },
  {
    path: '/portofolio',
    label: 'Portofolio',
    slots: [
      {
        slot: 'daftar-klien',
        label: 'Daftar Klien',
        defaultEyebrow: 'Daftar Klien',
        defaultTitle: '(dari data: `${clientCount} unit telah kami kerjakan`)',
        defaultLead: 'Daftar berikut disalin dari company profile resmi perusahaan, bagian “Our Projects — Cat Epoxy Lantai 2026”.',
      },
    ],
  },
  {
    path: '/area-layanan',
    label: 'Area Layanan',
    slots: [
      {
        slot: 'kota-utama',
        label: 'Kota Utama',
        defaultEyebrow: 'Kota Utama',
        defaultTitle: 'Kota dengan penanganan paling rutin',
      },
    ],
  },
  {
    path: '/tentang-kami',
    label: 'Tentang Kami',
    slots: [
      {
        slot: 'prinsip-kerja',
        label: 'Prinsip Kerja',
        defaultEyebrow: 'Prinsip Kerja',
        defaultTitle: 'Empat hal yang kami pegang di setiap proyek',
        defaultLead: 'Prinsip ini kadang membuat penawaran kami tidak menjadi yang termurah, tetapi menghindarkan klien dari biaya perbaikan berulang.',
      },
      {
        slot: 'cara-kerja',
        label: 'Cara Kerja',
        defaultEyebrow: 'Cara Kerja',
        defaultTitle: 'Alur kerja standar kami',
      },
      {
        slot: 'cakupan',
        label: 'Cakupan',
        defaultEyebrow: 'Cakupan',
        defaultTitle: 'Yang kami kerjakan dan tidak',
      },
    ],
  },
];

export const SLOTS_BY_PATH: Record<string, PageSlots> = Object.fromEntries(
  PAGE_SLOTS.map((p) => [p.path, p]),
);

export function slotsFor(path: string): SlotDef[] {
  return SLOTS_BY_PATH[path]?.slots ?? [];
}

export function slotDef(path: string, slot: string): SlotDef | undefined {
  return slotsFor(path).find((s) => s.slot === slot);
}

/** Teks satu bagian setelah override Owner diterapkan. */
export type SlotCopy = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  body?: string;
  isHidden: boolean;
};

export type CopyMap = Record<string, SlotCopy>;

/**
 * Ambil teks satu bagian. Bila Owner belum mengisinya, kembalikan nilai
 * bawaan yang diberikan pemanggil — sehingga halaman tidak pernah kosong.
 */
export function copyOf(
  map: CopyMap | undefined,
  slot: string,
): { eyebrow?: string; title?: string; lead?: string; body?: string; isHidden: boolean } {
  const c = map?.[slot];
  return {
    eyebrow: c?.eyebrow || undefined,
    title: c?.title || undefined,
    lead: c?.lead || undefined,
    body: c?.body || undefined,
    isHidden: Boolean(c?.isHidden),
  };
}

/**
 * Bentuk props untuk `<SectionHead>` dengan menerapkan override Owner di atas
 * teks bawaan kode. Dipakai halaman bawaan:
 *
 *   <SectionHead {...sh(copy, 'sistem', { eyebrow: 'Sistem', title: '…' })} />
 */
export function sh(
  map: CopyMap | undefined,
  slot: string,
  defaults: { eyebrow?: string; title: string; lead?: string },
): { eyebrow?: string; title: string; lead?: string } {
  const c = map?.[slot];
  return {
    eyebrow: (c?.eyebrow?.trim() || defaults.eyebrow) || undefined,
    title: c?.title?.trim() || defaults.title,
    lead: (c?.lead?.trim() || defaults.lead) || undefined,
  };
}

/** Apakah Owner menyembunyikan bagian ini. */
export function hidden(map: CopyMap | undefined, slot: string): boolean {
  return Boolean(map?.[slot]?.isHidden);
}
