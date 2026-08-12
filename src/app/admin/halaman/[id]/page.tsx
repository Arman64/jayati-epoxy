import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { getPageRow, listSections } from '@/lib/page-sections';
import { getPage } from '@/lib/pages';
import { listCopy, listPageImages } from '@/lib/page-copy';
import { slotsFor, seoDefaults } from '@/lib/page-slots';
import { AdminShell } from '../../AdminShell';
import { PageBuilder } from '../PageBuilder';
import { CopyEditor } from '../CopyEditor';
import { SeoEditor } from '../SeoEditor';
import { Tabs } from '../Tabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Atur Halaman' };

export default async function PageEditorRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const user = await requireOwner();

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const page = await getPageRow(id);
  if (!page) notFound();

  const setting = await getPage(page.path);
  const slots = slotsFor(page.path);
  const [copy, images, sections] = await Promise.all([
    listCopy(page.path),
    listPageImages(page.path),
    page.isCustom ? listSections(page.id) : Promise.resolve([]),
  ]);

  // Halaman buatan sendiri disusun bebas lewat PageBuilder; halaman bawaan
  // hanya boleh diubah teksnya.
  const tabs = page.isCustom
    ? [
        { id: 'isi', label: 'Isi halaman' },
        { id: 'seo', label: 'SEO & pembuka' },
      ]
    : [
        { id: 'isi', label: `Teks bagian (${slots.length})` },
        { id: 'seo', label: 'SEO & pembuka' },
      ];

  const tab = tabs.some((t) => t.id === searchParams.tab) ? searchParams.tab! : 'isi';

  return (
    <AdminShell user={user} active="/admin/halaman">
      <Link href="/admin/halaman" className="text-sm font-semibold text-forest-700 hover:underline">
        ← Kembali ke daftar halaman
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{page.label}</h1>
          <p className="mt-1 text-sm text-slate-600">
            <code className="rounded bg-slate-100 px-1.5 py-0.5">{page.path}</code>
            {page.isCustom ? (
              <span className="ml-2 rounded border border-navy-900/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                Halaman buatan sendiri
              </span>
            ) : null}
          </p>
        </div>
        <a
          href={page.path}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-forest-700 underline underline-offset-2"
        >
          Lihat halaman ↗
        </a>
      </div>

      <Tabs base={`/admin/halaman/${page.id}`} tabs={tabs} active={tab} />

      {tab === 'isi' ? (
        page.isCustom ? (
          <PageBuilder
            page={{
              id: page.id,
              path: page.path,
              label: page.label,
              isCustom: page.isCustom,
              isPublished: page.isPublished,
            }}
            sections={sections}
          />
        ) : (
          <CopyEditor
            pageId={page.id}
            pagePath={page.path}
            slots={slots}
            copy={copy}
            images={images}
          />
        )
      ) : setting ? (
        <SeoEditor page={setting} defaults={seoDefaults(page.path)} />
      ) : (
        <p className="mt-4 text-sm text-slate-600">Pengaturan SEO halaman ini belum tersedia.</p>
      )}
    </AdminShell>
  );
}
