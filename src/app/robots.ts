import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** robots.txt valid — PRD §12 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/preview',
          '/terima-kasih',
          '/*?utm_*',
          '/*?gclid=',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
