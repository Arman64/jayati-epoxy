'use client';

import { useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { IconCheck, IconInfo } from './Icons';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const buildingTypes = [
  'Rumah tinggal',
  'Garasi / carport',
  'Kamar mandi / area basah',
  'Gudang',
  'Pabrik / produksi',
  'Bengkel / workshop',
  'Dapur produksi / food grade',
  'Ruko / komersial',
  'Lainnya',
];

const floorConditions = [
  'Beton baru',
  'Beton lama, kondisi baik',
  'Beton retak / berdebu',
  'Lantai keramik',
  'Sudah pernah di-epoxy',
  'Belum tahu / perlu dicek',
];

const needTypes = [
  'Epoxy coating',
  'Epoxy self-leveling',
  'Self-leveling',
  'Epoxy mortar (heavy duty)',
  'PU Crete',
  'Polyurethane / food grade',
  'Belum tahu, minta rekomendasi',
];

export function QuotationForm({ source = 'website' }: { source?: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const started = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onFirstInteraction = () => {
    if (!started.current) {
      started.current = true;
      track('quotation_form_start', { form_source: source });
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const data = new FormData(form);

    // Validasi client (server tetap memvalidasi ulang — PRD §7)
    const nextErrors: Record<string, string> = {};
    const name = String(data.get('name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const city = String(data.get('city') ?? '').trim();

    if (name.length < 2) nextErrors.name = 'Mohon isi nama lengkap.';
    if (!/^[0-9+\-\s()]{8,20}$/.test(phone)) nextErrors.phone = 'Nomor WhatsApp tidak valid.';
    if (city.length < 2) nextErrors.city = 'Mohon isi kota atau lokasi proyek.';

    const file = data.get('photo');
    if (file instanceof File && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) nextErrors.photo = 'Ukuran file maksimal 5 MB.';
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        nextErrors.photo = 'Format harus JPG, PNG, atau WebP.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus('error');
      setMessage('Beberapa isian perlu diperbaiki.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', { method: 'POST', body: data });
      const json = (await res.json()) as { ok: boolean; error?: string; fields?: Record<string, string> };

      if (!res.ok || !json.ok) {
        setStatus('error');
        setErrors(json.fields ?? {});
        setMessage(json.error ?? 'Pengiriman gagal. Silakan coba lagi atau hubungi kami via WhatsApp.');
        return;
      }

      if (file instanceof File && file.size > 0) {
        track('file_upload_success', { form_source: source });
      }
      track('quotation_form_submit', { form_source: source });
      setStatus('success');
      setMessage(
        'Permintaan Anda sudah kami terima. Tim akan menghubungi pada jam kerja untuk konfirmasi detail dan jadwal survei.',
      );
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Koneksi bermasalah. Silakan coba lagi atau hubungi kami via WhatsApp.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border-2 border-leaf-300 bg-leaf-50 p-8 text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-500 text-white">
          <IconCheck className="h-7 w-7" strokeWidth={3} />
        </span>
        <h3 className="mt-4 text-xl">Permintaan Terkirim</h3>
        <p className="prose-brand mx-auto mt-2 max-w-md">{message}</p>
        <p className="mt-4 text-[13px] text-slate-500">
          Catatan: kami tidak memberikan harga final sebelum kondisi lantai diperiksa.
        </p>
        <button
          type="button"
          className="btn-outline mt-6"
          onClick={() => {
            setStatus('idle');
            started.current = false;
          }}
        >
          Kirim permintaan lain
        </button>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 text-xs font-semibold text-red-600">
        {errors[k]}
      </p>
    ) : null;

  const inputCls =
    'w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-slate-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200';
  const labelCls = 'block text-[13px] font-bold text-navy-900';

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onFocus={onFirstInteraction}
      noValidate
      className="grid gap-4 sm:grid-cols-2"
    >
      {/* Honeypot anti-spam — PRD §7 */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="company_website">Jangan diisi</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="source" value={source} />

      <div>
        <label className={labelCls} htmlFor="name">
          Nama <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Nama lengkap"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={`mt-1.5 ${inputCls}`}
        />
        {err('name')}
      </div>

      <div>
        <label className={labelCls} htmlFor="phone">
          Nomor WhatsApp <span className="text-red-600">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="0812xxxxxxx"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className={`mt-1.5 ${inputCls}`}
        />
        {err('phone')}
      </div>

      <div>
        <label className={labelCls} htmlFor="city">
          Kota / Lokasi Proyek <span className="text-red-600">*</span>
        </label>
        <input
          id="city"
          name="city"
          required
          placeholder="Contoh: Surabaya"
          aria-invalid={!!errors.city}
          aria-describedby={errors.city ? 'city-error' : undefined}
          className={`mt-1.5 ${inputCls}`}
        />
        {err('city')}
      </div>

      <div>
        <label className={labelCls} htmlFor="buildingType">
          Jenis Bangunan
        </label>
        <select id="buildingType" name="buildingType" className={`mt-1.5 ${inputCls}`} defaultValue="">
          <option value="" disabled>
            Pilih jenis bangunan
          </option>
          {buildingTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls} htmlFor="areaSqm">
          Perkiraan Luas (m²)
        </label>
        <input
          id="areaSqm"
          name="areaSqm"
          type="number"
          min={1}
          max={1000000}
          inputMode="numeric"
          placeholder="Contoh: 120"
          className={`mt-1.5 ${inputCls}`}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="floorCondition">
          Kondisi Lantai
        </label>
        <select id="floorCondition" name="floorCondition" className={`mt-1.5 ${inputCls}`} defaultValue="">
          <option value="" disabled>
            Pilih kondisi lantai
          </option>
          {floorConditions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="needType">
          Jenis Kebutuhan
        </label>
        <select id="needType" name="needType" className={`mt-1.5 ${inputCls}`} defaultValue="">
          <option value="" disabled>
            Pilih sistem atau minta rekomendasi
          </option>
          {needTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="message">
          Pesan
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Ceritakan kondisi area, target jadwal, atau kebutuhan khusus."
          className={`mt-1.5 ${inputCls} resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="photo">
          Foto Lantai (opsional)
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={errors.photo ? 'photo-error' : 'photo-hint'}
          className="mt-1.5 w-full rounded-xl border border-dashed border-navy-900/25 bg-cream-50 px-3.5 py-3 text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-forest-700 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
        {errors.photo ? (
          err('photo')
        ) : (
          <p id="photo-hint" className="mt-1.5 text-xs text-slate-500">
            JPG, PNG, atau WebP. Maksimal 5 MB. Foto membantu estimasi awal lebih akurat.
          </p>
        )}
      </div>

      {status === 'error' && message ? (
        <p role="alert" className="sm:col-span-2 flex gap-2 rounded-xl bg-red-50 p-3.5 text-[13px] font-semibold text-red-700">
          <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full disabled:opacity-60">
          {status === 'submitting' ? 'Mengirim…' : 'Kirim Permintaan Penawaran'}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Dengan mengirim formulir, Anda setuju dihubungi terkait permintaan ini. Data Anda tidak
          dibagikan ke pihak ketiga. Lihat{' '}
          <a className="link-underline" href="/privacy-policy">
            Kebijakan Privasi
          </a>
          . Harga final hanya diberikan setelah survei kondisi lantai.
        </p>
      </div>
    </form>
  );
}
