'use client';

import { useState } from 'react';
import type { MediaItem } from '@/lib/page-copy';
import { MediaPicker } from '../halaman/MediaPicker';

export type PhotoValue = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

/**
 * Pengelola daftar foto untuk satu item konten (dipakai proyek portofolio).
 *
 * Foto diambil dari pustaka gambar yang sama dengan pengaturan halaman,
 * sehingga berkas yang sudah diunggah bisa dipakai ulang. Ukuran gambar
 * dibawa serta dari pustaka supaya tata letak halaman tidak bergeser.
 */
export function PhotoListField({
  value,
  onChange,
  hint,
}: {
  value: PhotoValue[];
  onChange: (v: PhotoValue[]) => void;
  hint?: string;
}) {
  const [picking, setPicking] = useState(false);
  const photos = Array.isArray(value) ? value : [];

  function add(m: MediaItem) {
    if (photos.some((p) => p.src === m.path)) {
      setPicking(false);
      return;
    }
    onChange([
      ...photos,
      { src: m.path, alt: m.alt, width: m.width, height: m.height },
    ]);
    setPicking(false);
  }

  function update(i: number, patch: Partial<PhotoValue>) {
    onChange(photos.map((p, n) => (n === i ? { ...p, ...patch } : p)));
  }

  function remove(i: number) {
    onChange(photos.filter((_, n) => n !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  }

  return (
    <div className="grid gap-2">
      {photos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-navy-900/20 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
          Belum ada foto. Tambahkan minimal satu.
        </p>
      ) : (
        <ul className="grid gap-2">
          {photos.map((p, i) => (
            <li
              key={`${p.src}-${i}`}
              className="grid gap-2 rounded-xl border border-navy-900/12 bg-white p-3 sm:grid-cols-[auto_1fr]"
            >
              <div className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  width={96}
                  height={72}
                  className="h-18 w-24 rounded-lg border border-navy-900/10 bg-slate-100 object-cover"
                />
                {i === 0 ? (
                  <span className="rounded bg-leaf-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-forest-700">
                    Utama
                  </span>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="grid gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Teks alternatif (wajib)
                  </span>
                  <input
                    value={p.alt}
                    onChange={(e) => update(i, { alt: e.target.value })}
                    maxLength={200}
                    placeholder="Jelaskan isi foto"
                    className="w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Keterangan di bawah foto
                  </span>
                  <input
                    value={p.caption ?? ''}
                    onChange={(e) => update(i, { caption: e.target.value })}
                    maxLength={300}
                    placeholder="Boleh dikosongkan"
                    className="w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Naikkan foto ke-${i + 1}`}
                    className="rounded-lg border border-navy-900/20 bg-white px-2 py-1 text-xs font-bold text-navy-900 disabled:opacity-40"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === photos.length - 1}
                    aria-label={`Turunkan foto ke-${i + 1}`}
                    className="rounded-lg border border-navy-900/20 bg-white px-2 py-1 text-xs font-bold text-navy-900 disabled:opacity-40"
                  >
                    ▼
                  </button>
                  <span className="text-[11px] tabular-nums text-slate-500">
                    {p.width}×{p.height}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="ml-auto rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setPicking((v) => !v)}
        className="w-fit rounded-lg border border-navy-900/20 bg-white px-3 py-2 text-sm font-bold text-navy-900 hover:bg-cream-200"
      >
        {picking ? 'Tutup pustaka' : '+ Tambah foto'}
      </button>

      {picking ? <MediaPicker onPick={add} onClose={() => setPicking(false)} /> : null}

      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
