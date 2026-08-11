import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { pageOverride } from '@/lib/pages';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs, SectionHead } from '@/components/Sections';
import { QuotationForm } from '@/components/QuotationForm';
import { defaultWaMessage, site, waLink } from '@/lib/site';
import { IconClock, IconMail, IconMapPin, IconPhone, IconWhatsApp } from '@/components/Icons';
import { TrackedLink } from '@/components/TrackedLink';

const PATH = '/kontak';

const DEFAULT_TITLE = 'Kontak & Minta Penawaran Epoxy Lantai';
const DEFAULT_DESC =
  'Hubungi Jayati Epoxy untuk konsultasi dan permintaan penawaran jasa epoxy lantai. Kirim detail area melalui formulir, WhatsApp, atau telepon.';

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

export default async function KontakPage() {
  const o = await pageOverride(PATH);
  const crumbs = [
    { name: 'Beranda', path: '/' },
    { name: 'Kontak', path: PATH },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <section className="container-page py-10 sm:py-14">
        <SectionHead
          eyebrow="Kontak"
          title={o.h1 || 'Minta Penawaran atau Jadwalkan Survei'}
          lead="Sampaikan kebutuhan Anda melalui formulir agar kami dapat menyiapkan estimasi awal. Untuk pertanyaan cepat, WhatsApp adalah jalur tercepat."
          as="h1"
        />
      </section>

      <section className="container-page pb-14">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          {/* NAP */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-lg">Hubungi kami</h2>
              <address className="mt-4 space-y-4 not-italic">
                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-50 text-forest-700">
                    <IconWhatsApp className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-slate-500">WhatsApp</p>
                    <TrackedLink
                      href={waLink(defaultWaMessage, 'kontak-page')}
                      external
                      event="whatsapp_click"
                      params={{ cta_position: 'contact_nap' }}
                      className="text-[15px] font-bold text-navy-900 hover:text-forest-700"
                    >
                      {site.whatsappDisplay}
                    </TrackedLink>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-50 text-forest-700">
                    <IconPhone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-slate-500">Telepon</p>
                    <TrackedLink
                      href={`tel:${site.phoneE164}`}
                      external
                      event="phone_click"
                      params={{ cta_position: 'contact_nap' }}
                      className="text-[15px] font-bold text-navy-900 hover:text-forest-700"
                    >
                      {site.phoneDisplay}
                    </TrackedLink>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-50 text-forest-700">
                    <IconMail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-slate-500">Email</p>
                    <a href={`mailto:${site.email}`} className="text-[15px] font-bold text-navy-900 hover:text-forest-700">
                      {site.email}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-50 text-forest-700">
                    <IconMapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-slate-500">Alamat</p>
                    <p className="text-[15px] font-semibold text-navy-900">
                      {site.address.street}
                      <br />
                      {site.address.locality}, {site.address.region} {site.address.postalCode}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-50 text-forest-700">
                    <IconClock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-slate-500">Jam Layanan</p>
                    <p className="text-[15px] font-semibold text-navy-900">{site.openingHours}</p>
                  </div>
                </div>
              </address>
            </div>

            <div className="card bg-cream-50">
              <h2 className="text-base">Agar respons lebih cepat</h2>
              <ul className="mt-3 space-y-2 text-[14px] text-slate-700">
                {[
                  'Sebutkan kota dan alamat lokasi proyek',
                  'Lampirkan foto kondisi lantai saat ini',
                  'Sampaikan perkiraan luas area dalam m²',
                  'Jelaskan aktivitas atau beban di area tersebut',
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5 text-[13px] leading-relaxed text-amber-900">
              <strong className="block">Catatan mengenai harga</strong>
              Kami tidak memberikan harga final melalui chat sebelum kondisi lantai diperiksa. Yang
              dapat kami berikan lebih dulu adalah rentang estimasi berdasarkan informasi dan foto
              yang Anda kirim.
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-xl">Formulir Permintaan Penawaran</h2>
            <p className="prose-brand mt-2 text-[14px]">
              Isi data berikut. Kolom bertanda bintang wajib diisi.
            </p>
            <div className="mt-6">
              <QuotationForm source="kontak" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
