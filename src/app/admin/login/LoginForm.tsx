'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Email atau kata sandi salah.');
        setBusy(false);
        return;
      }

      // refresh() memastikan server component membaca cookie sesi yang baru.
      router.replace(nextPath && nextPath.startsWith('/admin') ? nextPath : '/admin');
      router.refresh();
    } catch {
      setError('Tidak dapat menghubungi server. Periksa koneksi Anda.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-sm font-bold text-navy-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
          placeholder="nama@perusahaan.com"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="password" className="text-sm font-bold text-navy-900">
          Kata sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
        {busy ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  );
}
