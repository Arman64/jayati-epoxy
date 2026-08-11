import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Sections';
import { SectionRenderer } from '@/components/SectionRenderer';
import { getCustomPageByPath, getVisibleSections } from '@/lib/page-sections';
import { buildMetadata } from '@/lib/seo';

/**
 * Perender halaman buatan Owner.
 *
 * Rute tangkap-semua ini hanya menangani path yang belum dipakai rute lain —
 * Next.js selalu mendahulukan rute yang lebih spesifik. Bila path tidak ada di
 * tabel `pages` sebagai halaman kustom yang sudah terbit, tampilkan 404 agar
 * tidak ada halaman tipis yang terindeks (PRD §12).
 */

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string[] } };

function pathOf(slug: string[]): string {
  return `/${slug.map((s) => decodeURIComponent(s)).join('/')}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = pathOf(params.slug);
  const page = await getCustomPageByPath(path);

  if (!page || !page.isPublished) {
    return buildMetadata({
      title: 'Halaman Tidak Ditemukan',
      description: 'Halaman yang Anda cari tidak tersedia.',
      path,
      noindex: true,
    });
  }

  return buildMetadata({
    title: page.title || page.label,
    description: page.description || '',
    path,
    noindex: page.noindex,
    ogImage: page.ogImage || undefined,
  });
}

export default async function CustomPage({ params }: Props) {
  const path = pathOf(params.slug);
  const page = await getCustomPageByPath(path);

  if (!page || !page.isPublished) notFound();

  const sections = await getVisibleSections(page.id);

  // Halaman tanpa seksi apa pun akan tampak kosong dan merugikan SEO.
  if (!sections.length) notFound();

  const hasHero = sections.some((s) => s.kind === 'hero');
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: page.label, path },
  ];

  return (
    <>
      <div className="container-page pt-6">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Bila Owner tidak memasang seksi hero, H1 tetap dibuat dari data halaman
          agar setiap halaman punya tepat satu H1 — PRD §12. */}
      {!hasHero ? (
        <div className="container-page pt-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
            {page.h1 || page.label}
          </h1>
          {page.intro ? <p className="prose-brand mt-4 max-w-3xl">{page.intro}</p> : null}
        </div>
      ) : null}

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          formSource={`halaman${path.replace(/\//g, '-')}`}
        />
      ))}
    </>
  );
}
