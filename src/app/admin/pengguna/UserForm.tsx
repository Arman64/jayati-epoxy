'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function UserForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/pengguna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal menambah pengguna.' });
      } else {
        setMsg({ kind: 'ok', text: 'Pengguna ditambahkan.' });
        setF({ name: '', email: '', password: '', role: 'staff' });
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-3">
      {msg ? (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
            msg.kind === 'ok'
              ? 'border-leaf-300 bg-leaf-50 text-forest-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor="u-name" className="text-sm font-bold text-navy-900">Nama</label>
        <input
          id="u-name"
          required
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          className={field}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="u-email" className="text-sm font-bold text-navy-900">Email</label>
        <input
          id="u-email"
          type="email"
          required
          autoComplete="off"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          className={field}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="u-pass" className="text-sm font-bold text-navy-900">
          Kata sandi awal
        </label>
        <input
          id="u-pass"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
          className={field}
        />
        <p className="text-xs text-slate-500">Minimal 10 karakter.</p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="u-role" className="text-sm font-bold text-navy-900">Peran</label>
        <select
          id="u-role"
          value={f.role}
          onChange={(e) => setF({ ...f, role: e.target.value })}
          className={field}
        >
          <option value="staff">Staf — hanya kelola prospek</option>
          <option value="owner">Pemilik — akses penuh</option>
        </select>
      </div>

      <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
        {busy ? 'Menyimpan…' : 'Tambah pengguna'}
      </button>
    </form>
  );
}
