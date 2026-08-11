import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getLead, listEvents, listNotes, listUsers, STATUS_LABEL } from '@/lib/leads';
import { AdminShell } from '../../AdminShell';
import { FIELD_LABEL, StatusBadge, formatDate, formatDateTime, formatRupiah } from '../../ui';
import { LeadControls } from './LeadControls';
import { NoteForm } from './NoteForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Detail Prospek' };

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const user = await requireUser();

  if (!/^\d+$/.test(params.id)) notFound();
  const id = Number(params.id);

  const lead = await getLead(id);
  if (!lead) notFound();

  const [notes, events, users] = await Promise.all([listNotes(id), listEvents(id), listUsers()]);

  const waPhone = lead.phone.replace(/\D/g, '').replace(/^0/, '62');

  const rows: Array<[string, string]> = [
    ['Telepon', lead.phone],
    ['Kota', lead.city ?? '—'],
    ['Jenis bangunan', lead.buildingType ?? '—'],
    ['Luas area', lead.areaSqm ? `${lead.areaSqm} m²` : '—'],
    ['Kondisi lantai', lead.floorCondition ?? '—'],
    ['Kebutuhan', lead.needType ?? '—'],
    ['Sumber', lead.source],
    ['Lampiran foto', lead.photoPath ?? '—'],
    ['Masuk', formatDateTime(lead.createdAt)],
    ['Diperbarui', formatDateTime(lead.updatedAt)],
  ];

  return (
    <AdminShell user={user} active="/admin/leads">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/admin/leads" className="font-semibold text-forest-700 underline-offset-2 hover:underline">
          ← Kembali ke daftar prospek
        </Link>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{lead.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <StatusBadge status={lead.status} />
            {lead.assignedName ? <span>Ditangani {lead.assignedName}</span> : <span>Belum ditugaskan</span>}
          </p>
        </div>
        <a
          href={`https://wa.me/${waPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !px-4 !py-2.5 text-sm"
        >
          Hubungi via WhatsApp
        </a>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        {/* Data prospek */}
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Data permintaan
          </h2>
          <dl className="mt-3 grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{k}</dt>
                <dd className="mt-0.5 break-words text-sm text-navy-900">{v}</dd>
              </div>
            ))}
          </dl>

          {lead.message ? (
            <div className="mt-4 rounded-xl bg-cream-100 p-3.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pesan</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-navy-900">
                {lead.message}
              </p>
            </div>
          ) : null}

          {lead.estimatedValue ? (
            <p className="mt-4 text-sm text-slate-600">
              Estimasi nilai proyek:{' '}
              <strong className="text-navy-900">{formatRupiah(lead.estimatedValue)}</strong>
            </p>
          ) : null}
        </section>

        {/* Kontrol CRM */}
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Kelola prospek
          </h2>
          <LeadControls
            leadId={lead.id}
            status={lead.status}
            assignedTo={lead.assignedTo}
            estimatedValue={lead.estimatedValue}
            followUpAt={lead.followUpAt}
            users={users.map((u) => ({ id: u.id, name: u.name }))}
          />
        </section>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        {/* Catatan */}
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Catatan follow-up
          </h2>
          <NoteForm leadId={lead.id} />

          {notes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Belum ada catatan.</p>
          ) : (
            <ul className="mt-4 grid gap-2.5">
              {notes.map((n) => (
                <li key={n.id} className="rounded-xl border border-navy-900/10 bg-cream-50 p-3.5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-900">
                    {n.body}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {n.authorName ?? 'Pengguna dihapus'} · {formatDateTime(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Audit log */}
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Riwayat perubahan
          </h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Belum ada perubahan tercatat.</p>
          ) : (
            <ol className="mt-3 grid gap-2">
              {events.map((e) => (
                <li key={e.id} className="border-l-2 border-navy-900/15 pl-3 text-sm">
                  <p className="text-navy-900">
                    <strong>{FIELD_LABEL[e.field] ?? e.field}</strong>{' '}
                    {e.oldValue ? (
                      <>
                        dari <em className="not-italic text-slate-600">{e.oldValue}</em>{' '}
                      </>
                    ) : null}
                    menjadi <em className="not-italic font-semibold">{e.newValue ?? 'kosong'}</em>
                  </p>
                  <p className="text-xs text-slate-500">
                    {e.authorName ?? 'Sistem'} · {formatDateTime(e.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {lead.followUpAt ? (
        <p className="mt-4 text-sm text-slate-600">
          Jadwal follow-up berikutnya: <strong>{formatDate(lead.followUpAt)}</strong>
        </p>
      ) : null}
    </AdminShell>
  );
}
