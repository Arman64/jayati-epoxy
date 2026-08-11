'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SlotDef, CopyMap } from '@/lib/page-slots';
import type { MediaItem, PlacedImage } from '@/lib/page-copy';
import { MediaPicker } from './MediaPicker';

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

type Draft = { eyebrow: string; title: string; lead: string };

/**
 * Editor teks bagian-per-bagian untuk halaman bawaan.
 *
 * Setiap kolom kosong berarti "pakai teks bawaan" — teks bawaannya sendiri
 * ditampilkan sebagai placeholder supaya Owner tahu apa yang akan tampil.
 */
export function CopyEditor({
  pageId,
  pagePath,
  slots,
  copy,
  images,
}: {
  pageId: number;
  pagePath: string;
  slots: SlotDef[];
  copy: CopyMap;
  images: Record<string, PlacedImage>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ slot: string; kind: 'ok' | 'err'; text: string } | null>(null);
  const [picking, setPicking] = useState('');

  if (slots.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-navy-900/12 bg-slate-50 p-4 text-sm text-slate-600">
        Halaman ini belum punya bagian teks yang bisa diubah dari sini. Judul, deskripsi, dan
        paragraf pembukanya tetap bisa diatur di tab <strong>SEO &amp; pembuka</strong>.
      </p>
    );
  }

  function cur(s: SlotDef): Draft {
    const saved = copy[s.slot];
    return (
      draft[s.slot] ?? {
        eyebrow: saved?.eyebrow ?? '',
        title: saved?.title ?? '',
        lead: saved?.lead ?? '',
      }
    );
  }

  function set(slot: string, changes: Partial<Draft>, base: Draft) {
    setDraft((d) => ({ ...d, [slot]: { ...base, ...changes } }));
    setMsg(null);
  }

  async function save(s: SlotDef) {
    const v = cur(s);
    setBusy(s.slot);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/halaman/${pageId}/teks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: s.slot, ...v }),
      });
      const d = (await res.json()) as {
        ok: boolean;
        error?: string;
        problems?: Array<{ message: string }>;
      };
      if (!res.ok || !d.ok) {
        setMsg({
          slot: s.slot,
          kind: 'err',
          text: d.problems?.[0]?.message ?? d.error ?? 'Gagal menyimpan.',
        });
        return;
      }
      setMsg({ slot: s.slot, kind: 'ok', text: 'Tersimpan. Halaman publik langsung ikut berubah.' });
      setDraft((x) => {
        const next = { ...x };
        delete next[s.slot];
        return next;
      });
      router.refresh();
    } catch {
      setMsg({ slot: s.slot, kind: 'err', text: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy('');
    }
  }

  async function reset(s: SlotDef) {
    if (!confirm(`Kembalikan bagian "${s.label}" ke teks bawaan?`)) return;
    setBusy(s.slot);
    try {
      const res = await fetch(`/api/admin/halaman/${pageId}/teks?slot=${encodeURIComponent(s.slot)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDraft((x) => {
          const next = { ...x };
          delete next[s.slot];
          return next;
        });
        setMsg({ slot: s.slot, kind: 'ok', text: 'Kembali ke teks bawaan.' });
        router.refresh();
      } else {
        setMsg({ slot: s.slot, kind: 'err', text: 'Gagal mengembalikan.' });
      }
    } finally {
      setBusy('');
    }
  }

  async function place(s: SlotDef, mediaId: number | null) {
    setBusy(s.slot);
    try {
      const res = await fetch(`/api/admin/halaman/${pageId}/teks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: s.slot, mediaId }),
      });
      if (res.ok) {
        setPicking('');
        setMsg({
          slot: s.slot,
          kind: 'ok',
          text: mediaId ? 'Foto diperbarui.' : 'Kembali ke foto bawaan.',
        });
        router.refresh();
      } else {
        setMsg({ slot: s.slot, kind: 'err', text: 'Foto gagal dipasang.' });
      }
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="mt-4 grid gap-4">
      <p className="rounded-xl border border-navy-900/12 bg-cream-200/60 p-3 text-sm text-slate-700">
        Kolom yang dibiarkan kosong akan memakai teks bawaan — teks bawaannya tertulis abu-abu di
        dalam kolom. Susunan bagian dan tata letaknya tetap, jadi halaman tidak bisa rusak.
      </p>

      {slots.map((s) => {
        const v = cur(s);
        const dirty = Boolean(draft[s.slot]);
        const overridden = Boolean(copy[s.slot]?.eyebrow || copy[s.slot]?.title || copy[s.slot]?.lead);
        const placed = images[s.slot];
        const m = msg?.slot === s.slot ? msg : null;

        return (
          <section
            key={s.slot}
            className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-navy-900">
                {s.label}
                {overridden ? (
                  <span className="ml-2 rounded border border-leaf-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-forest-700">
                    Diubah
                  </span>
                ) : null}
                {dirty ? (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                    Belum disimpan
                  </span>
                ) : null}
              </h3>
              {overridden ? (
                <button
                  type="button"
                  onClick={() => reset(s)}
                  disabled={busy === s.slot}
                  className="text-xs font-bold text-slate-600 underline underline-offset-2 hover:text-navy-900 disabled:opacity-60"
                >
                  Kembalikan ke bawaan
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3">
              {s.defaultEyebrow !== undefined ? (
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`eb-${s.slot}`}
                    className="text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Teks kecil di atas judul
                  </label>
                  <input
                    id={`eb-${s.slot}`}
                    value={v.eyebrow}
                    onChange={(e) => set(s.slot, { eyebrow: e.target.value }, v)}
                    placeholder={s.defaultEyebrow}
                    maxLength={60}
                    className={field}
                  />
                </div>
              ) : null}

              <div className="grid gap-1.5">
                <label
                  htmlFor={`ti-${s.slot}`}
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Judul bagian
                </label>
                <input
                  id={`ti-${s.slot}`}
                  value={v.title}
                  onChange={(e) => set(s.slot, { title: e.target.value }, v)}
                  placeholder={s.defaultTitle}
                  maxLength={140}
                  className={field}
                />
              </div>

              {s.defaultLead !== undefined ? (
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`ld-${s.slot}`}
                    className="text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Kalimat pengantar
                  </label>
                  <textarea
                    id={`ld-${s.slot}`}
                    rows={3}
                    value={v.lead}
                    onChange={(e) => set(s.slot, { lead: e.target.value }, v)}
                    placeholder={s.defaultLead}
                    maxLength={600}
                    className={field}
                  />
                </div>
              ) : null}

              {s.image ? (
                <div className="grid gap-2 rounded-xl border border-navy-900/12 bg-slate-50 p-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {s.image.label}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={placed?.src ?? s.image.defaultSrc}
                      alt={placed?.alt ?? s.image.defaultAlt}
                      width={112}
                      height={84}
                      className="h-21 w-28 rounded-lg border border-navy-900/10 bg-white object-cover"
                    />
                    <div className="grid gap-1">
                      <span className="text-xs font-semibold text-slate-600">
                        {placed ? 'Foto pilihan Anda' : 'Foto bawaan'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPicking(picking === s.slot ? '' : s.slot)}
                          className="rounded-lg border border-navy-900/20 bg-white px-3 py-1.5 text-xs font-bold text-navy-900 hover:bg-cream-200"
                        >
                          {picking === s.slot ? 'Tutup pustaka' : 'Ganti foto'}
                        </button>
                        {placed ? (
                          <button
                            type="button"
                            onClick={() => place(s, null)}
                            disabled={busy === s.slot}
                            className="rounded-lg border border-navy-900/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-cream-200 disabled:opacity-60"
                          >
                            Pakai foto bawaan
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {picking === s.slot ? (
                    <MediaPicker
                      onPick={(mm: MediaItem) => place(s, mm.id)}
                      onClose={() => setPicking('')}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>

            {m ? (
              <p
                role="status"
                className={`mt-3 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  m.kind === 'ok'
                    ? 'border-leaf-500/40 bg-leaf-500/10 text-forest-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {m.text}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => save(s)}
              disabled={busy === s.slot || !dirty}
              className={
                dirty
                  ? 'btn-primary mt-4 text-sm disabled:opacity-60'
                  : 'mt-4 cursor-default rounded-lg border border-navy-900/15 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-400'
              }
            >
              {busy === s.slot ? 'Menyimpan…' : dirty ? 'Simpan bagian ini' : 'Belum ada perubahan'}
            </button>
          </section>
        );
      })}

      <p className="text-xs text-slate-500">
        Halaman: <code className="rounded bg-slate-100 px-1">{pagePath}</code>
      </p>
    </div>
  );
}
