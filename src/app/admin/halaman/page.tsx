import Link from 'next/link';
import { requireOwner } from '@/lib/auth';
import { listPages } from '@/lib/pages';
import { getCustomPages, listSections } from '@/lib/page-sections';
import { COLLECTIONS } from '@/lib/collections';
import { listItems } from '@/lib/content-db';
import { slotsFor } from '@/lib/page-slots';
import { AdminShell } from '../AdminShell';
import { NewPageForm } from './NewPageForm';
import { CollectionEditor } from '../konten/CollectionEditor';
import { Tabs } from './Tabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Halaman' };

export default async function PagesAdmin({
  searchParams,
}: {
  searchParams: { tab?: string; c?: string };
}) {
  const user = await requireOwner();

  const tabs = [
    { id: 'halaman', label: 'Halaman' },
    { id: 'bersama', label: 'Dipakai bersama' },
  ];
  const tab = tabs.some((t) => t.id === searchParams.tab) ? searchParams.tab! : 'halaman';

  /* ---------------------------------------------- tab: dipakai bersama */
  if (tab === 'bersama') {
    const active = COLLECTIONS.find((c) => c.id === searchParams.c) ?? COLLECTIONS[0]!;
    const items = await listItems(active.id);
    const counts: Record<string, number> = {};
    await Promise.all(
      COLLECTIONS.map(async (c) => {
        counts[c.id] = c.id === active.id ? items.length : (await listItems(c.id)).length;
      }),
    );

    return (
      <AdminShell user={user} active="/admin/halaman">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Halaman website</h1>
        <p className="mt-1 max-w-[75ch] text-sm text-slate-600">
          Semua pengaturan isi website ada di sini: teks tiap halaman, foto, SEO, dan data yang
          dipakai bersama beberapa halaman.
        </p>

        <Tabs base="/admin/halaman" tabs={tabs} active={tab} />

        <p className="mt-4 max-w-[75ch] rounded-xl border border-navy-900/12 bg-cream-200/60 p-3 text-sm text-slate-700">
          Data di tab ini muncul di beberapa halaman sekaligus — harga per m², daftar layanan,
          tahapan kerja, FAQ, dan kota layanan. Satu kali ubah, semua halaman yang memakainya ikut
          berubah.
        </p>

        <CollectionEditor
          collections={COLLECTIONS}
          counts={counts}
          activeId={active.id}
          items={items}
        />
      </AdminShell>
    );
  }

  /* ------------------------------------------------------ tab: halaman */
  const pages = await listPages();
  const custom = await getCustomPages();
  const customWithCounts = await Promise.all(
    custom.map(async (p) => ({
      id: p.id,
      path: p.path,
      label: p.label,
      isPublished: p.isPublished,
      sectionCount: (await listSections(p.id)).length,
    })),
  );
  const customIds = new Set(custom.map((p) => p.id));

  return (
    <AdminShell user={user} active="/admin/halaman">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Halaman website</h1>
      <p className="mt-1 max-w-[75ch] text-sm text-slate-600">
        Semua pengaturan isi website ada di sini: teks tiap halaman, foto, SEO, dan data yang
        dipakai bersama beberapa halaman.
      </p>

      <Tabs base="/admin/halaman" tabs={tabs} active={tab} />

      <p className="mt-4 max-w-[75ch] text-sm text-slate-600">
        Pilih halaman untuk mengubah teks tiap bagiannya, mengganti foto, dan mengatur judul serta
        deskripsi di hasil pencarian Google.
      </p>

      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {pages.map((p) => {
          const isCustom = customIds.has(p.id);
          const n = isCustom
            ? (customWithCounts.find((c) => c.id === p.id)?.sectionCount ?? 0)
            : slotsFor(p.path).length;

          return (
            <li key={p.id}>
              <Link
                href={`/admin/halaman/${p.id}`}
                className="group flex h-full items-start justify-between gap-3 rounded-xl border border-navy-900/12 bg-white p-4 shadow-card transition-colors hover:border-leaf-500"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-navy-900 group-hover:text-forest-700">
                    {p.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{p.path}</span>
                  <span className="mt-1.5 block text-xs text-slate-600">
                    {isCustom
                      ? `${n} seksi · disusun sendiri`
                      : n > 0
                        ? `${n} bagian teks bisa diubah`
                        : 'Judul & deskripsi saja'}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {isCustom ? (
                    <span className="rounded border border-navy-900/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      Buatan sendiri
                    </span>
                  ) : null}
                  {p.noindex ? (
                    <span className="rounded border border-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                      Noindex
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <NewPageForm pages={customWithCounts} />
    </AdminShell>
  );
}
