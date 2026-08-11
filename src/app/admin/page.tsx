import Link from 'next/link';
import { demoCredentialsInUse, requireUser } from '@/lib/auth';
import { countByStatus, dashboardStats, listLeads, STATUS_LABEL, LEAD_STATUSES } from '@/lib/leads';
import { AdminShell } from './AdminShell';
import { StatusBadge, formatDateTime, formatRupiahShort } from './ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const user = await requireUser();
  const [counts, stats, recent, demoAccounts] = await Promise.all([
    countByStatus(),
    dashboardStats(),
    listLeads({ perPage: 8 }),
    demoCredentialsInUse(),
  ]);

  const cards = [
    { label: 'Masuk hari ini', value: stats.today, tone: 'leaf' as const },
    { label: '7 hari terakhir', value: stats.week, tone: 'navy' as const },
    { label: '30 hari terakhir', value: stats.month, tone: 'navy' as const },
    {
      label: 'Follow-up terlewat',
      value: stats.overdue,
      tone: stats.overdue > 0 ? ('warn' as const) : ('navy' as const),
    },
  ];

  return (
    <AdminShell user={user} active="/admin">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
        Selamat datang, {user.name.split(' ')[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Ringkasan prospek masuk. Total {counts.total} prospek tercatat.
      </p>

      {/* Kata sandi demo tertulis di ADMIN.md, jadi harus dianggap sudah bocor. */}
      {demoAccounts.length ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-[14px] leading-relaxed text-red-900"
        >
          <p className="font-bold">Kata sandi demo masih aktif — ganti sebelum situs online.</p>
          <p className="mt-1.5">
            Akun {demoAccounts.join(' dan ')} masih memakai kata sandi contoh yang tertulis di
            berkas <code className="rounded bg-white px-1">ADMIN.md</code>, sehingga siapa pun yang
            membaca berkas itu bisa masuk. Ganti lewat perintah:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 text-[12px] text-navy-900">
{`npm run db:seed -- ${demoAccounts[0]} "Nama Anda" "KataSandiBaruYangPanjang" owner`}
          </pre>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border bg-white p-4 shadow-card ${
              c.tone === 'warn' ? 'border-amber-300' : 'border-navy-900/10'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.label}</p>
            <p
              className={`mt-1.5 text-3xl font-extrabold tabular-nums ${
                c.tone === 'leaf'
                  ? 'text-forest-700'
                  : c.tone === 'warn'
                    ? 'text-amber-700'
                    : 'text-navy-900'
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Sebaran status
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {LEAD_STATUSES.map((s) => (
              <li key={s}>
                <Link
                  href={`/admin/leads?status=${s}`}
                  className="flex items-center justify-between rounded-lg border border-navy-900/10 px-3 py-2.5 transition-colors hover:bg-cream-100"
                >
                  <StatusBadge status={s} />
                  <span className="text-sm font-extrabold tabular-nums text-navy-900">
                    {counts[s] ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Nilai proyek dimenangkan
          </h2>
          <p className="mt-2 text-2xl font-extrabold text-forest-700">
            {formatRupiahShort(stats.wonValue)}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            Dijumlahkan dari kolom estimasi nilai pada prospek berstatus Menang. Isi manual per
            prospek.
          </p>
        </section>
      </div>

      <section className="mt-3 rounded-2xl border border-navy-900/10 bg-white shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-navy-900/10 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Prospek terbaru
          </h2>
          <Link
            href="/admin/leads"
            className="text-sm font-bold text-forest-700 underline underline-offset-2"
          >
            Lihat semua
          </Link>
        </div>

        {recent.leads.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">Belum ada prospek masuk.</p>
        ) : (
          <ul className="divide-y divide-navy-900/8">
            {recent.leads.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/admin/leads/${l.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-cream-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-navy-900">{l.name}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {l.phone}
                      {l.city ? ` · ${l.city}` : ''}
                      {l.areaSqm ? ` · ${l.areaSqm} m²` : ''}
                    </span>
                  </span>
                  <StatusBadge status={l.status} />
                  <span className="w-32 text-right text-xs text-slate-500">
                    {formatDateTime(l.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
