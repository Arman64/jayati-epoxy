/**
 * Konten unik per area — PRD §5.6 melarang doorway page copy-paste.
 *
 * Setiap area di bawah dipilih karena kami BENAR-BENAR memiliki proyek di sana
 * (company profile hal. 12, "Our Projects — Cat Epoxy Lantai 2026"), bukan
 * karena volume pencarian. Setiap halaman memuat konteks proyek nyata yang
 * berbeda.
 */

export type CityContent = {
  slug: string;
  name: string;
  region: string;
  intro: string;
  localContext: string;
  commonAreas: string[];
  districts: string[];
  operationalNote: string;
  /** Slug sistem dari epoxySystems yang paling relevan untuk area ini. */
  typicalSystems: string[];
  /** Nama proyek nyata di area ini, disalin dari company profile hal. 12. */
  realProjects: string[];
};

export const cityContents: CityContent[] = [
  {
    slug: 'kediri',
    name: 'Kediri',
    region: 'Jawa Timur',
    intro:
      'Kediri adalah basis operasional kami. Kantor manajemen, training center tenaga ahli, dan mess pekerja berada di Jalan Tambora, Bandar Lor, Kecamatan Mojoroto, sehingga mobilisasi tim ke proyek di wilayah ini paling cepat.',
    localContext:
      'Karena kantor dan gudang peralatan berada di kota ini, pekerjaan di Kediri dapat dijadwalkan tanpa biaya mobilisasi antar kota. Tim juga dapat melakukan peninjauan ulang setelah serah terima bila diperlukan.',
    commonAreas: [
      'Dapur SPPG (Satuan Pelayanan Pemenuhan Gizi)',
      'Dapur produksi dan katering',
      'Ruang produksi skala kecil dan menengah',
      'Gudang penyimpanan bahan',
      'Fasilitas pendidikan dan pesantren',
    ],
    districts: ['Mojoroto', 'Kota Kediri', 'Ngadiluwih', 'Pare', 'Kabupaten Kediri'],
    operationalNote:
      'Sebagai kota basis, kami dapat mengirim tim survei dalam waktu singkat dan melakukan pengecekan berkala selama masa curing tanpa biaya perjalanan tambahan.',
    typicalSystems: ['self-leveling-1000-micron', 'self-leveling-2000-micron', 'pu-crete-3000-micron'],
    realProjects: ['SPPG Ngadiluwih Kediri', 'SPPG Gbranggahan 2 Ngadiluwih'],
  },
  {
    slug: 'nganjuk',
    name: 'Nganjuk',
    region: 'Jawa Timur',
    intro:
      'Kami mengerjakan lantai dapur SPPG di wilayah Nganjuk, termasuk unit di Kecamatan Ngluyu dengan finish epoxy biru, marka jalur kuning, dan penandaan identitas unit langsung pada lantai.',
    localContext:
      'Sebagian lokasi SPPG di Nganjuk berada di kecamatan yang cukup jauh dari pusat kota, sehingga penjadwalan material dan tim disusun agar seluruh tahap aplikasi selesai dalam satu rangkaian kunjungan.',
    commonAreas: [
      'Dapur SPPG program pemenuhan gizi',
      'Dapur produksi makanan skala menengah',
      'Ruang penyimpanan bahan pangan',
      'Fasilitas yayasan dan lembaga pendidikan',
    ],
    districts: ['Ngluyu', 'Nganjuk Kota', 'Sukomoro', 'Bagor', 'Kabupaten Nganjuk'],
    operationalNote:
      'Untuk lokasi dengan akses jalan sempit, material dan mesin diangkut dengan kendaraan yang disesuaikan, dan volume material dihitung agar tidak perlu pengiriman ulang.',
    typicalSystems: ['self-leveling-1000-micron', 'self-leveling-2000-micron', 'pu-crete-3000-micron'],
    realProjects: ['SPPG Ngluyu Nganjuk', 'SPPG Sugihwaras Ngluyu'],
  },
  {
    slug: 'madura',
    name: 'Madura',
    region: 'Jawa Timur',
    intro:
      'Madura merupakan salah satu konsentrasi proyek terbesar kami, dengan dapur SPPG di Kabupaten Sampang dan Pamekasan — mulai dari Torjun, Komis, Tanggumong, Tambelangan, Dalpenang, hingga Peltong, Palengaan, Kangenan, dan Pademawu.',
    localContext:
      'Pekerjaan di Madura memerlukan penyeberangan dan perjalanan darat yang panjang, sehingga kami biasanya mengerjakan beberapa unit dalam satu periode mobilisasi agar biaya dan waktu lebih efisien bagi klien.',
    commonAreas: [
      'Dapur SPPG di Sampang dan Pamekasan',
      'Dapur produksi lembaga dan yayasan',
      'Ruang penyajian dan penyimpanan makanan',
      'Area cuci peralatan dapur',
    ],
    districts: ['Sampang', 'Pamekasan', 'Torjun', 'Tambelangan', 'Palengaan', 'Pademawu'],
    operationalNote:
      'Iklim pesisir dengan kelembapan tinggi membuat pemeriksaan kadar air beton menjadi tahap yang tidak dapat dilewati sebelum aplikasi lapisan pertama.',
    typicalSystems: ['self-leveling-1000-micron', 'self-leveling-2000-micron', 'pu-crete-3000-micron'],
    realProjects: [
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
    slug: 'surabaya',
    name: 'Surabaya',
    region: 'Jawa Timur',
    intro:
      'Surabaya dan sekitarnya memiliki konsentrasi kawasan industri serta pergudangan yang tinggi, sehingga kebutuhan yang paling sering muncul adalah sistem tahan lalu lintas forklift dan area produksi makanan.',
    localContext:
      'Iklim pesisir dengan kelembapan udara tinggi membuat pemeriksaan kadar air beton menjadi tahap yang tidak dapat dilewati, khususnya pada gudang lama dengan lantai yang bersentuhan langsung dengan tanah.',
    commonAreas: [
      'Gudang distribusi dan logistik',
      'Pabrik manufaktur dan area produksi',
      'Dapur produksi makanan',
      'Cold storage dan ruang pendingin',
      'Clean room industri farmasi dan kosmetik',
    ],
    districts: ['Surabaya Barat', 'Surabaya Timur', 'Rungkut', 'Margomulyo', 'Sidoarjo (sekitar)'],
    operationalNote:
      'Banyak klien industri meminta pengerjaan bertahap per zona agar jalur distribusi tetap berjalan. Skema ini disusun bersama tim maintenance sebelum mobilisasi.',
    typicalSystems: ['pu-crete-4000-micron', 'pu-crete-6000-micron', 'pu-crete-8000-micron'],
    realProjects: [],
  },
  {
    slug: 'semarang',
    name: 'Semarang',
    region: 'Jawa Tengah',
    intro:
      'Semarang menjadi salah satu simpul proyek kami di Jawa Tengah, dengan pekerjaan dapur pada Yayasan Al Masykur, Yayasan Darussalam Bergas, Yayasan Ahmad Tamin Said, dan Yayasan Wakaf Literasi Islam.',
    localContext:
      'Dari Semarang, tim kami juga menjangkau proyek di Grobogan, Demak, Kudus, Pati, Rembang, Blora, hingga Magelang dan Temanggung — sebagian besar berupa dapur yayasan dan pondok pesantren.',
    commonAreas: [
      'Dapur yayasan dan pondok pesantren',
      'Dapur produksi makanan',
      'Ruang serbaguna dan aula',
      'Gudang bahan pangan',
    ],
    districts: ['Kota Semarang', 'Bergas', 'Demak', 'Kudus', 'Grobogan', 'Boyolali'],
    operationalNote:
      'Karena banyak proyek Jawa Tengah berada dalam satu koridor perjalanan, penjadwalan dilakukan berkelompok sehingga biaya mobilisasi per lokasi dapat ditekan.',
    typicalSystems: ['self-leveling-1000-micron', 'self-leveling-2000-micron', 'pu-crete-3000-micron'],
    realProjects: [
      'Yayasan Al Masykur Semarang',
      'Yayasan Darussalam Bergas Semarang',
      'Yayasan Ahmad Tamin Said Semarang',
      'Yayasan Wakaf Literasi Islam Semarang',
    ],
  },
  {
    slug: 'jakarta',
    name: 'Jakarta',
    region: 'DKI Jakarta',
    intro:
      'Di Jakarta kami mengerjakan pelapisan lantai lapangan padel, selain kebutuhan umum berupa area komersial, basement, dan ruang produksi yang menuntut permukaan rata dan mudah dirawat.',
    localContext:
      'Sebagian besar proyek Jakarta dikerjakan di bangunan yang tetap beroperasi, sehingga pekerjaan dilakukan malam hari atau akhir pekan mengikuti izin pengelola gedung. Akses lift barang dan pembatasan jam masuk kendaraan proyek perlu diperhitungkan sejak awal.',
    commonAreas: [
      'Lapangan olahraga indoor',
      'Basement parkir dan area komersial',
      'Ruang produksi dan pengemasan',
      'Dapur produksi hotel dan restoran',
    ],
    districts: ['Jakarta Utara', 'Jakarta Timur', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Pusat'],
    operationalNote:
      'Pekerjaan di gedung bertingkat memerlukan koordinasi izin kerja dengan building management, termasuk pengaturan jalur material dan ketersediaan sumber listrik untuk mesin.',
    typicalSystems: ['self-leveling-2000-micron', 'pu-crete-3000-micron', 'pu-crete-4000-micron'],
    realProjects: ['Backspin Lapangan Padel DKI Jakarta'],
  },
];

export function getCityContent(slug: string): CityContent | undefined {
  return cityContents.find((c) => c.slug === slug);
}
