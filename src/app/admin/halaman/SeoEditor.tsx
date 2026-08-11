'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PageSetting } from '@/lib/pages';

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

function counter(v: string, min: number, max: number) {
  const n = v.length;
  const bad = n > 0 && (n < min || n > max);
  return (
    <span className={`text-xs tabular-nums ${bad ? 'font-bold text-amber-700' : 'text-slate-500'}`}>
      {n}/{max}
    </span>
  );
}

/**
 * Pengaturan SEO satu halaman: title, meta description, H1, paragraf pembuka,
 * gambar OG, dan perilaku indeks. Kolom kosong berarti memakai nilai bawaan
 * yang ditulis di kode halaman.
 */
export function SeoEditor({ page }: { page: PageSetting }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Partial<PageSetting>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const cur = { ...page, ...draft };

  function set(changes: Partial<PageSetting>) {
    setDraft((d) => ({ ...d, ...changes }));
    setMsg(null);
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/halaman/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cur.title ?? '',
          description: cur.description ?? '',
          h1: cur.h1 ?? '',
          intro: cur.intro ?? '',
          ogImage: cur.ogImage ?? '',
          noindex: cur.noindex,
          inSitemap: cur.inSitemap,
          sitemapPriority: cur.sitemapPriority,
        }),
      });
      const d = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !d.ok) setMsg({ kind: 'err', text: d.error ?? 'Gagal menyimpan.' });
      else {
        setMsg({ kind: 'ok', text: 'Tersimpan.' });
        setDraft({});
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
      {msg ? (
        <p
          role="status"
          className={`mb-3 rounded-lg border px-3 py-2 text-sm font-semibold ${
            msg.kind === 'ok'
              ? 'border-leaf-500/40 bg-leaf-500/10 text-forest-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4">
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="p-title" className="text-sm font-bold text-navy-900">
              Judul (title tag)
            </label>
            {counter(cur.title ?? '', 30, 65)}
          </div>
          <input
            id="p-title"
            value={cur.title ?? ''}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Kosongkan untuk memakai judul bawaan halaman"
            className={field}
          />
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="p-desc" className="text-sm font-bold text-navy-900">
              Meta description
            </label>
            {counter(cur.description ?? '', 70, 165)}
          </div>
          <textarea
            id="p-desc"
            rows={3}
            value={cur.description ?? ''}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Kosongkan untuk memakai deskripsi bawaan"
            className={field}
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="p-h1" className="text-sm font-bold text-navy-900">
            Judul utama (H1)
          </label>
          <input
            id="p-h1"
            value={cur.h1 ?? ''}
            onChange={(e) => set({ h1: e.target.value })}
            placeholder="Kosongkan untuk memakai H1 bawaan"
            className={field}
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="p-intro" className="text-sm font-bold text-navy-900">
            Paragraf pembuka
          </label>
          <textarea
            id="p-intro"
            rows={4}
            value={cur.intro ?? ''}
            onChange={(e) => set({ intro: e.target.value })}
            className={field}
          />
          <p className="text-xs text-slate-500">
            Untuk halaman layanan, jawab pertanyaan utama dalam 40–60 kata di awal.
          </p>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="p-og" className="text-sm font-bold text-navy-900">
            Gambar OG
          </label>
          <input
            id="p-og"
            value={cur.ogImage ?? ''}
            onChange={(e) => set({ ogImage: e.target.value })}
            placeholder="/img/og-default.png"
            className={field}
          />
        </div>

        <fieldset className="grid gap-3 rounded-xl border border-navy-900/12 p-4">
          <legend className="px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            Indeks mesin pencari
          </legend>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={cur.noindex}
              onChange={(e) => set({ noindex: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[#6A9929]"
            />
            <span>
              <span className="block text-sm font-bold text-navy-900">Jangan indeks halaman ini</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Halaman tetap bisa dibuka, tapi diminta tidak muncul di Google.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={cur.inSitemap}
              onChange={(e) => set({ inSitemap: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[#6A9929]"
            />
            <span>
              <span className="block text-sm font-bold text-navy-900">Sertakan di sitemap.xml</span>
            </span>
          </label>

          <div className="grid max-w-[220px] gap-1.5">
            <label htmlFor="p-prio" className="text-sm font-bold text-navy-900">
              Prioritas sitemap
            </label>
            <input
              id="p-prio"
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={cur.sitemapPriority}
              onChange={(e) => set({ sitemapPriority: Number(e.target.value) })}
              className={field}
            />
          </div>
        </fieldset>
      </div>

      <button type="button" onClick={save} disabled={busy} className="btn-primary mt-6 disabled:opacity-60">
        {busy ? 'Menyimpan…' : 'Simpan halaman'}
      </button>
    </section>
  );
}
