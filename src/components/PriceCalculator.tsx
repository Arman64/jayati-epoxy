'use client';

import { useMemo, useState } from 'react';
import { curvingPrice as fallbackCurving, epoxySystems as fallbackSystems, formatRupiah, priceForArea, type EpoxySystem } from '@/lib/content';

type CurvingPrice = { label: string; unit: string; under100: number; over100: number; over500: number; unverified: boolean };
import { track } from '@/lib/analytics';
import { IconInfo } from './Icons';
import { defaultWaMessage, site, waLink } from '@/lib/site';

/**
 * Kalkulator estimasi — PRD §6 LP-02.
 * Perhitungan MURNI mengikuti pricelist resmi company profile hal. 11:
 *   biaya lantai  = harga tier (< 100 / > 100 / > 500 m²) × luas
 *   biaya curving = harga tier × panjang meter lari
 * Tidak ada faktor pengali karangan. Angka yang tampil dapat ditelusuri
 * langsung ke dokumen resmi perusahaan.
 */
export function PriceCalculator({
  systems,
  curvingPrice: curvingProp,
}: {
  /** Pricelist dari CMS. Bila kosong, memakai daftar bawaan. */
  systems?: EpoxySystem[];
  curvingPrice?: CurvingPrice;
} = {}) {
  const epoxySystems = systems?.length ? systems : fallbackSystems;
  const curvingPrice = curvingProp ?? fallbackCurving;

  const [area, setArea] = useState<string>('100');
  const [curving, setCurving] = useState<string>('0');
  const [systemSlug, setSystemSlug] = useState(epoxySystems[0]!.slug);
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => {
    const sqm = Number(area);
    const lm = Number(curving) || 0;
    // Bila sistem yang dipilih dihapus dari CMS, jatuh ke sistem pertama
    // supaya kalkulator tidak mendadak kosong bagi pengunjung.
    const system = epoxySystems.find((s) => s.slug === systemSlug) ?? epoxySystems[0];

    if (!system || !Number.isFinite(sqm) || sqm <= 0 || lm < 0) return null;

    const perSqm = priceForArea(system, sqm);
    const tierLabel = sqm > 500 ? 'di atas 500 m²' : sqm > 100 ? 'di atas 100 m²' : 'di bawah 100 m²';
    const perLm = sqm > 500 ? curvingPrice.over500 : sqm > 100 ? curvingPrice.over100 : curvingPrice.under100;

    const floorCost = perSqm * sqm;
    const curvingCost = perLm * lm;

    return {
      system,
      perSqm,
      perLm,
      tierLabel,
      floorCost,
      curvingCost,
      total: floorCost + curvingCost,
      hasCurving: lm > 0,
      lm,
    };
  }, [area, curving, systemSlug, epoxySystems, curvingPrice]);

  const onChange = () => {
    if (!touched) {
      setTouched(true);
      track('calculator_use', { calculator: 'estimasi_harga' });
    }
  };

  const inputCls =
    'w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-[15px] focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200';

  return (
    <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-card sm:p-8">
      <h3 className="text-xl">Kalkulator Estimasi Biaya</h3>
      <p className="prose-brand mt-2 text-[14px]">
        Perhitungan mengikuti pricelist resmi {site.legalName}. Semakin luas area, semakin rendah
        harga per meter perseginya.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="calc-area" className="block text-[13px] font-bold text-navy-900">
            Luas area (m²)
          </label>
          <input
            id="calc-area"
            type="number"
            min={1}
            max={100000}
            inputMode="numeric"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              onChange();
            }}
            className={`mt-1.5 ${inputCls}`}
          />
        </div>

        <div>
          <label htmlFor="calc-system" className="block text-[13px] font-bold text-navy-900">
            Sistem &amp; ketebalan
          </label>
          <select
            id="calc-system"
            value={systemSlug}
            onChange={(e) => {
              setSystemSlug(e.target.value);
              onChange();
            }}
            className={`mt-1.5 ${inputCls}`}
          >
            {epoxySystems.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="calc-curving" className="block text-[13px] font-bold text-navy-900">
            Panjang curving / coving max 8 cm (meter lari) — opsional
          </label>
          <input
            id="calc-curving"
            type="number"
            min={0}
            max={100000}
            inputMode="numeric"
            value={curving}
            onChange={(e) => {
              setCurving(e.target.value);
              onChange();
            }}
            className={`mt-1.5 ${inputCls}`}
          />
          <p className="mt-1.5 text-[12px] text-slate-500">
            Coving adalah pelengkungan pertemuan lantai dan dinding agar sudut mudah dibersihkan.
            Umumnya dihitung sepanjang keliling ruangan.
          </p>
        </div>
      </div>

      {result ? (
        <div className="mt-6 rounded-2xl bg-brand-gradient p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-leaf-300">
            Estimasi biaya sesuai pricelist
          </p>
          <p className="mt-2 text-2xl font-extrabold sm:text-3xl">{formatRupiah(result.total)}</p>
          <p className="mt-2 text-sm text-white/75">
            {result.system.name} pada tier harga {result.tierLabel}, yaitu{' '}
            {formatRupiah(result.perSqm)} per m².
          </p>
          <dl className="mt-4 space-y-2 border-t border-white/15 pt-4 text-[13px] text-white/70">
            <div className="flex justify-between gap-3">
              <dt>
                Lantai — {Number(area).toLocaleString('id-ID')} m² × {formatRupiah(result.perSqm)}
              </dt>
              <dd className="font-semibold text-white">{formatRupiah(result.floorCost)}</dd>
            </div>
            {result.hasCurving && (
              <div className="flex justify-between gap-3">
                <dt>
                  Curving — {result.lm.toLocaleString('id-ID')} m′ × {formatRupiah(result.perLm)}
                </dt>
                <dd className="font-semibold text-white">{formatRupiah(result.curvingCost)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-white/15 pt-2">
              <dt>Ketebalan</dt>
              <dd className="font-semibold text-white">{result.system.thicknessLabel}</dd>
            </div>
          </dl>
          <a
            href={waLink(
              `Halo, saya sudah menghitung estimasi di website: ${result.system.name}, luas ${area} m²${
                result.hasCurving ? `, curving ${result.lm} meter lari` : ''
              }. Estimasi ${formatRupiah(result.total)}. Mohon dibantu penawaran resminya.`,
              'kalkulator',
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_click', { cta_position: 'calculator' })}
            className="btn-primary mt-5 w-full sm:w-auto"
          >
            Minta Penawaran Resmi
          </a>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-cream-100 p-5 text-sm text-slate-600">
          Masukkan luas area yang valid untuk melihat estimasi.
        </p>
      )}

      <p className="mt-4 flex gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
        <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Angka di atas mengacu pricelist per {site.priceLastReviewed} dan belum mencakup perbaikan
          struktural, penanganan kelembapan beton, marka lantai, serta mobilisasi luar kota. Harga
          final ditetapkan setelah survei lokasi.
        </span>
      </p>
      <noscript>
        <p className="mt-3 text-[13px] text-slate-600">
          Kalkulator memerlukan JavaScript.{' '}
          <a className="link-underline" href={waLink(defaultWaMessage, 'noscript')}>
            Hubungi kami via WhatsApp
          </a>{' '}
          untuk estimasi manual.
        </p>
      </noscript>
    </div>
  );
}
