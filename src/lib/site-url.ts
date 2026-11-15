/**
 * Resolves the canonical base URL for SEO metadata, sitemaps, robots.txt, and canonical links.
 * 
 * Production Safety Rules:
 * 1. If NEXT_PUBLIC_SITE_URL is explicitly set and not localhost, use it (stripping trailing slash).
 * 2. In production (NODE_ENV === 'production'):
 *    - Logs a configuration warning if NEXT_PUBLIC_SITE_URL is missing or contains localhost.
 * 3. In local development / test:
 *    - Falls back to http://localhost:3000 safely.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (configured && !configured.includes('localhost')) {
    return configured.replace(/\/+$/, '');
  }

  if (isProd) {
    if (!configured || configured.includes('localhost')) {
      // Safe build-time and server-side warning without crashing the process
      if (typeof window === 'undefined') {
        console.warn(
          '\n⚠️ [SEO CONFIG WARNING] NEXT_PUBLIC_SITE_URL is missing or set to localhost in production mode.\n' +
          'Production canonical URLs, sitemap.xml, and robots.txt require a verified production domain.\n' +
          'Please configure NEXT_PUBLIC_SITE_URL in your production environment variables.\n'
        );
      }
    }
  }

  return (configured || 'http://localhost:3000').replace(/\/+$/, '');
}

export default getSiteUrl;
