'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { McpToken, Scope } from '@/lib/mcp';

const SCOPES: Array<{ id: Scope; label: string; desc: string }> = [
  { id: 'read', label: 'read', desc: 'Membaca brief, artikel, dan hasil validasi.' },
  { id: 'write', label: 'write', desc: 'Membuat brief dan draf artikel.' },
  { id: 'publish', label: 'publish', desc: 'Menerbitkan artikel yang sudah disetujui.' },
];

export function TokenManager({ tokens }: { tokens: McpToken[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<Scope[]>(['read', 'write']);
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    setFresh(null);
    try {
      const res = await fetch('/api/admin/mcp/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scopes }),
      });
      const d = (await res.json()) as { ok: boolean; token?: string; error?: string };
      if (!res.ok || !d.ok || !d.token) setError(d.error ?? 'Gagal membuat token.');
      else {
        setFresh(d.token);
        setName('');
        router.refresh();
      }
    } catch {
      setError('Tidak dapat menghubungi server.');
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: number) {
    if (!window.confirm('Cabut token ini? Aplikasi yang memakainya akan langsung ditolak.')) return;
    const res = await fetch(`/api/admin/mcp/token/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    else setError('Gagal mencabut token.');
  }

  return (
    <section className="mt-5 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
      <h2 className="text-lg font-extrabold text-navy-900">Token akses</h2>

      {fresh ? (
        <div className="mt-3 rounded-xl border border-leaf-300 bg-leaf-50 p-4">
          <p className="text-sm font-bold text-forest-700">
            Token dibuat. Salin sekarang — nilai ini tidak ditampilkan lagi.
          </p>
          <code className="mt-2 block break-all rounded-lg bg-white px-3 py-2.5 font-mono text-xs text-navy-900">
            {fresh}
          </code>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-1.5">
          <label htmlFor="tk-name" className="text-sm font-bold text-navy-900">
            Nama token
          </label>
          <input
            id="tk-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Asisten konten Claude"
            className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
          />
        </div>
        <button
          type="button"
          onClick={create}
          disabled={busy || name.trim().length < 3}
          className="btn-primary !py-2.5 text-sm disabled:opacity-50"
        >
          {busy ? 'Membuat…' : 'Buat token'}
        </button>
      </div>

      <fieldset className="mt-3">
        <legend className="text-sm font-bold text-navy-900">Hak akses</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {SCOPES.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-navy-900/12 px-3 py-2.5">
              <input
                type="checkbox"
                checked={scopes.includes(s.id)}
                onChange={(e) =>
                  setScopes((cur) => (e.target.checked ? [...cur, s.id] : cur.filter((x) => x !== s.id)))
                }
                className="mt-0.5 h-4 w-4 accent-[#6A9929]"
              />
              <span>
                <span className="block font-mono text-sm font-bold text-navy-900">{s.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{s.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 overflow-x-auto">
        {tokens.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada token.</p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Daftar token MCP</caption>
            <thead className="border-b border-navy-900/10 bg-cream-50">
              <tr>
                <th scope="col" className="px-3 py-2 font-bold text-navy-900">Nama</th>
                <th scope="col" className="px-3 py-2 font-bold text-navy-900">Awalan</th>
                <th scope="col" className="px-3 py-2 font-bold text-navy-900">Hak akses</th>
                <th scope="col" className="px-3 py-2 font-bold text-navy-900">Terakhir dipakai</th>
                <th scope="col" className="px-3 py-2 font-bold text-navy-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/8">
              {tokens.map((t) => (
                <tr key={t.id} className={t.isActive ? '' : 'opacity-50'}>
                  <td className="px-3 py-2.5 font-semibold text-navy-900">{t.name}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{t.prefix}…</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{t.scopes.join(', ')}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">
                    {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString('id-ID') : 'belum pernah'}
                  </td>
                  <td className="px-3 py-2.5">
                    {t.isActive ? (
                      <button type="button" onClick={() => revoke(t.id)} className="text-xs font-bold text-red-700 hover:underline">
                        Cabut
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">dicabut</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
