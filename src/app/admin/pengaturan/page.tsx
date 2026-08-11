import { requireOwner } from '@/lib/auth';
import { getSettingsFresh } from '@/lib/settings';
import { AdminShell } from '../AdminShell';
import { SettingsTabs } from './SettingsTabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pengaturan' };

export default async function SettingsPage() {
  const user = await requireOwner();
  const settings = await getSettingsFresh();

  return (
    <AdminShell user={user} active="/admin/pengaturan">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Pengaturan situs</h1>
      <p className="mt-1 text-sm text-slate-600">
        Perubahan langsung tampil di website. Kolom yang dikosongkan memakai nilai bawaan.
      </p>

      <SettingsTabs initial={settings} />
    </AdminShell>
  );
}
