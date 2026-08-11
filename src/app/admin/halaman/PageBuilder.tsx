'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { SECTION_KINDS, SECTION_BY_KIND, type SectionField, type PageSectionRow } from '@/lib/sections';

/**
 * Penyusun seksi halaman.
 *
 * Owner memilih seksi dari katalog, mengatur urutan dengan tombol naik/turun,
 * menyembunyikan, dan mengisi teksnya. Semua perubahan langsung tersimpan ke
 * server; tidak ada draf lokal yang bisa hilang.
 */

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

type Problem = { field: string; message: string };

type PageInfo = {
  id: number;
  path: string;
  label: string;
  isCustom: boolean;
  isPublished: boolean;
};

function SectionField({
  def,
  value,
  onChange,
  problem,
}: {
  def: SectionField;
  value: unknown;
  onChange: (v: unknown) => void;
  problem?: string;
}) {
  const id = `sf-${def.name}`;
  const err = problem ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : '';

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-navy-900">
        {def.label}
        {def.required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>

      {def.type === 'textarea' ? (
        <textarea
          id={id}
          rows={4}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
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
            <option key={o.value} value={o.value}>
              {o.label}
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
          <span className="text-sm text-slate-600">Ya</span>
        </label>
      ) : def.type === 'number' ? (
        <input
          id={id}
          type="number"
          min={0}
          value={value === undefined || value === null || value === '' ? '' : Number(value)}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} ${err} max-w-[10rem]`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          className={`${field} ${err}`}
        />
      )}

      {problem ? (
        <p className="text-[13px] font-semibold text-red-600">{problem}</p>
      ) : def.help ? (
        <p className="text-[13px] text-slate-500">{def.help}</p>
      ) : null}
    </div>
  );
}

function SectionCard({
  section,
  index,
  total,
  onChanged,
}: {
  section: PageSectionRow;
  index: number;
  total: number;
  onChanged: () => void;
}) {
  const def = SECTION_BY_KIND[section.kind];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(section.config as Record<string, unknown>);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const problemFor = (name: string) => problems.find((p) => p.field === name)?.message;

  async function call(url: string, init: RequestInit) {
    setBusy(true);
    setProblems([]);
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProblems(json.problems ?? [{ field: '_', message: json.error ?? 'Gagal menyimpan.' }]);
        return false;
      }
      return true;
    } catch {
      setProblems([{ field: '_', message: 'Tidak dapat terhubung ke server.' }]);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const ok = await call(`/api/admin/seksi/${section.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ config: draft }),
    });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onChanged();
    }
  }

  async function toggleVisible() {
    const ok = await call(`/api/admin/seksi/${section.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isVisible: !section.isVisible }),
    });
    if (ok) onChanged();
  }

  async function remove() {
    if (!confirm(`Hapus seksi "${def?.label ?? section.kind}" dari halaman ini?`)) return;
    const ok = await call(`/api/admin/seksi/${section.id}`, { method: 'DELETE' });
    if (ok) onChanged();
  }

  const generalProblem = problems.find((p) => p.field === '_')?.message;

  return (
    <li
      className={`rounded-2xl border bg-white shadow-card ${
        section.isVisible ? 'border-navy-900/10' : 'border-dashed border-navy-900/25 bg-slate-50'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream-200 text-[12px] font-extrabold text-navy-900">
          {index + 1}
        </span>

        <div className="min-w-[12rem] flex-1">
          <p className="text-sm font-bold text-navy-900">{def?.label ?? section.kind}</p>
          <p className="text-[13px] text-slate-500">{def?.description}</p>
        </div>

        {!section.isVisible ? (
          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Disembunyikan
          </span>
        ) : null}

        <div className="flex items-center gap-1.5">
          <MoveButtons index={index} total={total} sectionId={section.id} onChanged={onChanged} />
          <button
            type="button"
            onClick={toggleVisible}
            disabled={busy}
            className="rounded-lg border border-navy-900/15 px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 hover:bg-cream-100 disabled:opacity-50"
          >
            {section.isVisible ? 'Sembunyikan' : 'Tampilkan'}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-navy-900/15 px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 hover:bg-cream-100"
            aria-expanded={open}
          >
            {open ? 'Tutup' : 'Ubah isi'}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[13px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Hapus
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-navy-900/10 p-4">
          {def?.fields.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {def.fields.map((f) => (
                <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <SectionField
                    def={f}
                    value={draft[f.name]}
                    onChange={(v) => setDraft((d) => ({ ...d, [f.name]: v }))}
                    problem={problemFor(f.name)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Seksi ini tidak punya pengaturan teks — isinya diambil otomatis dari menu Konten.
            </p>
          )}

          {generalProblem ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">
              {generalProblem}
            </p>
          ) : null}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-forest-700 px-4 py-2 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-50"
            >
              {busy ? 'Menyimpan…' : 'Simpan seksi'}
            </button>
            {saved ? <span className="text-[13px] font-semibold text-forest-700">Tersimpan.</span> : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

/** Tombol naik/turun. Dipisah agar logika urutan tidak mengulang state kartu. */
function MoveButtons({
  index,
  total,
  sectionId,
  onChanged,
}: {
  index: number;
  total: number;
  sectionId: number;
  onChanged: () => void;
}) {
  return (
    <>
      <button
        type="button"
        data-move="up"
        data-section={sectionId}
        disabled={index === 0}
        className="rounded-lg border border-navy-900/15 px-2 py-1.5 text-[13px] font-bold text-slate-700 hover:bg-cream-100 disabled:opacity-30"
        aria-label="Pindahkan ke atas"
      >
        ↑
      </button>
      <button
        type="button"
        data-move="down"
        data-section={sectionId}
        disabled={index === total - 1}
        className="rounded-lg border border-navy-900/15 px-2 py-1.5 text-[13px] font-bold text-slate-700 hover:bg-cream-100 disabled:opacity-30"
        aria-label="Pindahkan ke bawah"
      >
        ↓
      </button>
    </>
  );
}

export function PageBuilder({
  page,
  sections,
}: {
  page: PageInfo;
  sections: PageSectionRow[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const usedSingletons = useMemo(
    () => new Set(sections.filter((s) => SECTION_BY_KIND[s.kind]?.singleton).map((s) => s.kind)),
    [sections],
  );

  const refresh = () => router.refresh();

  async function move(id: number, dir: number) {
    const order = sections.map((s) => s.id);
    const i = order.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j]!, order[i]!];

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/halaman/${page.id}/seksi`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: order }),
      });
      if (!res.ok) {
        const j2 = await res.json().catch(() => ({}));
        setError(j2.error ?? 'Urutan gagal disimpan.');
        return;
      }
      refresh();
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setBusy(false);
    }
  }

  async function addSection() {
    if (!adding) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/halaman/${page.id}/seksi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: adding, config: {} }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Seksi wajib-isi akan lolos dibuat kosong hanya bila validator
        // mengizinkan; kalau tidak, tampilkan pesannya apa adanya.
        setError(json.error ?? json.problems?.[0]?.message ?? 'Seksi gagal ditambahkan.');
        return;
      }
      setAdding('');
      refresh();
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/halaman/${page.id}/seksi`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? 'Gagal mengubah status.');
        return;
      }
      refresh();
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setBusy(false);
    }
  }

  async function removePage() {
    if (!confirm(`Hapus halaman "${page.label}" (${page.path}) beserta seluruh seksinya? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/halaman/${page.id}/seksi`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? 'Halaman gagal dihapus.');
        return;
      }
      window.location.href = '/admin/halaman';
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6" onClickCapture={(e) => {
      /* Tombol naik/turun berada di dalam kartu seksi. Klik ditangkap di sini
         agar urutan cukup dikelola satu tempat, bukan diteruskan berlapis. */
      const btn = (e.target as HTMLElement).closest('[data-move]') as HTMLElement | null;
      if (!btn) return;
      const id = Number(btn.dataset.section);
      const dir = btn.dataset.move === 'up' ? -1 : 1;
      if (Number.isInteger(id)) void move(id, dir);
    }}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy-900/10 bg-cream-50 p-4">
        <div>
          <p className="text-sm font-bold text-navy-900">{page.label}</p>
          <p className="text-[13px] text-slate-600">
            <code className="rounded bg-white px-1.5 py-0.5">{page.path}</code>
            {page.isCustom ? (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                page.isPublished ? 'bg-leaf-100 text-forest-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {page.isPublished ? 'Terbit' : 'Draf'}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {page.isPublished ? (
            <a
              href={page.path}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-navy-900/15 px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-white"
            >
              Lihat halaman
            </a>
          ) : null}
          {page.isCustom ? (
            <>
              <button
                type="button"
                onClick={togglePublish}
                disabled={busy}
                className="rounded-lg bg-forest-700 px-3 py-2 text-[13px] font-bold text-white hover:bg-forest-800 disabled:opacity-50"
              >
                {page.isPublished ? 'Tarik dari publikasi' : 'Terbitkan'}
              </button>
              <button
                type="button"
                onClick={removePage}
                disabled={busy}
                className="rounded-lg border border-red-200 px-3 py-2 text-[13px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Hapus halaman
              </button>
            </>
          ) : null}
        </div>
      </div>

      {!page.isCustom ? (
        <p className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
          Ini halaman bawaan. Tata letaknya diatur langsung oleh kode agar SEO dan
          kecepatannya terjaga. Untuk mengubah teksnya, gunakan tab Pengaturan SEO di atas
          atau menu Konten. Susunan seksi di bawah hanya berlaku untuk halaman buatan sendiri.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{error}</p>
      ) : null}

      {page.isCustom ? (
        <>
          <ul className="mt-5 grid gap-3">
            {sections.map((s, i) => (
              <SectionCard
                key={s.id}
                section={s}
                index={i}
                total={sections.length}
                onChanged={refresh}
              />
            ))}
          </ul>

          {!sections.length ? (
            <p className="mt-5 rounded-2xl border border-dashed border-navy-900/20 bg-white p-8 text-center text-sm text-slate-600">
              Belum ada seksi. Tambahkan seksi pertama di bawah — biasanya dimulai dengan Hero.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-card">
            <div className="grid min-w-[16rem] flex-1 gap-1.5">
              <label htmlFor="add-section" className="text-sm font-bold text-navy-900">
                Tambah seksi
              </label>
              <select
                id="add-section"
                value={adding}
                onChange={(e) => setAdding(e.target.value)}
                className={field}
              >
                <option value="">— pilih jenis seksi —</option>
                {SECTION_KINDS.map((k) => (
                  <option key={k.kind} value={k.kind} disabled={k.singleton && usedSingletons.has(k.kind)}>
                    {k.label}
                    {k.singleton && usedSingletons.has(k.kind) ? ' (sudah ada)' : ''}
                  </option>
                ))}
              </select>
              {adding ? (
                <p className="text-[13px] text-slate-500">{SECTION_BY_KIND[adding]?.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={addSection}
              disabled={!adding || busy}
              className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-40"
            >
              Tambahkan
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
