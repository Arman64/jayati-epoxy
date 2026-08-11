import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articleSchema, buildMetadata, breadcrumbSchema, faqSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { AnswerBox, Breadcrumbs, CtaBand, FaqList, SectionHead } from '@/components/Sections';
import { posts } from '@/lib/content';
import { IconArrow, IconClock } from '@/components/Icons';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) {
    return buildMetadata({
      title: 'Artikel Tidak Ditemukan',
      description: 'Halaman tidak tersedia.',
      path: `/blog/${params.slug}`,
      noindex: true,
    });
  }
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.published,
    modifiedTime: post.modified,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PostPage({ params }: Props) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          articleSchema({
            title: post.title,
            description: post.description,
            path: `/blog/${post.slug}`,
            author: post.author,
            reviewer: post.reviewer,
            published: post.published,
            modified: post.modified,
          }),
          ...(post.faqs?.length ? [faqSchema(post.faqs)] : []),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <article className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-leaf-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-700">
            {post.category}
          </span>
          <h1 className="mt-4 text-[1.75rem] leading-tight sm:text-[2.35rem]">{post.title}</h1>

          {/* Author, reviewer, tanggal update — PRD §12 E-E-A-T */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-navy-900/10 py-4 text-[13px] text-slate-600">
            <p>
              Ditulis oleh <strong className="text-navy-900">{post.author}</strong>
            </p>
            <p>
              Ditinjau oleh <strong className="text-navy-900">{post.reviewer}</strong>
            </p>
            <p className="flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5" />
              {post.readMinutes} menit baca
            </p>
            <p>
              Terbit {formatDate(post.published)} · Diperbarui{' '}
              <time dateTime={post.modified}>{formatDate(post.modified)}</time>
            </p>
          </div>

          <div className="mt-7">
            <AnswerBox>
              <p>{post.intro}</p>
            </AnswerBox>
          </div>

          <div className="mt-9 space-y-9">
            {post.sections.map((s) => (
              <section key={s.h2}>
                <h2 className="text-xl sm:text-2xl">{s.h2}</h2>
                {s.body.map((para, i) => (
                  <p key={i} className="prose-brand mt-3">
                    {para}
                  </p>
                ))}
                {s.list ? (
                  <ul className="mt-4 space-y-2">
                    {s.list.map((li) => (
                      <li key={li} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                        {li}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {/* Internal link dari blog ke layanan — PRD §12 */}
          <aside className="mt-11 rounded-2xl bg-cream-100 p-6">
            <h2 className="text-lg">Butuh bantuan untuk area Anda?</h2>
            <p className="prose-brand mt-2 text-[14px]">
              Kami mengerjakan epoxy lantai untuk rumah, gudang, dan pabrik dengan sistem yang
              dipilih berdasarkan beban nyata di lokasi.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/jasa-epoxy-lantai" className="btn-primary !py-2.5 text-sm">
                Lihat Layanan
              </Link>
              <Link href="/harga-epoxy-lantai" className="btn-outline !py-2.5 text-sm">
                Cek Rentang Harga
              </Link>
              <Link href="/kontak" className="btn-outline !py-2.5 text-sm">
                Minta Penawaran
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {post.faqs?.length ? <FaqList faqs={post.faqs} title="Pertanyaan Terkait" /> : null}

      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <SectionHead eyebrow="Artikel Lain" title="Bacaan terkait" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <article key={p.slug} className="card flex flex-col">
                <span className="w-fit rounded-full bg-leaf-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-700">
                  {p.category}
                </span>
                <h3 className="mt-3 text-base">
                  <Link href={`/blog/${p.slug}`} className="hover:text-forest-700">
                    {p.title}
                  </Link>
                </h3>
                <p className="prose-brand mt-2 text-[13.5px]">{p.description}</p>
                <Link href={`/blog/${p.slug}`} className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-bold text-forest-700">
                  Baca <IconArrow className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
