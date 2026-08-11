import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs, CtaBand, Disclaimer, ProjectPhoto, SectionHead } from '@/components/Sections';
import { projects } from '@/lib/content';
import { IconArrow, IconCheck } from '@/components/Icons';
import { site } from '@/lib/site';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project)
    return buildMetadata({
      title: 'Proyek Tidak Ditemukan',
      description: 'Halaman tidak tersedia.',
      path: `/portofolio/${params.slug}`,
      noindex: true,
    });

  return buildMetadata({
    title: `${project.name} — Studi Kasus`,
    description: `Studi kasus ${project.name}: ${project.summary}`,
    path: `/portofolio/${project.slug}`,
  });
}

export default function ProjectPage({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 3);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Portofolio', path: '/portofolio' },
    { name: project.name, path: `/portofolio/${project.slug}` },
  ];

  const hero = project.photos[0]!;
  const rest = project.photos.slice(1);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <article>
        <section className="container-page py-10 sm:py-14">
          <span className="inline-block rounded-full bg-leaf-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-700">
            {project.category}
          </span>
          <h1 className="mt-3 max-w-3xl text-[1.8rem] leading-tight sm:text-4xl">{project.name}</h1>
          <p className="prose-brand mt-4 max-w-2xl">{project.summary}</p>

          <div className="mt-8">
            <ProjectPhoto
              photo={hero}
              ratio="aspect-[16/10]"
              priority
              sizes="(min-width: 1180px) 1100px, 100vw"
            />
          </div>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-navy-900/10 bg-navy-900/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Jenis bangunan', project.buildingType],
              ['Sistem', project.system],
              ['Ketebalan', project.thickness],
              ['Lokasi', project.city],
            ].map(([k, v]) => (
              <div key={k} className="bg-white p-4">
                <dt className="text-[12px] uppercase tracking-wider text-slate-500">{k}</dt>
                <dd className="mt-1 text-[15px] font-bold text-navy-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="container-page pb-14">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
            <div className="space-y-8">
              <div>
                <SectionHead title="Lingkup pekerjaan" as="h2" />
                <ul className="mt-4 space-y-2.5">
                  {project.scope.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                      <IconCheck className="mt-1 h-4 w-4 shrink-0 text-leaf-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <SectionHead title="Catatan pengerjaan" as="h2" />
                <div className="mt-3 space-y-3">
                  {project.detail.map((par) => (
                    <p key={par} className="prose-brand">
                      {par}
                    </p>
                  ))}
                </div>
              </div>

              <Disclaimer>
                Foto pada halaman ini adalah dokumentasi asli pengerjaan {site.legalName}. Luas area
                dan durasi tidak dicantumkan karena angka tersebut tidak tersedia dalam dokumen resmi
                proyek.
              </Disclaimer>
            </div>

            <aside className="rounded-3xl bg-cream-100 p-6">
              <h2 className="text-lg">Punya kebutuhan serupa?</h2>
              <p className="prose-brand mt-2 text-[14px]">
                Kondisi setiap lantai berbeda. Kirim foto dan perkiraan luas area untuk mendapatkan
                estimasi awal.
              </p>
              <Link href="/kontak" className="btn-primary mt-5 w-full">
                Minta Penawaran <IconArrow className="h-4 w-4" />
              </Link>
              <Link href="/harga-epoxy-lantai" className="btn-outline mt-3 w-full">
                Lihat Pricelist
              </Link>
            </aside>
          </div>
        </section>

        {rest.length > 0 && (
          <section className="container-page pb-14">
            <SectionHead eyebrow="Dokumentasi" title="Foto pengerjaan lainnya" as="h2" />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((photo) => (
                <ProjectPhoto key={photo.src} photo={photo} ratio="aspect-[4/3]" />
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="bg-cream-100 py-14">
            <div className="container-page">
              <SectionHead eyebrow="Proyek Lain" title="Studi kasus lainnya" as="h2" />
              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {others.map((p) => (
                  <Link key={p.slug} href={`/portofolio/${p.slug}`} className="group">
                    <ProjectPhoto photo={p.photos[0]!} showCaption={false} />
                    <h3 className="mt-3 text-[15px] font-bold group-hover:text-forest-700">{p.name}</h3>
                    <p className="mt-1 text-[13px] text-slate-500">
                      {p.system} · {p.city}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <CtaBand />
    </>
  );
}
