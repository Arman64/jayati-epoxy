'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type Props = {
  name: string;
  email: string;
};

export function MyProfileForm({ name, email }: Props) {
  const router = useRouter();
  const [f, setF] = useState({ name, email, password: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body: Record<string, unknown> = { name: f.name, email: f.email };
      if (f.password) body.password = f.password;
      const res = await fetch('/api/admin/pengguna/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal menyimpan.' });
      } else {
        setMsg({ kind: 'ok', text: 'Profil berhasil diperbarui.' });
        setF({ ...f, password: '' });
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Kesalahan jaringan.' });
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
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
        <label htmlFor="me-name" className="text-sm font-bold text-navy-900">Nama</label>
        <input
          id="me-name"
          required
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          className={field}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="me-email" className="text-sm font-bold text-navy-900">Email</label>
        <input
          id="me-email"
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          className={field}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="me-pass" className="text-sm font-bold text-navy-900">
          Ubah Kata Sandi
        </label>
        <input
          id="me-pass"
          type="password"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
          className={field}
          placeholder="Kosongkan jika tidak ingin ubah"
          minLength={10}
          autoComplete="new-password"
        />
        <p className="text-xs text-slate-500">Minimal 10 karakter. Kosongkan jika tidak ingin mengubah.</p>
      </div>

      <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
        {busy ? 'Menyimpan…' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
