import { requireOwner } from '@/lib/auth';
import { AdminShell } from '../AdminShell';
import { KlienManager } from './KlienManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kelola Klien' };

export default async function KlienPage() {
  const user = await requireOwner();

  return (
    <AdminShell user={user} active="/admin/klien">
      <KlienManager />
    </AdminShell>
  );
}
