/**
 * Konten terstruktur.
 *
 * SUMBER DATA: "COMPANY PROFILE - SEMESTA BUMI JAYATI" (PDF resmi perusahaan,
 * diterima Owner 11 Agustus 2026):
 *   · hal. 2  — daftar layanan & positioning
 *   · hal. 4  — 5 alasan memilih (termasuk klaim garansi resmi)
 *   · hal. 6  — spesifikasi umum epoxy (1.000–9.000 micron, material ISO 9001)
 *   · hal. 7  — jenis Self-Leveling & PU Crete + peruntukan
 *   · hal. 8  — sandwich panel / clean room (50–150 mm)
 *   · hal. 9  — ducting & HVAC
 *   · hal. 10 — jasa repaint
 *   · hal. 11 — Pricelist Epoxy resmi (dipakai apa adanya di bawah)
 *   · hal. 12 — daftar proyek "Cat Epoxy Lantai 2026"
 *
 * Setiap angka di file ini dapat dilacak ke halaman company profile di atas.
 * `unverified: true` hanya dipakai untuk klaim yang TIDAK ada di company profile.
 */

export type EpoxySystem = {
  slug: string;
  name: string;
  /** Ketebalan sesuai kolom "KETEBALAN CAT" pricelist company profile hal. 11 */
  micron: number;
  thicknessLabel: string;
  /** Keluarga material: Self-Leveling (1.000–2.000 µ) atau PU Crete (3.000–9.000 µ) */
  family: 'Self Leveling' | 'PU Crete';
  bestFor: string;
  /** Rp/m² — pricelist resmi hal. 11. Tiga tier berdasarkan luas area. */
  priceUnder100: number;
  priceOver100: number;
  priceOver500: number;
  highlights: string[];
  /** false = angka bersumber langsung dari pricelist resmi perusahaan */
  unverified: boolean;
};

/**
 * PRICELIST RESMI — Company Profile hal. 11 ("Pricelist Epoxy").
 * Kolom: HARGA < 100 m2 | HARGA > 100 m2 | HARGA > 500 m2 (Rp/meter²).
 * Angka disalin persis, tidak diinterpolasi.
 */
export const epoxySystems: EpoxySystem[] = [
  {
    slug: 'self-leveling-1000-micron',
    name: 'Epoxy Self-Leveling 1.000 micron',
    micron: 1000,
    thicknessLabel: '1.000 micron (± 1 mm)',
    family: 'Self Leveling',
    bestFor: 'Dapur komersial SPPG, perkantoran, ruang serbaguna dengan lalu lintas ringan–sedang',
    priceUnder100: 190000,
    priceOver100: 170000,
    priceOver500: 150000,
    highlights: [
      'Meratakan diri sehingga menutup pori dan celah kecil',
      'Tanpa bekas rol, permukaan halus dan mengilap',
      'Tanpa sambungan sehingga mudah dibersihkan',
    ],
    unverified: false,
  },
  {
    slug: 'self-leveling-2000-micron',
    name: 'Epoxy Self-Leveling 2.000 micron',
    micron: 2000,
    thicknessLabel: '2.000 micron (± 2 mm)',
    family: 'Self Leveling',
    bestFor: 'Rumah sakit, laboratorium, fasilitas farmasi, dan lapangan olahraga',
    priceUnder100: 260000,
    priceOver100: 240000,
    priceOver500: 220000,
    highlights: [
      'Lapisan lebih tebal untuk beban dan lalu lintas lebih tinggi',
      'Permukaan monolitik tanpa nat, mendukung standar higienitas',
      'Tampilan akhir rata dan mengilap',
    ],
    unverified: false,
  },
  {
    slug: 'pu-crete-3000-micron',
    name: 'PU Crete 3.000 micron',
    micron: 3000,
    thicknessLabel: '3.000 micron (± 3 mm)',
    family: 'PU Crete',
    bestFor: 'Area produksi makanan dan dapur basah yang sering dicuci',
    priceUnder100: 310000,
    priceOver100: 280000,
    priceOver500: 250000,
    highlights: [
      'Resin poliuretan + agregat semen, tahan kondisi ekstrem',
      'Tahan paparan air panas dan pencucian rutin',
      'Meredam muai-susut beton sehingga risiko retak lebih kecil',
    ],
    unverified: false,
  },
  {
    slug: 'pu-crete-4000-micron',
    name: 'PU Crete 4.000 micron',
    micron: 4000,
    thicknessLabel: '4.000 micron (± 4 mm)',
    family: 'PU Crete',
    bestFor: 'Pabrik dan pergudangan dengan lalu lintas forklift harian',
    priceUnder100: 370000,
    priceOver100: 340000,
    priceOver500: 310000,
    highlights: [
      'Ketahanan abrasi tinggi untuk lalu lintas roda keras',
      'Tahan suhu panas maupun area dingin',
      'Cocok dikombinasikan dengan coving/curving tepi dinding',
    ],
    unverified: false,
  },
  {
    slug: 'pu-crete-6000-micron',
    name: 'PU Crete 6.000 micron',
    micron: 6000,
    thicknessLabel: '6.000 micron (± 6 mm)',
    family: 'PU Crete',
    bestFor: 'Industri kimia dan area produksi dengan beban kerja berat',
    priceUnder100: 610000,
    priceOver100: 580000,
    priceOver500: 550000,
    highlights: [
      'Sistem heavy duty untuk beban tekan dan benturan tinggi',
      'Tahan tumpahan bahan kimia sesuai datasheet material',
      'Permukaan tetap higienis dan mudah disanitasi',
    ],
    unverified: false,
  },
  {
    slug: 'pu-crete-8000-micron',
    name: 'PU Crete 8.000 micron',
    micron: 8000,
    thicknessLabel: '8.000 micron (± 8 mm)',
    family: 'PU Crete',
    bestFor: 'Area freezer, cold storage, dan zona thermal shock',
    priceUnder100: 780000,
    priceOver100: 740000,
    priceOver500: 700000,
    highlights: [
      'Menahan perubahan suhu ekstrem termasuk area freezer',
      'Tahan paparan air mendidih pada proses pencucian',
      'Umur pakai panjang pada kondisi operasional berat',
    ],
    unverified: false,
  },
  {
    slug: 'pu-crete-9000-micron',
    name: 'PU Crete 9.000 micron',
    micron: 9000,
    thicknessLabel: '9.000 micron (± 9 mm)',
    family: 'PU Crete',
    bestFor: 'Kondisi paling ekstrem: beban dinamis berat dan thermal shock berulang',
    priceUnder100: 930000,
    priceOver100: 890000,
    priceOver500: 850000,
    highlights: [
      'Ketebalan maksimum dalam rentang layanan kami',
      'Spesifikasi untuk area dengan tuntutan ketahanan tertinggi',
      'Dipilih setelah evaluasi beban nyata di lokasi',
    ],
    unverified: false,
  },
];

/** Pekerjaan tepi/coving — pricelist hal. 11, satuan meter lari. */
export const curvingPrice = {
  label: 'Curving (coving) max 8 cm',
  unit: 'meter lari',
  under100: 50000,
  over100: 40000,
  over500: 30000,
  unverified: false,
};

/** Tier harga pricelist resmi. */
export const priceTiers = [
  { key: 'under100', label: '< 100 m²', note: 'Area kecil' },
  { key: 'over100', label: '> 100 m²', note: 'Area menengah' },
  { key: 'over500', label: '> 500 m²', note: 'Area besar' },
] as const;

/** Layanan non-epoxy sesuai company profile hal. 2, 8, 9, 10. */
export const otherServices = [
  {
    name: 'Clean Room & Sandwich Panel',
    body: 'Panel dinding dan plafon berinsulasi untuk clean room, cold room, serta sistem ceiling & wall. Pilihan ketebalan panel 50 mm, 75 mm, 100 mm, hingga 150 mm sesuai kebutuhan isolasi termal dan standar kebersihan.',
    points: ['Clean Room', 'Cold Room', 'Insulated Panel', 'Ceiling & Wall System'],
  },
  {
    name: 'HVAC & Ducting',
    body: 'Fabrikasi dan instalasi ducting menggunakan Galvanized Steel (GI), Stainless Steel (SS), atau Aluminium. Setiap pekerjaan disertai Leakage Test untuk memastikan sistem bekerja optimal.',
    points: ['Supply Air / Fresh Air System', 'Exhaust System', 'Kitchen Exhaust', 'Leakage Test', 'Air Distribution'],
  },
  {
    name: 'Konstruksi & Renovasi Industri',
    body: 'Pekerjaan pendukung fasilitas industri mulai dari partisi, finishing interior, renovasi area produksi, hingga pekerjaan sipil pendukung.',
    points: ['Partisi', 'Finishing Interior', 'Renovasi Area Produksi', 'Pekerjaan Sipil Pendukung'],
  },
  {
    name: 'Repaint Epoxy Lantai',
    body: 'Pembaruan lapisan epoxy pada lantai yang telah kusam, tergores, atau menurun kualitasnya. Proses meliputi persiapan permukaan, perbaikan area rusak, dan aplikasi ulang epoxy.',
    points: ['Persiapan permukaan', 'Perbaikan area rusak', 'Aplikasi ulang epoxy'],
  },
];

export type Service = {
  slug: string;
  title: string;
  short: string;
  icon: 'home' | 'factory' | 'shield' | 'layers' | 'droplet' | 'ruler';
  href?: string;
};

export const coreServices: Service[] = [
  { slug: 'epoxy-lantai-industri', title: 'Epoxy Lantai Industri', short: 'Pabrik, pergudangan, industri kimia, dan area produksi beban berat.', icon: 'factory' },
  { slug: 'epoxy-floor-coating', title: 'Epoxy Floor Coating', short: 'Pelapisan lantai beton untuk area komersial dan produksi.', icon: 'layers' },
  { slug: 'epoxy-lantai-rumah', title: 'Epoxy Lantai Rumah', short: 'Garasi, carport, dapur, dan area hunian yang menuntut lantai mudah dibersihkan.', icon: 'home' },
  { slug: 'clean-room', title: 'Clean Room & Sandwich Panel', short: 'Panel berinsulasi 50–150 mm untuk clean room dan cold room.', icon: 'shield', href: '/blog/clean-room-sandwich-panel' },
  { slug: 'ducting-hvac', title: 'Ducting & HVAC', short: 'Fabrikasi dan instalasi ducting GI, SS, atau Aluminium dengan leakage test.', icon: 'droplet', href: '/blog/ducting-hvac' },
  { slug: 'repaint-epoxy', title: 'Repaint & Floor Repair', short: 'Pembaruan lapisan epoxy yang kusam, tergores, atau menurun kualitasnya.', icon: 'ruler', href: '/blog/repaint-floor-repair' },
];

export type ProjectPhoto = {
  /** Path relatif di /public */
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export type Project = {
  slug: string;
  name: string;
  category: string;
  city: string;
  buildingType: string;
  system: string;
  thickness: string;
  summary: string;
  scope: string[];
  detail: string[];
  photos: ProjectPhoto[];
  /** Foto asli dokumentasi perusahaan yang dikirim Owner. */
  hasRealPhoto: boolean;
};

/**
 * PORTOFOLIO — foto asli dokumentasi CV Semesta Bumi Jayati (dikirim Owner
 * 11 Agustus 2026) dan nama proyek dari company profile hal. 12
 * ("Our Projects — Cat Epoxy Lantai 2026").
 *
 * Catatan editorial: luas area dan durasi TIDAK dicantumkan karena angka
 * tersebut tidak ada di company profile. Yang ditampilkan hanya yang dapat
 * diverifikasi dari foto dan dokumen resmi.
 */
export const projects: Project[] = [
  {
    slug: 'sppg-sugihwaras-ngluyu',
    name: 'Dapur SPPG Sugihwaras, Ngluyu — Nganjuk',
    category: 'Dapur SPPG',
    city: 'Nganjuk',
    buildingType: 'Dapur Satuan Pelayanan Pemenuhan Gizi (SPPG)',
    system: 'Epoxy lantai dapur komersial',
    thickness: 'Sesuai kebutuhan area dapur',
    summary:
      'Pelapisan lantai dapur SPPG dengan finish biru, marka jalur kuning, dan penandaan nama unit langsung pada permukaan lantai.',
    scope: [
      'Persiapan dan perataan permukaan lantai beton',
      'Aplikasi epoxy warna biru pada seluruh area dapur',
      'Marka garis kuning sebagai pembagi zona kerja',
      'Penandaan identitas unit "SPPG - Sugihwaras Ngluyu" pada lantai',
      'Coving tepi dinding agar sudut mudah dibersihkan',
    ],
    detail: [
      'Dapur SPPG menuntut permukaan lantai yang menyatu tanpa nat sehingga sisa makanan dan air tidak mengendap di celah. Lapisan epoxy dituang merata hingga ke tepi dinding.',
      'Marka kuning dipasang untuk memisahkan jalur lalu lintas petugas dari area pengolahan, mengikuti kebutuhan alur kerja dapur pemenuhan gizi.',
      'Identitas unit ditulis langsung pada lapisan lantai sebagai penanda permanen yang tidak mudah terkelupas saat pembersihan rutin.',
    ],
    photos: [
      { src: '/img/proyek/sppg-sugihwaras-ngluyu/hero.webp', width: 1600, height: 1200, alt: 'Lantai epoxy biru dapur SPPG Sugihwaras Ngluyu dengan tulisan nama unit dan marka kuning', caption: 'Area dapur setelah pelapisan epoxy dan penandaan unit.' },
      { src: '/img/proyek/sppg-sugihwaras-ngluyu/2.webp', width: 1600, height: 1200, alt: 'Detail tulisan SPPG Sugihwaras Ngluyu pada lantai epoxy biru', caption: 'Penandaan identitas unit langsung pada lapisan lantai.' },
      { src: '/img/proyek/sppg-sugihwaras-ngluyu/3.webp', width: 1600, height: 902, alt: 'Lantai epoxy biru dapur SPPG dengan rak stainless di atasnya', caption: 'Area penempatan peralatan dapur setelah lantai selesai.' },
      { src: '/img/proyek/sppg-sugihwaras-ngluyu/4.webp', width: 1600, height: 902, alt: 'Area kompor dan meja stainless di atas lantai epoxy biru dapur SPPG', caption: 'Zona memasak dengan lantai epoxy yang mudah dibersihkan.' },
    ],
    hasRealPhoto: true,
  },
  {
    slug: 'sppg-gbranggahan-ngadiluwih',
    name: 'Dapur SPPG Gbranggahan 2, Ngadiluwih — Kediri',
    category: 'Dapur SPPG',
    city: 'Kediri',
    buildingType: 'Dapur Satuan Pelayanan Pemenuhan Gizi (SPPG)',
    system: 'Epoxy lantai dapur komersial',
    thickness: 'Sesuai kebutuhan area dapur',
    summary:
      'Pengerjaan lantai epoxy dapur SPPG di wilayah operasional kantor pusat, dengan finish biru dan penandaan unit pada lantai.',
    scope: [
      'Pembersihan dan persiapan dasar lantai',
      'Aplikasi epoxy biru pada area dapur dan sirkulasi',
      'Penandaan "SPPG Gbranggahan 2 Ngadiluwih" pada lantai',
      'Perapian sudut pertemuan lantai dan dinding',
    ],
    detail: [
      'Proyek ini berada di Kabupaten Kediri, wilayah yang sama dengan kantor manajemen perusahaan, sehingga pengawasan pekerjaan dapat dilakukan intensif.',
      'Permukaan biru dipilih agar kotoran dan sisa bahan makanan mudah terlihat, mendukung kontrol kebersihan harian di dapur pemenuhan gizi.',
      'Tepi dinding dirapikan agar tidak ada sudut siku tajam yang menyulitkan pembersihan.',
    ],
    photos: [
      { src: '/img/proyek/sppg-gbranggahan-ngadiluwih/hero.webp', width: 1200, height: 1600, alt: 'Tulisan SPPG Gbranggahan 2 Ngadiluwih pada lantai epoxy biru', caption: 'Penandaan unit pada lantai dapur SPPG Gbranggahan 2.' },
      { src: '/img/proyek/sppg-gbranggahan-ngadiluwih/2.webp', width: 1600, height: 900, alt: 'Ruang dapur SPPG dengan lantai dan dinding bawah berlapis epoxy biru', caption: 'Lantai dan plint dinding dilapisi dalam satu sistem.' },
      { src: '/img/proyek/sppg-gbranggahan-ngadiluwih/3.webp', width: 1600, height: 900, alt: 'Lantai epoxy biru mengilap dengan tepi dinding yang telah dicoving', caption: 'Permukaan mengilap hasil aplikasi self-leveling.' },
      { src: '/img/proyek/sppg-gbranggahan-ngadiluwih/4.webp', width: 720, height: 1280, alt: 'Detail sudut lantai epoxy biru dapur SPPG', caption: 'Detail sudut pertemuan bidang lantai.' },
    ],
    hasRealPhoto: true,
  },
  {
    slug: 'dapur-sppg-pu-crete',
    name: 'Dapur Produksi Area Basah',
    category: 'Dapur Komersial',
    city: 'Jawa Timur',
    buildingType: 'Dapur produksi / pengolahan makanan',
    system: 'Epoxy lantai area basah',
    thickness: 'Menyesuaikan beban dan paparan air',
    summary:
      'Pekerjaan lantai dapur produksi berukuran besar dengan area cuci, jalur drainase, dan marka pembagi zona.',
    scope: [
      'Aplikasi lapisan epoxy pada area pengolahan dan pencucian',
      'Pembentukan kemiringan menuju saluran drainase',
      'Marka kuning pembagi jalur kerja',
      'Coving tepi dinding di seluruh keliling ruangan',
    ],
    detail: [
      'Area dapur produksi menerima paparan air dan pencucian rutin, sehingga permukaan lantai dibuat rapat dan tidak menyerap.',
      'Jalur drainase diperhatikan agar air mengalir ke saluran dan tidak menggenang di area kerja.',
      'Marka kuning memisahkan jalur petugas dari zona peralatan, sekaligus meningkatkan keselamatan kerja di ruangan yang sering basah.',
    ],
    photos: [
      { src: '/img/proyek/dapur-sppg-pu-crete/hero.webp', width: 1600, height: 1200, alt: 'Ruang dapur produksi luas dengan lantai epoxy biru mengilap', caption: 'Area dapur produksi setelah pelapisan selesai.' },
      { src: '/img/proyek/dapur-sppg-pu-crete/2.webp', width: 1200, height: 1600, alt: 'Lantai epoxy biru dapur produksi dengan kolom dan dinding berlapis', caption: 'Lantai dan kolom dilapisi dalam satu kesatuan.' },
      { src: '/img/proyek/dapur-sppg-pu-crete/3.webp', width: 864, height: 1536, alt: 'Marka kuning di tepi lantai epoxy area dapur produksi', caption: 'Marka kuning sebagai pembatas zona kerja.' },
      { src: '/img/proyek/dapur-sppg-pu-crete/4.webp', width: 1200, height: 1600, alt: 'Pekerja menyelesaikan aplikasi epoxy di dapur produksi dengan marka kuning', caption: 'Proses aplikasi lapisan oleh tim di lokasi.' },
      { src: '/img/proyek/dapur-sppg-pu-crete/5.webp', width: 1200, height: 1600, alt: 'Lantai epoxy hijau kebiruan pada area cuci dapur produksi', caption: 'Area basah dengan permukaan rapat anti-serap.' },
    ],
    hasRealPhoto: true,
  },
  {
    slug: 'dapur-komersial-self-leveling',
    name: 'Ruang Produksi Higienis',
    category: 'Fasilitas Higienis',
    city: 'Jawa Timur',
    buildingType: 'Ruang produksi / koridor fasilitas higienis',
    system: 'Epoxy Self-Leveling',
    thickness: '1.000–2.000 micron',
    summary:
      'Pelapisan self-leveling warna terang pada ruang produksi dan koridor, dengan marka jalur dan penutup saluran.',
    scope: [
      'Grinding dan persiapan permukaan beton',
      'Aplikasi epoxy self-leveling warna terang',
      'Marka jalur kuning di kedua sisi saluran',
      'Finishing tepi dan pertemuan dinding',
    ],
    detail: [
      'Warna terang dipilih agar ruangan terlihat lebih bersih dan kotoran mudah terdeteksi, sesuai kebutuhan fasilitas dengan standar higienitas tinggi.',
      'Sistem self-leveling menghasilkan permukaan yang meratakan diri sehingga menutup pori dan celah kecil tanpa meninggalkan bekas rol.',
      'Marka kuning dipasang mengapit saluran lantai sebagai penanda visual bagi petugas.',
    ],
    photos: [
      { src: '/img/proyek/dapur-komersial-self-leveling/hero.webp', width: 1200, height: 1600, alt: 'Ruang produksi dengan lantai epoxy self-leveling warna terang yang mengilap', caption: 'Permukaan self-leveling tanpa sambungan.' },
      { src: '/img/proyek/dapur-komersial-self-leveling/2.webp', width: 900, height: 1600, alt: 'Lantai epoxy putih dengan marka kuning mengapit saluran drainase', caption: 'Marka jalur di kedua sisi saluran lantai.' },
      { src: '/img/proyek/dapur-komersial-self-leveling/3.webp', width: 1200, height: 1600, alt: 'Ruang kosong dengan lantai epoxy putih mengilap sebelum peralatan dipasang', caption: 'Kondisi ruangan sebelum peralatan masuk.' },
      { src: '/img/proyek/dapur-komersial-self-leveling/4.webp', width: 1200, height: 1600, alt: 'Koridor panjang dengan lantai epoxy warna terang dan dinding panel', caption: 'Koridor penghubung antar ruang produksi.' },
    ],
    hasRealPhoto: true,
  },
  {
    slug: 'clean-room-cold-storage',
    name: 'Clean Room & Cold Storage',
    category: 'Clean Room',
    city: 'Jawa Timur',
    buildingType: 'Clean room / cold storage berdinding sandwich panel',
    system: 'Screed lantai + sistem sandwich panel',
    thickness: 'Sesuai spesifikasi ruang bersih',
    summary:
      'Pengerjaan lantai ruang bersih berdinding sandwich panel, mulai dari screed dasar hingga finishing permukaan.',
    scope: [
      'Pemasangan dinding dan plafon sandwich panel',
      'Pekerjaan screed lantai oleh tim aplikator',
      'Pembentukan coving pada pertemuan lantai dan panel',
      'Finishing permukaan siap operasional',
    ],
    detail: [
      'Ruang bersih memerlukan pertemuan lantai dan dinding yang melengkung (coving) agar tidak ada sudut mati tempat kotoran menumpuk.',
      'Pekerjaan screed dilakukan bertahap oleh tim dengan perlengkapan kebersihan, karena area harus tetap bebas kontaminasi selama proses.',
      'Dinding dan plafon menggunakan sandwich panel berinsulasi yang permukaannya rata, mudah dibersihkan, dan tahan korosi.',
    ],
    photos: [
      { src: '/img/proyek/clean-room-cold-storage/hero.webp', width: 1200, height: 1600, alt: 'Ruang bersih berdinding sandwich panel putih dengan lantai epoxy terang', caption: 'Ruang bersih setelah lantai dan panel selesai.' },
      { src: '/img/proyek/clean-room-cold-storage/2.webp', width: 1200, height: 1600, alt: 'Dua pekerja mengaplikasikan screed lantai di dalam ruang bersih', caption: 'Proses pengerjaan screed lantai oleh tim.' },
      { src: '/img/proyek/clean-room-cold-storage/3.webp', width: 1200, height: 1600, alt: 'Pekerja meratakan lapisan screed abu-abu di ruang berdinding panel', caption: 'Perataan lapisan dasar sebelum finishing.' },
      { src: '/img/proyek/clean-room-cold-storage/4.webp', width: 1200, height: 1600, alt: 'Tim aplikator menyelesaikan lantai ruang bersih dengan alat trowel', caption: 'Pengerjaan detail pada area tepi ruangan.' },
      { src: '/img/proyek/clean-room-cold-storage/5.webp', width: 1200, height: 1600, alt: 'Ruang cold storage dengan lantai screed abu-abu yang telah selesai', caption: 'Area cold storage siap tahap berikutnya.' },
      { src: '/img/proyek/clean-room-cold-storage/6.webp', width: 900, height: 1600, alt: 'Koridor ruang bersih dengan lantai terang dan dinding sandwich panel', caption: 'Koridor dengan sistem panel dinding penuh.' },
    ],
    hasRealPhoto: true,
  },
];

/**
 * DAFTAR KLIEN — Company Profile hal. 12 ("Our Projects — Cat Epoxy Lantai 2026").
 * Nama disalin persis dari dokumen resmi perusahaan.
 */
export type ClientGroup = { category: string; note: string; clients: string[] };

export const clientGroups: ClientGroup[] = [
  {
    category: 'Dapur SPPG — Jawa Timur & Madura',
    note: 'Satuan Pelayanan Pemenuhan Gizi di Kediri, Nganjuk, Sampang, dan Pamekasan.',
    clients: [
      'SPPG Ngadiluwih Kediri',
      'SPPG Ngluyu Nganjuk',
      'SPPG Torjun Sampang',
      'SPPG Komis Sampang',
      'SPPG Tanggumong Sampang',
      'SPPG Tambelangan Sampang',
      'SPPG Dalpenang Sampang',
      'SPPG Peltong Pamekasan',
      'SPPG Palengaan Pamekasan',
      'SPPG Kangenan Pamekasan',
      'SPPG Pademawu Pamekasan',
    ],
  },
  {
    category: 'Dapur SPPG — Jawa Tengah (Yayasan & Pesantren)',
    note: 'Dapur pemenuhan gizi pada yayasan dan pondok pesantren di berbagai kabupaten Jawa Tengah.',
    clients: [
      'Yayasan Binaul Akram Wonosobo',
      'Yayasan PP Al Amin Wonosobo',
      'Yayasan Nurul Qur’an Wonosobo',
      'Yayasan Ma’had Al Mubarok Manggisa Wonosobo',
      'Ponpes Fathul Muin Ali Masykur Wonosobo',
      'Yayasan Bahrul Ulum Pati',
      'Yayasan Ya Fatimah Tayu Pati',
      'Yayasan Sirojul Munir Giling Pati',
      'Yayasan Al Hamidiyah Bulumanis Pati',
      'Yayasan Pendidikan Islam Manahijul Pati',
      'Al Huda Mlagen Rembang',
      'Yayasan Maslakul Huda Rembang',
      'Yayasan PP Abdurrahman Kragan Rembang',
      'Yayasan Nahjatus Sholihin Rembang',
      'PPAL Hidayah Tegal',
      'Yayasan Al Mahbub PP Al Adalah Tegal',
      'Yayasan Ell Firdaus Cilacap',
      'Yayasan Haji Abdullah Yaqub Mansur Cilacap',
      'Yayasan Haji Ilyas Hasan Cilacap',
      'Salafiyah Syarbin Hasan Cilacap',
      'Yayasan Nurul Huda Kawunganten Cilacap',
      'PP Bustanul Ulum Brebes',
      'Yayasan Al Fattah Tegalgandu Brebes',
      'Yayasan Al Masykur Semarang',
      'Yayasan Darussalam Bergas Semarang',
      'Yayasan Ahmad Tamin Said Semarang',
      'Yayasan Wakaf Literasi Islam Semarang',
      'Yayasan Pend. Islam & Sosial Al Mustawa Blora',
      'Yayasan PP Roudhotut Tholobien Bangle Sragen',
      'Yayasan Nurul Hikmah Sambungmacan Sragen',
      'Yayasan Mahyajatul Qurro Sragen',
      'Yayasan PP Imam Ruba’i Sragen',
      'Yayasan Baitussalam Kradenan 1 Grobogan',
      'Yayasan Baitussalam Kradenan 3 Grobogan',
      'Yayasan Baitussalam Kradenan 4 Grobogan',
      'Yayasan Darul Qur’an Al Alif Setro Grobogan',
      'Yayasan Darul Qur’an Al Alif Jeketro Grobogan',
      'Yayasan Pend. Islam Nurul Huda Grobogan',
      'Perkumpulan PP Matholiul Anwar Grobogan',
      'Yayasan Manbaul Anwar Nurul Barokah 2 Kudus',
      'Yayasan Darussalam 1969 Kudus',
      'Yayasan Pesantren Ikhlasul Murtaho 2 Wonogiri',
      'Yayasan Darussalam Istiqomah Purbalingga',
      'PP An Nahl El Qosimi 1 Purbalingga',
      'PP Nahjul Hidayah Darussalam Pekalongan',
      'Yayasan PP Ayo Ngaji Kedungkebo Pekalongan',
      'Perkumpulan PP Salaf & Modern Masyithoh Boyolali',
      'Yayasan Al Muttaqin Ngroto Boyolali',
      'Yayasan PP Al Hikmah Krajan Boyolali',
      'Yayasan Miftahul Huda Rawalo Banyumas',
      'Nurul Iman Rawalo Banyumas',
      'Yayasan Sabilul Hidayatur Rohman Banyumas',
      'Yayasan Kader Santri Yaksa Banyumas',
      'Yayasan Al Ponpes Al Masda Banyumas',
      'Yayasan Roudlotut Tholibin Banjarnegara',
      'Yayasan PP Darussalam Plaosan Purworejo',
      'Yayasan PP Hidayatul Mubtadiin Grogol Purworejo',
      'Yayasan Maarif NU Bener Purworejo',
      'Yayasan Pesantren Assholihaat 1 Magelang',
      'Yayasan Api Nailul Muna Magelang',
      'Yayasan Subbanul Wathon 3 Magelang',
      'Ponpes Assalam Tempuran Magelang',
      'Yayasan Al Irsyad Almubarok Demak',
      'Yayasan Miftahul Falah Balong Jepara',
      'Yayasan Haji San Ahmad Kebumen',
      'Yayasan Al Hidayah Prapak Temanggung',
    ],
  },
  {
    category: 'Lapangan Olahraga',
    note: 'Pelapisan lantai lapangan olahraga indoor.',
    clients: ['Backspin Lapangan Padel DKI Jakarta'],
  },
];

export const clientCount = clientGroups.reduce((n, g) => n + g.clients.length, 0);

export type Faq = { q: string; a: string };

export const generalFaqs: Faq[] = [
  {
    q: 'Berapa lama pengerjaan epoxy lantai?',
    a: 'Untuk area di bawah 100 m² umumnya 2–3 hari kerja, sedangkan area 1.000 m² ke atas biasanya 5–10 hari kerja. Durasi dipengaruhi kondisi dasar lantai, sistem epoxy yang dipilih, cuaca, dan apakah area dapat dikosongkan penuh. Jadwal pasti diberikan setelah survei.',
  },
  {
    q: 'Apakah lantai keramik bisa dilapisi epoxy?',
    a: 'Bisa, dengan syarat keramik masih menempel kuat pada dasar lantai dan tidak ada rembesan air dari bawah. Permukaan keramik perlu diasarkan lebih dahulu dan menggunakan primer khusus untuk permukaan non-porous. Keramik yang sudah popping atau kopong sebaiknya dibongkar.',
  },
  {
    q: 'Apakah Semesta Bumi Jayati menjual material epoxy?',
    a: 'Fokus layanan kami adalah jasa aplikasi epoxy lantai, bukan penjualan material eceran. Material yang digunakan diproduksi dengan standar ISO 9001 dan disesuaikan dengan kebutuhan proyek serta datasheet pabrikan.',
  },
  {
    q: 'Berapa lama lantai bisa dipakai setelah pengerjaan?',
    a: 'Sebagai acuan umum, lantai dapat dilalui pejalan kaki sekitar 24 jam setelah lapisan akhir, kendaraan ringan sekitar 3 hari, dan beban berat setelah proses curing penuh sekitar 7 hari. Angka pasti mengikuti datasheet material dan suhu lokasi.',
  },
  {
    q: 'Apakah tersedia garansi pekerjaan?',
    a: 'Ya. Kami menjaga kualitas produk dan layanan sehingga hasil pekerjaan bergaransi resmi. Rincian masa serta cakupan garansi dicantumkan tertulis pada surat penawaran, bukan dijanjikan secara lisan, karena bergantung pada jenis sistem, kondisi dasar lantai, dan pola penggunaan area.',
  },
  {
    q: 'Apakah bisa dikerjakan malam hari atau saat operasional berjalan?',
    a: 'Bisa, dan cukup umum untuk pabrik atau gudang yang tidak dapat berhenti. Pekerjaan dibagi per zona atau dijadwalkan di luar jam operasional. Skema ini memengaruhi durasi dan biaya, sehingga dihitung terpisah saat survei.',
  },
];

export const priceFaqs: Faq[] = [
  {
    q: 'Berapa harga epoxy lantai per m2?',
    a: 'Pricelist resmi kami berkisar Rp150.000 hingga Rp930.000 per m². Self-Leveling 1.000 micron berada di ujung terendah, sedangkan PU Crete 9.000 micron di ujung tertinggi. Harga juga turun bertahap untuk area di atas 100 m² dan di atas 500 m².',
  },
  {
    q: 'Apa saja yang memengaruhi harga epoxy lantai?',
    a: 'Faktor utamanya adalah ketebalan lapisan (1.000–9.000 micron), jenis sistem (Self-Leveling atau PU Crete), dan luas area yang menentukan tier harga. Di luar itu ada kondisi dasar lantai, kebutuhan curving, serta jarak lokasi yang memengaruhi biaya mobilisasi.',
  },
  {
    q: 'Kenapa harga per m² lebih mahal untuk area kecil?',
    a: 'Biaya mobilisasi mesin, genset, dan tim relatif tetap berapa pun luas yang dikerjakan. Pada area di bawah 100 m² biaya tersebut ditanggung sedikit meter persegi sehingga harga satuan lebih tinggi. Di atas 100 m² dan 500 m², harga per m² turun sesuai pricelist.',
  },
  {
    q: 'Apakah harga sudah termasuk persiapan lantai?',
    a: 'Penawaran kami mencantumkan secara terpisah item persiapan permukaan, perbaikan retak, primer, lapisan utama, dan topcoat, sehingga terlihat jelas apa yang termasuk dan tidak.',
  },
];

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  reviewer: string;
  published: string;
  modified: string;
  readMinutes: number;
  intro: string;
  sections: { h2: string; body: string[]; list?: string[] }[];
  faqs?: Faq[];
};

export const posts: Post[] = [
  {
    slug: 'cara-menghitung-kebutuhan-epoxy-lantai',
    title: 'Cara Menghitung Kebutuhan dan Estimasi Biaya Epoxy Lantai',
    description:
      'Panduan menghitung luas area, memilih sistem epoxy, dan menyusun estimasi biaya awal sebelum survei kontraktor.',
    category: 'Harga & Perhitungan',
    author: 'Tim Teknis Jayati Epoxy',
    reviewer: 'Supervisor Proyek',
    published: '2026-07-14',
    modified: '2026-08-05',
    readMinutes: 7,
    intro:
      'Estimasi biaya epoxy lantai dihitung dari luas area dikalikan harga sistem per m², ditambah biaya persiapan permukaan dan perbaikan. Perhitungan mandiri berguna untuk menyiapkan anggaran, tetapi angka final tetap ditentukan setelah kondisi lantai diperiksa langsung.',
    sections: [
      {
        h2: 'Langkah 1: ukur luas area dengan benar',
        body: [
          'Ukur panjang dikali lebar untuk setiap bidang, lalu jumlahkan. Untuk ruang berbentuk tidak beraturan, pecah menjadi beberapa persegi panjang agar lebih akurat.',
          'Kurangi area yang tidak dilapisi seperti pondasi mesin atau kolom, dan tambahkan area naik seperti plint atau coving bila diperlukan.',
        ],
      },
      {
        h2: 'Langkah 2: tentukan sistem yang sesuai penggunaan',
        body: [
          'Sistem yang berlebihan membuat biaya membengkak, sedangkan sistem yang terlalu tipis membuat lantai cepat rusak. Dasar pemilihan adalah beban dan aktivitas di area tersebut.',
        ],
        list: [
          'Lalu lintas orang dan trolley ringan: epoxy coating.',
          'Forklift dan aktivitas gudang: epoxy multilayer.',
          'Estetika tinggi dan permukaan sangat rata: self-leveling.',
          'Beban berat dan benturan: epoxy mortar.',
          'Area basah dan food grade: polyurethane.',
        ],
      },
      {
        h2: 'Langkah 3: masukkan biaya persiapan permukaan',
        body: [
          'Persiapan permukaan sering menjadi selisih terbesar antara estimasi kasar dan harga final. Beton baru yang rata jauh lebih murah dikerjakan dibanding lantai lama yang berminyak, retak, atau pernah dilapisi cat.',
          'Item yang perlu diperhitungkan meliputi grinding, penambalan retak, leveling, serta penanganan kelembapan bila kadar air beton tinggi.',
        ],
      },
      {
        h2: 'Langkah 4: susun rentang, bukan angka tunggal',
        body: [
          'Karena kondisi lantai baru diketahui pasti saat survei, susun anggaran sebagai rentang bawah dan atas. Cara ini lebih realistis dan menghindari kekecewaan saat penawaran resmi keluar.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Apakah estimasi mandiri bisa dipakai sebagai harga final?',
        a: 'Tidak. Estimasi mandiri berguna untuk menyiapkan anggaran awal, tetapi harga final hanya dapat ditetapkan setelah kondisi dasar lantai, kelembapan, dan kebutuhan perbaikan diperiksa di lokasi.',
      },
    ],
  },
  {
    slug: 'epoxy-vs-keramik-untuk-lantai',
    title: 'Epoxy atau Keramik? Perbandingan untuk Rumah dan Area Kerja',
    description:
      'Perbandingan epoxy dan keramik dari sisi perawatan, ketahanan, estetika, waktu pemasangan, dan kesesuaian ruangan.',
    category: 'Epoxy vs Keramik',
    author: 'Tim Teknis Jayati Epoxy',
    reviewer: 'Supervisor Proyek',
    published: '2026-06-28',
    modified: '2026-07-30',
    readMinutes: 6,
    intro:
      'Epoxy unggul pada permukaan tanpa nat, kemudahan pembersihan, dan ketahanan terhadap beban kendaraan. Keramik unggul pada ketahanan gores permukaan dan penggantian per keping. Pilihan terbaik bergantung pada fungsi ruangan, bukan pada tren.',
    sections: [
      {
        h2: 'Perbedaan utama yang terasa sehari-hari',
        body: [
          'Perbedaan paling nyata adalah nat. Lantai epoxy dituang menyatu sehingga tidak ada garis nat yang menampung kotoran, sedangkan keramik selalu memiliki nat yang lama-kelamaan menghitam.',
        ],
        list: [
          'Perawatan: epoxy cukup dipel, keramik perlu menyikat nat berkala.',
          'Beban: epoxy sistem tebal lebih tahan lintasan kendaraan.',
          'Perbaikan: keramik dapat diganti per keping, epoxy diperbaiki per area.',
          'Waktu: epoxy butuh waktu curing, keramik langsung dapat dipakai setelah nat kering.',
        ],
      },
      {
        h2: 'Kapan sebaiknya memilih epoxy',
        body: [
          'Epoxy tepat untuk garasi, gudang, bengkel, dapur produksi, dan area yang menuntut kebersihan tinggi atau menerima beban roda.',
        ],
      },
      {
        h2: 'Kapan keramik masih lebih masuk akal',
        body: [
          'Untuk ruang tamu, kamar tidur, dan area yang mengutamakan variasi motif serta perbaikan sebagian, keramik masih menjadi pilihan yang wajar.',
        ],
      },
    ],
  },
  {
    slug: 'penyebab-epoxy-mengelupas',
    title: 'Penyebab Lantai Epoxy Mengelupas dan Cara Mencegahnya',
    description:
      'Enam penyebab umum epoxy mengelupas — mulai dari kelembapan beton hingga persiapan permukaan yang tidak memadai.',
    category: 'Masalah Lantai',
    author: 'Tim Teknis Jayati Epoxy',
    reviewer: 'Supervisor Proyek',
    published: '2026-05-19',
    modified: '2026-07-22',
    readMinutes: 8,
    intro:
      'Epoxy mengelupas hampir selalu berakar pada daya lekat yang gagal, bukan pada mutu resin semata. Penyebab paling sering adalah kelembapan beton yang tinggi, persiapan permukaan yang kurang, dan pencampuran material yang tidak sesuai rasio.',
    sections: [
      {
        h2: '1. Kelembapan beton terlalu tinggi',
        body: [
          'Uap air yang naik dari bawah slab mendorong lapisan epoxy hingga terlepas. Beton baru idealnya melewati masa kering yang cukup, dan pada kasus tertentu diperlukan pengujian kelembapan atau primer penahan uap.',
        ],
      },
      {
        h2: '2. Persiapan permukaan tidak memadai',
        body: [
          'Menyapu lantai saja tidak cukup. Lapisan laitance, sisa cat lama, dan minyak harus dihilangkan dengan grinding atau shot blasting agar epoxy mengunci ke pori beton.',
        ],
      },
      {
        h2: '3. Rasio campuran tidak tepat',
        body: [
          'Epoxy adalah material dua komponen. Rasio yang meleset membuat reaksi kimia tidak sempurna sehingga lapisan tetap lunak atau rapuh.',
        ],
      },
      {
        h2: '4. Kontaminasi minyak dan bahan kimia',
        body: [
          'Bekas oli pada lantai bengkel meresap dalam ke pori beton. Tanpa degreasing menyeluruh, area tersebut akan menjadi titik awal pengelupasan.',
        ],
      },
      {
        h2: '5. Sistem tidak sesuai beban',
        body: [
          'Coating tipis yang dipasang di jalur forklift akan aus dan terkelupas. Pemilihan sistem harus mengikuti beban nyata di lapangan.',
        ],
      },
      {
        h2: '6. Curing terganggu',
        body: [
          'Area yang dipakai sebelum curing selesai, terkena air, atau suhu ekstrem berisiko mengalami cacat permanen pada lapisan.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Apakah epoxy yang mengelupas harus dibongkar semua?',
        a: 'Tidak selalu. Bila kerusakan bersifat lokal dan lapisan sekitarnya masih melekat kuat, perbaikan dapat dilakukan per area dengan pengasaran tepi. Bila kegagalan disebabkan kelembapan menyeluruh, pembongkaran total biasanya lebih ekonomis dalam jangka panjang.',
      },
    ],
  },
  {
    slug: 'tahapan-pemasangan-epoxy-lantai',
    title: 'Tahapan Pemasangan Epoxy Lantai dari Survei ke Serah Terima',
    description:
      'Urutan pekerjaan epoxy lantai yang benar: survei, persiapan permukaan, primer, lapisan utama, topcoat, curing, dan serah terima.',
    category: 'Proses Pemasangan',
    author: 'Tim Teknis Jayati Epoxy',
    reviewer: 'Supervisor Proyek',
    published: '2026-04-11',
    modified: '2026-07-18',
    readMinutes: 6,
    intro:
      'Pemasangan epoxy lantai terdiri dari tujuh tahap: survei dan pengukuran, persiapan permukaan, perbaikan cacat, aplikasi primer, aplikasi lapisan utama, topcoat, lalu curing dan serah terima. Tahap persiapan menentukan sebagian besar kualitas hasil akhir.',
    sections: [
      {
        h2: 'Survei dan pengukuran',
        body: [
          'Tim memeriksa luas, kerataan, keretakan, kelembapan, dan jenis aktivitas di area tersebut. Hasil survei menjadi dasar pemilihan sistem dan penyusunan penawaran.',
        ],
      },
      {
        h2: 'Persiapan permukaan',
        body: [
          'Grinding atau shot blasting membuka pori beton. Tahap ini juga membersihkan sisa cat, minyak, dan lapisan lemah di permukaan.',
        ],
      },
      {
        h2: 'Perbaikan cacat lantai',
        body: [
          'Retak dibuka dan diisi filler, area gompal ditambal, dan permukaan tidak rata diratakan agar lapisan epoxy memiliki ketebalan yang konsisten.',
        ],
      },
      {
        h2: 'Primer, lapisan utama, dan topcoat',
        body: [
          'Primer mengunci daya lekat, lapisan utama membentuk ketebalan sesuai sistem, dan topcoat menentukan tampilan akhir serta ketahanan permukaan.',
        ],
      },
      {
        h2: 'Curing dan serah terima',
        body: [
          'Area dijaga tetap bersih dan kering selama curing. Serah terima dilakukan dengan pemeriksaan bersama serta penjelasan cara perawatan.',
        ],
      },
    ],
  },
];

/**
 * Testimonial belum tersedia: company profile tidak memuat kutipan klien.
 * PRD §5.7 melarang menampilkan review yang belum diverifikasi, sehingga
 * blok testimonial diganti dengan alasan memilih & nilai perusahaan yang
 * bersumber dari dokumen resmi.
 */
export const testimonials: { name: string; role: string; city: string; quote: string; verified: boolean }[] = [];

/** Company Profile hal. 4 — "Mengapa memilih CV Semesta Bumi Jayati?" */
export const whyChooseUs = [
  {
    n: 1,
    title: 'Sesuai Pesanan',
    body: 'Produk cat epoxy lantai, panel sandwich, ducting, dan sebagainya dibuat sesuai warna, ketebalan, model, dan spesifikasi standar SNI sesuai pesanan.',
  },
  {
    n: 2,
    title: 'Tepat Waktu',
    body: 'Pengerjaan proyek tepat waktu, bahkan bisa lebih cepat dari estimasi kesepakatan sesuai deal.',
  },
  {
    n: 3,
    title: 'Tenaga Ahli Terampil',
    body: 'Terampil dan berpengalaman dalam bidang konstruksi industri: cat epoxy lantai, panel sandwich, ducting, dan pekerjaan pendukung lainnya.',
  },
  {
    n: 4,
    title: 'Berkualitas & Bergaransi',
    body: 'Menjaga kualitas produk dan layanan yang menghasilkan produk terbaik dan bergaransi resmi.',
  },
  {
    n: 5,
    title: 'Berpengalaman',
    body: 'CV Semesta Bumi Jayati memiliki tenaga ahli yang profesional di bidang konstruksi industri.',
  },
];

/** Company Profile hal. 3 — Value Perusahaan */
export const companyValues = ['Integritas', 'Transparan', 'Service Excellence', 'Profesional', 'Solutif'];

/** Company Profile hal. 3 — Visi */
export const visionStatement = 'Be a solution for the Construction Industries of Indonesian';

/** Company Profile hal. 3 — Misi Perusahaan */
export const missionStatements = [
  'Menjalankan pekerjaan berlandaskan agama dan nilai-nilai profesionalisme.',
  'Menjadikan kepuasan klien sebagai komitmen dan prioritas utama dalam pelayanan.',
  'Menghadirkan produk terbaik dengan kualitas Standar Nasional Indonesia (SNI).',
  'Memiliki SDM (Sumber Daya Manusia) yang kompeten, berintegritas, dan berorientasi pada perkembangan perusahaan.',
  'Berkomitmen untuk menyelesaikan pekerjaan dengan cepat, tepat waktu, dan tanpa mengurangi kualitas.',
];

export const workSteps = [
  {
    n: 1,
    title: 'Konsultasi & Survei',
    body: 'Kami mendata luas, kondisi dasar lantai, kelembapan, dan aktivitas area. Survei dapat diawali dengan foto untuk estimasi awal.',
  },
  {
    n: 2,
    title: 'Rekomendasi Sistem & Penawaran',
    body: 'Sistem epoxy dipilih berdasarkan beban nyata, lalu dituangkan dalam penawaran dengan rincian item pekerjaan.',
  },
  {
    n: 3,
    title: 'Persiapan Permukaan',
    body: 'Grinding atau blasting, pembersihan kontaminan, penambalan retak, dan leveling area yang tidak rata.',
  },
  {
    n: 4,
    title: 'Aplikasi Lapisan',
    body: 'Primer, lapisan utama sesuai ketebalan sistem, dan topcoat dengan kontrol rasio campuran serta ketebalan basah.',
  },
  {
    n: 5,
    title: 'Curing, QC & Serah Terima',
    body: 'Pemeriksaan hasil bersama, penjelasan masa curing, panduan perawatan, dan dokumentasi pekerjaan.',
  },
];

/**
 * Area layanan yang ditonjolkan. Dipilih dari lokasi proyek nyata pada
 * company profile hal. 12, bukan daftar kota generik.
 */
export const cities = [
  { slug: 'kediri', name: 'Kediri', region: 'Jawa Timur' },
  { slug: 'nganjuk', name: 'Nganjuk', region: 'Jawa Timur' },
  { slug: 'surabaya', name: 'Surabaya', region: 'Jawa Timur' },
  { slug: 'madura', name: 'Madura', region: 'Jawa Timur' },
  { slug: 'semarang', name: 'Semarang', region: 'Jawa Tengah' },
  { slug: 'jakarta', name: 'Jakarta', region: 'DKI Jakarta' },
];

export function formatRupiah(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}

/** Harga per m² sesuai tier luas area (pricelist resmi hal. 11). */
export function priceForArea(s: EpoxySystem, sqm: number): number {
  if (sqm > 500) return s.priceOver500;
  if (sqm > 100) return s.priceOver100;
  return s.priceUnder100;
}

/**
 * Rentang harga sebuah sistem: terendah = tier > 500 m², tertinggi = tier < 100 m².
 * Dipakai untuk menampilkan "Rp150.000 – Rp190.000 / m²".
 */
export function priceRange(s: EpoxySystem): { from: number; to: number } {
  return { from: s.priceOver500, to: s.priceUnder100 };
}

/** Harga terendah dan tertinggi di seluruh pricelist. */
export const priceFloor = Math.min(...epoxySystems.map((s) => s.priceOver500));
export const priceCeiling = Math.max(...epoxySystems.map((s) => s.priceUnder100));
