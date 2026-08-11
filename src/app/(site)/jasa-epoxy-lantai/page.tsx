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
import { epoxySystems, generalFaqs, formatRupiah, projects, workSteps, cities, priceRange } from '@/lib/content';
import { IconArrow, IconClock, IconMapPin, IconWhatsApp } from '@/components/Icons';
import { defaultWaMessage, site, waLink } from '@/lib/site';
import { TrackedLink } from '@/components/TrackedLink';
import { QuotationForm } from '@/components/QuotationForm';

const PATH = '/jasa-epoxy-lantai';

const DEFAULT_TITLE = 'Jasa Epoxy Lantai — Kontraktor & Aplikator Profesional';
const DEFAULT_DESC =
  'Jasa epoxy lantai oleh kontraktor dan aplikator berpengalaman. Survei lokasi, persiapan permukaan, sistem Self-Leveling hingga PU Crete 9.000 micron. Penawaran tertulis.';

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

const serviceFaqs = [
  {
    q: 'Apa bedanya kontraktor, aplikator, dan penjual material epoxy?',
    a: 'Kontraktor epoxy mengelola keseluruhan pekerjaan termasuk perencanaan sistem, tenaga kerja, dan jadwal. Aplikator adalah pelaksana teknis di lapangan. Penjual material hanya menyediakan resin tanpa tanggung jawab hasil akhir. Jayati Epoxy bekerja sebagai kontraktor sekaligus aplikator sehingga tanggung jawab hasil tidak terpecah.',
  },
  {
    q: 'Apakah area harus dikosongkan total selama pengerjaan?',
    a: 'Idealnya ya, karena persiapan permukaan menggunakan mesin grinding dan lapisan membutuhkan waktu curing tanpa lalu lintas. Bila operasional tidak bisa berhenti, pekerjaan dapat dibagi per zona dengan konsekuensi durasi lebih panjang.',
  },
  {
    q: 'Bagaimana cara memastikan ketebalan sesuai yang dijanjikan?',
    a: 'Ketebalan dikontrol melalui konsumsi material per meter persegi yang dicatat selama aplikasi, serta pengukuran ketebalan basah saat pengerjaan. Angka konsumsi ini dapat dilampirkan pada laporan pekerjaan bila diminta.',
  },
  ...generalFaqs.slice(0, 4),
];

export default async function JasaEpoxyPage() {
  const o = await pageOverride(PATH);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Jasa Epoxy Lantai', path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          serviceSchema({
            name: 'Jasa Epoxy Lantai',
            description:
              'Layanan kontraktor dan aplikator epoxy lantai untuk bangunan rumah, komersial, dan industri di Indonesia.',
            path: PATH,
            serviceType: 'Epoxy Flooring Contractor',
          }),
          faqSchema(serviceFaqs),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className="eyebrow">Jasa Epoxy Lantai</p>
            <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
              {o.h1 || 'Jasa Epoxy Lantai oleh Kontraktor & Aplikator Profesional'}
            </h1>
            <div className="mt-6">
              <AnswerBox override={o.intro}>
                <p>
                  Jasa epoxy lantai adalah layanan pelapisan lantai beton dengan resin epoxy dua
                  komponen, mencakup persiapan permukaan, primer, lapisan utama, dan topcoat. Kami
                  mengerjakan rumah, gudang, pabrik, dan area komersial dengan sistem yang dipilih
                  berdasarkan beban nyata di lokasi, bukan paket seragam.
                </p>
              </AnswerBox>
            </div>
            <CheckList
              columns={2}
              items={[
                'Survei kondisi lantai sebelum penawaran',
                'Grinding mekanis, bukan sekadar disapu',
                'Kontrol rasio campuran dua komponen',
                'Laporan konsumsi material per m²',
                'Opsi pengerjaan malam / per zona',
                'Panduan perawatan saat serah terima',
              ]}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedLink
                href={waLink('Halo, saya ingin konsultasi jasa epoxy lantai.', 'jasa-hero')}
                external
                event="whatsapp_click"
                params={{ cta_position: 'hero', keyword_cluster: 'jasa' }}
                className="btn-primary"
              >
                <IconWhatsApp className="h-4 w-4" />
                Konsultasi Sekarang
              </TrackedLink>
              <Link href="#form" className="btn-outline">
                Minta Penawaran
                <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <ProjectPhoto
            photo={projects[4]!.photos[1]!}
            ratio="aspect-[4/3]"
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
          />
        </div>
      </section>

      {/* SISTEM */}
      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <SectionHead
            eyebrow="Jenis Sistem"
            title="Sistem epoxy dan penggunaannya"
            lead="Pemilihan sistem menentukan biaya sekaligus umur pakai. Sistem terlalu tipis untuk area berat akan cepat aus, sedangkan sistem berlebihan membuat anggaran tidak efisien."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {epoxySystems.map((s) => (
              <article key={s.slug} className="card flex flex-col">
                <h3 className="text-lg">{s.name}</h3>
                <p className="mt-1.5 text-[13px] font-semibold text-leaf-600">{s.thicknessLabel}</p>
                <p className="prose-brand mt-3 text-[14px]">{s.bestFor}</p>
                <ul className="mt-4 grid gap-1.5">
                  {s.highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-[13px] text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                      {h}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-4 text-sm font-bold text-forest-700">
                  {formatRupiah(priceRange(s).from)} – {formatRupiah(priceRange(s).to)} / m²
                </p>
              </article>
            ))}
          </div>
          <Disclaimer>
            Rentang harga diambil dari pricelist resmi {site.legalName} per {site.priceLastReviewed}:
            angka terendah berlaku untuk area di atas 500 m², tertinggi untuk area di bawah 100 m².
            Spesifikasi teknis final mengikuti datasheet material yang disetujui pada penawaran.
          </Disclaimer>
        </div>
      </section>

      {/* TAHAPAN */}
      <section className="container-page py-14">
        <SectionHead eyebrow="Tahapan Kerja" title="Dari survei sampai serah terima" />
        <ol className="mt-8 grid gap-4 md:grid-cols-2">
          {workSteps.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-sm font-extrabold text-white">
                {s.n}
              </span>
              <div>
                <h3 className="text-base">{s.title}</h3>
                <p className="prose-brand mt-1.5 text-[14px]">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: IconClock, title: 'Area < 100 m²', body: 'Umumnya 2–3 hari kerja termasuk curing lapisan akhir.' },
            { icon: IconClock, title: 'Area 100–500 m²', body: 'Umumnya 3–6 hari kerja tergantung kondisi dasar lantai.' },
            { icon: IconClock, title: 'Area > 1.000 m²', body: 'Umumnya 5–10 hari kerja, dapat dibagi per zona.' },
          ].map((d) => (
            <div key={d.title} className="rounded-2xl bg-cream-100 p-5">
              <d.icon className="h-5 w-5 text-forest-700" />
              <h3 className="mt-2.5 text-[15px]">{d.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{d.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Estimasi durasi di atas berlaku untuk kondisi normal tanpa perbaikan struktural berat dan
          dapat berubah karena cuaca, kelembapan beton, atau akses lokasi.
        </p>
      </section>

      {/* PORTOFOLIO RINGKAS */}
      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="Portofolio" title="Contoh proyek yang kami tangani" />
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
                <p className="mt-1 text-[13px] text-slate-500">{p.system} · {p.city}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AREA */}
      <section className="container-page py-14">
        <SectionHead eyebrow="Area Layanan" title="Kota yang paling sering kami layani" lead="Layanan tersedia untuk seluruh Indonesia. Untuk luar kota, biaya mobilisasi dikonfirmasi sebelum penawaran." />
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link href={`/area-layanan/${c.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/12 bg-white px-4 py-2 text-sm font-semibold hover:border-leaf-400 hover:text-forest-700">
                <IconMapPin className="h-3.5 w-3.5 text-leaf-600" />
                Epoxy Lantai {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FaqList faqs={serviceFaqs} />

      {/* FORM */}
      <section id="form" className="container-page scroll-mt-24 pb-14">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <SectionHead eyebrow="Minta Penawaran" title="Kirim detail area Anda" lead="Isi data berikut agar kami dapat menyiapkan estimasi awal dan menjadwalkan survei." />
            <div className="mt-6 space-y-3 text-[14px] text-slate-600">
              <p className="flex gap-2.5"><IconClock className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />{site.openingHours}</p>
              <p className="flex gap-2.5"><IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />Melayani {site.serviceArea}</p>
            </div>
          </div>
          <QuotationForm source="jasa-epoxy-lantai" />
        </div>
      </section>

      <CtaBand
        title="Belum yakin sistem mana yang sesuai?"
        body="Kirim foto lantai dan ceritakan aktivitas di area tersebut. Kami bantu tentukan sistem yang tepat sebelum bicara angka."
      />
    </>
  );
}
