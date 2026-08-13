'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { IconClose } from '@/components/Icons';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export function UserActions({ user, isSelf }: { user: User; isSelf: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [f, setF] = useState({ name: user.name, email: user.email, password: '', role: user.role });
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function onEdit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body: Record<string, unknown> = { name: f.name, email: f.email, role: f.role };
      if (f.password) body.password = f.password;
      const res = await fetch(`/api/admin/pengguna/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal menyimpan.' });
      } else {
        setMsg({ kind: 'ok', text: 'Tersimpan.' });
        setEditing(false);
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Kesalahan jaringan.' });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/pengguna/${user.id}`, { method: 'DELETE' });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal menghapus.' });
      } else {
        setMsg({ kind: 'ok', text: 'Dihapus.' });
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Kesalahan jaringan.' });
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  async function toggleActive() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/pengguna/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.isActive }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal.' });
      } else {
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Kesalahan jaringan.' });
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

  if (isSelf) {
    return <span className="text-xs text-slate-400">Akun Anda</span>;
  }

  if (editing) {
    return (
      <div className="min-w-[200px]">
        {msg ? (
          <p className={`mb-2 rounded border px-2 py-1 text-xs ${msg.kind === 'ok' ? 'border-leaf-300 bg-leaf-50 text-forest-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {msg.text}
          </p>
        ) : null}
        <form onSubmit={onEdit} className="grid gap-2">
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} placeholder="Nama" required />
          <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} placeholder="Email" type="email" required />
          <input value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={field} placeholder="Password baru (opsional)" type="password" minLength={10} />
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={field}>
            <option value="staff">Staf</option>
            <option value="owner">Pemilik</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary !px-3 !py-1.5 text-xs">
              {busy ? '...' : 'Simpan'}
            </button>
            <button type="button" onClick={() => { setEditing(false); setMsg(null); }} className="btn-outline !px-3 !py-1.5 text-xs">
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setEditing(true)}
        className="rounded-lg border border-navy-900/10 bg-white px-2.5 py-1 text-xs font-semibold text-navy-900 hover:bg-cream-50"
      >
        Edit
      </button>
      <button
        onClick={toggleActive}
        disabled={busy}
        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
          user.isActive
            ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'border-leaf-300 bg-leaf-50 text-forest-700 hover:bg-leaf-100'
        }`}
      >
        {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
      </button>
      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <button onClick={onDelete} disabled={busy} className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100">
            Hapus
          </button>
          <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500 hover:text-slate-700">
            <IconClose className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Hapus
        </button>
      )}
    </div>
  );
}
