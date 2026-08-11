import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import {
  LEAD_STATUSES,
  STATUS_LABEL,
  listLeads,
  listUsers,
  type LeadStatus,
} from '@/lib/leads';
import { AdminShell } from '../AdminShell';
import { StatusBadge, formatDateTime } from '../ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Prospek' };

function isStatus(v: string | undefined): v is LeadStatus {
  return !!v && (LEAD_STATUSES as readonly string[]).includes(v);
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string; petugas?: string };
}) {
  const user = await requireUser();

  const status = isStatus(searchParams.status) ? searchParams.status : 'semua';
  const q = (searchParams.q ?? '').slice(0, 100);
  const page = Math.max(Number(searchParams.page) || 1, 1);
  const assignedTo =
    searchParams.petugas && /^\d+$/.test(searchParams.petugas)
      ? Number(searchParams.petugas)
      : 'semua';

  const [{ leads, total, pages }, users] = await Promise.all([
    listLeads({ status, q, assignedTo, page, perPage: 20 }),
    listUsers(),
  ]);

  const qs = (over: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (status !== 'semua') p.set('status', status);
    if (q) p.set('q', q);
    if (assignedTo !== 'semua') p.set('petugas', String(assignedTo));
    for (const [k, v] of Object.entries(over)) {
      if (v === '' || v === 'semua') p.delete(k);
      else p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `/admin/leads?${s}` : '/admin/leads';
  };

  return (
    <AdminShell user={user} active="/admin/leads">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Prospek</h1>
          <p className="mt-1 text-sm text-slate-600">{total} prospek sesuai filter saat ini.</p>
        </div>
        <a href="/api/admin/export" className="btn-navy !px-4 !py-2.5 text-sm">
          Unduh CSV
        </a>
      </div>

      {/* Filter */}
      <form method="get" action="/admin/leads" className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari nama, telepon, atau kota…"
            aria-label="Cari prospek"
            className="min-w-[220px] flex-1 rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
          />
          <select
            name="petugas"
            defaultValue={assignedTo === 'semua' ? '' : String(assignedTo)}
            aria-label="Filter petugas"
            className="rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Semua petugas</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          {status !== 'semua' ? <input type="hidden" name="status" value={status} /> : null}
          <button type="submit" className="btn-primary !px-4 !py-2.5 text-sm">
            Terapkan
          </button>
        </div>
      </form>

      {/* Tab status */}
      <nav aria-label="Filter status" className="mt-3 flex flex-wrap gap-1.5">
        <Link
          href={qs({ status: 'semua', page: 1 })}
          aria-current={status === 'semua' ? 'page' : undefined}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
            status === 'semua'
              ? 'border-navy-900 bg-navy-900 text-white'
              : 'border-navy-900/15 bg-white text-slate-700 hover:bg-cream-50'
          }`}
        >
          Semua
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s}
            href={qs({ status: s, page: 1 })}
            aria-current={status === s ? 'page' : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
              status === s
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-navy-900/15 bg-white text-slate-700 hover:bg-cream-50'
            }`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </nav>

      {/* Tabel */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-card">
        {leads.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            Tidak ada prospek yang cocok dengan filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">Daftar prospek masuk</caption>
              <thead className="border-b border-navy-900/10 bg-cream-50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Nama</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Kontak</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Luas</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Status</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Petugas</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/8">
                {leads.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="font-bold text-navy-900 underline-offset-2 hover:underline"
                      >
                        {l.name}
                      </Link>
                      <span className="block text-xs text-slate-500">{l.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${l.phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest-700 underline underline-offset-2"
                      >
                        {l.phone}
                      </a>
                      <span className="block text-xs text-slate-500">{l.city ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {l.areaSqm ? `${l.areaSqm} m²` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{l.assignedName ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatDateTime(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginasi */}
      {pages > 1 ? (
        <nav aria-label="Paginasi" className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-600">
            Halaman {page} dari {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={qs({ page: page - 1 })} className="btn-navy !px-4 !py-2 text-sm">
                Sebelumnya
              </Link>
            ) : null}
            {page < pages ? (
              <Link href={qs({ page: page + 1 })} className="btn-navy !px-4 !py-2 text-sm">
                Berikutnya
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </AdminShell>
  );
}
