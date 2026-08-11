'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from '@/lib/leadStatus';

export function LeadControls({
  leadId,
  status,
  assignedTo,
  estimatedValue,
  followUpAt,
  users,
}: {
  leadId: number;
  status: LeadStatus;
  assignedTo: number | null;
  estimatedValue: number | null;
  followUpAt: string | null;
  users: Array<{ id: number; name: string }>;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    status,
    assignedTo: assignedTo === null ? '' : String(assignedTo),
    estimatedValue: estimatedValue === null ? '' : String(estimatedValue),
    followUpAt: followUpAt ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          assignedTo: form.assignedTo === '' ? null : Number(form.assignedTo),
          estimatedValue: form.estimatedValue === '' ? null : Number(form.estimatedValue),
          followUpAt: form.followUpAt === '' ? null : form.followUpAt,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg({ kind: 'err', text: data.error ?? 'Gagal menyimpan perubahan.' });
      } else {
        setMsg({ kind: 'ok', text: 'Perubahan tersimpan.' });
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy(false);
    }
  }

  const field = 'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

  return (
    <div className="mt-3 grid gap-3">
      {msg ? (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
            msg.kind === 'ok'
              ? 'border-leaf-300 bg-leaf-50 text-forest-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor="status" className="text-sm font-bold text-navy-900">
          Status
        </label>
        <select
          id="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
          className={field}
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="assigned" className="text-sm font-bold text-navy-900">
          Ditugaskan ke
        </label>
        <select
          id="assigned"
          value={form.assignedTo}
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          className={field}
        >
          <option value="">Belum ditugaskan</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="value" className="text-sm font-bold text-navy-900">
          Estimasi nilai proyek (Rp)
        </label>
        <input
          id="value"
          type="number"
          min={0}
          step={100000}
          inputMode="numeric"
          value={form.estimatedValue}
          onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
          placeholder="contoh: 45000000"
          className={field}
        />
        <p className="text-xs text-slate-500">
          Diisi manual setelah survei. Dipakai untuk total nilai proyek dimenangkan di dasbor.
        </p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="followup" className="text-sm font-bold text-navy-900">
          Jadwal follow-up
        </label>
        <input
          id="followup"
          type="date"
          value={form.followUpAt}
          onChange={(e) => setForm({ ...form, followUpAt: e.target.value })}
          className={field}
        />
      </div>

      <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">
        {busy ? 'Menyimpan…' : 'Simpan perubahan'}
      </button>
    </div>
  );
}
