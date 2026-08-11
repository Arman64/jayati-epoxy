import { requireOwner } from '@/lib/auth';
import { listBriefs, listCmsEvents, listMcpLogs, listTokens } from '@/lib/mcp';
import { AdminShell } from '../AdminShell';
import { formatDateTime } from '../ui';
import { TokenManager } from './TokenManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Otomasi MCP' };

export default async function McpAdmin() {
  const user = await requireOwner();
  const [tokens, logs, briefs, events] = await Promise.all([
    listTokens(),
    listMcpLogs(25),
    listBriefs(),
    listCmsEvents(25),
  ]);

  return (
    <AdminShell user={user} active="/admin/mcp">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Otomasi konten (MCP)</h1>
      <p className="mt-1 max-w-[68ch] text-sm text-slate-600">
        Asisten AI dapat membuat brief dan draf artikel lewat endpoint <code>/api/mcp</code>. Draf
        tetap harus lolos pemeriksaan kualitas dan disetujui manusia sebelum terbit — endpoint
        publikasi menolak semua status selain <strong>approved</strong>.
      </p>

      <TokenManager tokens={tokens} />

      <section className="mt-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
        <h2 className="text-lg font-extrabold text-navy-900">Cara menghubungkan</h2>
        <ol className="mt-3 grid gap-2 text-sm text-slate-700">
          <li>1. Buat token di atas, salin sekali saja (tidak bisa dilihat lagi).</li>
          <li>
            2. Kirim <code>POST</code> ke <code>/api/mcp</code> dengan header{' '}
            <code>Authorization: Bearer &lt;token&gt;</code>.
          </li>
          <li>
            3. Body: <code>{'{ "tool": "...", "request_id": "...", "params": { } }'}</code>. ID
            permintaan yang sama tidak akan dieksekusi dua kali.
          </li>
          <li>
            4. <code>GET /api/mcp</code> menampilkan daftar tool beserta hak akses token Anda.
          </li>
        </ol>
      </section>

      <section className="mt-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
        <h2 className="text-lg font-extrabold text-navy-900">Brief konten</h2>
        {briefs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Belum ada brief.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy-900/8">
            {briefs.map((b) => (
              <li key={b.id} className="py-3">
                <p className="text-sm font-bold text-navy-900">{b.topic}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  #{b.id} · kata kunci &ldquo;{b.primaryKeyword}&rdquo; · {b.intent} · {b.status} ·{' '}
                  {formatDateTime(b.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
        <h2 className="text-lg font-extrabold text-navy-900">Log permintaan MCP</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Belum ada permintaan masuk.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Riwayat permintaan MCP</caption>
              <thead className="border-b border-navy-900/10 bg-cream-50">
                <tr>
                  <th scope="col" className="px-3 py-2 font-bold text-navy-900">Tool</th>
                  <th scope="col" className="px-3 py-2 font-bold text-navy-900">Status</th>
                  <th scope="col" className="px-3 py-2 font-bold text-navy-900">Durasi</th>
                  <th scope="col" className="px-3 py-2 font-bold text-navy-900">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/8">
                {logs.map((l) => (
                  <tr key={l.requestId}>
                    <td className="px-3 py-2 font-semibold text-navy-900">{l.tool}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold ${
                          l.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : l.status === 'error'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {l.status}
                      </span>
                      {l.error ? (
                        <span className="ml-2 text-xs text-red-700">{l.error}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-slate-500">
                      {l.durationMs != null ? `${l.durationMs} ms` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                      {formatDateTime(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
        <h2 className="text-lg font-extrabold text-navy-900">Jejak audit CMS</h2>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Belum ada aktivitas.</p>
        ) : (
          <ol className="mt-3 grid gap-2">
            {events.map((e) => (
              <li key={e.id} className="border-l-2 border-navy-900/15 pl-3 text-sm">
                <p className="text-navy-900">
                  <strong>{e.action}</strong> pada {e.entity} #{e.entityId}
                </p>
                <p className="text-xs text-slate-500">
                  {e.authorName ?? e.actor} · {formatDateTime(e.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AdminShell>
  );
}
