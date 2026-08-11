import { requireOwner } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { listItems } from '@/lib/content-db';
import { AdminShell } from '../AdminShell';
import { CollectionEditor } from './CollectionEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Konten' };

export default async function KontenPage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const user = await requireOwner();

  const active = COLLECTIONS.find((c) => c.id === searchParams.c) ?? COLLECTIONS[0]!;
  const items = await listItems(active.id);

  // Jumlah item per koleksi untuk penanda di menu samping.
  const counts: Record<string, number> = {};
  await Promise.all(
    COLLECTIONS.map(async (c) => {
      counts[c.id] = c.id === active.id ? items.length : (await listItems(c.id)).length;
    }),
  );

  return (
    <AdminShell user={user} active="/admin/konten">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Konten website</h1>
      <p className="mt-1 max-w-[70ch] text-sm text-slate-600">
        Data yang sewaktu-waktu berubah — harga per m², ketebalan micron, daftar layanan, tahapan
        kerja, dan FAQ. Perubahan langsung tampil di semua halaman yang memakainya.
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
