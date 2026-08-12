import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';
import { getCities, getCoreServices } from '@/lib/content-db';
import { getSettings } from '@/lib/settings';
import { IconMail, IconMapPin, IconPhone, IconClock } from './Icons';

export async function Footer() {
  // Kontak, alamat, dan jam kerja mengikuti Pengaturan Kontak di admin.
  const { contact } = await getSettings();
  const [coreServices, cities] = await Promise.all([getCoreServices(), getCities()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-navy-900 text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-cream-200 p-1.5">
              <Image
                src="/img/logo-jayati-transparent.png"
                alt={`Logo ${site.legalName}`}
                width={48}
                height={48}
                className="h-11 w-11 object-contain"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-extrabold text-white">JAYATI EPOXY</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-leaf-400">
                {site.legalName}
              </span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed">{site.description}</p>
          <p className="mt-4 text-xs text-white/55">
            Layanan: {contact.serviceArea}. Cakupan pengerjaan di luar kota mengikuti konfirmasi jadwal
            dan biaya mobilisasi.
          </p>
        </div>

        <nav aria-label="Layanan">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Layanan</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {coreServices.slice(0, 4).map((s) => (
              <li key={s.slug}>
                <Link className="hover:text-leaf-300" href={s.href || `/${s.slug}`}>
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link className="hover:text-leaf-300" href="/harga-epoxy-lantai">
                Harga Epoxy Lantai
              </Link>
            </li>
            <li>
              <Link className="hover:text-leaf-300" href="/jasa-epoxy-lantai">
                Jasa Epoxy Lantai
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Perusahaan dan area">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Perusahaan</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-leaf-300" href="/tentang-kami">Tentang Kami</Link></li>
            <li><Link className="hover:text-leaf-300" href="/portofolio">Portofolio</Link></li>
            <li><Link className="hover:text-leaf-300" href="/blog">Blog</Link></li>
            <li><Link className="hover:text-leaf-300" href="/area-layanan">Area Layanan</Link></li>
            <li><Link className="hover:text-leaf-300" href="/kontak">Kontak</Link></li>
          </ul>
          <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-white">Kota Utama</h2>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[13px]">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link className="hover:text-leaf-300" href={`/area-layanan/${c.slug}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Kontak</h2>
          {/* NAP konsisten dengan Organization schema — PRD §12 */}
          <address className="mt-4 space-y-3 text-sm not-italic">
            <p className="flex gap-2.5">
              <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-leaf-400" />
              <a href={`tel:${contact.phoneE164}`} className="hover:text-leaf-300">
                {contact.phoneDisplay}
              </a>
            </p>
            <p className="flex gap-2.5">
              <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-leaf-400" />
              <a href={`mailto:${contact.email}`} className="hover:text-leaf-300">
                {contact.email}
              </a>
            </p>
            <p className="flex gap-2.5">
              <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-400" />
              <span>
                {contact.addressStreet}
                <br />
                {contact.addressCity}, {contact.addressRegion} {contact.addressPostal}
              </span>
            </p>
            <p className="flex gap-2.5">
              <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-leaf-400" />
              <span>{contact.hours}</span>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-leaf-300" href="/privacy-policy">Kebijakan Privasi</Link>
            <Link className="hover:text-leaf-300" href="/terms">Syarat & Ketentuan</Link>
            <Link className="hover:text-leaf-300" href="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
