'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Post, PostSection, ValidationResult } from '@/lib/posts';
import { POST_STATUS_LABEL, POST_STATUS_TONE } from '@/lib/postStatus';

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

type Brief = { id: number; topic: string; primaryKeyword: string; questions: string[] } | null;

export function PostEditor({
  post,
  isOwner,
  brief,
}: {
  post: Post;
  isOwner: boolean;
  brief: Brief;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    author: post.author,
    reviewer: post.reviewer,
    intro: post.intro,
    readMinutes: post.readMinutes,
    noindex: post.noindex,
    sections: post.sections.length ? post.sections : [{ h2: '', body: [''], list: [] }],
    faqs: post.faqs,
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(
    (post.validation as ValidationResult)?.issues ? (post.validation as ValidationResult) : null,
  );

  const published = post.status === 'published';

  function setSection(i: number, changes: Partial<PostSection>) {
    setF((s) => ({
      ...s,
      sections: s.sections.map((x, idx) => (idx === i ? { ...x, ...changes } : x)),
    }));
  }

  async function call(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: f, ...extra }),
      });
      const d = (await res.json()) as {
        ok: boolean;
        error?: string;
        validation?: ValidationResult;
        message?: string;
      };
      if (d.validation) setValidation(d.validation);
      if (!res.ok || !d.ok) {
        setMsg({ kind: 'err', text: d.error ?? 'Gagal.' });
      } else {
        setMsg({ kind: 'ok', text: d.message ?? 'Tersimpan.' });
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy(null);
    }
  }

  const errors = validation?.issues.filter((i) => i.level === 'error') ?? [];
  const warnings = validation?.issues.filter((i) => i.level === 'warning') ?? [];

  return (
    <>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
            {f.title || 'Artikel tanpa judul'}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span
              className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${POST_STATUS_TONE[post.status]}`}
            >
              {POST_STATUS_LABEL[post.status]}
            </span>
            {post.source === 'mcp' ? (
              <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">
                Dibuat via MCP
              </span>
            ) : null}
            {published ? (
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-forest-700 underline underline-offset-2"
              >
                Lihat di website ↗
              </a>
            ) : null}
          </p>
        </div>
      </div>

      {msg ? (
        <p
          role="status"
          className={`mt-3 rounded-lg border px-3 py-2.5 text-sm font-semibold ${
            msg.kind === 'ok'
              ? 'border-leaf-300 bg-leaf-50 text-forest-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      {post.reviewNotes ? (
        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <strong>Catatan peninjau:</strong> {post.reviewNotes}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* ---------- Editor ---------- */}
        <div className="grid gap-4">
          <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Metadata</h2>
            <div className="mt-3 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="b-title" className="text-sm font-bold text-navy-900">Judul</label>
                <input id="b-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={field} />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="b-slug" className="text-sm font-bold text-navy-900">Slug URL</label>
                <input id="b-slug" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className={field} />
                <p className="text-xs text-slate-500">/blog/{f.slug || '…'}</p>
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="b-desc" className="text-sm font-bold text-navy-900">Meta description</label>
                  <span className="text-xs tabular-nums text-slate-500">{f.description.length}/165</span>
                </div>
                <textarea id="b-desc" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={field} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label htmlFor="b-cat" className="text-sm font-bold text-navy-900">Kategori</label>
                  <input id="b-cat" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={field} />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="b-read" className="text-sm font-bold text-navy-900">Menit baca</label>
                  <input id="b-read" type="number" min={1} max={60} value={f.readMinutes} onChange={(e) => setF({ ...f, readMinutes: Number(e.target.value) })} className={field} />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="b-author" className="text-sm font-bold text-navy-900">Penulis</label>
                  <input id="b-author" value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} className={field} />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="b-rev" className="text-sm font-bold text-navy-900">Peninjau</label>
                  <input id="b-rev" value={f.reviewer} onChange={(e) => setF({ ...f, reviewer: e.target.value })} className={field} />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={f.noindex} onChange={(e) => setF({ ...f, noindex: e.target.checked })} className="h-4 w-4 accent-[#6A9929]" />
                <span className="text-sm font-bold text-navy-900">Jangan indeks artikel ini</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Isi artikel</h2>

            <div className="mt-3 grid gap-1.5">
              <label htmlFor="b-intro" className="text-sm font-bold text-navy-900">
                Paragraf pembuka
              </label>
              <textarea id="b-intro" rows={4} value={f.intro} onChange={(e) => setF({ ...f, intro: e.target.value })} className={field} />
              <p className="text-xs text-slate-500">Jawab pertanyaan utama dalam 40–60 kata.</p>
            </div>

            <div className="mt-5 grid gap-4">
              {f.sections.map((s, i) => (
                <div key={i} className="rounded-xl border border-navy-900/12 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bagian {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setF((x) => ({ ...x, sections: x.sections.filter((_, idx) => idx !== i) }))}
                      className="text-xs font-bold text-red-700 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                  <input
                    value={s.h2}
                    onChange={(e) => setSection(i, { h2: e.target.value })}
                    placeholder="Judul bagian (H2)"
                    aria-label={`Judul bagian ${i + 1}`}
                    className={`${field} mt-2 font-bold`}
                  />
                  <textarea
                    rows={4}
                    value={(s.body ?? []).join('\n\n')}
                    onChange={(e) => setSection(i, { body: e.target.value.split('\n\n').filter((x) => x.trim()) })}
                    placeholder="Paragraf. Pisahkan antar paragraf dengan baris kosong."
                    aria-label={`Isi bagian ${i + 1}`}
                    className={`${field} mt-2`}
                  />
                  <textarea
                    rows={3}
                    value={(s.list ?? []).join('\n')}
                    onChange={(e) => setSection(i, { list: e.target.value.split('\n').filter((x) => x.trim()) })}
                    placeholder="Poin daftar, satu per baris (opsional)"
                    aria-label={`Daftar bagian ${i + 1}`}
                    className={`${field} mt-2`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setF((x) => ({ ...x, sections: [...x.sections, { h2: '', body: [''], list: [] }] }))}
                className="btn-outline justify-self-start !py-2.5 text-sm"
              >
                + Tambah bagian
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">FAQ</h2>
            <div className="mt-3 grid gap-3">
              {f.faqs.map((q, i) => (
                <div key={i} className="rounded-xl border border-navy-900/12 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">FAQ {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setF((x) => ({ ...x, faqs: x.faqs.filter((_, idx) => idx !== i) }))}
                      className="text-xs font-bold text-red-700 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                  <input
                    value={q.q}
                    onChange={(e) => setF((x) => ({ ...x, faqs: x.faqs.map((y, idx) => (idx === i ? { ...y, q: e.target.value } : y)) }))}
                    placeholder="Pertanyaan"
                    aria-label={`Pertanyaan ${i + 1}`}
                    className={`${field} mt-2`}
                  />
                  <textarea
                    rows={2}
                    value={q.a}
                    onChange={(e) => setF((x) => ({ ...x, faqs: x.faqs.map((y, idx) => (idx === i ? { ...y, a: e.target.value } : y)) }))}
                    placeholder="Jawaban"
                    aria-label={`Jawaban ${i + 1}`}
                    className={`${field} mt-2`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setF((x) => ({ ...x, faqs: [...x.faqs, { q: '', a: '' }] }))}
                className="btn-outline justify-self-start !py-2.5 text-sm"
              >
                + Tambah FAQ
              </button>
            </div>
          </section>
        </div>

        {/* ---------- Panel samping ---------- */}
        <div className="grid content-start gap-4">
          <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Tindakan</h2>
            <div className="mt-3 grid gap-2">
              <button type="button" onClick={() => call('save')} disabled={busy !== null} className="btn-navy disabled:opacity-60">
                {busy === 'save' ? 'Menyimpan…' : 'Simpan draf'}
              </button>
              <button type="button" onClick={() => call('validate')} disabled={busy !== null} className="btn-outline disabled:opacity-60">
                {busy === 'validate' ? 'Memeriksa…' : 'Periksa kualitas'}
              </button>

              {post.status !== 'published' ? (
                <button type="button" onClick={() => call('submit')} disabled={busy !== null} className="btn-outline disabled:opacity-60">
                  {busy === 'submit' ? 'Mengirim…' : 'Ajukan untuk review'}
                </button>
              ) : null}

              {isOwner && post.status === 'pending_review' ? (
                <>
                  <button type="button" onClick={() => call('approve')} disabled={busy !== null} className="btn-primary disabled:opacity-60">
                    {busy === 'approve' ? 'Menyetujui…' : 'Setujui'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const notes = window.prompt('Alasan dikembalikan (opsional):') ?? '';
                      call('reject', { notes });
                    }}
                    disabled={busy !== null}
                    className="rounded-xl border border-red-300 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Kembalikan
                  </button>
                </>
              ) : null}

              {isOwner && post.status === 'approved' ? (
                <button type="button" onClick={() => call('publish')} disabled={busy !== null} className="btn-primary disabled:opacity-60">
                  {busy === 'publish' ? 'Menerbitkan…' : 'Terbitkan sekarang'}
                </button>
              ) : null}

              {isOwner && published ? (
                <button type="button" onClick={() => call('unpublish')} disabled={busy !== null} className="btn-outline disabled:opacity-60">
                  Tarik dari publikasi
                </button>
              ) : null}
            </div>

            {!isOwner ? (
              <p className="mt-3 text-xs text-slate-500">
                Persetujuan dan publikasi hanya dapat dilakukan pemilik.
              </p>
            ) : null}
          </section>

          {/* Hasil validator */}
          <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Pemeriksaan kualitas
            </h2>
            {!validation ? (
              <p className="mt-3 text-sm text-slate-500">
                Belum diperiksa. Tekan &quot;Periksa kualitas&quot;.
              </p>
            ) : (
              <>
                <p
                  className={`mt-3 rounded-lg px-3 py-2 text-sm font-bold ${
                    validation.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {validation.ok
                    ? `Lolos — siap diajukan (${validation.wordCount} kata)`
                    : `${errors.length} masalah wajib diperbaiki`}
                </p>

                {errors.length ? (
                  <ul className="mt-3 grid gap-2">
                    {errors.map((i) => (
                      <li key={i.code} className="border-l-2 border-red-400 pl-2.5 text-sm text-red-800">
                        {i.message}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {warnings.length ? (
                  <>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Saran
                    </p>
                    <ul className="mt-2 grid gap-2">
                      {warnings.map((i) => (
                        <li key={i.code} className="border-l-2 border-amber-400 pl-2.5 text-sm text-amber-800">
                          {i.message}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            )}
          </section>

          {brief ? (
            <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Brief konten
              </h2>
              <p className="mt-2 text-sm font-bold text-navy-900">{brief.topic}</p>
              <p className="mt-1 text-xs text-slate-600">
                Kata kunci utama: <strong>{brief.primaryKeyword}</strong>
              </p>
              {brief.questions.length ? (
                <ul className="mt-3 grid gap-1.5">
                  {brief.questions.map((q) => (
                    <li key={q} className="text-xs text-slate-600">• {q}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
