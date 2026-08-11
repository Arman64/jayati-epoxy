import Link from 'next/link';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import { AnswerBox, Breadcrumbs, CtaBand, Disclaimer, SectionHead } from '@/components/Sections';
import { getCities } from '@/lib/content-db';
import { IconArrow, IconMapPin } from '@/components/Icons';
import { site } from '@/lib/site';
import { getPageCopy } from '@/lib/page-copy';
import { sh } from '@/lib/page-slots';

const PATH = '/area-layanan';

const DEFAULT_TITLE = 'Area Layanan Jasa Epoxy Lantai';
const DEFAULT_DESC =
  'CV Semesta Bumi Jayati melayani pekerjaan epoxy lantai di seluruh Indonesia. Proyek kami tersebar di Kediri, Nganjuk, Madura, Jawa Tengah, hingga Jakarta.';

export async function generateMetadata() {
  const o = await pageOverride(PATH);
  return buildMetadata({
    title: o.title || DEFAULT_TITLE,
    description: o.description || DEFAULT_DESC,
    path: PATH,
    noindex: o.noindex,
    ogImage: o.ogImage ?? undefined,
  });
}

export default async function AreaLayananPage() {
  const [o, cities, copy] = await Promise.all([
    pageOverride(PATH),
    getCities(),
    getPageCopy(PATH),
  ]);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Area Layanan', path: PATH },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="max-w-3xl">
          <p className="eyebrow">Area Layanan</p>
          <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
            {o.h1 || 'Area Layanan Jasa Epoxy Lantai Jayati Epoxy'}
          </h1>
          <div className="mt-6">
            <AnswerBox override={o.intro}>
              <p>
                {site.legalName} berkantor di Kediri, Jawa Timur, dan melayani pekerjaan epoxy
                lantai di seluruh Indonesia. Proyek kami tercatat di Kediri, Nganjuk, Sampang,
                Pamekasan, berbagai kabupaten di Jawa Tengah, hingga Jakarta. Untuk lokasi lain,
                jadwal dan biaya mobilisasi dikonfirmasi sebelum penawaran diterbitkan.
              </p>
            </AnswerBox>
          </div>
        </div>
      </section>

      <section className="container-page pb-14">
        <SectionHead {...sh(copy, 'kota-utama', { eyebrow: 'Kota Utama', title: 'Kota dengan penanganan paling rutin' })} as="h2" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <Link key={c.slug} href={`${PATH}/${c.slug}`} className="card group flex items-start gap-4 hover:shadow-lift">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf-gradient text-white">
                <IconMapPin className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg group-hover:text-forest-700">Epoxy Lantai {c.name}</h3>
                <p className="mt-1 text-[13px] text-slate-500">{c.region}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-forest-700">
                  Detail area <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-14">
        <div className="rounded-3xl bg-navy-900 p-7 text-white sm:p-10">
          <h2 className="text-2xl text-white">Lokasi Anda tidak ada dalam daftar?</h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-white/75">
            Kami tetap dapat menangani proyek di kota lain di Indonesia. Faktor yang menentukan
            adalah luas area, jadwal, dan akses lokasi — karena biaya mobilisasi alat serta tim perlu
            dihitung terlebih dahulu. Hubungi kami dengan menyebutkan lokasi dan perkiraan luas area.
          </p>
          <Link href="/kontak" className="btn-primary mt-6">
            Tanyakan Ketersediaan <IconArrow className="h-4 w-4" />
          </Link>
        </div>
        <Disclaimer>
          Kami hanya menampilkan kota yang benar-benar dapat kami layani. Halaman kota tidak dibuat
          semata-mata untuk menargetkan kata kunci pencarian.
        </Disclaimer>
      </section>

      <CtaBand
        title={`Melayani proyek di ${site.serviceArea}`}
        body="Sampaikan lokasi dan kebutuhan area Anda, kami konfirmasi ketersediaan jadwal tim."
      />
    </>
  );
}
