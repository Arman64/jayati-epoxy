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
import { projects } from '@/lib/content';
import { IconArrow, IconWhatsApp } from '@/components/Icons';
import { waLink } from '@/lib/site';
import { TrackedLink } from '@/components/TrackedLink';

const PATH = '/epoxy-lantai-industri';

const DEFAULT_TITLE = 'Epoxy Lantai Industri — Pabrik, Gudang & Heavy Duty';
const DEFAULT_DESC =
  'Jasa epoxy lantai industri untuk pabrik, gudang, workshop, dan area food grade. Sistem heavy duty, persiapan permukaan mekanis, dan pengerjaan bertahap tanpa menghentikan operasional.';

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

/** Rekomendasi mengikuti katalog ketebalan resmi (1.000–9.000 micron). */
const loadTypes = [
  { load: 'Pejalan kaki & trolley ringan', system: 'Self-Leveling', thickness: '1.000 micron', note: 'Koridor, area kantor pabrik' },
  { load: 'Aktivitas produksi & higienitas tinggi', system: 'Self-Leveling', thickness: '2.000 micron', note: 'Ruang produksi, laboratorium' },
  { load: 'Area basah & pencucian rutin', system: 'PU Crete', thickness: '3.000 micron', note: 'Dapur industri, area cuci' },
  { load: 'Hand pallet & forklift harian', system: 'PU Crete', thickness: '4.000 micron', note: 'Gudang distribusi, pergudangan' },
  { load: 'Beban berat & paparan kimia', system: 'PU Crete', thickness: '6.000 micron', note: 'Industri kimia, area produksi berat' },
  { load: 'Thermal shock & area freezer', system: 'PU Crete', thickness: '8.000–9.000 micron', note: 'Cold storage, freezer' },
];

const industryFaqs = [
  {
    q: 'Apakah pabrik harus berhenti beroperasi selama pengerjaan?',
    a: 'Tidak selalu. Pekerjaan umumnya dibagi per zona sehingga sebagian area tetap beroperasi. Metode ini memperpanjang total durasi tetapi menekan kehilangan produksi. Pembagian zona disusun bersama tim maintenance sebelum pekerjaan dimulai.',
  },
  {
    q: 'Berapa lama downtime yang dibutuhkan per zona?',
    a: 'Sebagai acuan, satu zona membutuhkan sekitar 3–5 hari sejak persiapan permukaan sampai lapisan dapat dilalui pejalan kaki, dan sekitar 7 hari untuk beban penuh. Angka pasti bergantung sistem yang dipilih dan suhu ruangan.',
  },
  {
    q: 'Apakah epoxy tahan terhadap bahan kimia di area produksi?',
    a: 'Ketahanan kimia berbeda untuk setiap material dan hanya dapat dipastikan berdasarkan datasheet pabrikan. Kami meminta daftar bahan kimia yang digunakan di area tersebut, lalu mencocokkannya dengan chemical resistance chart material sebelum merekomendasikan sistem.',
  },
  {
    q: 'Apakah bisa untuk area food grade?',
    a: 'Bisa, umumnya menggunakan sistem PU Crete yang menggabungkan resin poliuretan dan agregat semen. Material ini tahan terhadap paparan air mendidih, sanitasi rutin, maupun area freezer. Detail sertifikasi material disampaikan bersama datasheet pada tahap penawaran.',
  },
  {
    q: 'Bagaimana penanganan lantai beton yang lembap?',
    a: 'Kelembapan beton yang tinggi adalah penyebab utama kegagalan epoxy di area industri. Bila hasil pemeriksaan menunjukkan kadar air tinggi, diperlukan primer penahan uap atau sistem yang lebih toleran terhadap kelembapan. Pemeriksaan ini dilakukan saat survei teknis.',
  },
  {
    q: 'Apakah termasuk marka jalur dan safety line?',
    a: 'Marka jalur forklift, zebra cross gudang, dan penandaan area dapat dikerjakan sebagai item terpisah pada penawaran, termasuk penentuan warna sesuai standar keselamatan yang berlaku di pabrik Anda.',
  },
];

export default async function IndustriPage() {
  const o = await pageOverride(PATH);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Epoxy Lantai Industri', path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          serviceSchema({
            name: 'Epoxy Lantai Industri',
            description: 'Jasa epoxy lantai industri untuk pabrik, gudang, workshop, dan area food grade dengan sistem heavy duty.',
            path: PATH,
            serviceType: 'Industrial Epoxy Flooring',
          }),
          faqSchema(industryFaqs),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className="eyebrow">Epoxy Industri</p>
            <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
              {o.h1 || 'Epoxy Lantai Industri untuk Pabrik, Gudang, dan Area Heavy Duty'}
            </h1>
            <div className="mt-6">
              <AnswerBox override={o.intro}>
                <p>
                  Epoxy lantai industri adalah sistem pelapisan lantai beton yang dirancang menahan
                  beban forklift, benturan, dan paparan bahan kimia. Ketebalan berkisar dari 300
                  micron untuk area ringan sampai 6 mm untuk sistem mortar. Pemilihan sistem
                  ditentukan oleh beban nyata dan aktivitas di area tersebut.
                </p>
              </AnswerBox>
            </div>
            <CheckList
              columns={2}
              items={[
                'Survei teknis termasuk cek kelembapan beton',
                'Persiapan permukaan grinding / shot blasting',
                'Pengerjaan bertahap per zona',
                'Opsi marka jalur dan safety line',
                'Rekomendasi berbasis datasheet material',
                'Laporan konsumsi material per area',
              ]}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedLink
                href={waLink('Halo, saya ingin konsultasi epoxy lantai untuk pabrik/gudang.', 'industri-hero')}
                external
                event="whatsapp_click"
                params={{ cta_position: 'hero', keyword_cluster: 'industri' }}
                className="btn-primary"
              >
                <IconWhatsApp className="h-4 w-4" />
                Diskusi Kebutuhan Teknis
              </TrackedLink>
              <TrackedLink href="#form" event="schedule_survey_click" params={{ cta_position: 'hero' }} className="btn-outline">
                Minta Survei Teknis <IconArrow className="h-4 w-4" />
              </TrackedLink>
            </div>
          </div>
          <ProjectPhoto
            photo={projects[2]!.photos[0]!}
            ratio="aspect-[4/3]"
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
          />
        </div>
      </section>

      {/* BEBAN */}
      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <SectionHead
            eyebrow="Pemilihan Sistem"
            title="Cocokkan sistem dengan beban dan aktivitas area"
            lead="Tabel berikut membantu menyempitkan pilihan sebelum survei. Keputusan akhir tetap memerlukan pemeriksaan kondisi lantai di lokasi."
          />
          <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
            <table className="w-full min-w-[720px] border-collapse bg-white text-left text-sm">
              <caption className="sr-only">Pemilihan sistem epoxy industri berdasarkan beban dan aktivitas area</caption>
              <thead>
                <tr className="bg-navy-900 text-white">
                  <th scope="col" className="px-4 py-3.5 font-bold">Beban / aktivitas</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Sistem disarankan</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Ketebalan</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Contoh area</th>
                </tr>
              </thead>
              <tbody>
                {loadTypes.map((l, i) => (
                  <tr key={l.load} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                    <th scope="row" className="px-4 py-3.5 font-bold text-navy-900">{l.load}</th>
                    <td className="px-4 py-3.5 font-semibold text-forest-700">{l.system}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{l.thickness}</td>
                    <td className="px-4 py-3.5 text-slate-600">{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Disclaimer>
            Angka ketebalan adalah rentang umum sistem, bukan spesifikasi final. Ketahanan abrasi dan
            kimia hanya dinyatakan berdasarkan datasheet material yang disepakati pada penawaran.
          </Disclaimer>
        </div>
      </section>

      {/* PERSIAPAN */}
      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Persiapan Permukaan" title="Tahap yang paling menentukan umur lapisan" />
            <p className="prose-brand mt-4">
              Di area industri, lantai beton biasanya sudah terkontaminasi oli, bahan kimia, atau
              lapisan cat lama. Menutup kontaminan tanpa membukanya lebih dulu akan menghasilkan
              kegagalan daya lekat dalam hitungan bulan.
            </p>
            <CheckList
              items={[
                'Diamond grinding untuk membuka pori beton',
                'Shot blasting untuk area luas dan kontaminasi berat',
                'Degreasing pada area bekas oli dan pelumas',
                'Pemeriksaan kadar kelembapan sebelum primer',
                'Penambalan retak dan pemulihan elevasi',
              ]}
            />
          </div>
          <div>
            <SectionHead eyebrow="Downtime" title="Menyusun jadwal tanpa menghentikan produksi" />
            <p className="prose-brand mt-4">
              Sebagian besar klien industri tidak dapat menghentikan operasional sepenuhnya. Karena
              itu perencanaan zona dan jadwal disusun sebelum mobilisasi, bukan saat pekerjaan
              berjalan.
            </p>
            <ol className="mt-5 space-y-3">
              {[
                'Pemetaan zona berdasarkan alur produksi dan jalur forklift',
                'Penentuan urutan zona agar akses tetap tersedia',
                'Pemasangan barrier dan penandaan area kerja',
                'Pengerjaan di luar jam operasional bila diperlukan',
                'Serah terima per zona sehingga area cepat dipakai kembali',
              ].map((t, i) => (
                <li key={t} className="flex gap-3 rounded-xl bg-cream-100 p-3.5 text-[14px] text-slate-700">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-navy-900 text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PROYEK B2B */}
      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="Dokumentasi B2B" title="Contoh proyek industri" />
            <Link href="/portofolio" className="btn-outline !py-2.5 text-sm">Semua Proyek</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {projects.slice(0, 4).map((p) => (
              <Link key={p.slug} href={`/portofolio/${p.slug}`} className="group">
                <ProjectPhoto
                  photo={p.photos[0]!}
                  showCaption={false}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <h3 className="mt-3 text-[15px] font-bold group-hover:text-forest-700">{p.name}</h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  {p.system} · {p.city}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqList faqs={industryFaqs} title="Pertanyaan Teknis Industri" />

      <section id="form" className="container-page scroll-mt-24 pb-14">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead
            eyebrow="Survei Teknis"
            title="Ajukan survei untuk area produksi Anda"
            lead="Sertakan informasi jenis beban, bahan kimia yang digunakan, dan jam operasional agar kami dapat menyiapkan rekomendasi yang tepat."
          />
          <QuotationForm source="epoxy-lantai-industri" />
        </div>
      </section>

      <CtaBand
        title="Perlu rekomendasi sistem untuk pabrik Anda?"
        body="Kirim data luas area, jenis forklift, dan bahan kimia yang digunakan. Kami cocokkan dengan datasheet material sebelum memberi rekomendasi."
        primaryLabel="Minta Survei Teknis"
      />
    </>
  );
}
