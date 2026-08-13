'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, type FormEvent } from 'react';

type ClientGroup = {
  id: number;
  category: string;
  note: string;
  clients: string[];
  sort_order: number;
};

export function KlienManager() {
  const router = useRouter();
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [f, setF] = useState({ category: '', note: '', clients: '', sort_order: 0 });

  useEffect(() => {
    fetch('/api/admin/klien')
      .then((r) => r.json())
      .then((d: { ok: boolean; groups: ClientGroup[] }) => {
        if (d.ok) setGroups(d.groups);
      })
      .finally(() => setLoading(false));
  }, []);

  function startEdit(g: ClientGroup) {
    setEditing(g.id);
    setAdding(false);
    setF({
      category: g.category,
      note: g.note,
      clients: g.clients.join('\n'),
      sort_order: g.sort_order,
    });
    setMsg(null);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setF({ category: '', note: '', clients: '', sort_order: groups.length + 1 });
    setMsg(null);
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const clientsArr = f.clients.split('\n').map((s) => s.trim()).filter(Boolean);
      const body = { ...f, clients: clientsArr };

      let res: Response;
      if (editing) {
        res = await fetch('/api/admin/klien', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing, ...body }),
        });
      } else {
        res = await fetch('/api/admin/klien', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal menyimpan.' });
      } else {
        setMsg({ kind: 'ok', text: editing ? 'Tersimpan.' : 'Ditambahkan.' });
        setEditing(null);
        setAdding(false);
        // Refresh list
        const r = await fetch('/api/admin/klien');
        const d = (await r.json()) as { ok: boolean; groups: ClientGroup[] };
        if (d.ok) setGroups(d.groups);
      }
    } catch {
      setMsg({ kind: 'err', text: 'Kesalahan jaringan.' });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Hapus grup klien ini?')) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/klien', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal menghapus.' });
      } else {
        setGroups(groups.filter((g) => g.id !== id));
        setMsg({ kind: 'ok', text: 'Dihapus.' });
      }
    } catch {
      setMsg({ kind: 'err', text: 'Kesalahan jaringan.' });
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

  const isFormOpen = editing !== null || adding;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Kelola Klien</h1>
      <p className="mt-1 text-sm text-slate-600">
        Daftar klien per kategori yang ditampilkan di halaman Portofolio.
      </p>

      {/* Form tambah / edit */}
      {isFormOpen ? (
        <section className="mt-5 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {editing ? 'Edit Grup Klien' : 'Tambah Grup Klien'}
          </h2>
          <form onSubmit={onSave} className="mt-3 grid gap-3 max-w-2xl">
            {msg ? (
              <p className={`rounded-lg border px-3 py-2 text-sm font-semibold ${msg.kind === 'ok' ? 'border-leaf-300 bg-leaf-50 text-forest-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {msg.text}
              </p>
            ) : null}

            <div className="grid gap-1.5">
              <label className="text-sm font-bold text-navy-900">Nama Kategori</label>
              <input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={field} placeholder="Contoh: Dapur SPPG" required />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-bold text-navy-900">Catatan</label>
              <input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className={field} placeholder="Deskripsi singkat kategori" />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-bold text-navy-900">Daftar Klien</label>
              <textarea
                value={f.clients}
                onChange={(e) => setF({ ...f, clients: e.target.value })}
                className={`${field} min-h-[200px] font-mono text-xs`}
                placeholder="Satu nama klien per baris"
              />
              <p className="text-xs text-slate-500">Satu nama klien per baris. Total: {f.clients.split('\n').filter((s) => s.trim()).length} klien.</p>
            </div>

            <div className="grid gap-1.5 w-32">
              <label className="text-sm font-bold text-navy-900">Urutan</label>
              <input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} className={field} />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
                {busy ? 'Menyimpan…' : 'Simpan'}
              </button>
              <button type="button" onClick={() => { setEditing(null); setAdding(false); setMsg(null); }} className="btn-outline">
                Batal
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button onClick={startAdd} className="mt-5 btn-primary">
          + Tambah Grup Klien
        </button>
      )}

      {/* Daftar grup */}
      {loading ? (
        <p className="mt-5 text-sm text-slate-500">Memuat…</p>
      ) : groups.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Belum ada grup klien.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {groups.map((g) => (
            <section key={g.id} className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-navy-900">{g.category}</h3>
                  <p className="text-sm text-slate-600 mt-1">{g.note}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {g.clients.length} klien · Urutan: {g.sort_order}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {g.clients.slice(0, 5).map((c) => (
                      <span key={c} className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs text-slate-700">
                        {c}
                      </span>
                    ))}
                    {g.clients.length > 5 && (
                      <span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs text-slate-500">
                        +{g.clients.length - 5} lainnya
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(g)} className="rounded-lg border border-navy-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-cream-50">
                    Edit
                  </button>
                  <button onClick={() => onDelete(g.id)} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                    Hapus
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
