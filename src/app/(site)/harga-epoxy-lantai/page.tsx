import Link from 'next/link';
import { buildMetadata, breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import {
  AnswerBox,
  Breadcrumbs,
  CtaBand,
  Disclaimer,
  FaqList,
  SectionHead,
} from '@/components/Sections';
import { formatRupiah, curvingPrice } from '@/lib/content';
import { getEpoxySystems, getPriceFaqs } from '@/lib/content-db';
import { PriceCalculator } from '@/components/PriceCalculator';
import { QuotationForm } from '@/components/QuotationForm';
import { site } from '@/lib/site';
import { getSettings } from '@/lib/settings';
import { toContactInfo } from '@/lib/contact';
import { IconArrow } from '@/components/Icons';
import { getPageCopy } from '@/lib/page-copy';
import { sh } from '@/lib/page-slots';

const PATH = '/harga-epoxy-lantai';

const DEFAULT_TITLE = 'Harga Epoxy Lantai per m2 — Pricelist Resmi';
const DEFAULT_DESC =
  'Pricelist resmi epoxy lantai per m2: Self-Leveling 1.000–2.000 micron dan PU Crete 3.000–9.000 micron. Harga turun untuk area di atas 100 m2 dan di atas 500 m2.';

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

const priceFactors = [
  { title: 'Luas area', body: 'Pricelist kami memiliki tiga tier: di bawah 100 m², di atas 100 m², dan di atas 500 m². Semakin luas, semakin rendah harga per m².' },
  { title: 'Ketebalan lapisan', body: 'Ketebalan 1.000 micron hingga 9.000 micron memiliki harga berbeda karena volume material yang dipakai.' },
  { title: 'Jenis sistem', body: 'Self-Leveling untuk 1.000–2.000 micron, PU Crete untuk 3.000 micron ke atas dengan ketahanan suhu ekstrem.' },
  { title: 'Pekerjaan curving', body: 'Coving pertemuan lantai dan dinding dihitung terpisah per meter lari, bukan per meter persegi.' },
  { title: 'Kondisi dasar lantai', body: 'Beton retak, berminyak, atau bekas cat memerlukan persiapan permukaan lebih intensif.' },
  { title: 'Lokasi proyek', body: 'Jarak, akses kendaraan, dan ketersediaan listrik memengaruhi biaya mobilisasi tim dan alat.' },
];

export default async function HargaPage() {
  const contact = toContactInfo((await getSettings()).contact);
  const [o, epoxySystems, priceFaqs, copy] = await Promise.all([
    pageOverride(PATH),
    getEpoxySystems(),
    getPriceFaqs(),
    getPageCopy(PATH),
  ]);

  // Rentang harga dihitung dari pricelist yang sedang aktif di CMS,
  // bukan dari konstanta, supaya kalimat pembuka ikut berubah.
  const priceFloor = Math.min(...epoxySystems.map((x) => x.priceOver500));
  const priceCeiling = Math.max(...epoxySystems.map((x) => x.priceUnder100));
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Harga Epoxy Lantai', path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          serviceSchema({
            name: 'Harga Jasa Epoxy Lantai',
            description: 'Rentang harga jasa epoxy lantai per meter persegi berdasarkan sistem yang digunakan.',
            path: PATH,
            serviceType: 'Epoxy Flooring Pricing',
          }),
          faqSchema(priceFaqs),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="max-w-3xl">
          <p className="eyebrow">Harga & Estimasi</p>
          <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
            {o.h1 || 'Harga Epoxy Lantai per m² dan Faktor yang Memengaruhinya'}
          </h1>
          <div className="mt-6">
            <AnswerBox override={o.intro}>
              <p>
                Harga jasa epoxy lantai kami berkisar {formatRupiah(priceFloor)} sampai{' '}
                {formatRupiah(priceCeiling)} per m². Angka terendah berlaku untuk Self-Leveling
                1.000 micron pada area di atas 500 m², sedangkan angka tertinggi untuk PU Crete
                9.000 micron pada area di bawah 100 m². Ketebalan dan luas area menentukan
                selisihnya.
              </p>
            </AnswerBox>
          </div>
          <p className="prose-brand mt-5">
            Tabel di bawah adalah pricelist resmi {site.legalName}, bukan perkiraan. Harga per meter
            persegi turun otomatis ketika luas area melewati 100 m² dan 500 m², karena mobilisasi
            alat serta tim terbagi ke area yang lebih besar.
          </p>
        </div>
      </section>

      {/* TABEL HARGA */}
      <section className="container-page pb-14">
        <SectionHead {...sh(copy, 'pricelist-resmi', { eyebrow: 'Pricelist Resmi', title: 'Harga epoxy lantai per m² menurut ketebalan', lead: 'Tiga kolom harga di bawah mengikuti luas area yang dikerjakan dalam satu proyek.' })} as="h2" />
        <div className="mt-7 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
          <table className="w-full min-w-[820px] border-collapse bg-white text-left text-sm">
            <caption className="sr-only">
              Pricelist epoxy lantai per meter persegi menurut ketebalan cat dan luas area
            </caption>
            <thead>
              <tr className="bg-navy-900 text-white">
                <th scope="col" className="px-4 py-3.5 font-bold">Ketebalan cat</th>
                <th scope="col" className="px-4 py-3.5 font-bold">Sistem</th>
                <th scope="col" className="px-4 py-3.5 text-right font-bold">&lt; 100 m²</th>
                <th scope="col" className="px-4 py-3.5 text-right font-bold">&gt; 100 m²</th>
                <th scope="col" className="px-4 py-3.5 text-right font-bold">&gt; 500 m²</th>
              </tr>
            </thead>
            <tbody>
              {epoxySystems.map((s, i) => (
                <tr key={s.slug} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                  <th scope="row" className="whitespace-nowrap px-4 py-3.5 font-bold text-navy-900">
                    {s.micron.toLocaleString('id-ID')} micron
                  </th>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{s.family}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-slate-600">
                    {formatRupiah(s.priceUnder100)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-slate-600">
                    {formatRupiah(s.priceOver100)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-forest-700">
                    {formatRupiah(s.priceOver500)}
                  </td>
                </tr>
              ))}
              <tr className="bg-cream-100">
                <th scope="row" className="whitespace-nowrap px-4 py-3.5 font-bold text-navy-900">
                  {curvingPrice.label}
                </th>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">Per {curvingPrice.unit}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right text-slate-600">
                  {formatRupiah(curvingPrice.under100)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right text-slate-600">
                  {formatRupiah(curvingPrice.over100)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-forest-700">
                  {formatRupiah(curvingPrice.over500)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Disclaimer>
          Pricelist ditinjau terakhir pada {site.priceLastReviewed}. Harga belum termasuk PPN,
          perbaikan struktural, penanganan kelembapan beton, serta mobilisasi ke luar kota.
          Penawaran resmi diterbitkan setelah survei lokasi.
        </Disclaimer>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card">
            <h3 className="text-base">Self-Leveling (1.000–2.000 micron)</h3>
            <p className="prose-brand mt-2 text-[14px]">
              Sistem yang meratakan diri sehingga menutup pori dan celah kecil tanpa meninggalkan
              bekas rol. Cocok untuk dapur komersial (SPPG), rumah sakit, laboratorium, fasilitas
              farmasi, lapangan olahraga, hingga perkantoran modern.
            </p>
          </div>
          <div className="card">
            <h3 className="text-base">PU Crete (3.000–9.000 micron)</h3>
            <p className="prose-brand mt-2 text-[14px]">
              Menggabungkan resin poliuretan, agregat semen, dan bahan pengeras. Tahan suhu panas
              maupun dingin termasuk paparan air mendidih dan area freezer, serta meredam muai-susut
              beton. Cocok untuk pabrik, pergudangan, dan industri kimia.
            </p>
          </div>
        </div>
      </section>

      {/* KALKULATOR */}
      <section className="bg-cream-100 py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <SectionHead {...sh(copy, 'hitung-sendiri', { eyebrow: 'Hitung Sendiri', title: 'Perkirakan anggaran sebelum survei', lead: 'Masukkan luas area dan pilih ketebalan yang sesuai. Kalkulator memakai angka pricelist resmi di atas, termasuk penyesuaian tier luas area.' })} />
            <div className="mt-6 rounded-2xl border border-navy-900/10 bg-white p-5">
              <h3 className="text-base">Contoh perhitungan</h3>
              <p className="prose-brand mt-2 text-[14px]">
                Pabrik 600 m² dengan PU Crete 4.000 micron:
              </p>
              <ol className="mt-3 space-y-1.5 text-[14px] text-slate-600">
                <li>1. Luas 600 m² masuk tier &gt; 500 m²</li>
                <li>2. Harga tier tersebut: {formatRupiah(310000)} / m²</li>
                <li>3. Perhitungan: 600 m² × {formatRupiah(310000)}</li>
                <li className="font-bold text-forest-700">= {formatRupiah(310000 * 600)}</li>
              </ol>
              <p className="mt-3 text-xs text-slate-500">
                Belum termasuk curving, perbaikan lantai, dan mobilisasi.
              </p>
            </div>
          </div>
          <PriceCalculator systems={epoxySystems} curvingPrice={curvingPrice} contact={contact} />
        </div>
      </section>

      {/* FAKTOR HARGA */}
      <section className="container-page py-14">
        <SectionHead {...sh(copy, 'faktor-harga', { eyebrow: 'Faktor Harga', title: 'Enam hal yang mengubah angka penawaran' })} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priceFactors.map((f, i) => (
            <article key={f.title} className="card">
              <span className="text-sm font-extrabold text-leaf-500">0{i + 1}</span>
              <h3 className="mt-2 text-base">{f.title}</h3>
              <p className="prose-brand mt-2 text-[14px]">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* MINIMUM ORDER */}
      <section className="container-page pb-14">
        <div className="rounded-3xl bg-navy-900 p-7 text-white sm:p-10">
          <h2 className="text-2xl text-white">Kenapa area besar lebih murah per meter?</h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-white/75">
            Biaya mobilisasi mesin, genset, dan tim relatif tetap, berapa pun luas yang dikerjakan.
            Pada area di bawah 100 m² biaya tersebut ditanggung oleh sedikit meter persegi sehingga
            harga satuannya lebih tinggi. Begitu luas melewati 100 m² dan 500 m², biaya tetap
            tersebut terbagi lebih merata dan harga per m² turun sesuai pricelist.
          </p>
          <Link href="/kontak" className="btn-primary mt-6">
            Tanyakan Ketentuan untuk Area Anda
            <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FaqList faqs={priceFaqs} title="Pertanyaan Seputar Harga" />

      <section id="form" className="container-page scroll-mt-24 pb-14">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead {...sh(copy, 'estimasi-dari-foto', { eyebrow: 'Estimasi dari Foto', title: 'Kirim foto lantai, terima estimasi awal', lead: 'Foto membantu kami menilai kondisi permukaan sehingga estimasi lebih mendekati angka final.' })} />
          <QuotationForm source="harga-epoxy-lantai" />
        </div>
      </section>

      <CtaBand
        title="Ingin angka yang lebih pasti?"
        body="Survei lokasi memungkinkan kami mengukur luas sebenarnya, memeriksa kelembapan beton, dan menghitung kebutuhan perbaikan."
        primaryLabel="Jadwalkan Survei"
      />
    </>
  );
}
