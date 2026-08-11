'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaItem } from '@/lib/page-copy';

/**
 * Pemilih gambar: mengunggah berkas baru atau memilih dari yang sudah ada.
 * Dipakai di dalam editor bagian, muncul sebagai panel mengambang.
 */
export function MediaPicker({
  onPick,
  onClose,
}: {
  onPick: (m: MediaItem) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [alt, setAlt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/admin/media')
      .then((r) => r.json())
      .then((d: { ok?: boolean; media?: MediaItem[] }) => {
        if (alive) setItems(d.ok && d.media ? d.media : []);
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  // Escape menutup panel — perilaku yang diharapkan dari dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function upload() {
    if (!file) {
      setError('Pilih berkas gambar terlebih dahulu.');
      return;
    }
    if (!alt.trim()) {
      setError('Teks alternatif wajib diisi.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('alt', alt.trim());
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      const d = (await res.json()) as {
        ok: boolean;
        media?: MediaItem;
        error?: string;
        problems?: Array<{ message: string }>;
      };
      if (!res.ok || !d.ok || !d.media) {
        setError(d.problems?.[0]?.message ?? d.error ?? 'Gambar gagal diunggah.');
        return;
      }
      setItems((x) => [d.media!, ...(x ?? [])]);
      setFile(null);
      setAlt('');
      if (inputRef.current) inputRef.current.value = '';
      onPick(d.media);
    } catch {
      setError('Tidak dapat menghubungi server.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: MediaItem) {
    if (!confirm(`Hapus gambar ini dari pustaka?\n\n${m.alt}`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/media/${m.id}`, { method: 'DELETE' });
      if (res.ok) setItems((x) => (x ?? []).filter((i) => i.id !== m.id));
      else setError('Gambar gagal dihapus.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Pustaka gambar"
      className="mt-3 rounded-xl border border-navy-900/15 bg-slate-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-extrabold text-navy-900">Pustaka gambar</h4>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold text-slate-600 hover:text-navy-900"
        >
          Tutup
        </button>
      </div>

      {/* unggah baru */}
      <div className="mt-3 grid gap-2 rounded-lg border border-navy-900/12 bg-white p-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Unggah gambar baru
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setError('');
          }}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
        />
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Teks alternatif — jelaskan isi foto (wajib)"
          maxLength={200}
          className="w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
        />
        <p className="text-xs text-slate-500">JPG, PNG, atau WebP. Maksimal 8&nbsp;MB, minimal 200×200 piksel.</p>
        <button
          type="button"
          onClick={upload}
          disabled={busy}
          className="btn-primary w-fit text-sm disabled:opacity-60"
        >
          {busy ? 'Mengunggah…' : 'Unggah & pakai'}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {/* daftar gambar */}
      <div className="mt-3">
        {items === null ? (
          <p className="text-sm text-slate-500">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada gambar di pustaka.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <li key={m.id} className="overflow-hidden rounded-lg border border-navy-900/12 bg-white">
                <button
                  type="button"
                  onClick={() => onPick(m)}
                  className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-leaf-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.path}
                    alt={m.alt}
                    width={m.width}
                    height={m.height}
                    className="h-24 w-full bg-slate-100 object-cover"
                  />
                  <span className="block px-2 py-1.5 text-[11px] leading-snug text-slate-600 line-clamp-2">
                    {m.alt}
                  </span>
                </button>
                <div className="flex items-center justify-between border-t border-navy-900/10 px-2 py-1">
                  <span className="text-[10px] tabular-nums text-slate-500">
                    {m.width}×{m.height}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    className="text-[10px] font-bold text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
