import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs, Disclaimer } from '@/components/Sections';
import { site } from '@/lib/site';

const PATH = '/terms';

const DEFAULT_TITLE = 'Syarat & Ketentuan';
const DEFAULT_DESC =
  'Syarat dan ketentuan penggunaan situs Jayati Epoxy serta ketentuan umum terkait estimasi, penawaran, dan pelaksanaan pekerjaan epoxy lantai.';

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
    h2: 'Penggunaan situs',
    body: [
      'Dengan mengakses situs ini, Anda menyetujui bahwa informasi yang disajikan bersifat umum dan ditujukan sebagai bahan pertimbangan awal, bukan sebagai nasihat teknis yang mengikat untuk kondisi lantai tertentu.',
    ],
  },
  {
    h2: 'Estimasi dan penawaran',
    body: [
      'Seluruh angka harga yang ditampilkan di situs, termasuk hasil kalkulator estimasi, merupakan rentang indikatif. Angka tersebut bukan penawaran yang mengikat.',
      'Penawaran resmi hanya diterbitkan secara tertulis setelah survei lokasi dilakukan dan lingkup pekerjaan disepakati. Bila terdapat perbedaan antara informasi di situs dan surat penawaran, yang berlaku adalah surat penawaran.',
    ],
  },
  {
    h2: 'Lingkup pekerjaan',
    body: [
      'Lingkup pekerjaan, spesifikasi material, ketebalan sistem, dan jadwal pelaksanaan dituangkan dalam surat penawaran atau kontrak kerja. Pekerjaan di luar lingkup yang disepakati dihitung sebagai pekerjaan tambah.',
      'Kondisi tersembunyi yang baru ditemukan saat pembongkaran atau persiapan permukaan, seperti kelembapan tinggi atau kerusakan struktural, dapat memengaruhi biaya dan jadwal, dan akan dikomunikasikan sebelum pekerjaan dilanjutkan.',
    ],
  },
  {
    h2: 'Tanggung jawab pelanggan',
    body: [
      'Pelanggan menyediakan akses lokasi, sumber listrik dan air sesuai kebutuhan pekerjaan, serta memastikan area dikosongkan sesuai jadwal yang disepakati. Keterlambatan akses dapat menggeser jadwal penyelesaian.',
    ],
  },
  {
    h2: 'Garansi',
    body: [
      'Ketentuan garansi, termasuk masa berlaku dan cakupannya, dicantumkan secara tertulis pada surat penawaran. Garansi tidak mencakup kerusakan akibat penggunaan di luar peruntukan, beban melebihi rancangan sistem, kerusakan struktur bangunan, atau perawatan yang tidak sesuai panduan.',
    ],
  },
  {
    h2: 'Hak kekayaan intelektual',
    body: [
      `Seluruh konten, logo, dan materi visual pada situs ini merupakan milik ${site.legalName} dan tidak boleh digunakan tanpa izin tertulis.`,
    ],
  },
];

export default async function TermsPage() {
  const o = await pageOverride(PATH);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Syarat & Ketentuan', path: PATH },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <article className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[1.8rem] leading-tight sm:text-4xl">{o.h1 || 'Syarat & Ketentuan'}</h1>
          <p className="mt-3 text-[13px] text-slate-500">Terakhir diperbarui: {site.priceLastReviewed}</p>
          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <section key={s.h2}>
                <h2 className="text-xl">{s.h2}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="prose-brand mt-3">{p}</p>
                ))}
              </section>
            ))}
          </div>
          <Disclaimer>
            Dokumen ini adalah kerangka awal dan wajib ditinjau oleh penasihat hukum sebelum
            digunakan sebagai dasar hubungan kontraktual.
          </Disclaimer>
        </div>
      </article>
    </>
  );
}
