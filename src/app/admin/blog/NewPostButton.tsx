'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NewPostButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blog', { method: 'POST' });
      const d = (await res.json()) as { ok: boolean; id?: number; error?: string };
      if (!res.ok || !d.ok || !d.id) {
        setError(d.error ?? 'Gagal membuat artikel.');
        setBusy(false);
        return;
      }
      router.push(`/admin/blog/${d.id}`);
    } catch {
      setError('Tidak dapat menghubungi server.');
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button type="button" onClick={create} disabled={busy} className="btn-primary !px-4 !py-2.5 text-sm disabled:opacity-60">
        {busy ? 'Membuat…' : 'Tulis artikel baru'}
      </button>
      {error ? <p className="mt-1 text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
