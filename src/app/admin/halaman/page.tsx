import { requireOwner } from '@/lib/auth';
import { listPages } from '@/lib/pages';
import { AdminShell } from '../AdminShell';
import { PageEditor } from './PageEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Halaman' };

export default async function PagesAdmin() {
  const user = await requireOwner();
  const pages = await listPages();

  return (
    <AdminShell user={user} active="/admin/halaman">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Pengaturan halaman</h1>
      <p className="mt-1 text-sm text-slate-600">
        Ubah judul, meta description, H1, dan paragraf pembuka tiap halaman. Struktur dan komponen
        halaman tetap diatur kode; yang bisa diubah di sini adalah teks dan pengaturan indeks.
      </p>

      <PageEditor pages={pages} />
    </AdminShell>
  );
}
