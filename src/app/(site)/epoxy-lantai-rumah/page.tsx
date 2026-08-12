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
  ProjectPhoto,
  SectionHead,
} from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { formatRupiah, priceForArea } from '@/lib/content';
import { getEpoxySystems } from '@/lib/content-db';
import { IconArrow, IconWhatsApp } from '@/components/Icons';
import { getSettings } from '@/lib/settings';
import { toContactInfo, waHref } from '@/lib/contact';
import { TrackedLink } from '@/components/TrackedLink';
import { getPageCopy, getPageImages, imageOr } from '@/lib/page-copy';
import { sh } from '@/lib/page-slots';

const PATH = '/epoxy-lantai-rumah';

const DEFAULT_TITLE = 'Epoxy Lantai Rumah — Garasi, Kamar Mandi & Keramik';
const DEFAULT_DESC =
  'Jasa epoxy lantai rumah untuk garasi, carport, kamar mandi, dapur, dan lantai keramik lama. Permukaan tanpa nat, mudah dibersihkan, dikerjakan aplikator berpengalaman.';

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

const areas = [
  {
    title: 'Garasi & Carport',
    body: 'Area yang menerima beban roda kendaraan dan tetesan oli. Sistem coating dengan topcoat tahan bahan kimia ringan biasanya sudah memadai untuk mobil pribadi.',
    system: 'Self-Leveling 1.000–2.000 micron',
  },
  {
    title: 'Kamar Mandi & Area Basah',
    body: 'Membutuhkan permukaan anti-slip dan kemiringan menuju floor drain. PU Crete lebih sesuai karena lebih tahan air dan perubahan suhu.',
    system: 'Polyurethane Anti-Slip',
  },
  {
    title: 'Lantai Keramik Lama',
    body: 'Keramik dapat dilapisi tanpa dibongkar bila masih menempel kuat. Permukaan diasarkan lebih dulu, lalu diberi primer khusus permukaan non-porous.',
    system: 'Primer Khusus + Coating',
  },
  {
    title: 'Dapur Rumah',
    body: 'Area yang sering terkena minyak dan air. Permukaan menyatu tanpa nat membuat pembersihan jauh lebih cepat dibanding keramik.',
    system: 'Epoxy Coating / PU',
  },
  {
    title: 'Teras & Outdoor',
    body: 'Perlu topcoat tahan sinar UV agar warna tidak cepat menguning. Kami sampaikan keterbatasan material untuk area terbuka secara terbuka.',
    system: 'PU UV-Resistant',
  },
  {
    title: 'Ruang Usaha di Rumah',
    body: 'Laundry, kafe rumahan, atau bengkel kecil menuntut ketahanan lebih tinggi dibanding ruang keluarga biasa.',
    system: 'Self-Leveling 2.000 micron',
  },
];

/** Dibuat sebagai fungsi agar harga selalu mengikuti pricelist di CMS. */
function buildHomeFaqs(basePrice: number) {
  return [
  {
    q: 'Apakah epoxy cocok untuk lantai rumah?',
    a: 'Cocok untuk area fungsional seperti garasi, dapur, kamar mandi, dan teras karena permukaannya menyatu tanpa nat sehingga mudah dibersihkan. Untuk kamar tidur dan ruang tamu, banyak pemilik rumah tetap memilih keramik atau vinyl karena pertimbangan estetika dan kehangatan ruangan.',
  },
  {
    q: 'Berapa biaya epoxy lantai rumah untuk garasi 40 m²?',
    a: `Dengan Self-Leveling 1.000 micron pada tier luas di bawah 100 m² yaitu ${formatRupiah(basePrice)} per m², garasi 40 m² berada di kisaran ${formatRupiah(basePrice * 40)} sebelum penyesuaian kondisi lantai. Bila lantai berupa keramik atau memiliki retak, biaya persiapan bertambah.`,
  },
  {
    q: 'Apakah epoxy membuat lantai kamar mandi licin?',
    a: 'Epoxy standar dengan finish glossy memang licin saat basah, sehingga untuk kamar mandi kami menyarankan finishing bertekstur atau penambahan agregat anti-slip. Tingkat kekasaran disesuaikan agar tetap nyaman dilalui tanpa alas kaki.',
  },
  {
    q: 'Apakah rumah harus dikosongkan selama pengerjaan?',
    a: 'Hanya area yang dikerjakan yang perlu dikosongkan. Untuk garasi atau dapur, penghuni umumnya tetap dapat tinggal di rumah, namun area tersebut tidak boleh dilalui selama proses curing.',
  },
  {
    q: 'Apakah ada bau menyengat saat pengerjaan?',
    a: 'Material epoxy memiliki bau khas saat aplikasi dan beberapa jam setelahnya. Kami mengatur ventilasi selama pengerjaan, dan bau umumnya hilang setelah lapisan mengering. Untuk area dalam rumah, pengerjaan dijadwalkan agar ventilasi maksimal.',
    },
  ];
}

export default async function RumahPage() {
  const contact = toContactInfo((await getSettings()).contact);
  const [o, epoxySystems, copy, images] = await Promise.all([
    pageOverride(PATH),
    getEpoxySystems(),
    getPageCopy(PATH),
    getPageImages(PATH),
  ]);

  // Harga contoh di FAQ mengikuti sistem 1.000 micron yang aktif di CMS.
  const basePrice =
    epoxySystems.find((x) => x.micron === 1000)?.priceUnder100 ??
    epoxySystems[0]?.priceUnder100 ??
    0;
  const homeFaqs = buildHomeFaqs(basePrice);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Epoxy Lantai Rumah', path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          serviceSchema({
            name: 'Epoxy Lantai Rumah',
            description: 'Jasa aplikasi epoxy lantai untuk rumah tinggal: garasi, kamar mandi, dapur, teras, dan lantai keramik.',
            path: PATH,
            serviceType: 'Residential Epoxy Flooring',
          }),
          faqSchema(homeFaqs),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className="eyebrow">Epoxy Rumah</p>
            <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
              {o.h1 || 'Epoxy Lantai Rumah untuk Garasi, Kamar Mandi, dan Keramik Lama'}
            </h1>
            <div className="mt-6">
              <AnswerBox override={o.intro}>
                <p>
                  Epoxy lantai rumah adalah pelapisan lantai hunian dengan resin epoxy agar
                  permukaan menyatu tanpa nat, tidak berdebu, dan mudah dibersihkan. Paling sesuai
                  untuk garasi, carport, dapur, kamar mandi, dan teras. Lantai keramik lama dapat
                  dilapisi tanpa dibongkar selama masih menempel kuat.
                </p>
              </AnswerBox>
            </div>

            {/* PRD §5.4: bedakan jasa aplikasi dari penjualan cat */}
            <div className="mt-6 rounded-2xl border-l-4 border-navy-900 bg-cream-100 p-5">
              <h2 className="text-base">Kami menyediakan jasa aplikasi, bukan menjual cat epoxy</h2>
              <p className="prose-brand mt-2 text-[14px]">
                Bila Anda mencari cat epoxy kemasan kaleng untuk dikerjakan sendiri, kebutuhan
                tersebut berbeda dengan layanan kami. Jayati Epoxy mengerjakan pelapisan lantai
                secara menyeluruh — mulai persiapan permukaan dengan mesin, aplikasi berlapis,
                sampai serah terima.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <TrackedLink
                href={waHref(contact, 'Halo, saya ingin epoxy lantai untuk rumah saya.', 'rumah-hero')}
                external
                event="whatsapp_click"
                params={{ cta_position: 'hero', keyword_cluster: 'rumah' }}
                className="btn-primary"
              >
                <IconWhatsApp className="h-4 w-4" />
                Tanya Kebutuhan Rumah
              </TrackedLink>
              <Link href="#form" className="btn-outline">
                Minta Estimasi <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {/* Foto asli dokumentasi perusahaan, bukan placeholder. */}
          <ProjectPhoto
            photo={imageOr(images, 'hero-foto', {
              src: '/img/proyek/dapur-komersial-self-leveling/3.webp',
              width: 1200,
              height: 1600,
              alt: 'Ruangan dengan lantai epoxy self-leveling putih mengilap tanpa sambungan',
              caption: 'Hasil self-leveling: permukaan rata tanpa nat, mudah dibersihkan.',
            })}
            ratio="aspect-[4/3]"
            sizes="(min-width: 1024px) 520px, 100vw"
          />
        </div>
      </section>

      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <SectionHead {...sh(copy, 'area-di-rumah', { eyebrow: 'Area di Rumah', title: 'Setiap ruangan punya kebutuhan berbeda', lead: 'Menggunakan satu sistem untuk semua ruangan adalah kesalahan umum. Kamar mandi dan garasi menghadapi tantangan yang tidak sama.' })} />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <article key={a.title} className="card">
                <h3 className="text-lg">{a.title}</h3>
                <p className="prose-brand mt-2 text-[14px]">{a.body}</p>
                <p className="mt-4 inline-block rounded-lg bg-leaf-50 px-3 py-1.5 text-[12px] font-bold text-forest-700">
                  {a.system}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead {...sh(copy, 'keramik', { eyebrow: 'Keramik', title: 'Melapisi lantai keramik tanpa dibongkar' })} />
            <p className="prose-brand mt-4">
              Membongkar keramik berarti biaya bongkar, buangan puing, dan waktu tambahan. Pada
              banyak kasus keramik masih dapat dipertahankan sebagai dasar, asalkan memenuhi
              beberapa syarat teknis.
            </p>
            <CheckList
              items={[
                'Keramik masih menempel kuat, tidak kopong saat diketuk',
                'Tidak ada rembesan air dari bawah lantai',
                'Permukaan diasarkan agar primer dapat mengunci',
                'Nat diisi rata agar tidak membayang di lapisan akhir',
              ]}
            />
            <Disclaimer>
              Keramik yang sudah popping, retak struktural, atau lembap permanen sebaiknya dibongkar.
              Melapisi dasar yang bermasalah hanya memindahkan kerusakan ke lapisan baru.
            </Disclaimer>
          </div>
          <div>
            <SectionHead {...sh(copy, 'perbandingan', { eyebrow: 'Perbandingan', title: 'Epoxy dibanding keramik untuk area rumah' })} />
            <div className="mt-5 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
              <table className="w-full min-w-[420px] border-collapse bg-white text-left text-sm">
                <caption className="sr-only">Perbandingan lantai epoxy dan keramik untuk rumah</caption>
                <thead>
                  <tr className="bg-navy-900 text-white">
                    <th scope="col" className="px-4 py-3 font-bold">Aspek</th>
                    <th scope="col" className="px-4 py-3 font-bold">Epoxy</th>
                    <th scope="col" className="px-4 py-3 font-bold">Keramik</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Nat', 'Tidak ada', 'Ada, perlu disikat'],
                    ['Pembersihan', 'Cukup dipel', 'Sikat nat berkala'],
                    ['Beban kendaraan', 'Kuat (sistem tebal)', 'Berisiko pecah'],
                    ['Perbaikan', 'Per area', 'Per keping'],
                    ['Waktu pakai', 'Tunggu curing', 'Segera setelah nat kering'],
                  ].map(([a, b, c], i) => (
                    <tr key={a} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                      <th scope="row" className="px-4 py-3 font-semibold text-navy-900">{a}</th>
                      <td className="px-4 py-3 text-slate-600">{b}</td>
                      <td className="px-4 py-3 text-slate-600">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/blog/epoxy-vs-keramik-untuk-lantai" className="link-underline mt-4 inline-block text-sm">
              Baca perbandingan lengkap epoxy vs keramik
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <SectionHead {...sh(copy, 'estimasi', { eyebrow: 'Estimasi', title: 'Perkiraan biaya untuk area rumah' })} center />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Garasi 1 mobil', area: '± 20 m²', sys: 'Self-Leveling 1.000 micron' },
              { label: 'Garasi 2 mobil', area: '± 40 m²', sys: 'Self-Leveling 1.000 micron' },
              { label: 'Dapur + teras', area: '± 60 m²', sys: 'Self-Leveling 1.000 micron' },
            ].map((c) => {
              const sysData = epoxySystems[0]!;
              const sqm = Number(c.area.replace(/[^\d]/g, ''));
              return (
                <div key={c.label} className="card text-center">
                  <h3 className="text-base">{c.label}</h3>
                  <p className="mt-1 text-[13px] text-slate-500">{c.area} · {c.sys}</p>
                  <p className="mt-3 text-lg font-extrabold text-forest-700">
                    {formatRupiah(priceForArea(sysData, sqm) * sqm)}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {formatRupiah(priceForArea(sysData, sqm))}/m² · tier di bawah 100 m²
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mx-auto mt-6 max-w-3xl">
            <Disclaimer>
              Angka di atas dihitung dari pricelist resmi {epoxySystems[0]!.name} pada tier luas di
              bawah 100 m², dan belum memperhitungkan kondisi dasar lantai, perbaikan, maupun
              mobilisasi. Gunakan{' '}
              <Link className="link-underline" href="/harga-epoxy-lantai#form">kalkulator estimasi</Link>{' '}
              untuk perhitungan yang lebih sesuai.
            </Disclaimer>
          </div>
        </div>
      </section>

      <FaqList faqs={homeFaqs} title="Pertanyaan Seputar Epoxy Rumah" />

      <section id="form" className="container-page scroll-mt-24 pb-14">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead {...sh(copy, 'konsultasi-rumah', { eyebrow: 'Konsultasi Rumah', title: 'Ceritakan area yang ingin dikerjakan', lead: 'Sertakan foto lantai saat ini agar kami dapat menilai kondisi permukaan dan menyarankan sistem yang sesuai.' })} />
          <QuotationForm source="epoxy-lantai-rumah" />
        </div>
      </section>

      <CtaBand
        title="Ingin garasi yang tidak berdebu lagi?"
        body="Kirim foto lantai garasi atau area rumah Anda. Kami bantu perkirakan kebutuhan sebelum survei."
      />
    </>
  );
}
