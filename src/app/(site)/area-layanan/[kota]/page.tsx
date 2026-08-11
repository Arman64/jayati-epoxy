import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildMetadata, breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import {
  AnswerBox,
  Breadcrumbs,
  CheckList,
  CtaBand,
  Disclaimer,
  FaqList,
  ProjectPhoto,
  SectionHead,
} from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { cityContents, getCityContent } from '@/lib/cityContent';
import { formatRupiah, priceRange, projects } from '@/lib/content';
import { getEpoxySystems } from '@/lib/content-db';
import { IconArrow, IconMapPin, IconWhatsApp } from '@/components/Icons';
import { site, waLink } from '@/lib/site';
import { TrackedLink } from '@/components/TrackedLink';

type Props = { params: { kota: string } };

export function generateStaticParams() {
  return cityContents.map((c) => ({ kota: c.slug }));
}

export function generateMetadata({ params }: Props) {
  const city = getCityContent(params.kota);
  if (!city) {
    return buildMetadata({
      title: 'Area Tidak Ditemukan',
      description: 'Halaman tidak tersedia.',
      path: `/area-layanan/${params.kota}`,
      noindex: true,
    });
  }
  return buildMetadata({
    title: `Jasa Epoxy Lantai ${city.name} — Kontraktor & Aplikator`,
    description: `Jasa epoxy lantai ${city.name} untuk ${city.commonAreas[0]?.toLowerCase()} dan area industri. ${city.localContext.slice(0, 70).trimEnd()}...`,
    path: `/area-layanan/${city.slug}`,
  });
}

export default async function CityPage({ params }: Props) {
  const city = getCityContent(params.kota);
  if (!city) notFound();

  const epoxySystems = await getEpoxySystems();

  // Foto dipilih deterministik per kota agar tiap halaman berbeda — PRD §5.6.
  const cityIndex = cityContents.findIndex((c) => c.slug === city.slug);
  const heroProject = projects[cityIndex % projects.length]!;
  const heroPhoto = heroProject.photos[0]!;

  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Area Layanan', path: '/area-layanan' },
    { name: city.name, path: `/area-layanan/${city.slug}` },
  ];

  const cityFaqs = [
    {
      q: `Apakah Jayati Epoxy melayani proyek di ${city.name}?`,
      a: `Ya. ${city.name} termasuk kota yang rutin kami tangani, terutama untuk ${city.commonAreas.slice(0, 2).join(' dan ').toLowerCase()}. Jadwal survei dikonfirmasi setelah kami menerima informasi lokasi dan perkiraan luas area.`,
    },
    {
      q: `Berapa lama pengerjaan epoxy lantai di ${city.name}?`,
      a: `Durasi mengikuti luas area dan sistem yang dipilih, umumnya 2–3 hari untuk area kecil dan 5–10 hari untuk area di atas 1.000 m². ${city.operationalNote}`,
    },
    {
      q: `Sistem epoxy apa yang paling sering dipakai di ${city.name}?`,
      a: `Sistem yang paling sering digunakan adalah ${city.typicalSystems.join(', ')}, menyesuaikan karakter bangunan dan beban di area tersebut. Rekomendasi final tetap ditentukan setelah survei kondisi lantai.`,
    },
    {
      q: 'Apakah ada biaya tambahan untuk lokasi di luar pusat kota?',
      a: 'Biaya mobilisasi dihitung berdasarkan jarak, akses kendaraan, dan kebutuhan peralatan. Rincian ini dicantumkan terpisah pada penawaran sehingga terlihat jelas.',
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          serviceSchema({
            name: `Jasa Epoxy Lantai ${city.name}`,
            description: `Layanan kontraktor dan aplikator epoxy lantai di ${city.name}, ${city.region}.`,
            path: `/area-layanan/${city.slug}`,
            serviceType: 'Epoxy Flooring Contractor',
          }),
          faqSchema(cityFaqs),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className="eyebrow">
              <IconMapPin className="h-3.5 w-3.5" /> {city.region}
            </p>
            <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
              Jasa Epoxy Lantai {city.name}
            </h1>
            <div className="mt-6">
              <AnswerBox>
                <p>{city.intro}</p>
              </AnswerBox>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <TrackedLink
                href={waLink(`Halo, saya ingin konsultasi epoxy lantai untuk lokasi di ${city.name}.`, `kota-${city.slug}`)}
                external
                event="whatsapp_click"
                params={{ cta_position: 'hero', city: city.slug }}
                className="btn-primary"
              >
                <IconWhatsApp className="h-4 w-4" />
                Konsultasi Area {city.name}
              </TrackedLink>
              <Link href="#form" className="btn-outline">
                Minta Survei <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <ProjectPhoto
            photo={heroPhoto}
            ratio="aspect-[4/3]"
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
          />
        </div>
      </section>

      {/* KONTEKS LOKAL — pembeda antar halaman kota */}
      <section className="bg-cream-100 py-14">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Konteks Lokal" title={`Karakter proyek di ${city.name}`} />
            <p className="prose-brand mt-4">{city.localContext}</p>
            <div className="mt-5 rounded-2xl border-l-4 border-navy-900 bg-white p-5">
              <h3 className="text-base">Catatan operasional</h3>
              <p className="prose-brand mt-2 text-[14px]">{city.operationalNote}</p>
            </div>
            {city.realProjects.length > 0 && (
              <div className="mt-5 rounded-2xl border border-navy-900/10 bg-white p-5">
                <h3 className="text-base">Proyek kami di {city.name}</h3>
                <p className="mt-1.5 text-[12px] text-slate-500">
                  Tercatat dalam company profile {site.legalName}.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {city.realProjects.map((r) => (
                    <li key={r} className="flex gap-2 text-[13.5px] text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <SectionHead eyebrow="Tipe Area" title={`Area yang paling sering kami tangani di ${city.name}`} />
            <CheckList items={city.commonAreas} />
            <h3 className="mt-7 text-base">Cakupan wilayah</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {city.districts.map((d) => (
                <li key={d} className="rounded-full border border-navy-900/12 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy-900">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SISTEM UMUM DI KOTA INI */}
      <section className="container-page py-14">
        <SectionHead
          eyebrow="Sistem Umum"
          title={`Sistem yang sering digunakan di ${city.name}`}
          lead="Rekomendasi berikut berdasarkan karakter bangunan yang umum di wilayah ini, dan tetap perlu dikonfirmasi lewat survei."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {city.typicalSystems.map((slug) => {
            const sys = epoxySystems.find((s) => s.slug === slug) ?? epoxySystems[0]!;
            return (
              <article key={slug} className="card">
                <h3 className="text-lg">{sys.name}</h3>
                <p className="mt-1.5 text-[13px] font-semibold text-leaf-600">{sys.thicknessLabel}</p>
                <p className="prose-brand mt-2.5 text-[14px]">{sys.bestFor}</p>
                <p className="mt-4 text-sm font-bold text-forest-700">
                  {formatRupiah(priceRange(sys).from)} – {formatRupiah(priceRange(sys).to)} / m²
                </p>
              </article>
            );
          })}
        </div>
        <Disclaimer>
          Rentang harga diambil dari pricelist resmi dan belum termasuk biaya mobilisasi ke lokasi
          di {city.name} maupun perbaikan kondisi lantai. Penawaran resmi diterbitkan setelah survei.
        </Disclaimer>
      </section>

      <FaqList faqs={cityFaqs} title={`Pertanyaan Seputar Epoxy Lantai ${city.name}`} />

      <section id="form" className="container-page scroll-mt-24 pb-14">
        <div className="grid gap-8 rounded-3xl border border-navy-900/10 bg-cream-50 p-6 shadow-card sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead
            eyebrow={`Survei ${city.name}`}
            title="Ajukan jadwal survei lokasi"
            lead={`Sampaikan alamat area di ${city.name} dan perkiraan luas agar kami dapat mengatur jadwal tim.`}
          />
          <QuotationForm source={`kota-${city.slug}`} />
        </div>
      </section>

      {/* Internal link antar kota */}
      <section className="container-page pb-14">
        <h2 className="text-lg">Area layanan lainnya</h2>
        <ul className="mt-4 flex flex-wrap gap-2.5">
          {cityContents
            .filter((c) => c.slug !== city.slug)
            .map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/area-layanan/${c.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/12 bg-white px-4 py-2 text-sm font-semibold hover:border-leaf-400 hover:text-forest-700"
                >
                  <IconMapPin className="h-3.5 w-3.5 text-leaf-600" />
                  Epoxy Lantai {c.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <CtaBand
        title={`Siap mengerjakan proyek Anda di ${city.name}`}
        body="Kirim foto lantai dan perkiraan luas area untuk mendapatkan estimasi awal sebelum survei."
      />
    </>
  );
}
