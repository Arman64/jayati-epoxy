import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { getPageRow, listSections } from '@/lib/page-sections';
import { AdminShell } from '../../AdminShell';
import { PageBuilder } from '../PageBuilder';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Susun Halaman' };

export default async function PageBuilderRoute({ params }: { params: { id: string } }) {
  const user = await requireOwner();

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const page = await getPageRow(id);
  if (!page) notFound();

  const sections = await listSections(page.id);

  return (
    <AdminShell user={user} active="/admin/halaman">
      <Link href="/admin/halaman" className="text-sm font-semibold text-forest-700 hover:underline">
        ← Kembali ke daftar halaman
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900">
        Susun halaman: {page.label}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Tambahkan seksi, atur urutannya, dan isi teksnya. Perubahan langsung tersimpan.
      </p>

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
    </AdminShell>
  );
}
