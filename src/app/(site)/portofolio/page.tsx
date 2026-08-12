import Link from 'next/link';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs, CtaBand, Disclaimer, ProjectPhoto, SectionHead } from '@/components/Sections';
import { clientCount, clientGroups } from '@/lib/content';
import { getProjects } from '@/lib/content-db';
import { IconArrow, IconCheck } from '@/components/Icons';
import { site } from '@/lib/site';
import { getPageCopy } from '@/lib/page-copy';
import { sh } from '@/lib/page-slots';

const PATH = '/portofolio';

const DEFAULT_TITLE = 'Portofolio Proyek Epoxy Lantai';
const DEFAULT_DESC =
  'Dokumentasi proyek epoxy lantai CV Semesta Bumi Jayati: dapur SPPG, ruang produksi higienis, clean room, dan cold storage. Foto asli dari lokasi pengerjaan.';

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

export default async function PortofolioPage() {
  const o = await pageOverride(PATH);
  const copy = await getPageCopy(PATH);
  const projects = await getProjects();
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Portofolio', path: PATH },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <SectionHead
          eyebrow="Portofolio"
          title={o.h1 || 'Proyek epoxy lantai yang kami kerjakan'}
          lead={`Foto pada halaman ini adalah dokumentasi asli pengerjaan ${site.legalName} — bukan stock photo. Setiap proyek dilengkapi lingkup pekerjaan dan catatan lapangan.`}
          as="h1"
        />
      </section>

      <section className="container-page pb-14">
        <div className="grid gap-7 md:grid-cols-2">
          {projects.map((p, i) => (
            <article
              key={p.slug}
              className="group overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-card transition-shadow hover:shadow-lift"
            >
              <Link href={`${PATH}/${p.slug}`} className="block p-4">
                <ProjectPhoto
                  photo={p.photos[0]!}
                  ratio="aspect-[16/10]"
                  priority={i === 0}
                  showCaption={false}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </Link>
              <div className="px-6 pb-6">
                <span className="inline-block rounded-full bg-leaf-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-700">
                  {p.category}
                </span>
                <h2 className="mt-3 text-xl">
                  <Link href={`${PATH}/${p.slug}`} className="hover:text-forest-700">
                    {p.name}
                  </Link>
                </h2>
                <p className="prose-brand mt-2 text-[14px]">{p.summary}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
                  {[
                    ['Jenis bangunan', p.buildingType],
                    ['Sistem', p.system],
                    ['Lokasi', p.city],
                    ['Dokumentasi', `${p.photos.length} foto asli`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="font-semibold text-navy-900">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={`${PATH}/${p.slug}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-forest-700"
                >
                  Lihat detail proyek
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ DAFTAR KLIEN */}
      <section className="bg-cream-100 py-14 sm:py-16">
        <div className="container-page">
          <SectionHead {...sh(copy, 'daftar-klien', { eyebrow: 'Daftar Klien', title: `${clientCount} unit telah kami kerjakan`, lead: 'Daftar berikut disalin dari company profile resmi perusahaan, bagian “Our Projects — Cat Epoxy Lantai 2026”.' })} as="h2" />
          <div className="mt-8 space-y-6">
            {clientGroups.map((g) => (
              <div key={g.category} className="rounded-3xl border border-navy-900/10 bg-white p-6 sm:p-7">
                <h3 className="text-lg">{g.category}</h3>
                <p className="prose-brand mt-1.5 text-[14px]">{g.note}</p>
                <p className="mt-3 text-[13px] font-bold uppercase tracking-wider text-forest-700">
                  {g.clients.length} unit
                </p>
                <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {g.clients.map((c) => (
                    <li key={c} className="flex gap-2 text-[13.5px] leading-relaxed text-slate-700">
                      <IconCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-leaf-600" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Disclaimer>
            Nama klien ditampilkan sebagaimana tercantum dalam company profile resmi
            {' '}{site.legalName}. Foto detail per klien hanya dipublikasikan setelah memperoleh izin
            tertulis dari pemilik proyek.
          </Disclaimer>
        </div>
      </section>

      <CtaBand
        title="Punya proyek serupa?"
        body="Ceritakan kondisi area Anda. Kami bantu menentukan sistem yang sesuai dan menyiapkan penawaran tertulis."
      />
    </>
  );
}
