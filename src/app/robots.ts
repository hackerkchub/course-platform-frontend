import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/courses',
          '/courses/*',
          '/categories',
          '/categories/*',
          '/instructors',
          '/instructors/*',
          '/about',
          '/faq',
          '/contact',
          '/search',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/counsellor/',
          '/unauthorized',
          '/login',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
