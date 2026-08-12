import { buildMetadata, faqSchema, serviceSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { LpHero, LpPortfolio, LpStickyCta, LpSteps, LpTrustBar } from '@/components/LpBlocks';
import { FaqList, Disclaimer, SectionHead } from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { PriceCalculator } from '@/components/PriceCalculator';
import { curvingPrice, formatRupiah, projects, priceRange } from '@/lib/content';
import { getEpoxySystems, getPriceFaqs } from '@/lib/content-db';
import { site } from '@/lib/site';
import { getSettings } from '@/lib/settings';
import { toContactInfo } from '@/lib/contact';

const PATH = '/lp/harga-epoxy-lantai';
const CLUSTER = 'harga';
const WA = 'Halo, saya lihat iklan harga epoxy lantai. Mohon info biaya untuk area saya.';

export const metadata = buildMetadata({
  title: 'Harga Epoxy Lantai per m² — Estimasi Cepat',
  description:
    'Cek rentang harga epoxy lantai per m² berdasarkan sistem, hitung estimasi dengan kalkulator, dan minta penawaran tertulis dari kontraktor epoxy.',
  path: PATH,
  noindex: true,
});

const priceFactors = [
  { title: 'Luas area', body: 'Area lebih luas membuat biaya per m² lebih efisien.' },
  { title: 'Kondisi dasar lantai', body: 'Retak, minyak, dan bekas cat menambah pekerjaan persiapan.' },
  { title: 'Ketebalan sistem', body: 'Lapisan 1.000 micron jauh lebih murah dibanding PU Crete 9.000 micron.' },
  { title: 'Lokasi proyek', body: 'Jarak dan akses memengaruhi biaya mobilisasi alat dan tim.' },
  { title: 'Jadwal pengerjaan', body: 'Kerja malam atau akhir pekan menambah biaya tenaga kerja.' },
  { title: 'Perbaikan tambahan', body: 'Leveling, coving, dan marka dihitung sebagai item terpisah.' },
];

export default async function LpHarga() {
  const contact = toContactInfo((await getSettings()).contact);
  const [epoxySystems, priceFaqs] = await Promise.all([getEpoxySystems(), getPriceFaqs()]);
  const priceFloor = Math.min(...epoxySystems.map((x) => x.priceOver500));
  const priceCeiling = Math.max(...epoxySystems.map((x) => x.priceUnder100));
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Harga Jasa Epoxy Lantai',
            description: 'Rentang harga jasa epoxy lantai per meter persegi menurut sistem yang digunakan.',
            path: PATH,
            serviceType: 'Epoxy Flooring Pricing',
          }),
          faqSchema(priceFaqs),
        ]}
      />

      <LpHero
        eyebrow="Harga & Estimasi"
        h1="Harga Epoxy Lantai per m² — Hitung Estimasi Sekarang"
        benefit={`Pricelist resmi mulai ${formatRupiah(priceFloor)} sampai ${formatRupiah(priceCeiling)} per m² tergantung ketebalan dan luas area. Gunakan kalkulator untuk menyiapkan anggaran, lalu minta penawaran tertulis.`}
        bullets={[
          'Rentang harga per sistem yang transparan',
          'Kalkulator estimasi berdasarkan kondisi lantai',
          'Estimasi awal dari foto lantai',
          'Penawaran tertulis setelah survei',
        ]}
        waMessage={WA}
        cluster={CLUSTER}
      />

      <LpTrustBar
        items={[
          { label: 'Mulai dari', value: `${formatRupiah(priceFloor)}/m²` },
          { label: 'Sistem', value: '6 Pilihan' },
          { label: 'Estimasi', value: 'Dari Foto' },
          { label: 'Penawaran', value: 'Tertulis' },
        ]}
      />

      {/* TABEL HARGA */}
      <section className="container-page py-12">
        <SectionHead eyebrow="Tabel Harga" title="Rentang harga per sistem epoxy" />
        <div className="mt-7 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
          <table className="w-full min-w-[680px] border-collapse bg-white text-left text-sm">
            <caption className="sr-only">Rentang harga jasa epoxy lantai per meter persegi</caption>
            <thead>
              <tr className="bg-navy-900 text-white">
                <th scope="col" className="px-4 py-3.5 font-bold">Sistem</th>
                <th scope="col" className="px-4 py-3.5 font-bold">Ketebalan</th>
                <th scope="col" className="px-4 py-3.5 text-right font-bold">Mulai / m²</th>
                <th scope="col" className="px-4 py-3.5 text-right font-bold">Batas atas / m²</th>
              </tr>
            </thead>
            <tbody>
              {epoxySystems.map((s, i) => (
                <tr key={s.slug} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                  <th scope="row" className="px-4 py-3.5 font-bold text-navy-900">{s.name}</th>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{s.thicknessLabel}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-forest-700">
                    {formatRupiah(priceRange(s).from)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-slate-600">
                    {formatRupiah(priceRange(s).to)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Disclaimer>
          Rentang berlaku sejak {site.priceLastReviewed} untuk kondisi pengerjaan normal, belum
          termasuk PPN, perbaikan struktural, dan mobilisasi luar kota.
        </Disclaimer>
      </section>

      {/* KALKULATOR */}
      <section className="bg-cream-100 py-12">
        <div className="container-page grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <div>
            <SectionHead
              eyebrow="Kalkulator"
              title="Hitung estimasi untuk area Anda"
              lead="Masukkan luas dan pilih sistem yang mendekati kebutuhan. Kalkulator menyesuaikan faktor kondisi lantai dan jadwal."
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {priceFactors.map((f, i) => (
                <div key={f.title} className="rounded-xl bg-white p-4">
                  <span className="text-[11px] font-extrabold text-leaf-500">0{i + 1}</span>
                  <h3 className="mt-1 text-[14px]">{f.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
          <PriceCalculator systems={epoxySystems} curvingPrice={curvingPrice} contact={contact} />
        </div>
      </section>

      <LpSteps
        steps={[
          { title: 'Kirim foto', body: 'Foto lantai dan perkiraan luas untuk estimasi awal.' },
          { title: 'Terima rentang', body: 'Kami sampaikan rentang biaya berdasarkan kondisi terlihat.' },
          { title: 'Survei lokasi', body: 'Pengukuran akurat dan pemeriksaan kelembapan beton.' },
          { title: 'Penawaran final', body: 'Rincian item pekerjaan dan jadwal pelaksanaan.' },
        ]}
      />

      <LpPortfolio projects={projects} />

      <FaqList faqs={priceFaqs} title="Pertanyaan Seputar Harga" />

      <section id="form" className="container-page scroll-mt-20 py-12">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead
            eyebrow="Estimasi dari Foto"
            title="Unggah foto lantai untuk estimasi lebih akurat"
            lead="Foto membantu kami menilai kondisi permukaan sehingga rentang yang kami berikan lebih mendekati angka final."
          />
          <QuotationForm source="lp-harga-epoxy-lantai" />
        </div>
      </section>

      <LpStickyCta waMessage={WA} cluster={CLUSTER} />
    </>
  );
}
