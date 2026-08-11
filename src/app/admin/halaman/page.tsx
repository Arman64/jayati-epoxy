import { requireOwner } from '@/lib/auth';
import { listPages } from '@/lib/pages';
import { getCustomPages, listSections } from '@/lib/page-sections';
import { AdminShell } from '../AdminShell';
import { PageEditor } from './PageEditor';
import { NewPageForm } from './NewPageForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Halaman' };

export default async function PagesAdmin() {
  const user = await requireOwner();
  const pages = await listPages();

  // Halaman buatan Owner ditampilkan terpisah, lengkap dengan jumlah seksinya.
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

  return (
    <AdminShell user={user} active="/admin/halaman">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Pengaturan halaman</h1>
      <p className="mt-1 text-sm text-slate-600">
        Ubah judul, meta description, H1, dan paragraf pembuka tiap halaman. Struktur dan komponen
        halaman tetap diatur kode; yang bisa diubah di sini adalah teks dan pengaturan indeks.
      </p>

      <PageEditor pages={pages} />

      <NewPageForm pages={customWithCounts} />
    </AdminShell>
  );
}
