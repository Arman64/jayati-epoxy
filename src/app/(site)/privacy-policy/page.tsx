import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs, Disclaimer } from '@/components/Sections';
import { site } from '@/lib/site';
import { getSettings } from '@/lib/settings';
import { toContactInfo, waHref } from '@/lib/contact';

const PATH = '/privacy-policy';

const DEFAULT_TITLE = 'Kebijakan Privasi';
const DEFAULT_DESC =
  'Kebijakan privasi Jayati Epoxy mengenai pengumpulan, penggunaan, penyimpanan, dan perlindungan data pengunjung serta calon pelanggan.';

export async function generateMetadata() {
  const o = await pageOverride(PATH);
  return buildMetadata({
    title: o.title || DEFAULT_TITLE,
    description: o.description || DEFAULT_DESC,
    path: PATH,
    noindex: o.noindex,
    ogImage: o.ogImage ?? undefined,
  });
}

const sections = [
  {
    h2: 'Data yang kami kumpulkan',
    body: [
      'Kami mengumpulkan data yang Anda kirimkan secara sukarela melalui formulir permintaan penawaran, yaitu nama, nomor WhatsApp, kota atau lokasi proyek, jenis bangunan, perkiraan luas area, kondisi lantai, jenis kebutuhan, pesan, dan foto lantai bila Anda mengunggahnya.',
      'Selain itu, kami mengumpulkan data teknis standar seperti alamat IP, jenis perangkat, dan halaman yang dikunjungi untuk keperluan keamanan dan analisis performa situs.',
    ],
  },
  {
    h2: 'Cara kami menggunakan data',
    body: [
      'Data permintaan penawaran digunakan untuk menghubungi Anda, menyiapkan estimasi, menjadwalkan survei, dan menerbitkan penawaran. Data teknis digunakan untuk mencegah penyalahgunaan formulir serta memperbaiki kualitas layanan situs.',
      'Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga.',
    ],
  },
  {
    h2: 'Penyimpanan dan retensi',
    body: [
      'Data permintaan penawaran disimpan selama diperlukan untuk keperluan tindak lanjut penjualan dan administrasi. Foto lantai yang diunggah disimpan hanya selama proses estimasi dan dihapus sesuai kebijakan retensi internal.',
      'Akses terhadap data calon pelanggan dibatasi hanya untuk personel yang berwenang.',
    ],
  },
  {
    h2: 'Cookie dan analitik',
    body: [
      'Situs ini dapat menggunakan cookie dan layanan analitik untuk mengukur kunjungan halaman serta efektivitas kampanye iklan. Data yang dikumpulkan bersifat agregat dan digunakan untuk memahami perilaku pengunjung secara umum.',
      'Anda dapat mengatur atau menonaktifkan cookie melalui pengaturan peramban, dengan konsekuensi sebagian fungsi situs mungkin tidak bekerja optimal.',
    ],
  },
  {
    h2: 'Keamanan',
    body: [
      'Kami menerapkan langkah teknis dan organisasi yang wajar untuk melindungi data, termasuk koneksi terenkripsi, pembatasan akses berbasis peran, validasi masukan, dan pencatatan aktivitas administratif.',
    ],
  },
  {
    h2: 'Hak Anda',
    body: [
      'Anda berhak meminta akses, koreksi, atau penghapusan data pribadi yang kami simpan. Permintaan tersebut dapat diajukan melalui kontak resmi yang tercantum di situs ini.',
    ],
  },
];

export default async function PrivacyPage() {
  const contact = toContactInfo((await getSettings()).contact);
  const o = await pageOverride(PATH);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Kebijakan Privasi', path: PATH },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <article className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[1.8rem] leading-tight sm:text-4xl">{o.h1 || 'Kebijakan Privasi'}</h1>
          <p className="mt-3 text-[13px] text-slate-500">
            Terakhir diperbarui: {site.priceLastReviewed}
          </p>
          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <section key={s.h2}>
                <h2 className="text-xl">{s.h2}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="prose-brand mt-3">{p}</p>
                ))}
              </section>
            ))}
            <section>
              <h2 className="text-xl">Kontak</h2>
              <p className="prose-brand mt-3">
                Pertanyaan mengenai kebijakan ini dapat disampaikan melalui email {contact.email} atau
                telepon {contact.phoneDisplay}.
              </p>
            </section>
          </div>
          <Disclaimer>
            Dokumen ini adalah kerangka awal dan wajib ditinjau oleh penasihat hukum sebelum situs
            dipublikasikan, khususnya terkait kepatuhan pada peraturan perlindungan data pribadi
            yang berlaku di Indonesia.
          </Disclaimer>
        </div>
      </article>
    </>
  );
}
