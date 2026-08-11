'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Pembuatan halaman baru oleh Owner.
 *
 * Halaman baru selalu lahir sebagai draf (belum terbit) supaya tidak ada
 * halaman kosong yang bocor ke publik atau ke sitemap sebelum diisi.
 */

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

type CustomPage = {
  id: number;
  path: string;
  label: string;
  isPublished: boolean;
  sectionCount: number;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function NewPageForm({ pages }: { pages: CustomPage[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [path, setPath] = useState('');
  const [pathTouched, setPathTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<Array<{ field: string; message: string }>>([]);

  const problemFor = (f: string) => problems.find((p) => p.field === f)?.message;

  function onLabel(v: string) {
    setLabel(v);
    if (!pathTouched) setPath(v ? `/${slugify(v)}` : '');
  }

  async function submit() {
    setBusy(true);
    setProblems([]);
    try {
      const res = await fetch('/api/admin/halaman/baru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, path, title, description }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProblems(json.problems ?? [{ field: '_', message: json.error ?? 'Halaman gagal dibuat.' }]);
        return;
      }
      setLabel('');
      setPath('');
      setTitle('');
      setDescription('');
      setPathTouched(false);
      setOpen(false);
      router.push(`/admin/halaman/${json.page.id}`);
    } catch {
      setProblems([{ field: '_', message: 'Tidak dapat terhubung ke server.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-navy-900">Halaman buatan sendiri</h2>
          <p className="text-sm text-slate-600">
            Buat halaman baru dan susun isinya dari seksi siap pakai.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
        >
          {open ? 'Batal' : '+ Halaman baru'}
        </button>
      </div>

      {open ? (
        <div className="mt-4 grid gap-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="np-label" className="text-sm font-bold text-navy-900">
              Nama halaman <span className="text-red-600">*</span>
            </label>
            <input
              id="np-label"
              type="text"
              value={label}
              onChange={(e) => onLabel(e.target.value)}
              placeholder="Epoxy Lantai Gudang"
              className={field}
            />
            {problemFor('label') ? (
              <p className="text-[13px] font-semibold text-red-600">{problemFor('label')}</p>
            ) : (
              <p className="text-[13px] text-slate-500">Dipakai sebagai nama di menu admin dan remah roti.</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="np-path" className="text-sm font-bold text-navy-900">
              Alamat halaman <span className="text-red-600">*</span>
            </label>
            <input
              id="np-path"
              type="text"
              value={path}
              onChange={(e) => {
                setPathTouched(true);
                setPath(e.target.value);
              }}
              placeholder="/epoxy-lantai-gudang"
              className={field}
            />
            {problemFor('path') ? (
              <p className="text-[13px] font-semibold text-red-600">{problemFor('path')}</p>
            ) : (
              <p className="text-[13px] text-slate-500">Huruf kecil, angka, dan tanda hubung saja.</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="np-title" className="text-sm font-bold text-navy-900">
              Judul untuk Google
            </label>
            <input
              id="np-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Epoxy Lantai Gudang — Jayati Epoxy"
              className={field}
            />
            <p className="text-[13px] text-slate-500">Bisa diisi nanti. Idealnya di bawah 65 karakter.</p>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="np-desc" className="text-sm font-bold text-navy-900">
              Deskripsi untuk Google
            </label>
            <input
              id="np-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
            <p className="text-[13px] text-slate-500">Idealnya 70–165 karakter.</p>
          </div>

          {problemFor('_') ? (
            <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">
              {problemFor('_')}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy || !label || !path}
              className="rounded-lg bg-forest-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-40"
            >
              {busy ? 'Membuat…' : 'Buat halaman'}
            </button>
            <p className="mt-2 text-[13px] text-slate-500">
              Halaman dibuat sebagai draf. Setelah isinya siap, tekan Terbitkan.
            </p>
          </div>
        </div>
      ) : null}

      {pages.length ? (
        <ul className="mt-4 grid gap-2.5">
          {pages.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/halaman/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/10 bg-white p-4 shadow-card hover:border-leaf-300"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-navy-900">{p.label}</span>
                  <code className="text-[13px] text-slate-500">{p.path}</code>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[13px] text-slate-500">
                    {p.sectionCount} seksi
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      p.isPublished ? 'bg-leaf-100 text-forest-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.isPublished ? 'Terbit' : 'Draf'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-navy-900/20 bg-white p-6 text-center text-sm text-slate-600">
          Belum ada halaman buatan sendiri.
        </p>
      )}
    </section>
  );
}
