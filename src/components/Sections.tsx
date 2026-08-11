import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { IconArrow, IconCheck, IconChevron, IconInfo } from './Icons';
import type { Faq, ProjectPhoto as ProjectPhotoData } from '@/lib/content';

/* ------------------------------------------------------------- breadcrumb */

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-navy-900/8 bg-cream-100">
      <div className="container-page">
        <ol className="flex flex-wrap items-center gap-1.5 py-3 text-[13px] text-slate-600">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="font-semibold text-forest-700">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-forest-700 hover:underline">
                      {item.name}
                    </Link>
                    <IconChevron className="h-3.5 w-3.5 -rotate-90 text-slate-400" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

/* --------------------------------------------------------------- headings */

export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
  as: As = 'h2',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  center?: boolean;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <As className={`${eyebrow ? 'mt-3' : ''} text-2xl sm:text-3xl lg:text-[2.1rem] lg:leading-tight`}>
        {title}
      </As>
      {lead ? <p className="prose-brand mt-3">{lead}</p> : null}
    </div>
  );
}

/** Jawaban langsung 40–60 kata di awal — PRD §5.2 & §12 (answer-first) */
export function AnswerBox({
  children,
  override,
}: {
  children: ReactNode;
  /** Teks pembuka dari CMS. Bila diisi, menggantikan teks bawaan. */
  override?: string | null;
}) {
  return (
    <div className="answer-box">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-forest-700">
        Jawaban singkat
      </p>
      {override ? <p>{override}</p> : children}
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
      <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function CheckList({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 }) {
  return (
    <ul className={`mt-5 grid gap-2.5 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((t) => (
        <li key={t} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-100 text-forest-700">
            <IconCheck className="h-3 w-3" strokeWidth={3} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------- FAQ */

export function FaqList({ faqs, title = 'Pertanyaan yang Sering Diajukan' }: { faqs: Faq[]; title?: string }) {
  return (
    <section className="container-page py-14 sm:py-16" aria-labelledby="faq-heading">
      <SectionHead eyebrow="FAQ" title={title} as="h2" />
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card open:border-leaf-300 open:bg-cream-50"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-bold text-navy-900">
              <h3 className="text-[15px] font-bold sm:text-base">{f.q}</h3>
              <IconChevron className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600 transition-transform group-open:rotate-180" />
            </summary>
            <p className="prose-brand mt-3">{f.a}</p>
          </details>
        ))}
      </div>
      <span id="faq-heading" className="sr-only">
        {title}
      </span>
    </section>
  );
}

/* -------------------------------------------------------------- final CTA */

export function CtaBand({
  title = 'Butuh estimasi untuk area Anda?',
  body = 'Kirim foto lantai dan perkiraan luas area. Tim kami membantu memilih sistem yang sesuai kebutuhan, lalu menyiapkan penawaran tertulis.',
  primaryHref = '/kontak',
  primaryLabel = 'Minta Penawaran',
}: {
  title?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <section className="container-page py-14">
      <div className="overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-center shadow-lift sm:px-12">
        <h2 className="text-2xl text-white sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:text-base">
          {body}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={primaryHref} className="btn-primary">
            {primaryLabel}
            <IconArrow className="h-4 w-4" />
          </Link>
          <Link href="/portofolio" className="btn-ghost-light">
            Lihat Portofolio
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- project media */

/**
 * Foto proyek asli (dokumentasi CV Semesta Bumi Jayati).
 * width/height selalu diisi agar tidak terjadi layout shift — PRD §11 (CLS ≤ 0,1).
 */
export function ProjectPhoto({
  photo,
  className = '',
  ratio = 'aspect-[4/3]',
  priority = false,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  showCaption = true,
}: {
  photo: ProjectPhotoData;
  className?: string;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  showCaption?: boolean;
}) {
  return (
    <figure className={className}>
      <div className={`${ratio} relative w-full overflow-hidden rounded-2xl bg-cream-200`}>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </div>
      {showCaption && photo.caption ? (
        <figcaption className="mt-2 text-xs text-slate-500">{photo.caption}</figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Placeholder foto. Dipertahankan untuk area yang belum memiliki dokumentasi
 * asli — PRD §5.1 melarang stock photo.
 */
export function PhotoSlot({
  label,
  caption,
  className = '',
  ratio = 'aspect-[4/3]',
}: {
  label: string;
  caption?: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <figure className={className}>
      <div
        className={`${ratio} grid w-full place-items-center rounded-2xl border-2 border-dashed border-navy-900/20 bg-gradient-to-br from-cream-100 to-cream-300 p-6 text-center`}
      >
        <div>
          <span className="mx-auto block h-9 w-9 rounded-full bg-leaf-100" aria-hidden />
          <p className="mt-3 text-[13px] font-bold text-navy-900">{label}</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Slot foto proyek asli
          </p>
        </div>
      </div>
      {caption ? <figcaption className="mt-2 text-xs text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}
