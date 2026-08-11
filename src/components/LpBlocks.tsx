import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconCheck, IconPhone, IconWhatsApp } from './Icons';
import { site, waLink } from '@/lib/site';
import { TrackedLink } from './TrackedLink';
import { ProjectPhoto } from './Sections';
import type { Project } from '@/lib/content';

/* ------------------------------------------------------------ LP hero */

export function LpHero({
  eyebrow,
  h1,
  benefit,
  bullets,
  waMessage,
  cluster,
}: {
  eyebrow: string;
  h1: string;
  benefit: string;
  bullets: string[];
  waMessage: string;
  cluster: string;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, #6A9929 0, transparent 42%), radial-gradient(circle at 85% 75%, #17418D 0, transparent 46%)',
        }}
      />
      <div className="container-page relative grid gap-9 py-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-leaf-300 ring-1 ring-inset ring-white/15">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-[1.85rem] leading-[1.15] text-white sm:text-4xl lg:text-[2.8rem]">{h1}</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-lg">{benefit}</p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-[14px] text-white/90">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-500">
                  <IconCheck className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedLink
              href={waLink(waMessage, `lp-${cluster}`)}
              external
              event="whatsapp_click"
              params={{ cta_position: 'lp_hero', keyword_cluster: cluster }}
              className="btn-primary"
            >
              <IconWhatsApp className="h-4 w-4" />
              Konsultasi via WhatsApp
            </TrackedLink>
            <Link href="#form" className="btn-ghost-light">
              Isi Form Penawaran
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/55">
            Estimasi awal dari foto. Harga final setelah survei kondisi lantai.
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[.07] p-3 shadow-lift backdrop-blur-sm">
          <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-white/25 bg-navy-800/40">
            <div className="grid h-full place-items-center p-6 text-center">
              <div>
                <span className="mx-auto block h-10 w-10 rounded-full bg-leaf-500/30" aria-hidden />
                <p className="mt-3.5 text-sm font-bold text-white">Slot Foto Proyek Asli</p>
                <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-white/60">
                  Landing page iklan wajib memakai foto proyek asli agar message match dengan iklan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- LP trust bar */

export function LpTrustBar({ items }: { items: { label: string; value: string }[] }) {
  return (
    <section className="border-b border-navy-900/10 bg-cream-100">
      <div className="container-page grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
        {items.map((t) => (
          <div key={t.label} className="text-center">
            <p className="text-base font-extrabold text-navy-900 sm:text-lg">{t.value}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------- LP problems */

export function LpProblems({ title, items }: { title: string; items: { p: string; s: string }[] }) {
  return (
    <section className="container-page py-12">
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <article key={it.p} className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
            <h3 className="text-[15px] text-navy-900">{it.p}</h3>
            <p className="mt-2.5 flex gap-2 text-[14px] leading-relaxed text-slate-600">
              <span className="mt-0.5 shrink-0 font-bold text-leaf-600">→</span>
              {it.s}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ LP steps */

export function LpSteps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <section className="bg-navy-900 py-12">
      <div className="container-page">
        <h2 className="text-2xl text-white sm:text-3xl">Cara kerja kami</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-white/12 bg-white/[.06] p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-500 text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3.5 text-[15px] font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/65">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- LP portfolio */

export function LpPortfolio({ projects }: { projects: Project[] }) {
  return (
    <section className="container-page py-12">
      <h2 className="text-2xl sm:text-3xl">Contoh pekerjaan</h2>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p) => (
          <div key={p.slug}>
            <ProjectPhoto
              photo={p.photos[0]!}
              showCaption={false}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
            <h3 className="mt-3 text-[14px] font-bold text-navy-900">{p.name}</h3>
            <p className="mt-1 text-[13px] text-slate-500">
              {p.system} · {p.city}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-slate-500">
        Seluruh foto adalah dokumentasi asli pengerjaan {site.legalName}.
      </p>
    </section>
  );
}

/* ----------------------------------------------------- LP sticky mobile */

export function LpStickyCta({ waMessage, cluster }: { waMessage: string; cluster: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-900/10 bg-white/95 p-2.5 shadow-[0_-4px_20px_rgba(1,30,70,.10)] backdrop-blur lg:hidden">
      <div className="flex items-center gap-2">
        <TrackedLink
          href={`tel:${site.phoneE164}`}
          external
          event="phone_click"
          params={{ cta_position: 'lp_sticky', keyword_cluster: cluster }}
          className="btn-outline flex-1 !px-3 !py-3 text-[13px]"
          ariaLabel={`Telepon ${site.phoneDisplay}`}
        >
          <IconPhone className="h-4 w-4" />
          Telepon
        </TrackedLink>
        <TrackedLink
          href={waLink(waMessage, `lp-sticky-${cluster}`)}
          external
          event="whatsapp_click"
          params={{ cta_position: 'lp_sticky', keyword_cluster: cluster }}
          className="btn-primary flex-[1.6] !px-3 !py-3 text-[13px]"
        >
          <IconWhatsApp className="h-4 w-4" />
          Chat WhatsApp
        </TrackedLink>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ LP shell */

export function LpSection({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <section className={muted ? 'bg-cream-100 py-12' : 'py-12'}>{children}</section>;
}
