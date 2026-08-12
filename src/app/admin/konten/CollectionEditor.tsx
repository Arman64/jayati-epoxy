'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CollectionDef, FieldDef } from '@/lib/collections';
import { PhotoListField, type PhotoValue } from './PhotoListField';

type Item = {
  id: number;
  collection: string;
  slug: string;
  data: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

function rupiah(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n);
}

/** Satu kolom isian, bentuknya mengikuti tipe field. */
function FieldInput({
  def,
  value,
  onChange,
  problem,
}: {
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  problem?: string;
}) {
  const id = `f-${def.key}`;
  const err = problem
    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
    : '';

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-navy-900">
        {def.label}
        {def.required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>

      {def.type === 'photos' ? (
        <PhotoListField
          value={(Array.isArray(value) ? value : []) as PhotoValue[]}
          onChange={(v) => onChange(v)}
          hint={def.hint}
        />
      ) : def.type === 'textarea' ? (
        <textarea
          id={id}
          rows={3}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} ${err}`}
        />
      ) : def.type === 'list' ? (
        <textarea
          id={id}
          rows={Math.max((Array.isArray(value) ? value.length : 0) + 1, 3)}
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          onChange={(e) => onChange(e.target.value.split('\n'))}
          className={`${field} ${err}`}
        />
      ) : def.type === 'select' ? (
        <select
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} ${err}`}
        >
          {(def.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : def.type === 'boolean' ? (
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-[#6A9929]"
          />
          <span className="text-sm text-slate-600">{def.hint ?? 'Aktifkan'}</span>
        </label>
      ) : def.type === 'rupiah' ? (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
            Rp
          </span>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={def.min}
            max={def.max}
            value={value === '' || value === undefined ? '' : Number(value)}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={`${field} ${err} pl-9`}
          />
          {Number(value) > 0 ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums text-slate-400">
              {rupiah(Number(value))}
            </span>
          ) : null}
        </div>
      ) : def.type === 'number' ? (
        <input
          id={id}
          type="number"
          min={def.min}
          max={def.max}
          value={value === '' || value === undefined ? '' : Number(value)}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={`${field} ${err}`}
        />
      ) : (
        <input
          id={id}
          type="text"
          maxLength={def.maxLength}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} ${err}`}
        />
      )}

      {problem ? (
        <p className="text-xs font-semibold text-red-700">{problem}</p>
      ) : def.hint && def.type !== 'boolean' ? (
        <p className="text-xs text-slate-500">{def.hint}</p>
      ) : null}
    </div>
  );
}

export function CollectionEditor({
  collections,
  counts,
  activeId,
  items,
}: {
  collections: CollectionDef[];
  counts: Record<string, number>;
  activeId: string;
  items: Item[];
}) {
  const router = useRouter();
  const def = collections.find((c) => c.id === activeId)!;

  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function openEdit(item: Item) {
    setEditing(item.id);
    setForm({ ...item.data });
    setProblems({});
    setMsg(null);
  }

  function openNew() {
    const blank: Record<string, unknown> = {};
    for (const f of def.fields) {
      blank[f.key] =
        f.type === 'list' || f.type === 'photos' ? [] : f.type === 'boolean' ? false : f.type === 'select' ? f.options?.[0] ?? '' : f.type === 'number' || f.type === 'rupiah' ? '' : '';
    }
    setForm(blank);
    setEditing('new');
    setProblems({});
    setMsg(null);
  }

  async function save() {
    setBusy(true);
    setProblems({});
    setMsg(null);
    try {
      const isNew = editing === 'new';
      const res = await fetch(isNew ? '/api/admin/konten' : `/api/admin/konten/${editing}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: def.id, data: form }),
      });
      const d = (await res.json()) as {
        ok: boolean;
        error?: string;
        problems?: Array<{ field: string; message: string }>;
      };
      if (!res.ok || !d.ok) {
        if (d.problems?.length) {
          const map: Record<string, string> = {};
          for (const p of d.problems) map[p.field] = p.message;
          setProblems(map);
          setMsg({ kind: 'err', text: 'Periksa kembali kolom yang ditandai merah.' });
        } else {
          setMsg({ kind: 'err', text: d.error ?? 'Gagal menyimpan.' });
        }
        return;
      }
      setMsg({ kind: 'ok', text: 'Tersimpan. Website sudah diperbarui.' });
      setEditing(null);
      router.refresh();
    } catch {
      setMsg({ kind: 'err', text: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(item: Item) {
    const res = await fetch(`/api/admin/konten/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) router.refresh();
    else setMsg({ kind: 'err', text: 'Gagal mengubah status tampil.' });
  }

  async function remove(item: Item) {
    const title = String(item.data[def.titleField] ?? item.slug);
    if (!window.confirm(`Hapus "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/admin/konten/${item.id}`, { method: 'DELETE' });
    if (res.ok) {
      setMsg({ kind: 'ok', text: 'Item dihapus.' });
      router.refresh();
    } else {
      setMsg({ kind: 'err', text: 'Gagal menghapus.' });
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const ids = items.map((i) => i.id);
    [ids[index], ids[next]] = [ids[next]!, ids[index]!];
    const res = await fetch('/api/admin/konten/urutan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: def.id, ids }),
    });
    if (res.ok) router.refresh();
    else setMsg({ kind: 'err', text: 'Gagal mengubah urutan.' });
  }

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
      {/* daftar koleksi */}
      <nav aria-label="Jenis konten">
        <ul className="grid gap-1">
          {collections.map((c) => (
            <li key={c.id}>
              <a
                href={`/admin/konten?c=${c.id}`}
                aria-current={c.id === activeId ? 'true' : undefined}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  c.id === activeId ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                <span className="truncate">{c.label}</span>
                <span
                  className={`shrink-0 rounded px-1.5 text-xs tabular-nums ${
                    c.id === activeId ? 'bg-white/15' : 'bg-navy-900/8 text-slate-500'
                  }`}
                >
                  {counts[c.id] ?? 0}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section>
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-[60ch]">
              <h2 className="text-lg font-extrabold text-navy-900">{def.label}</h2>
              <p className="mt-1 text-sm text-slate-600">{def.description}</p>
            </div>
            {def.allowCreate && editing === null ? (
              <button type="button" onClick={openNew} className="btn-primary !px-4 !py-2.5 text-sm">
                + Tambah
              </button>
            ) : null}
          </div>

          {def.sensitive ? (
            <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              <strong>Perhatian:</strong> {def.sensitive}
            </p>
          ) : null}

          {msg ? (
            <p
              role="status"
              className={`mt-3 rounded-lg border px-3 py-2 text-sm font-semibold ${
                msg.kind === 'ok'
                  ? 'border-leaf-300 bg-leaf-50 text-forest-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {msg.text}
            </p>
          ) : null}

          {/* form tambah / ubah */}
          {editing !== null ? (
            <div className="mt-4 rounded-xl border-2 border-navy-900/15 bg-cream-50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                {editing === 'new' ? `Tambah ${def.label}` : `Ubah ${def.label}`}
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {def.fields.map((f) => (
                  <div
                    key={f.key}
                    className={f.type === 'textarea' || f.type === 'list' || f.type === 'photos' ? 'sm:col-span-2' : ''}
                  >
                    <FieldInput
                      def={f}
                      value={form[f.key]}
                      problem={problems[f.key]}
                      onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
                    />
                  </div>
                ))}
              </div>
              {problems._ ? (
                <p className="mt-3 text-sm font-semibold text-red-700">{problems._}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={save} disabled={busy} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
                  {busy ? 'Menyimpan…' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setProblems({});
                  }}
                  disabled={busy}
                  className="btn-outline !py-2.5 text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : null}

          {/* daftar item */}
          <ul className="mt-4 grid gap-2">
            {items.length === 0 ? (
              <li className="rounded-xl border border-dashed border-navy-900/20 px-4 py-8 text-center text-sm text-slate-500">
                Belum ada item.
              </li>
            ) : (
              items.map((item, i) => {
                const title = String(item.data[def.titleField] ?? item.slug);
                const isPrice = def.id === 'epoxy_systems';
                return (
                  <li
                    key={item.id}
                    className={`rounded-xl border px-3.5 py-3 transition-colors ${
                      item.isActive
                        ? 'border-navy-900/12 bg-white'
                        : 'border-navy-900/8 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="grid shrink-0 gap-0.5">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          aria-label={`Pindahkan ${title} ke atas`}
                          className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-cream-100 hover:text-navy-900 disabled:opacity-25"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === items.length - 1}
                          aria-label={`Pindahkan ${title} ke bawah`}
                          className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-cream-100 hover:text-navy-900 disabled:opacity-25"
                        >
                          ▼
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy-900">{title}</p>
                        {isPrice ? (
                          <p className="mt-0.5 text-xs tabular-nums text-slate-500">
                            {Number(item.data.micron ?? 0).toLocaleString('id-ID')} µ ·{' '}
                            Rp {rupiah(Number(item.data.priceUnder100 ?? 0))} /{' '}
                            {rupiah(Number(item.data.priceOver100 ?? 0))} /{' '}
                            {rupiah(Number(item.data.priceOver500 ?? 0))}
                            {item.data.unverified ? ' · perkiraan' : ''}
                          </p>
                        ) : (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {String(
                              item.data.short ?? item.data.body ?? item.data.a ?? item.data.note ?? item.data.region ?? '',
                            ).slice(0, 110)}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          className="rounded-lg border border-navy-900/15 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-cream-50"
                        >
                          {item.isActive ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg border border-navy-900/15 px-2.5 py-1.5 text-xs font-bold text-navy-900 hover:bg-cream-50"
                        >
                          Ubah
                        </button>
                        {def.allowDelete ? (
                          <button
                            type="button"
                            onClick={() => remove(item)}
                            aria-label={`Hapus ${title}`}
                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
