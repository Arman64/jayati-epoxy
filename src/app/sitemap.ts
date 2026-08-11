import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { posts, projects } from '@/lib/content';
import { cityContents } from '@/lib/cityContent';

/**
 * Sitemap hanya berisi URL canonical, status 200, dan indexable — PRD §12.
 * Halaman /terima-kasih, /lp/*, dan API sengaja TIDAK dimasukkan karena
 * noindex (thank-you) atau merupakan halaman iklan berbayar.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1, freq: 'weekly' },
    { path: '/jasa-epoxy-lantai', priority: 0.9, freq: 'monthly' },
    { path: '/harga-epoxy-lantai', priority: 0.9, freq: 'monthly' },
    { path: '/epoxy-lantai-rumah', priority: 0.85, freq: 'monthly' },
    { path: '/epoxy-lantai-industri', priority: 0.85, freq: 'monthly' },
    { path: '/epoxy-floor-coating', priority: 0.8, freq: 'monthly' },
    { path: '/portofolio', priority: 0.7, freq: 'monthly' },
    { path: '/area-layanan', priority: 0.7, freq: 'monthly' },
    { path: '/blog', priority: 0.7, freq: 'weekly' },
    { path: '/tentang-kami', priority: 0.5, freq: 'yearly' },
    { path: '/kontak', priority: 0.8, freq: 'yearly' },
    { path: '/privacy-policy', priority: 0.2, freq: 'yearly' },
    { path: '/terms', priority: 0.2, freq: 'yearly' },
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${site.url}${p.path === '/' ? '' : p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    ...cityContents.map((c) => ({
      url: `${site.url}/area-layanan/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...projects.map((p) => ({
      url: `${site.url}/portofolio/${p.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.modified),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
