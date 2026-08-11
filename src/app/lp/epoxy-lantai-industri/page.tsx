import { buildMetadata, faqSchema, serviceSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { LpHero, LpPortfolio, LpProblems, LpStickyCta, LpSteps, LpTrustBar } from '@/components/LpBlocks';
import { FaqList, Disclaimer, SectionHead } from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { projects } from '@/lib/content';

const PATH = '/lp/epoxy-lantai-industri';
const CLUSTER = 'industri';
const WA = 'Halo, saya lihat iklan epoxy lantai industri. Mohon dibantu survei teknis untuk pabrik/gudang kami.';

export const metadata = buildMetadata({
  title: 'Epoxy Lantai Industri — Pabrik, Gudang & Food Grade',
  description:
    'Epoxy lantai industri untuk pabrik, gudang, workshop, dan area food grade. Sistem heavy duty, pengerjaan per zona, dan minim gangguan operasional.',
  path: PATH,
  noindex: true,
});

const loadTable = [
  { load: 'Pejalan kaki & trolley', system: 'Epoxy Coating', thickness: '200–300 micron' },
  { load: 'Hand pallet & forklift harian', system: 'PU Crete', thickness: '4.000 micron' },
  { load: 'Beban berat & benturan', system: 'PU Crete', thickness: '6.000 micron' },
  { load: 'Area basah & food grade', system: 'Polyurethane', thickness: '2–4 mm' },
  { load: 'Risiko elektrostatis', system: 'Epoxy Anti-Static', thickness: '2–3 mm' },
];

const faqs = [
  {
    q: 'Apakah produksi harus berhenti total?',
    a: 'Tidak selalu. Pekerjaan umumnya dibagi per zona sehingga sebagian area tetap beroperasi. Pembagian zona disusun bersama tim maintenance sebelum mobilisasi.',
  },
  {
    q: 'Berapa downtime per zona?',
    a: 'Sebagai acuan, satu zona membutuhkan sekitar 3–5 hari sampai dapat dilalui pejalan kaki dan sekitar 7 hari untuk beban penuh, tergantung sistem dan suhu ruangan.',
  },
  {
    q: 'Bagaimana memastikan sistem tahan bahan kimia kami?',
    a: 'Kami meminta daftar bahan kimia yang digunakan, lalu mencocokkannya dengan chemical resistance chart pada datasheet material sebelum merekomendasikan sistem. Kami tidak menyatakan ketahanan tanpa dasar datasheet.',
  },
  {
    q: 'Apakah termasuk marka jalur forklift?',
    a: 'Marka jalur, zebra cross gudang, dan penandaan area dapat dikerjakan sebagai item terpisah pada penawaran, termasuk penentuan warna sesuai standar keselamatan pabrik Anda.',
  },
  {
    q: 'Bagaimana bila lantai beton lembap?',
    a: 'Kelembapan tinggi adalah penyebab utama kegagalan epoxy di area industri. Bila hasil pemeriksaan menunjukkan kadar air tinggi, diperlukan primer penahan uap atau sistem yang lebih toleran terhadap kelembapan.',
  },
];

export default function LpIndustri() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Epoxy Lantai Industri',
            description: 'Jasa epoxy lantai industri untuk pabrik, gudang, dan area food grade dengan sistem heavy duty.',
            path: PATH,
            serviceType: 'Industrial Epoxy Flooring',
          }),
          faqSchema(faqs),
        ]}
      />

      <LpHero
        eyebrow="Epoxy Lantai Industri"
        h1="Epoxy Lantai Industri untuk Pabrik, Gudang, dan Area Heavy Duty"
        benefit="Sistem dipilih berdasarkan beban forklift, benturan, dan paparan kimia di area Anda. Pengerjaan dapat dibagi per zona agar operasional tetap berjalan."
        bullets={[
          'Survei teknis termasuk cek kelembapan beton',
          'Persiapan grinding / shot blasting',
          'Pengerjaan bertahap per zona',
          'Rekomendasi berbasis datasheet material',
        ]}
        waMessage={WA}
        cluster={CLUSTER}
      />

      <LpTrustBar
        items={[
          { label: 'Ketebalan', value: 'Hingga 6 mm' },
          { label: 'Downtime', value: 'Per Zona' },
          { label: 'Food Grade', value: 'Tersedia' },
          { label: 'Dokumentasi', value: 'Laporan Kerja' },
        ]}
      />

      <LpProblems
        title="Masalah lantai industri yang kami tangani"
        items={[
          { p: 'Lantai gudang berdebu', s: 'Debu beton mencemari produk dan mesin — pori ditutup dengan sistem yang sesuai beban.' },
          { p: 'Jalur forklift cepat aus', s: 'Ketebalan dinaikkan ke PU Crete 4.000–6.000 micron sesuai frekuensi lintasan.' },
          { p: 'Epoxy lama mengelupas', s: 'Kami periksa penyebab utamanya — kelembapan, kontaminasi, atau persiapan yang kurang.' },
          { p: 'Area basah licin', s: 'Polyurethane bertekstur dengan kemiringan menuju drain.' },
          { p: 'Tumpahan kimia merusak lantai', s: 'Pencocokan material dengan chemical resistance chart sebelum rekomendasi.' },
          { p: 'Tidak ada penanda jalur', s: 'Marka jalur dan safety line sesuai standar keselamatan pabrik.' },
        ]}
      />

      <section className="bg-cream-100 py-12">
        <div className="container-page">
          <SectionHead eyebrow="Pemilihan Sistem" title="Cocokkan sistem dengan beban area" />
          <div className="mt-7 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
            <table className="w-full min-w-[600px] border-collapse bg-white text-left text-sm">
              <caption className="sr-only">Pemilihan sistem epoxy industri berdasarkan beban area</caption>
              <thead>
                <tr className="bg-navy-900 text-white">
                  <th scope="col" className="px-4 py-3.5 font-bold">Beban / aktivitas</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Sistem disarankan</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Ketebalan</th>
                </tr>
              </thead>
              <tbody>
                {loadTable.map((l, i) => (
                  <tr key={l.load} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                    <th scope="row" className="px-4 py-3.5 font-bold text-navy-900">{l.load}</th>
                    <td className="px-4 py-3.5 font-semibold text-forest-700">{l.system}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{l.thickness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Disclaimer>
            Ketebalan adalah rentang umum sistem, bukan spesifikasi final. Ketahanan abrasi dan kimia
            hanya dinyatakan berdasarkan datasheet material yang disepakati.
          </Disclaimer>
        </div>
      </section>

      <LpSteps
        steps={[
          { title: 'Survei teknis', body: 'Cek beban, kelembapan beton, dan alur operasional area.' },
          { title: 'Perencanaan zona', body: 'Pembagian area kerja agar produksi tetap berjalan.' },
          { title: 'Persiapan permukaan', body: 'Grinding atau shot blasting dan penanganan kontaminan.' },
          { title: 'Aplikasi & serah terima', body: 'Pelapisan bertahap, marka jalur, dan laporan pekerjaan.' },
        ]}
      />

      <LpPortfolio projects={projects.filter((p) => p.category !== 'Rumah')} />

      <FaqList faqs={faqs} title="Pertanyaan Teknis Industri" />

      <section id="form" className="container-page scroll-mt-20 py-12">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead
            eyebrow="Survei Teknis"
            title="Ajukan survei untuk area produksi Anda"
            lead="Sertakan jenis beban, bahan kimia yang digunakan, dan jam operasional agar rekomendasi lebih tepat."
          />
          <QuotationForm source="lp-epoxy-lantai-industri" />
        </div>
      </section>

      <LpStickyCta waMessage={WA} cluster={CLUSTER} />
    </>
  );
}
