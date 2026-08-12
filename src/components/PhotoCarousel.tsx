'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectPhoto as ProjectPhotoData } from '@/lib/content';
import { IconChevron } from '@/components/Icons';

/**
 * Galeri foto proyek yang bisa digeser kanan/kiri.
 *
 * Keputusan teknis:
 * - Menggunakan scroll-snap native, bukan transform JS. Dengan begitu geser
 *   dengan jari di ponsel terasa normal (momentum bawaan sistem) dan tetap
 *   berfungsi walau JavaScript lambat dimuat.
 * - width/height setiap foto selalu diisi + rasio dikunci lewat CSS supaya
 *   tidak ada layout shift — PRD §11 (CLS ≤ 0,1).
 * - Tombol panah disembunyikan dari pembaca layar pengguna keyboard? Tidak:
 *   tombol tetap fokusabel dan punya aria-label, karena ini satu-satunya cara
 *   navigasi bagi pengguna non-sentuh.
 */
export function PhotoCarousel({
  photos,
  ratio = 'aspect-[16/10]',
  sizes = '(min-width: 1180px) 1100px, 100vw',
  priority = false,
}: {
  photos: ProjectPhotoData[];
  ratio?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Satu foto saja: tidak perlu kontrol geser sama sekali.
  const many = photos.length > 1;

  /** Cari slide yang paling dekat dengan tepi kiri area geser. */
  const syncIndex = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.max(0, Math.min(photos.length - 1, i)));
  }, [photos.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncIndex);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
    };
  }, [syncIndex]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
    setIndex(clamped);
  }, [photos.length]);

  const current = photos[index];

  return (
    <div className="relative">
      <div
        ref={trackRef}
        // tabIndex agar bisa digeser dengan panah keyboard — area scroll
        // yang fokusabel adalah syarat aksesibilitas untuk konten menggulir.
        tabIndex={many ? 0 : -1}
        role={many ? 'group' : undefined}
        aria-roledescription={many ? 'karosel' : undefined}
        aria-label={many ? `Galeri foto proyek, ${photos.length} foto` : undefined}
        className={`flex w-full snap-x snap-mandatory overflow-x-auto rounded-2xl bg-cream-200 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          many ? 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-500' : ''
        }`}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            className={`${ratio} relative w-full shrink-0 grow-0 basis-full snap-start overflow-hidden`}
            aria-roledescription={many ? 'slide' : undefined}
            aria-label={many ? `${i + 1} dari ${photos.length}` : undefined}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes={sizes}
              priority={priority && i === 0}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Foto sebelumnya"
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-900 shadow-lift backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
          >
            <IconChevron className="h-5 w-5 rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Foto berikutnya"
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-900 shadow-lift backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
          >
            <IconChevron className="h-5 w-5 -rotate-90" />
          </button>

          {/* Titik indikator + lompat ke foto tertentu */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Lihat foto ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-forest-700' : 'w-2 bg-navy-900/20 hover:bg-navy-900/40'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Keterangan mengikuti foto yang sedang tampil. aria-live agar pengguna
          pembaca layar tahu isinya berubah setelah menekan panah. */}
      {current?.caption ? (
        <p className="mt-2 text-center text-xs text-slate-500" aria-live="polite">
          {current.caption}
        </p>
      ) : null}
    </div>
  );
}
