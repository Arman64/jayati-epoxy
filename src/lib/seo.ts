import type { Metadata } from 'next';
import { site } from './site';

type SeoInput = {
  title: string;
  description: string;
  path: string;
  /** noindex untuk admin/preview/thank-you/parameter — PRD §12 */
  noindex?: boolean;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
};

/** Canonical selalu absolut + HTTPS — PRD §12 */
export function canonical(path: string): string {
  const clean = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return new URL(clean, site.url).toString();
}

export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
  ogImage = '/img/og-default.png',
  type = 'website',
  publishedTime,
  modifiedTime,
}: SeoInput): Metadata {
  const url = canonical(path);
  // Layout root sudah memakai template '%s | Jayati Epoxy'. Judul di sini
  // dikirim polos agar tidak terjadi duplikasi brand ("| Jayati Epoxy" dobel).
  const fullTitle = `${title} | ${site.brand}`;

  return {
    // Home memakai judul absolut (tanpa template) agar tidak terlalu panjang.
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: site.brand,
      locale: 'id_ID',
      images: [{ url: new URL(ogImage, site.url).toString(), width: 1200, height: 630, alt: fullTitle }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [new URL(ogImage, site.url).toString()],
    },
  };
}

/* ---------------------------------------------------------------- schema */

export function organizationSchema(override?: {
  telephone?: string;
  email?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#organization`,
    name: site.brand,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/img/logo-jayati.png`,
    image: `${site.url}/img/logo-jayati.png`,
    description: site.description,
    telephone: override?.telephone || site.phoneE164,
    email: override?.email || site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: override?.streetAddress || site.address.street,
      addressLocality: override?.addressLocality || site.address.locality,
      addressRegion: override?.addressRegion || site.address.region,
      postalCode: override?.postalCode || site.address.postalCode,
      addressCountry: site.address.country,
    },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    openingHoursSpecification: site.openingHoursSpec.map((s) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: s.days,
      opens: s.opens,
      closes: s.closes,
    })),
    sameAs: Object.values(site.social),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url: canonical(input.path),
    provider: { '@id': `${site.url}/#organization` },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}

/** FAQPage hanya boleh dipakai bila FAQ-nya benar-benar tampil di halaman — PRD §12 */
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  author: string;
  reviewer?: string;
  published: string;
  modified: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: canonical(input.path),
    image: new URL(input.image ?? '/img/og-default.png', site.url).toString(),
    author: { '@type': 'Person', name: input.author },
    ...(input.reviewer ? { reviewedBy: { '@type': 'Person', name: input.reviewer } } : {}),
    publisher: { '@id': `${site.url}/#organization` },
    datePublished: input.published,
    dateModified: input.modified,
    inLanguage: 'id-ID',
  };
}
