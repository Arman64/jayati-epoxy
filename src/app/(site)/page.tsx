import Image from 'next/image';
import Link from 'next/link';
import { buildMetadata, breadcrumbSchema, faqSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import {
  AnswerBox,
  CheckList,
  CtaBand,
  Disclaimer,
  FaqList,
  ProjectPhoto,
  SectionHead,
} from '@/components/Sections';
import {
  generalFaqs as fallbackFaqs,
  formatRupiah,
  projects,
  clientCount,
  priceRange,
} from '@/lib/content';
import {
  getCities,
  getCoreServices,
  getEpoxySystems,
  getGeneralFaqs,
  getStats,
  getWhyChooseUs,
  getWorkSteps,
} from '@/lib/content-db';
import { iconMap, IconArrow, IconCheck, IconWhatsApp, IconMapPin } from '@/components/Icons';
import { defaultWaMessage, site, waLink } from '@/lib/site';
import { TrackedLink } from '@/components/TrackedLink';

const PATH = '/';

const DEFAULT_TITLE = 'Jasa Epoxy Lantai Industri & Dapur SPPG — CV Semesta Bumi Jayati';
const DEFAULT_DESC =
  'Kontraktor epoxy lantai untuk dapur SPPG, pabrik, clean room, dan cold storage. Self-leveling dan PU Crete 1.000–9.000 micron, material standar ISO 9001. Melayani seluruh Indonesia.';

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

/** Dipakai bila koleksi "Angka Sorotan" dikosongkan di CMS. */
const fallbackTrustPoints = [
  { eyebrow: 'Proyek Tercatat', value: `${clientCount}+ Unit`, note: 'Daftar klien company profile 2026' },
  { eyebrow: 'Standar Material', value: 'ISO 9001', note: 'Material produksi standar mutu' },
  { eyebrow: 'Spesifikasi', value: 'SNI', note: 'Warna, ketebalan & model sesuai pesanan' },
  { eyebrow: 'Layanan', value: 'Bergaransi', note: 'Garansi resmi tertulis' },
];

export default async function HomePage() {
  const [o, coreServices, epoxySystems, workSteps, whyChooseUs, generalFaqs, cities, stats] =
    await Promise.all([
      pageOverride(PATH),
      getCoreServices(),
      getEpoxySystems(),
      getWorkSteps(),
      getWhyChooseUs(),
      getGeneralFaqs(),
      getCities(),
      getStats(),
    ]);

  const trustPoints = stats.length ? stats : fallbackTrustPoints;
  const breadcrumb = breadcrumbSchema([{ name: 'Beranda', path: '/' }]);
  const heroProject = projects[0]!;
  const heroPhoto = heroProject.photos[0]!;

  return (
    <>
      <JsonLd data={[breadcrumb, faqSchema(generalFaqs.slice(0, 4))]} />

      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-brand-gradient">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, #6A9929 0, transparent 42%), radial-gradient(circle at 82% 70%, #17418D 0, transparent 46%)',
          }}
        />
        <div className="container-page relative grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-leaf-300 ring-1 ring-inset ring-white/15">
              CV Semesta Bumi Jayati · Construction &amp; Industrial Solutions
            </p>
            <h1 className="mt-5 text-[1.85rem] leading-[1.15] text-white sm:text-4xl lg:text-[2.95rem]">
              {o.h1 || 'Jasa Epoxy Lantai Industri, Dapur SPPG, dan Clean Room'}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-lg">
              Kami menyediakan solusi konstruksi industri yang mengutamakan kualitas, keamanan, dan
              standar higienitas — untuk sektor industri, manufaktur, fasilitas kesehatan, serta
              pengolahan makanan.
            </p>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[
                'Ketebalan 1.000–9.000 micron sesuai kebutuhan',
                'Material standar ISO 9001, spesifikasi SNI',
                'Self-Leveling & PU Crete tahan suhu ekstrem',
                'Pengerjaan tepat waktu dan bergaransi resmi',
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-[14px] text-white/90">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-500">
                    <IconCheck className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedLink
                href={waLink(defaultWaMessage, 'hero')}
                external
                event="whatsapp_click"
                params={{ cta_position: 'hero' }}
                className="btn-primary"
              >
                <IconWhatsApp className="h-4 w-4" />
                Konsultasi via WhatsApp
              </TrackedLink>
              <TrackedLink
                href="/kontak"
                event="schedule_survey_click"
                params={{ cta_position: 'hero' }}
                className="btn-ghost-light"
              >
                Jadwalkan Survei
                <IconArrow className="h-4 w-4" />
              </TrackedLink>
            </div>

            <p className="mt-4 text-xs text-white/55">
              Estimasi awal dapat diberikan dari foto. Harga final ditetapkan setelah survei kondisi
              lantai.
            </p>
          </div>

          {/* Hero visual: foto asli dokumentasi proyek — PRD §5.1 */}
          <div className="relative">
            <div className="rounded-3xl border border-white/15 bg-white/[.07] p-3 shadow-lift backdrop-blur-sm">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy-800/40">
                <Image
                  src={heroPhoto.src}
                  alt={heroPhoto.alt}
                  width={heroPhoto.width}
                  height={heroPhoto.height}
                  priority
                  sizes="(min-width: 1024px) 540px, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="px-1 pb-0.5 pt-2.5 text-[11px] leading-snug text-white/55">
                Dokumentasi pengerjaan {site.legalName} — {heroProject.name}.
              </figcaption>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative border-t border-white/10 bg-navy-950/40">
          <div className="container-page grid grid-cols-2 gap-px lg:grid-cols-4">
            {trustPoints.map((t) => (
              <div key={t.eyebrow} className="px-2 py-5 text-center sm:px-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-leaf-400">{t.eyebrow}</p>
                <p className="mt-1.5 text-base font-extrabold text-white sm:text-lg">{t.value}</p>
                <p className="mt-1 text-[11px] leading-snug text-white/55">{t.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- ANSWER-FIRST */}
      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div>
            <SectionHead
              eyebrow="Ringkasan"
              title="Apa itu jasa epoxy lantai?"
              as="h2"
            />
            <AnswerBox override={o.intro}>
              <p>
                Epoxy flooring adalah sistem pelapisan lantai yang dirancang untuk meningkatkan
                kekuatan, ketahanan, serta kebersihan permukaan lantai pada berbagai fasilitas
                industri dan komersial. Hasil akhirnya halus, kuat, dan mudah dibersihkan sehingga
                cocok untuk area yang menuntut standar higienitas tinggi.
              </p>
            </AnswerBox>
            <p className="prose-brand mt-5">
              Ketebalan aplikasi dapat disesuaikan mulai dari 1.000 micron hingga 9.000 micron,
              menggunakan material yang diproduksi dengan standar ISO 9001 (Sistem Manajemen Mutu).
            </p>
            <CheckList
              columns={2}
              items={[
                'Dapur komersial (SPPG): self-leveling',
                'Rumah sakit & laboratorium: self-leveling',
                'Pabrik & pergudangan: PU Crete',
                'Area freezer & industri kimia: PU Crete tebal',
              ]}
            />
          </div>

          <div className="card bg-cream-50">
            <h3 className="text-lg">Kenapa persiapan permukaan menentukan hasil</h3>
            <p className="prose-brand mt-3">
              Sebagian besar kegagalan epoxy — mengelupas, menggelembung, atau berbintik — berakar
              pada daya lekat yang gagal, bukan pada merek resin. Karena itu tahap grinding,
              pembersihan kontaminan, dan pemeriksaan kelembapan beton tidak dapat dilewati.
            </p>
            <Link href="/blog/penyebab-epoxy-mengelupas" className="link-underline mt-4 inline-block text-sm">
              Baca: penyebab lantai epoxy mengelupas
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- LAYANAN */}
      <section className="bg-cream-100 py-14 sm:py-16">
        <div className="container-page">
          <SectionHead
            eyebrow="Layanan Kami"
            title="Solusi konstruksi industri yang kami kerjakan"
            lead="Selain epoxy flooring, kami menangani clean room, sandwich panel, ducting HVAC, serta konstruksi dan renovasi industri."
            center
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreServices.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap] ?? iconMap.layers;
              const href = s.href || '/jasa-epoxy-lantai';
              return (
                <Link key={s.slug} href={href} className="card group hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-leaf-gradient text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg group-hover:text-forest-700">{s.title}</h3>
                  <p className="prose-brand mt-2 text-[14px]">{s.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-forest-700">
                    Pelajari <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- SISTEM */}
      <section className="container-page py-14 sm:py-16">
        <SectionHead
          eyebrow="Sistem & Harga"
          title="Pilihan ketebalan dan harga per meter persegi"
          lead="Angka berikut diambil dari pricelist resmi perusahaan. Harga per m² turun seiring bertambahnya luas area."
        />
        <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
          <table className="w-full min-w-[720px] border-collapse bg-white text-left text-sm">
            <caption className="sr-only">
              Perbandingan sistem epoxy lantai, ketebalan, penggunaan, dan rentang harga per meter persegi
            </caption>
            <thead>
              <tr className="bg-navy-900 text-white">
                <th scope="col" className="px-4 py-3.5 font-bold">Sistem</th>
                <th scope="col" className="px-4 py-3.5 font-bold">Ketebalan</th>
                <th scope="col" className="px-4 py-3.5 font-bold">Paling sesuai untuk</th>
                <th scope="col" className="px-4 py-3.5 text-right font-bold">Rentang / m²</th>
              </tr>
            </thead>
            <tbody>
              {epoxySystems.map((s, i) => (
                <tr key={s.slug} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                  <th scope="row" className="px-4 py-3.5 font-bold text-navy-900">{s.name}</th>
                  <td className="px-4 py-3.5 text-slate-600">{s.thicknessLabel}</td>
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
          Harga mengacu pricelist resmi {site.legalName} yang ditinjau {site.priceLastReviewed}.
          Belum termasuk perbaikan struktural, penanganan kelembapan beton, dan mobilisasi luar
          kota. Penawaran resmi diterbitkan setelah survei.
        </Disclaimer>
        <div className="mt-6">
          <Link href="/harga-epoxy-lantai" className="btn-navy">
            Lihat Rincian Harga & Kalkulator
            <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------- PROSES */}
      <section className="bg-navy-900 py-14 sm:py-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="eyebrow bg-white/10 !text-leaf-300">Proses Kerja</p>
            <h2 className="mt-3 text-2xl text-white sm:text-3xl">Lima tahap dari survei sampai serah terima</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">
              Alur kerja yang sama diterapkan untuk proyek rumah maupun industri, dengan skala dan
              peralatan yang menyesuaikan luas area.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {workSteps.map((s) => (
              <li key={s.n} className="rounded-2xl border border-white/12 bg-white/[.06] p-5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-500 text-sm font-extrabold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3.5 text-[15px] font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------- PORTOFOLIO */}
      <section className="container-page py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Portofolio" title="Dokumentasi proyek terbaru" />
          <Link href="/portofolio" className="btn-outline !py-2.5 text-sm">
            Semua Proyek
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/portofolio/${p.slug}`} className="group">
              <ProjectPhoto
                photo={p.photos[0]!}
                ratio="aspect-[4/3]"
                showCaption={false}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <h3 className="mt-3 text-[15px] font-bold group-hover:text-forest-700">{p.name}</h3>
              <p className="mt-1 text-[13px] text-slate-500">
                {p.system} · {p.city}
              </p>
            </Link>
          ))}
        </div>
        <Disclaimer>
          Seluruh foto adalah dokumentasi asli pengerjaan {site.legalName}, bukan stock photo.
        </Disclaimer>
      </section>

      {/* -------------------------------------------------- MENGAPA KAMI */}
      <section className="bg-cream-100 py-14 sm:py-16">
        <div className="container-page">
          <SectionHead
            eyebrow="Mengapa Kami"
            title={`Mengapa memilih ${site.legalName}?`}
            lead="Lima hal yang menjadi komitmen kerja kami, sebagaimana tercantum dalam company profile perusahaan."
            center
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((w) => (
              <div key={w.n} className="card">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-gradient text-sm font-extrabold text-white">
                  {w.n}
                </span>
                <h3 className="mt-4 text-lg">{w.title}</h3>
                <p className="prose-brand mt-2 text-[14px]">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- AREA LAYANAN */}
      <section className="container-page py-14 sm:py-16">
        <SectionHead
          eyebrow="Area Layanan"
          title="Melayani proyek di seluruh Indonesia"
          lead="Kantor kami di Kediri, Jawa Timur, dengan proyek tersebar di Jawa Timur, Madura, Jawa Tengah, hingga Jakarta. Untuk lokasi lain, biaya mobilisasi dikonfirmasi terlebih dahulu."
        />
        <ul className="mt-7 flex flex-wrap gap-2.5">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/area-layanan/${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/12 bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm hover:border-leaf-400 hover:text-forest-700"
              >
                <IconMapPin className="h-3.5 w-3.5 text-leaf-600" />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FaqList faqs={generalFaqs} />
      <CtaBand />
    </>
  );
}
