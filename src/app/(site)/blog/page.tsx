import Link from 'next/link';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs, CtaBand, SectionHead } from '@/components/Sections';
import { posts } from '@/lib/content';
import { IconArrow, IconClock } from '@/components/Icons';

const PATH = '/blog';

export const metadata = buildMetadata({
  title: 'Blog Epoxy Lantai — Panduan, Harga, dan Perawatan',
  description:
    'Artikel praktis seputar epoxy lantai: cara menghitung biaya, perbandingan epoxy dan keramik, penyebab lantai mengelupas, serta tahapan pemasangan yang benar.',
  path: PATH,
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPage() {
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Blog', path: PATH },
  ];
  const sorted = [...posts].sort((a, b) => b.published.localeCompare(a.published));
  const [featured, ...rest] = sorted;

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <SectionHead
          eyebrow="Blog"
          title="Panduan praktis seputar epoxy lantai"
          lead="Artikel disusun tim teknis berdasarkan pengalaman lapangan, lalu ditinjau sebelum diterbitkan. Setiap tulisan mencantumkan penulis, peninjau, dan tanggal pembaruan."
          as="h1"
        />
      </section>

      {featured ? (
        <section className="container-page pb-12">
          <article className="overflow-hidden rounded-3xl border border-navy-900/10 bg-brand-gradient p-7 text-white shadow-lift sm:p-10">
            <span className="inline-block rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-leaf-300">
              Terbaru · {featured.category}
            </span>
            <h2 className="mt-4 max-w-3xl text-2xl text-white sm:text-3xl">
              <Link href={`${PATH}/${featured.slug}`} className="hover:underline">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-white/75">{featured.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/60">
              <span>{featured.author}</span>
              <span className="flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5" />
                {featured.readMinutes} menit baca
              </span>
              <span>Diperbarui {formatDate(featured.modified)}</span>
            </div>
            <Link href={`${PATH}/${featured.slug}`} className="btn-primary mt-6">
              Baca Artikel <IconArrow className="h-4 w-4" />
            </Link>
          </article>
        </section>
      ) : null}

      <section className="container-page pb-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <article key={p.slug} className="card flex flex-col">
              <span className="inline-block w-fit rounded-full bg-leaf-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-700">
                {p.category}
              </span>
              <h2 className="mt-3 text-lg">
                <Link href={`${PATH}/${p.slug}`} className="hover:text-forest-700">
                  {p.title}
                </Link>
              </h2>
              <p className="prose-brand mt-2.5 text-[14px]">{p.description}</p>
              <div className="mt-auto pt-5 text-[12px] text-slate-500">
                <p>{p.author}</p>
                <p className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <IconClock className="h-3.5 w-3.5" />
                    {p.readMinutes} menit
                  </span>
                  <span>Diperbarui {formatDate(p.modified)}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand
        title="Masih ragu memilih sistem yang tepat?"
        body="Tim kami membantu mencocokkan kebutuhan area Anda dengan sistem yang sesuai, tanpa memaksakan paket termahal."
      />
    </>
  );
}
