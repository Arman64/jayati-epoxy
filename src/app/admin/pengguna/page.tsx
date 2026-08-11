import { requireOwner } from '@/lib/auth';
import { listUsers } from '@/lib/leads';
import { AdminShell } from '../AdminShell';
import { UserForm } from './UserForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pengguna' };

export default async function UsersPage() {
  const user = await requireOwner();
  const users = await listUsers();

  return (
    <AdminShell user={user} active="/admin/pengguna">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Pengguna</h1>
      <p className="mt-1 text-sm text-slate-600">
        Hanya pemilik yang dapat menambah atau menonaktifkan akun.
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daftar pengguna panel admin</caption>
            <thead className="border-b border-navy-900/10 bg-cream-50">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold text-navy-900">Nama</th>
                <th scope="col" className="px-4 py-3 font-bold text-navy-900">Email</th>
                <th scope="col" className="px-4 py-3 font-bold text-navy-900">Peran</th>
                <th scope="col" className="px-4 py-3 font-bold text-navy-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/8">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-bold text-navy-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {u.role === 'owner' ? 'Pemilik' : 'Staf'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${
                        u.isActive
                          ? 'border-leaf-300 bg-leaf-50 text-forest-700'
                          : 'border-slate-300 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Tambah pengguna
          </h2>
          <UserForm />
        </section>
      </div>
    </AdminShell>
  );
}
