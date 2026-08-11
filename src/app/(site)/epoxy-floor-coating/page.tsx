import Link from 'next/link';
import { buildMetadata, breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import {
  AnswerBox,
  Breadcrumbs,
  CheckList,
  CtaBand,
  Disclaimer,
  FaqList,
  PhotoSlot,
  SectionHead,
} from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { formatRupiah, priceRange } from '@/lib/content';
import { getEpoxySystems } from '@/lib/content-db';
import { IconArrow, IconWhatsApp } from '@/components/Icons';
import { waLink, site } from '@/lib/site';
import { TrackedLink } from '@/components/TrackedLink';

const PATH = '/epoxy-floor-coating';

const DEFAULT_TITLE = 'Epoxy Floor Coating — Pelapis Lantai Beton Pelindung';
const DEFAULT_DESC =
  'Epoxy floor coating untuk melindungi lantai beton dari debu, abrasi, dan tumpahan. Cocok untuk gudang, area komersial, dan ruang produksi. Aplikasi roll berlapis oleh aplikator.';

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

const coatingFaqs = [
  {
    q: 'Apa itu epoxy floor coating?',
    a: 'Epoxy floor coating adalah lapisan pelindung tipis berbahan resin epoxy dua komponen yang diaplikasikan di atas lantai beton, umumnya setebal 200–300 micron. Fungsinya menutup pori beton sehingga lantai tidak berdebu, lebih tahan tumpahan, dan mudah dibersihkan.',
  },
  {
    q: 'Apa bedanya coating dengan self-leveling?',
    a: 'Coating diaplikasikan dengan roll dan mengikuti kontur lantai yang ada, sehingga lantai yang bergelombang akan tetap terlihat bergelombang. Self-leveling dituang lebih tebal dan mengalir sendiri sehingga menghasilkan permukaan yang jauh lebih rata, dengan biaya beberapa kali lipat.',
  },
  {
    q: 'Berapa lama umur pakai epoxy floor coating?',
    a: 'Pada area dengan lalu lintas ringan sampai sedang dan perawatan rutin, lapisan coating umumnya bertahan beberapa tahun sebelum memerlukan pelapisan ulang topcoat. Umur pakai sangat dipengaruhi intensitas penggunaan, jenis beban, dan kualitas persiapan permukaan awal.',
  },
  {
    q: 'Apakah coating bisa diaplikasikan ulang tanpa membongkar lapisan lama?',
    a: 'Bisa, selama lapisan lama masih melekat kuat dan tidak mengelupas. Permukaan diasarkan lebih dulu agar lapisan baru dapat mengunci. Bila lapisan lama sudah terangkat di banyak titik, pengelupasan menyeluruh lebih dianjurkan.',
  },
];

export default async function CoatingPage() {
  const [o, epoxySystems] = await Promise.all([
    pageOverride(PATH),
    getEpoxySystems(),
  ]);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Epoxy Floor Coating', path: PATH },
  ];
  const coating = epoxySystems[0]!;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          serviceSchema({
            name: 'Epoxy Floor Coating',
            description: 'Layanan aplikasi epoxy floor coating sebagai pelapis pelindung lantai beton.',
            path: PATH,
            serviceType: 'Epoxy Floor Coating',
          }),
          faqSchema(coatingFaqs),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className="eyebrow">Floor Coating</p>
            <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
              {o.h1 || 'Epoxy Floor Coating untuk Melindungi Lantai Beton'}
            </h1>
            <div className="mt-6">
              <AnswerBox override={o.intro}>
                <p>
                  Epoxy floor coating adalah lapisan pelindung setebal sekitar 200–300 micron yang
                  diaplikasikan di atas beton menggunakan roll. Lapisan ini menutup pori beton
                  sehingga lantai berhenti berdebu, lebih tahan terhadap tumpahan, dan jauh lebih
                  mudah dibersihkan dibanding beton terbuka.
                </p>
              </AnswerBox>
            </div>
            <CheckList
              columns={2}
              items={[
                'Menghentikan debu dari permukaan beton',
                'Aplikasi relatif cepat dibanding sistem tebal',
                'Pilihan warna solid sesuai kebutuhan area',
                'Dapat dikombinasi topcoat anti-slip',
              ]}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedLink
                href={waLink('Halo, saya ingin konsultasi epoxy floor coating.', 'coating-hero')}
                external
                event="whatsapp_click"
                params={{ cta_position: 'hero', keyword_cluster: 'coating' }}
                className="btn-primary"
              >
                <IconWhatsApp className="h-4 w-4" />
                Konsultasi Coating
              </TrackedLink>
              <Link href="#form" className="btn-outline">
                Minta Penawaran <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <PhotoSlot label="Aplikasi Roll Floor Coating" caption="Gunakan foto proses aplikasi roll di lokasi proyek." />
        </div>
      </section>

      <section className="bg-cream-100 py-14">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Kapan Tepat" title="Coating cocok untuk area seperti ini" />
            <CheckList
              items={[
                'Gudang dengan lalu lintas hand pallet dan trolley',
                'Area parkir dalam gedung',
                'Ruang produksi non-berat dan area pengemasan',
                'Ruko, showroom kecil, dan area komersial',
                'Basement dan koridor bangunan',
              ]}
            />
          </div>
          <div>
            <SectionHead eyebrow="Kapan Kurang Tepat" title="Sebaiknya naik ke sistem lebih tebal" />
            <CheckList
              items={[
                'Lalu lintas forklift berat setiap hari',
                'Area dengan benturan benda logam rutin',
                'Paparan bahan kimia agresif terus-menerus',
                'Lantai yang sangat bergelombang dan perlu diratakan',
                'Area basah permanen dengan sanitasi air panas',
              ]}
            />
            <Disclaimer>
              Memasang coating tipis pada area berat memang menekan biaya awal, tetapi lapisan akan
              cepat aus dan biaya perbaikan berulang justru lebih besar.
            </Disclaimer>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHead eyebrow="Harga" title="Rentang biaya epoxy floor coating" />
        <div className="mt-6 rounded-3xl bg-brand-gradient p-7 text-white sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-leaf-300">Rentang harga</p>
          <p className="mt-2 text-3xl font-extrabold sm:text-4xl">
            {formatRupiah(priceRange(coating).from)} – {formatRupiah(priceRange(coating).to)}
            <span className="ml-2 text-lg font-semibold text-white/70">/ m²</span>
          </p>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">
            Rentang untuk {coating.name} ({coating.thicknessLabel}). Angka terendah berlaku untuk
            area di atas 500 m², tertinggi untuk area di bawah 100 m², sesuai pricelist resmi per{' '}
            {site.priceLastReviewed}. Belum mencakup perbaikan lantai, penanganan kelembapan, serta
            mobilisasi luar kota.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/harga-epoxy-lantai" className="btn-primary">Lihat Semua Sistem & Kalkulator</Link>
            <Link href="/epoxy-lantai-industri" className="btn-ghost-light">Butuh Sistem Heavy Duty?</Link>
          </div>
        </div>
      </section>

      <FaqList faqs={coatingFaqs} title="Pertanyaan Seputar Floor Coating" />

      <section id="form" className="container-page scroll-mt-24 pb-14">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead eyebrow="Penawaran" title="Kirim detail area yang akan dilapisi" />
          <QuotationForm source="epoxy-floor-coating" />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
