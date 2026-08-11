import Link from 'next/link';
import Image from 'next/image';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { AnswerBox, Breadcrumbs, CheckList, CtaBand, Disclaimer, SectionHead } from '@/components/Sections';
import { site } from '@/lib/site';
import { workSteps, companyValues, missionStatements, visionStatement, clientCount } from '@/lib/content';

const PATH = '/tentang-kami';

export const metadata = buildMetadata({
  title: 'Tentang Kami — Jayati Epoxy',
  description:
    'Jayati Epoxy adalah kontraktor dan aplikator epoxy lantai di bawah Semesta Bumi Jayati. Kami mengutamakan persiapan permukaan yang benar dan penawaran yang transparan.',
  path: PATH,
});

const principles = [
  {
    title: 'Sistem mengikuti beban, bukan anggaran semata',
    body: 'Kami menolak memasang coating tipis pada area forklift hanya agar angka penawaran terlihat murah. Bila anggaran terbatas, kami sarankan menyempitkan area, bukan menurunkan sistem di bawah kebutuhan.',
  },
  {
    title: 'Persiapan permukaan tidak dinegosiasikan',
    body: 'Grinding, pembersihan kontaminan, dan pemeriksaan kelembapan adalah bagian yang paling menentukan umur lapisan. Menghemat di tahap ini berarti memindahkan biaya ke perbaikan di kemudian hari.',
  },
  {
    title: 'Angka disampaikan sebagai rentang',
    body: 'Sebelum survei, kami hanya memberi rentang. Menyebut satu angka pasti tanpa melihat kondisi lantai berisiko berubah saat pekerjaan dimulai, dan itu merugikan kedua pihak.',
  },
  {
    title: 'Klaim harus dapat ditunjukkan',
    body: 'Spesifikasi ketebalan, ketahanan kimia, dan garansi hanya kami sampaikan bila tercantum pada datasheet material atau surat penawaran tertulis.',
  },
];

export default function TentangPage() {
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: PATH },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="eyebrow">Tentang Kami</p>
            <h1 className="mt-3 text-[1.8rem] leading-tight sm:text-4xl">
              Kontraktor Epoxy Lantai di Bawah {site.legalName}
            </h1>
            <div className="mt-6">
              <AnswerBox>
                <p>
                  {site.legalName} menyediakan solusi konstruksi industri yang mengutamakan
                  kualitas, keamanan, dan standar higienitas. Kami bekerja sebagai kontraktor
                  sekaligus aplikator untuk sektor industri, manufaktur, fasilitas kesehatan, serta
                  pengolahan makanan di {site.serviceArea}.
                </p>
              </AnswerBox>
            </div>
            <p className="prose-brand mt-5">
              Kami percaya fasilitas industri yang baik bukan hanya dibangun dengan material
              berkualitas, tetapi juga melalui proses kerja yang profesional dan sesuai regulasi
              yang berlaku. Hingga kini {clientCount}+ unit telah kami kerjakan, sebagian besar
              berupa dapur SPPG dan fasilitas pengolahan makanan.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-3xl bg-cream-100 p-10">
              <Image
                src="/img/logo-jayati.png"
                alt={`Logo ${site.legalName}`}
                width={260}
                height={260}
                className="h-auto w-52 object-contain sm:w-64"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-100 py-14">
        <div className="container-page">
          <SectionHead
            eyebrow="Prinsip Kerja"
            title="Empat hal yang kami pegang di setiap proyek"
            lead="Prinsip ini kadang membuat penawaran kami tidak menjadi yang termurah, tetapi menghindarkan klien dari biaya perbaikan berulang."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {principles.map((p, i) => (
              <article key={p.title} className="card">
                <span className="text-sm font-extrabold text-leaf-500">0{i + 1}</span>
                <h3 className="mt-2 text-lg">{p.title}</h3>
                <p className="prose-brand mt-2.5 text-[14px]">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Cara Kerja" title="Alur kerja standar kami" />
            <ol className="mt-6 space-y-3">
              {workSteps.map((s) => (
                <li key={s.n} className="flex gap-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-900 text-[12px] font-extrabold text-white">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[15px]">{s.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHead eyebrow="Cakupan" title="Yang kami kerjakan dan tidak" />
            <h3 className="mt-6 text-base text-forest-700">Kami mengerjakan</h3>
            <CheckList
              items={[
                'Epoxy lantai rumah, komersial, dan industri',
                'Repaint epoxy dan perbaikan permukaan beton',
                'Polyurethane untuk area basah dan food grade',
                'Marka jalur, coving, dan finishing anti-slip',
                'Pelapisan ulang lantai epoxy yang masih layak',
              ]}
            />
            <h3 className="mt-7 text-base text-navy-900">Kami tidak mengerjakan</h3>
            <ul className="mt-4 space-y-2">
              {[
                'Penjualan material epoxy eceran per kaleng',
                'Pekerjaan struktural beton dan pembetonan baru',
                'Pemasangan keramik, vinyl, atau parket',
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-[15px] text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VISI, MISI, VALUE — company profile hal. 3 */}
      <section className="bg-navy-900 py-14">
        <div className="container-page">
          <p className="eyebrow bg-white/10 !text-leaf-300">Visi, Misi &amp; Value</p>
          <h2 className="mt-3 text-2xl text-white sm:text-3xl">Arah dan komitmen perusahaan</h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-3xl bg-white/[.06] p-6 ring-1 ring-inset ring-white/10">
              <h3 className="text-lg text-white">Visi</h3>
              <p className="mt-3 text-[15px] italic leading-relaxed text-white/80">
                &ldquo;{visionStatement}&rdquo;
              </p>
              <h3 className="mt-7 text-lg text-white">Value Perusahaan</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {companyValues.map((v) => (
                  <li
                    key={v}
                    className="rounded-full bg-leaf-500/15 px-3.5 py-1.5 text-[13px] font-semibold text-leaf-300 ring-1 ring-inset ring-leaf-400/25"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white/[.06] p-6 ring-1 ring-inset ring-white/10">
              <h3 className="text-lg text-white">Misi</h3>
              <ol className="mt-4 space-y-3">
                {missionStatements.map((m, i) => (
                  <li key={m} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-leaf-500 text-[11px] font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[14.5px] leading-relaxed text-white/80">{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-14">
        <div className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-card sm:p-9">
          <h2 className="text-xl">Informasi perusahaan</h2>
          {/* NAP identik dengan footer & Organization schema — PRD §12 */}
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              ['Nama layanan', site.brand],
              ['Badan usaha', site.legalName],
              ['Area layanan', site.serviceArea],
              ['Jam layanan', site.openingHours],
              ['Telepon', site.phoneDisplay],
              ['Email', site.email],
              ['Alamat', `${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`],
              ['Fokus layanan', 'Jasa aplikasi epoxy lantai (bukan penjualan material)'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] uppercase tracking-wider text-slate-500">{k}</dt>
                <dd className="mt-1 text-[15px] font-semibold text-navy-900">{v}</dd>
              </div>
            ))}
          </dl>
          <Disclaimer>
            Seluruh data di atas bersumber dari company profile resmi {site.legalName}.
          </Disclaimer>
          <Link href="/kontak" className="btn-primary mt-6">
            Hubungi Kami
          </Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
