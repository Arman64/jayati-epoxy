'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AllSettings } from '@/lib/settings';

type Group = keyof AllSettings;

const TABS: Array<{ id: Group; label: string; desc: string }> = [
  { id: 'company', label: 'Profil Perusahaan', desc: 'Nama, tagline, visi, misi, dan nilai.' },
  { id: 'contact', label: 'Kontak & Alamat', desc: 'Telepon, WhatsApp, email, alamat, jam kerja.' },
  { id: 'social', label: 'Media Sosial', desc: 'Tautan akun resmi.' },
  { id: 'cta', label: 'Tombol CTA', desc: 'Tombol mengambang dan sticky bar mobile.' },
  { id: 'seo', label: 'SEO & Analytics', desc: 'URL situs, meta bawaan, GTM/GA4.' },
];

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30';

function Text({
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-navy-900">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-navy-900">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-navy-900/12 bg-white px-3.5 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#6A9929]"
      />
      <span>
        <span className="block text-sm font-bold text-navy-900">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Textarea multi-baris → array string. */
function ListArea({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  return (
    <Area
      label={label}
      rows={Math.max(value.length + 1, 3)}
      value={value.join('\n')}
      onChange={(v) => onChange(v.split('\n').map((x) => x.trim()).filter(Boolean))}
      hint={hint ?? 'Satu item per baris.'}
    />
  );
}

export function SettingsTabs({ initial }: { initial: AllSettings }) {
  const router = useRouter();
  const [tab, setTab] = useState<Group>('company');
  const [data, setData] = useState<AllSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function patch<K extends Group>(group: K, changes: Partial<AllSettings[K]>) {
    setData((d) => ({ ...d, [group]: { ...d[group], ...changes } }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: tab, value: data[tab] }),
      });
      const d = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !d.ok) setMsg({ kind: 'err', text: d.error ?? 'Gagal menyimpan.' });
      else {
        setMsg({ kind: 'ok', text: 'Tersimpan. Website sudah diperbarui.' });
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy(false);
    }
  }

  const c = data.company;
  const k = data.contact;
  const so = data.social;
  const cta = data.cta;
  const seo = data.seo;

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Kelompok pengaturan">
        <ul className="grid gap-1">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setMsg(null);
                }}
                aria-current={tab === t.id ? 'true' : undefined}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                  tab === t.id ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
        <p className="text-sm text-slate-600">{TABS.find((t) => t.id === tab)?.desc}</p>

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

        <div className="mt-4 grid gap-4">
          {tab === 'company' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Nama badan usaha" value={c.legalName} onChange={(v) => patch('company', { legalName: v })} />
                <Text label="Nama merek" value={c.brand} onChange={(v) => patch('company', { brand: v })} />
              </div>
              <Text label="Tagline" value={c.tagline} onChange={(v) => patch('company', { tagline: v })} />
              <Area label="Tentang perusahaan" value={c.about} rows={4} onChange={(v) => patch('company', { about: v })} />
              <Text label="Visi" value={c.vision} onChange={(v) => patch('company', { vision: v })} />
              <ListArea label="Misi" value={c.missions} onChange={(v) => patch('company', { missions: v })} />
              <ListArea label="Nilai perusahaan" value={c.values} onChange={(v) => patch('company', { values: v })} />
            </>
          ) : null}

          {tab === 'contact' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Telepon (tampilan)" value={k.phoneDisplay} onChange={(v) => patch('contact', { phoneDisplay: v })} hint="Contoh: 0857-858-22-695" />
                <Text label="Telepon (format E.164)" value={k.phoneE164} onChange={(v) => patch('contact', { phoneE164: v })} hint="Contoh: +6285785822695" />
                <Text label="WhatsApp (tampilan)" value={k.whatsappDisplay} onChange={(v) => patch('contact', { whatsappDisplay: v })} />
                <Text label="WhatsApp (E.164)" value={k.whatsappE164} onChange={(v) => patch('contact', { whatsappE164: v })} hint="Dipakai tombol WhatsApp." />
              </div>
              <Text label="Email" type="email" value={k.email} onChange={(v) => patch('contact', { email: v })} />
              <Text label="Alamat jalan" value={k.addressStreet} onChange={(v) => patch('contact', { addressStreet: v })} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Text label="Kota" value={k.addressCity} onChange={(v) => patch('contact', { addressCity: v })} />
                <Text label="Provinsi" value={k.addressRegion} onChange={(v) => patch('contact', { addressRegion: v })} />
                <Text label="Kode pos" value={k.addressPostal} onChange={(v) => patch('contact', { addressPostal: v })} />
              </div>
              <Text label="URL Google Maps" value={k.mapsUrl} onChange={(v) => patch('contact', { mapsUrl: v })} hint="Kosongkan bila belum ada." />
              <Text label="Area layanan" value={k.serviceArea} onChange={(v) => patch('contact', { serviceArea: v })} />
              <Text label="Jam operasional" value={k.hours} onChange={(v) => patch('contact', { hours: v })} />
              <Area label="Pesan WhatsApp bawaan" value={k.waMessage} onChange={(v) => patch('contact', { waMessage: v })} hint="Teks yang otomatis terisi saat pengunjung menekan tombol WhatsApp." />
            </>
          ) : null}

          {tab === 'social' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Instagram" value={so.instagram} onChange={(v) => patch('social', { instagram: v })} placeholder="https://instagram.com/..." />
              <Text label="Facebook" value={so.facebook} onChange={(v) => patch('social', { facebook: v })} />
              <Text label="TikTok" value={so.tiktok} onChange={(v) => patch('social', { tiktok: v })} />
              <Text label="YouTube" value={so.youtube} onChange={(v) => patch('social', { youtube: v })} />
              <Text label="LinkedIn" value={so.linkedin} onChange={(v) => patch('social', { linkedin: v })} />
            </div>
          ) : null}

          {tab === 'cta' ? (
            <>
              <Toggle label="Tampilkan tombol mengambang" checked={cta.floatingEnabled} onChange={(v) => patch('cta', { floatingEnabled: v })} hint="Muncul di pojok kanan bawah semua halaman publik." />
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="Tombol WhatsApp" checked={cta.floatingWhatsapp} onChange={(v) => patch('cta', { floatingWhatsapp: v })} />
                <Toggle label="Tombol Telepon" checked={cta.floatingPhone} onChange={(v) => patch('cta', { floatingPhone: v })} />
              </div>
              <Text label="Label tombol WhatsApp" value={cta.floatingLabel} onChange={(v) => patch('cta', { floatingLabel: v })} hint="Teks yang muncul sebentar di samping ikon." />
              <Text label="Jeda kemunculan (milidetik)" type="number" value={String(cta.floatingDelayMs)} onChange={(v) => patch('cta', { floatingDelayMs: Number(v) || 0 })} hint="1200 = muncul 1,2 detik setelah halaman dibuka." />
              <Toggle label="Sticky bar di mobile" checked={cta.stickyMobileEnabled} onChange={(v) => patch('cta', { stickyMobileEnabled: v })} hint="Bar Telepon / WhatsApp / Penawaran di bawah layar ponsel." />
            </>
          ) : null}

          {tab === 'seo' ? (
            <>
              <Text label="URL situs" value={seo.siteUrl} onChange={(v) => patch('seo', { siteUrl: v })} hint="Tanpa garis miring di akhir. Dipakai canonical & sitemap." />
              <Text label="Template judul" value={seo.titleTemplate} onChange={(v) => patch('seo', { titleTemplate: v })} hint="%s diganti judul halaman." />
              <Area label="Meta description bawaan" value={seo.defaultDescription} onChange={(v) => patch('seo', { defaultDescription: v })} />
              <Text label="Gambar OG bawaan" value={seo.defaultOgImage} onChange={(v) => patch('seo', { defaultOgImage: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Google Tag Manager ID" value={seo.gtmId} onChange={(v) => patch('seo', { gtmId: v })} placeholder="GTM-XXXXXXX" />
                <Text label="GA4 Measurement ID" value={seo.ga4Id} onChange={(v) => patch('seo', { ga4Id: v })} placeholder="G-XXXXXXXXXX" />
              </div>
            </>
          ) : null}
        </div>

        <button type="button" onClick={save} disabled={busy} className="btn-primary mt-6 disabled:opacity-60">
          {busy ? 'Menyimpan…' : 'Simpan perubahan'}
        </button>
      </section>
    </div>
  );
}
