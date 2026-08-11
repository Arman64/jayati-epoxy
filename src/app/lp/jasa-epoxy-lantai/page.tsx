import { buildMetadata, faqSchema, serviceSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { LpHero, LpPortfolio, LpProblems, LpStickyCta, LpSteps, LpTrustBar } from '@/components/LpBlocks';
import { FaqList, Disclaimer, SectionHead } from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { epoxySystems, formatRupiah, generalFaqs, projects, cities, priceRange } from '@/lib/content';
import { site } from '@/lib/site';

const PATH = '/lp/jasa-epoxy-lantai';
const CLUSTER = 'jasa';
const WA = 'Halo, saya lihat iklan jasa epoxy lantai. Mohon dibantu penawarannya.';

/** LP iklan tetap indexable? Tidak — hindari duplikasi dengan halaman organik. */
export const metadata = buildMetadata({
  title: 'Jasa Epoxy Lantai — Survei Gratis & Penawaran Tertulis',
  description:
    'Kontraktor dan aplikator epoxy lantai untuk rumah, gudang, dan pabrik. Survei lokasi, persiapan permukaan dengan grinding, penawaran tertulis dengan rincian item.',
  path: PATH,
  noindex: true,
});

const faqs = [
  {
    q: 'Apakah survei dikenakan biaya?',
    a: 'Untuk lokasi dalam jangkauan tim, survei awal tidak dikenakan biaya. Untuk lokasi di luar jangkauan, biaya kunjungan dikonfirmasi terlebih dahulu dan dapat diperhitungkan bila pekerjaan berlanjut.',
  },
  {
    q: 'Berapa lama penawaran diterbitkan setelah survei?',
    a: 'Umumnya penawaran tertulis dikirim dalam 1–3 hari kerja setelah survei, tergantung kompleksitas area dan kebutuhan pengecekan datasheet material.',
  },
  ...generalFaqs.slice(0, 4),
];

export default function LpJasa() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Jasa Epoxy Lantai',
            description: 'Layanan kontraktor dan aplikator epoxy lantai untuk rumah, komersial, dan industri.',
            path: PATH,
            serviceType: 'Epoxy Flooring Contractor',
          }),
          faqSchema(faqs),
        ]}
      />

      <LpHero
        eyebrow="Kontraktor & Aplikator Epoxy Lantai"
        h1="Jasa Epoxy Lantai untuk Rumah, Gudang, dan Pabrik"
        benefit="Kami memilih sistem berdasarkan beban nyata di area Anda, mengerjakan persiapan permukaan dengan mesin, dan menerbitkan penawaran tertulis yang dirinci per item."
        bullets={[
          'Survei lokasi sebelum penawaran',
          'Grinding mekanis, bukan sekadar disapu',
          'Penawaran tertulis dengan rincian item',
          'Opsi pengerjaan malam atau per zona',
        ]}
        waMessage={WA}
        cluster={CLUSTER}
      />

      <LpTrustBar
        items={[
          { label: 'Area Layanan', value: 'Nasional' },
          { label: 'Fokus', value: 'Jasa Aplikasi' },
          { label: 'Penawaran', value: 'Tertulis' },
          { label: 'Jam Layanan', value: 'Sen–Sab' },
        ]}
      />

      <LpProblems
        title="Masalah lantai yang kami tangani"
        items={[
          { p: 'Lantai beton berdebu terus-menerus', s: 'Pori beton ditutup lapisan epoxy sehingga debu permukaan berhenti.' },
          { p: 'Lantai retak dan gompal', s: 'Retak dibuka dan diisi filler, area gompal ditambal sebelum pelapisan.' },
          { p: 'Epoxy lama mengelupas', s: 'Kami periksa penyebabnya lebih dulu — kelembapan, kontaminasi, atau daya lekat.' },
          { p: 'Lantai licin saat basah', s: 'Finishing bertekstur atau agregat anti-slip sesuai tingkat kekasaran yang dibutuhkan.' },
          { p: 'Sulit dibersihkan karena nat', s: 'Permukaan epoxy menyatu tanpa nat sehingga cukup dipel.' },
          { p: 'Tidak tahan lintasan forklift', s: 'Naikkan ke PU Crete 4.000–6.000 micron sesuai beban aktual.' },
        ]}
      />

      <section className="bg-cream-100 py-12">
        <div className="container-page">
          <SectionHead eyebrow="Pilihan Sistem" title="Sistem epoxy dan rentang biayanya" />
          <div className="mt-7 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
            <table className="w-full min-w-[680px] border-collapse bg-white text-left text-sm">
              <caption className="sr-only">Pilihan sistem epoxy lantai dan rentang harga per meter persegi</caption>
              <thead>
                <tr className="bg-navy-900 text-white">
                  <th scope="col" className="px-4 py-3.5 font-bold">Sistem</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Ketebalan</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Untuk area</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-bold">Rentang / m²</th>
                </tr>
              </thead>
              <tbody>
                {epoxySystems.map((s, i) => (
                  <tr key={s.slug} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                    <th scope="row" className="px-4 py-3.5 font-bold text-navy-900">{s.name}</th>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{s.thicknessLabel}</td>
                    <td className="px-4 py-3.5 text-slate-600">{s.bestFor}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-forest-700">
                      {formatRupiah(priceRange(s).from)}–{formatRupiah(priceRange(s).to)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Disclaimer>
            Rentang indikatif per {site.priceLastReviewed}, belum termasuk perbaikan lantai,
            penanganan kelembapan, dan mobilisasi luar kota.
          </Disclaimer>
        </div>
      </section>

      <LpSteps
        steps={[
          { title: 'Konsultasi', body: 'Kirim foto dan perkiraan luas area untuk estimasi awal.' },
          { title: 'Survei', body: 'Pengukuran, cek kondisi dasar lantai, dan pemeriksaan kelembapan.' },
          { title: 'Penawaran', body: 'Rincian item pekerjaan, sistem, ketebalan, dan jadwal.' },
          { title: 'Pengerjaan', body: 'Persiapan permukaan, aplikasi berlapis, curing, dan serah terima.' },
        ]}
      />

      <LpPortfolio projects={projects} />

      <section className="bg-cream-100 py-12">
        <div className="container-page">
          <SectionHead eyebrow="Area Layanan" title="Melayani proyek di seluruh Indonesia" />
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {cities.map((c) => (
              <li key={c.slug} className="rounded-full border border-navy-900/12 bg-white px-4 py-2 text-sm font-semibold text-navy-900">
                {c.name}
              </li>
            ))}
            <li className="rounded-full border border-navy-900/12 bg-white px-4 py-2 text-sm font-semibold text-slate-500">
              dan kota lain di Indonesia
            </li>
          </ul>
        </div>
      </section>

      <FaqList faqs={faqs} />

      <section id="form" className="container-page scroll-mt-20 py-12">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead
            eyebrow="Minta Penawaran"
            title="Kirim detail area, terima estimasi awal"
            lead="Isi formulir berikut. Sertakan foto lantai bila tersedia agar estimasi lebih akurat."
          />
          <QuotationForm source="lp-jasa-epoxy-lantai" />
        </div>
      </section>

      <LpStickyCta waMessage={WA} cluster={CLUSTER} />
    </>
  );
}
