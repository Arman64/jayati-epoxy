'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function NoteForm({ leadId }: { leadId: number }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      setError('Catatan tidak boleh kosong.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Gagal menyimpan catatan.');
      } else {
        setBody('');
        router.refresh();
      }
    } catch {
      setError('Tidak dapat menghubungi server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-2">
      <label htmlFor="note" className="sr-only">
        Catatan baru
      </label>
      <textarea
        id="note"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        placeholder="Contoh: sudah ditelepon, minta dijadwalkan survei minggu depan."
        className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
      />
      {error ? (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="btn-navy justify-self-start !px-4 !py-2.5 text-sm disabled:opacity-60">
        {busy ? 'Menyimpan…' : 'Tambah catatan'}
      </button>
    </form>
  );
}
