import Link from 'next/link';
import { AnswerBox, CheckList, CtaBand, FaqList, ProjectPhoto, SectionHead } from '@/components/Sections';
import { PriceCalculator } from '@/components/PriceCalculator';
import { QuotationForm } from '@/components/QuotationForm';
import { TrackedLink } from '@/components/TrackedLink';
import { IconArrow, IconCheck, IconWhatsApp } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import {
  getCoreServices,
  getEpoxySystems,
  getGeneralFaqs,
  getPriceFaqs,
  getStats,
  getWhyChooseUs,
  getWorkSteps,
} from '@/lib/content-db';
import { curvingPrice, formatRupiah, priceRange, projects } from '@/lib/content';
import { site } from '@/lib/site';
import { getSettings } from '@/lib/settings';
import { toContactInfo, waHref } from '@/lib/contact';
import { bool, linesOf, num, paragraphsOf, str, type PageSectionRow } from '@/lib/sections';

/**
 * Merender seksi yang disusun Owner di admin.
 *
 * Setiap jenis seksi punya markup tetap di sini; Owner hanya mengatur teks,
 * urutan, dan tampil/sembunyi. Dengan begitu tata letak tidak bisa rusak dan
 * gambar selalu punya width/height (PRD §11, CLS ≤ 0,1).
 */

function Wrap({
  muted,
  children,
  id,
}: {
  muted?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={muted ? 'bg-cream-100 py-14' : 'py-14'}>
      <div className="container-page">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ hero */

function HeroSection({ config }: { config: PageSectionRow['config'] }) {
  const title = str(config, 'title');
  const lead = str(config, 'lead');
  const eyebrow = str(config, 'eyebrow');
  const primaryLabel = str(config, 'primaryLabel', 'Minta Penawaran');
  const primaryHref = str(config, 'primaryHref', '/kontak');
  const secondaryLabel = str(config, 'secondaryLabel');
  const secondaryHref = str(config, 'secondaryHref', '/portofolio');

  return (
    <section className="bg-cream-100">
      <div className="container-page py-14 sm:py-18">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">{title}</h1>
          {lead ? <p className="prose-brand mt-4 text-[16px]">{lead}</p> : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
              <IconArrow className="h-4 w-4" />
            </Link>
            {secondaryLabel ? (
              <Link href={secondaryHref} className="btn-outline">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- konten */

async function SystemsSection({ config }: { config: PageSectionRow['config'] }) {
  const all = await getEpoxySystems();
  const limit = num(config, 'limit', 0);
  const systems = limit > 0 ? all.slice(0, limit) : all;

  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead
        eyebrow="Jenis Sistem"
        title={str(config, 'title', 'Sistem epoxy dan penggunaannya')}
        lead={str(config, 'lead') || undefined}
      />
      <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((s) => {
          const r = priceRange(s);
          return (
            <article key={s.slug} className="card flex flex-col">
              <h3 className="text-lg">{s.name}</h3>
              <p className="mt-1.5 text-[13px] font-semibold text-leaf-600">{s.thicknessLabel}</p>
              <p className="prose-brand mt-3 text-[14px]">{s.bestFor}</p>
              <ul className="mt-4 grid gap-1.5">
                {s.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-[13px] text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                    {h}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 text-sm font-bold text-forest-700">
                {formatRupiah(r.from)} – {formatRupiah(r.to)} / m²
              </p>
            </article>
          );
        })}
      </div>
    </Wrap>
  );
}

async function PriceTableSection({ config }: { config: PageSectionRow['config'] }) {
  const systems = await getEpoxySystems();
  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead
        eyebrow="Pricelist"
        title={str(config, 'title', 'Pricelist per meter persegi')}
        lead={str(config, 'lead') || undefined}
      />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-900/10 shadow-card">
        <table className="w-full min-w-[640px] border-collapse bg-white text-left text-[14px]">
          <caption className="sr-only">Daftar harga epoxy lantai per meter persegi menurut luas area</caption>
          <thead>
            <tr className="bg-navy-900 text-white">
              <th scope="col" className="px-4 py-3 font-semibold">Sistem</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">&lt; 100 m²</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">&gt; 100 m²</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">&gt; 500 m²</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((s, i) => (
              <tr key={s.slug} className={i % 2 ? 'bg-cream-50' : 'bg-white'}>
                <th scope="row" className="px-4 py-3 font-semibold text-navy-900">{s.name}</th>
                <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(s.priceUnder100)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(s.priceOver100)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(s.priceOver500)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-slate-500">
        Harga per m², belum termasuk PPN. Terakhir ditinjau {site.priceLastReviewed}.
      </p>
    </Wrap>
  );
}

async function CalculatorSection({ config }: { config: PageSectionRow['config'] }) {
  const systems = await getEpoxySystems();
  const contact = toContactInfo((await getSettings()).contact);
  return (
    <Wrap muted={bool(config, 'muted')} id="kalkulator">
      <SectionHead
        eyebrow="Kalkulator"
        title={str(config, 'title', 'Hitung estimasi biaya')}
        lead={str(config, 'lead') || undefined}
      />
      <div className="mt-8">
        <PriceCalculator systems={systems} curvingPrice={curvingPrice} contact={contact} />
      </div>
    </Wrap>
  );
}

async function WorkStepsSection({ config }: { config: PageSectionRow['config'] }) {
  const steps = await getWorkSteps();
  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead
        eyebrow="Proses Kerja"
        title={str(config, 'title', 'Tahapan pengerjaan')}
        lead={str(config, 'lead') || undefined}
      />
      <ol className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="card">
            <span className="text-xs font-extrabold tracking-widest text-leaf-600">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-2 text-lg">{s.title}</h3>
            <p className="prose-brand mt-2 text-[14px]">{s.body}</p>
          </li>
        ))}
      </ol>
    </Wrap>
  );
}

async function WhyUsSection({ config }: { config: PageSectionRow['config'] }) {
  const items = await getWhyChooseUs();
  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead
        eyebrow="Keunggulan"
        title={str(config, 'title', 'Kenapa memilih kami')}
        lead={str(config, 'lead') || undefined}
      />
      <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <article key={it.title} className="card">
            <span className="text-xs font-extrabold tracking-widest text-leaf-600">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-2 text-lg">{it.title}</h3>
            <p className="prose-brand mt-2 text-[14px]">{it.body}</p>
          </article>
        ))}
      </div>
    </Wrap>
  );
}

async function ServicesSection({ config }: { config: PageSectionRow['config'] }) {
  const services = await getCoreServices();
  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead
        eyebrow="Layanan"
        title={str(config, 'title', 'Layanan kami')}
        lead={str(config, 'lead') || undefined}
      />
      <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link key={s.slug} href={s.href || `/${s.slug}`} className="card group hover:border-leaf-300">
            <h3 className="text-lg group-hover:text-forest-700">{s.title}</h3>
            <p className="prose-brand mt-2 text-[14px]">{s.short}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest-700">
              Pelajari
              <IconArrow className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </Wrap>
  );
}

async function StatsSection({ config }: { config: PageSectionRow['config'] }) {
  const stats = await getStats();
  if (!stats.length) return null;
  return (
    <Wrap muted={bool(config, 'muted')}>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.eyebrow} className="card text-center">
            <dt className="eyebrow">{s.eyebrow}</dt>
            <dd className="mt-2 text-3xl font-extrabold text-navy-900">{s.value}</dd>
            <p className="mt-1.5 text-[13px] text-slate-500">{s.note}</p>
          </div>
        ))}
      </dl>
    </Wrap>
  );
}

function ProjectsSection({ config }: { config: PageSectionRow['config'] }) {
  const limit = num(config, 'limit', 0);
  const list = limit > 0 ? projects.slice(0, limit) : projects;
  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead
        eyebrow="Portofolio"
        title={str(config, 'title', 'Proyek yang pernah kami kerjakan')}
        lead={str(config, 'lead') || undefined}
      />
      <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <article key={p.slug} className="card">
            {p.photos[0] ? <ProjectPhoto photo={p.photos[0]} showCaption={false} /> : null}
            <h3 className="mt-4 text-lg">{p.name}</h3>
            <p className="mt-1 text-[13px] font-semibold text-leaf-600">
              {p.system} · {p.thickness}
            </p>
            <p className="prose-brand mt-2 text-[14px]">{p.summary}</p>
            <Link
              href={`/portofolio/${p.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest-700"
            >
              Lihat detail
              <IconArrow className="h-3.5 w-3.5" />
            </Link>
          </article>
        ))}
      </div>
    </Wrap>
  );
}

function RichTextSection({ config }: { config: PageSectionRow['config'] }) {
  const paras = paragraphsOf(config.body);
  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead
        eyebrow={str(config, 'eyebrow') || undefined}
        title={str(config, 'title')}
      />
      <div className="mt-4 max-w-3xl space-y-3">
        {paras.map((p, i) => (
          <p key={i} className="prose-brand">
            {p}
          </p>
        ))}
      </div>
    </Wrap>
  );
}

function ChecklistSection({ config }: { config: PageSectionRow['config'] }) {
  const items = linesOf(config.items);
  return (
    <Wrap muted={bool(config, 'muted')}>
      <SectionHead title={str(config, 'title')} lead={str(config, 'lead') || undefined} />
      <div className="max-w-3xl">
        <CheckList items={items} columns={bool(config, 'twoColumns') ? 2 : 1} />
      </div>
    </Wrap>
  );
}

async function FaqSection({ config }: { config: PageSectionRow['config'] }) {
  const source = str(config, 'source', 'general');
  const all = source === 'price' ? await getPriceFaqs() : await getGeneralFaqs();
  const limit = num(config, 'limit', 0);
  const faqs = limit > 0 ? all.slice(0, limit) : all;
  if (!faqs.length) return null;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <FaqList faqs={faqs} title={str(config, 'title', 'Pertanyaan yang Sering Diajukan')} />
    </>
  );
}

function FormSection({ config, source }: { config: PageSectionRow['config']; source: string }) {
  return (
    <section id="form" className="container-page scroll-mt-24 py-14">
      <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <SectionHead
            eyebrow="Minta Penawaran"
            title={str(config, 'title', 'Kirim detail area Anda')}
            lead={str(config, 'lead', 'Isi data berikut agar kami dapat menyiapkan estimasi awal dan menjadwalkan survei.')}
          />
          <div className="mt-6 space-y-3 text-[14px] text-slate-600">
            <p className="flex gap-2.5">
              <IconCheck className="mt-1 h-4 w-4 shrink-0 text-forest-700" strokeWidth={3} />
              {site.openingHours}
            </p>
            <p className="flex gap-2.5">
              <IconCheck className="mt-1 h-4 w-4 shrink-0 text-forest-700" strokeWidth={3} />
              Melayani seluruh Indonesia
            </p>
          </div>
        </div>
        <QuotationForm source={source} />
      </div>
    </section>
  );
}

async function CtaSection({ config }: { config: PageSectionRow['config'] }) {
  const contact = toContactInfo((await getSettings()).contact);
  const title = str(config, 'title', 'Butuh estimasi untuk area Anda?');
  const body = str(config, 'body', 'Kirim foto lantai dan perkiraan luas area. Kami bantu memilih sistem yang sesuai.');
  const primaryHref = str(config, 'primaryHref', '/kontak');
  const primaryLabel = str(config, 'primaryLabel', 'Minta Penawaran');

  if (str(config, 'style', 'gradient') === 'soft') {
    return (
      <section className="container-page py-14">
        <div className="rounded-3xl border border-navy-900/10 bg-cream-50 px-6 py-10 text-center shadow-card sm:px-12">
          <h2 className="text-2xl sm:text-3xl">{title}</h2>
          <p className="prose-brand mx-auto mt-3 max-w-2xl">{body}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
              <IconArrow className="h-4 w-4" />
            </Link>
            <TrackedLink
              href={waHref(contact, 'Halo, saya ingin konsultasi mengenai pekerjaan epoxy lantai.', 'halaman-kustom')}
              external
              event="whatsapp_click"
              params={{ cta_position: 'section_cta' }}
              className="btn-outline"
            >
              <IconWhatsApp className="h-4 w-4" />
              WhatsApp
            </TrackedLink>
          </div>
        </div>
      </section>
    );
  }

  return <CtaBand title={title} body={body} primaryHref={primaryHref} primaryLabel={primaryLabel} />;
}

/* ---------------------------------------------------------------- daftar */

export async function SectionRenderer({
  section,
  formSource,
}: {
  section: PageSectionRow;
  formSource: string;
}) {
  const { kind, config } = section;

  switch (kind) {
    case 'hero':
      return <HeroSection config={config} />;
    case 'answer':
      return (
        <section className="container-page pt-8">
          <div className="max-w-3xl">
            <AnswerBox override={str(config, 'body')}>
              <p>{str(config, 'body')}</p>
            </AnswerBox>
          </div>
        </section>
      );
    case 'rich_text':
      return <RichTextSection config={config} />;
    case 'checklist':
      return <ChecklistSection config={config} />;
    case 'systems':
      return <SystemsSection config={config} />;
    case 'price_table':
      return <PriceTableSection config={config} />;
    case 'calculator':
      return <CalculatorSection config={config} />;
    case 'work_steps':
      return <WorkStepsSection config={config} />;
    case 'why_us':
      return <WhyUsSection config={config} />;
    case 'services':
      return <ServicesSection config={config} />;
    case 'stats':
      return <StatsSection config={config} />;
    case 'projects':
      return <ProjectsSection config={config} />;
    case 'faq':
      return <FaqSection config={config} />;
    case 'form':
      return <FormSection config={config} source={formSource} />;
    case 'cta':
      return <CtaSection config={config} />;
    default:
      return null;
  }
}
