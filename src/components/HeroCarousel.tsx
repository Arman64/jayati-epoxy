'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export type HeroSlide = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Nama proyek, untuk keterangan di bawah foto. */
  projectName: string;
  /** Tautan ke halaman detail proyek. */
  href: string;
};

/**
 * Karosel foto di hero beranda: menampilkan dokumentasi dari semua proyek
 * portofolio yang sudah tayang, berganti otomatis setiap 2 detik.
 *
 * Pertimbangan yang sengaja diambil:
 * - Slide pertama dirender sebagai <Image priority> dan slide lain memakai
 *   loading normal. Foto hero adalah kandidat LCP (PRD §11, LCP ≤ 2,5 s), jadi
 *   hanya satu foto yang boleh diprioritaskan.
 * - Semua slide ditumpuk absolut dengan opacity, bukan di-mount/unmount, agar
 *   pergantian tidak memicu layout shift (CLS ≤ 0,1).
 * - Rotasi otomatis BERHENTI saat pengguna mengarahkan kursor, memfokuskan
 *   tombol, atau saat tab tidak terlihat. Ini syarat aksesibilitas WCAG 2.2.2
 *   untuk konten bergerak, sekaligus mencegah foto berganti persis ketika
 *   pengunjung hendak mengkliknya.
 * - Pengguna yang menyalakan "kurangi animasi" (prefers-reduced-motion) tidak
 *   mendapat rotasi otomatis sama sekali.
 */
export function HeroCarousel({
  slides,
  intervalMs = 2000,
  legalName,
}: {
  slides: HeroSlide[];
  intervalMs?: number;
  legalName: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const many = slides.length > 1;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!many || paused) return;

    // Hormati preferensi sistem: jangan gerakkan apa pun bila diminta.
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    timer.current = setInterval(next, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [many, paused, next, intervalMs]);

  // Jangan buang tenaga menggeser foto saat tab tidak dilihat.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const current = slides[index]!;

  return (
    <div
      className="rounded-3xl border border-white/15 bg-white/[.07] p-3 shadow-lift backdrop-blur-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role={many ? 'group' : undefined}
      aria-roledescription={many ? 'karosel' : undefined}
      aria-label={many ? 'Dokumentasi proyek terbaru' : undefined}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy-800/40">
        {slides.map((s, i) => (
          <Link
            key={s.src}
            href={s.href}
            tabIndex={i === index ? 0 : -1}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-leaf-400 ${
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              width={s.width}
              height={s.height}
              priority={i === 0}
              sizes="(min-width: 1024px) 540px, 100vw"
              className="h-full w-full object-cover"
            />
          </Link>
        ))}

        {many && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-navy-950/60 to-transparent p-3">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Lihat foto ${i + 1}: ${s.projectName}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-leaf-400' : 'w-1.5 bg-white/45 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <figcaption className="px-1 pb-0.5 pt-2.5 text-[11px] leading-snug text-white/55" aria-live="off">
        Dokumentasi pengerjaan {legalName} — {current.projectName}.
      </figcaption>
    </div>
  );
}
