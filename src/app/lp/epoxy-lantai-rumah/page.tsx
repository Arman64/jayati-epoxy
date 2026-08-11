import { buildMetadata, faqSchema, serviceSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { LpHero, LpPortfolio, LpProblems, LpStickyCta, LpSteps, LpTrustBar } from '@/components/LpBlocks';
import { FaqList, Disclaimer, SectionHead } from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { formatRupiah, projects, priceForArea, priceRange } from '@/lib/content';
import { getEpoxySystems } from '@/lib/content-db';

const PATH = '/lp/epoxy-lantai-rumah';
const CLUSTER = 'rumah';
const WA = 'Halo, saya lihat iklan epoxy lantai rumah. Mohon dibantu estimasinya.';

export const metadata = buildMetadata({
  title: 'Epoxy Lantai Rumah — Garasi, Kamar Mandi & Keramik',
  description:
    'Jasa epoxy lantai rumah untuk garasi, carport, kamar mandi, dapur, dan lantai keramik lama. Permukaan tanpa nat dan mudah dibersihkan.',
  path: PATH,
  noindex: true,
});

const faqs = [
  {
    q: 'Apakah lantai keramik harus dibongkar?',
    a: 'Tidak selalu. Selama keramik masih menempel kuat dan tidak ada rembesan air dari bawah, permukaan cukup diasarkan lalu diberi primer khusus non-porous. Keramik yang sudah kopong atau popping sebaiknya dibongkar.',
  },
  {
    q: 'Apakah epoxy kamar mandi licin?',
    a: 'Finish glossy memang licin saat basah, sehingga untuk kamar mandi kami sarankan finishing bertekstur atau agregat anti-slip dengan tingkat kekasaran yang tetap nyaman dilalui tanpa alas kaki.',
  },
  {
    q: 'Berapa lama pengerjaan garasi rumah?',
    a: 'Untuk garasi 20–40 m² dengan sistem coating, umumnya 2–3 hari kerja termasuk waktu curing sebelum dapat dilalui kendaraan ringan.',
  },
  {
    q: 'Apakah penghuni harus pindah selama pengerjaan?',
    a: 'Tidak perlu. Hanya area yang dikerjakan yang harus dikosongkan dan tidak dilalui selama curing. Kami mengatur ventilasi agar bau material cepat hilang.',
  },
  {
    q: 'Apakah Jayati Epoxy menjual cat epoxy kaleng?',
    a: 'Tidak. Kami menyediakan jasa aplikasi menyeluruh, mulai persiapan permukaan dengan mesin sampai serah terima, bukan penjualan material eceran untuk dikerjakan sendiri.',
  },
];

export default async function LpRumah() {
  const epoxySystems = await getEpoxySystems();
  const coating = epoxySystems[0]!;

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Epoxy Lantai Rumah',
            description: 'Jasa aplikasi epoxy lantai untuk rumah tinggal: garasi, kamar mandi, dapur, dan keramik.',
            path: PATH,
            serviceType: 'Residential Epoxy Flooring',
          }),
          faqSchema(faqs),
        ]}
      />

      <LpHero
        eyebrow="Epoxy Lantai Rumah"
        h1="Epoxy Lantai Rumah untuk Garasi, Kamar Mandi, dan Keramik Lama"
        benefit="Lantai menyatu tanpa nat sehingga berhenti berdebu dan cukup dipel. Keramik lama umumnya dapat dilapisi tanpa dibongkar."
        bullets={[
          'Garasi & carport tahan beban kendaraan',
          'Kamar mandi dengan finishing anti-slip',
          'Keramik dilapisi tanpa bongkar',
          'Dapur bebas nat, mudah dibersihkan',
        ]}
        waMessage={WA}
        cluster={CLUSTER}
      />

      <LpTrustBar
        items={[
          { label: 'Garasi 40 m²', value: '2–3 Hari' },
          { label: 'Mulai dari', value: `${formatRupiah(priceRange(coating).from)}/m²` },
          { label: 'Keramik', value: 'Tanpa Bongkar' },
          { label: 'Estimasi', value: 'Dari Foto' },
        ]}
      />

      <LpProblems
        title="Keluhan lantai rumah yang sering kami tangani"
        items={[
          { p: 'Garasi berdebu dan menghitam', s: 'Pori beton ditutup lapisan epoxy sehingga debu berhenti dan noda mudah dilap.' },
          { p: 'Nat keramik sulit dibersihkan', s: 'Permukaan epoxy menyatu tanpa nat sehingga tidak ada celah penampung kotoran.' },
          { p: 'Kamar mandi licin', s: 'Finishing bertekstur anti-slip dengan kemiringan menuju floor drain.' },
          { p: 'Lantai dapur bernoda minyak', s: 'Topcoat yang lebih tahan minyak dan mudah dibersihkan.' },
          { p: 'Carport retak rambut', s: 'Retak diisi filler lebih dulu sebelum pelapisan agar tidak membayang.' },
          { p: 'Teras cepat kusam', s: 'Topcoat tahan UV untuk memperlambat perubahan warna di area terbuka.' },
        ]}
      />

      <section className="bg-cream-100 py-12">
        <div className="container-page">
          <SectionHead eyebrow="Estimasi Cepat" title="Perkiraan biaya area rumah" />
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Garasi 1 mobil', sqm: 20 },
              { label: 'Garasi 2 mobil', sqm: 40 },
              { label: 'Dapur + teras', sqm: 60 },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-navy-900/10 bg-white p-5 text-center shadow-card">
                <h3 className="text-base">{c.label}</h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  ± {c.sqm} m² · {coating.name}
                </p>
                <p className="mt-3 text-lg font-extrabold text-forest-700">
                  {formatRupiah(priceForArea(coating, c.sqm) * c.sqm)}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {formatRupiah(priceForArea(coating, c.sqm))}/m²
                </p>
              </div>
            ))}
          </div>
          <Disclaimer>
            Dihitung dari pricelist resmi {coating.name} pada tier luas di bawah 100 m². Belum
            memperhitungkan kondisi dasar lantai, perbaikan, dan mobilisasi. Angka final ditetapkan
            setelah survei.
          </Disclaimer>
        </div>
      </section>

      <LpSteps
        steps={[
          { title: 'Kirim foto', body: 'Foto area rumah dan perkiraan luas untuk estimasi awal.' },
          { title: 'Rekomendasi', body: 'Kami sarankan sistem sesuai ruangan dan penggunaannya.' },
          { title: 'Pengerjaan', body: 'Persiapan permukaan, primer, lapisan utama, dan topcoat.' },
          { title: 'Serah terima', body: 'Panduan curing dan cara perawatan agar lapisan awet.' },
        ]}
      />

      <LpPortfolio projects={projects.filter((p) => p.category === 'Rumah' || p.category === 'Komersial')} />

      <FaqList faqs={faqs} title="Pertanyaan Seputar Epoxy Rumah" />

      <section id="form" className="container-page scroll-mt-20 py-12">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead
            eyebrow="Konsultasi Rumah"
            title="Ceritakan area yang ingin dikerjakan"
            lead="Sertakan foto lantai saat ini agar kami dapat menilai kondisi permukaan."
          />
          <QuotationForm source="lp-epoxy-lantai-rumah" />
        </div>
      </section>

      <LpStickyCta waMessage={WA} cluster={CLUSTER} />
    </>
  );
}
