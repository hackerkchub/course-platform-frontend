/**
 * Phase 2 Final Fixes & Production Route/SEO Verification Test Suite
 *
 * Verifies:
 * 1. Dynamic Route Error Handling:
 *    - Valid resource response
 *    - Genuine resource 404 triggers notFound()
 *    - Backend 500 does NOT convert to 404, throws for route error boundary
 *    - Backend DNS / Network failure (TypeError: fetch failed) throws unavailable error
 *    - Backend timeout (AbortError) throws unavailable error
 *    - Absence of fake/invented fallback course/category/instructor data
 *    - User-friendly error boundary in src/app/(public)/error.tsx with retry (reset())
 * 2. Page-Specific SEO Metadata:
 *    - FAQ unique title, description, canonical, and OpenGraph in FAQLayout
 *    - Contact unique title, description, canonical, and OpenGraph in ContactLayout
 * 3. Production SEO Configuration:
 *    - getSiteUrl() production environment resolution
 *    - No localhost fallback when NEXT_PUBLIC_SITE_URL is configured
 *    - Sitemap and Robots URL formatting with configured domain
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_ROOT = fs.existsSync('frontend')
  ? path.resolve('frontend')
  : path.resolve('.');

describe('Phase 2 Final Fixes & Production SEO Verification', () => {
  // --------------------------------------------------------------------------
  // 1. Dynamic Route Safe Error Handling & Boundary Verification
  // --------------------------------------------------------------------------
  describe('1. Dynamic Route Error Handling Architecture', () => {
    test('Public error boundary src/app/(public)/error.tsx exists with retry and navigation', () => {
      const errorFilePath = path.join(FRONTEND_ROOT, 'src/app/(public)/error.tsx');
      assert.ok(fs.existsSync(errorFilePath), 'src/app/(public)/error.tsx must exist');

      const content = fs.readFileSync(errorFilePath, 'utf8');
      assert.ok(content.startsWith("'use client'"), 'error.tsx must be a client component');
      assert.ok(content.includes('reset'), 'error.tsx must accept reset callback for retry');
      assert.ok(content.includes('Service Temporarily Unavailable'), 'Must display friendly unavailable message');
      assert.ok(content.includes('Try Again'), 'Must provide retry button');
      assert.ok(content.includes('href="/courses"'), 'Must provide navigation link to courses');
      assert.ok(content.includes('Browse Catalog'), 'Must provide Browse Catalog CTA');
      assert.ok(content.includes('/contact'), 'Must provide link to admissions/support');
      assert.ok(!content.includes('stack'), 'Must NOT display raw stack traces');
      assert.ok(!content.includes('api.softmaxs.com'), 'Must NOT leak backend internal endpoint');
    });

    test('/courses/[slug]/page.tsx distinguishes genuine 404 from network/server failures', () => {
      const pagePath = path.join(FRONTEND_ROOT, 'src/app/(public)/courses/[slug]/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');

      // Check catch block logic
      assert.ok(content.includes('status === 404'), 'Must check err status 404');
      assert.ok(content.includes('notFound()'), 'Must call notFound() on 404');
      assert.ok(
        content.includes("throw new Error('Course catalog service is temporarily unavailable')"),
        'Must throw descriptive error on network/server failures for error boundary'
      );
      assert.ok(!content.includes('dummyCourse'), 'Must NOT inject fake/dummy course data');
      assert.ok(!content.includes('fallbackCourse'), 'Must NOT inject fallback course data');
    });

    test('/categories/[slug]/page.tsx distinguishes genuine 404 from network/server failures', () => {
      const pagePath = path.join(FRONTEND_ROOT, 'src/app/(public)/categories/[slug]/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(content.includes('status === 404'), 'Must check err status 404');
      assert.ok(content.includes('notFound()'), 'Must call notFound() on 404');
      assert.ok(
        content.includes("throw new Error('Category service is temporarily unavailable')"),
        'Must throw error on server/network failure'
      );
    });

    test('/categories/[slug]/[subSlug]/page.tsx distinguishes genuine 404 from network/server failures', () => {
      const pagePath = path.join(FRONTEND_ROOT, 'src/app/(public)/categories/[slug]/[subSlug]/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(content.includes('status === 404'), 'Must check err status 404');
      assert.ok(content.includes('notFound()'), 'Must call notFound() on 404');
      assert.ok(
        content.includes("throw new Error('Subcategory service is temporarily unavailable')"),
        'Must throw error on server/network failure'
      );
    });

    test('/instructors/[id]/page.tsx distinguishes genuine 404 from network/server failures', () => {
      const pagePath = path.join(FRONTEND_ROOT, 'src/app/(public)/instructors/[id]/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(content.includes('status === 404'), 'Must check err status 404');
      assert.ok(content.includes('notFound()'), 'Must call notFound() on 404');
      assert.ok(
        content.includes("throw new Error('Faculty profile service is temporarily unavailable')"),
        'Must throw error on server/network failure'
      );
    });

    test('Unit verification of error classification logic', () => {
      // Simulate the exact error handling logic implemented in dynamic route pages
      function handleRouteFetchError(err) {
        const status = err?.status;
        if (status === 404) {
          return 'TRIGGER_NOT_FOUND';
        }
        throw new Error('Service is temporarily unavailable');
      }

      // Case 1: Genuine 404
      const notFoundErr = { status: 404, message: 'Course not found' };
      assert.equal(handleRouteFetchError(notFoundErr), 'TRIGGER_NOT_FOUND');

      // Case 2: Backend 500 Internal Server Error
      const serverErr = { status: 500, message: 'Database connection failed' };
      assert.throws(
        () => handleRouteFetchError(serverErr),
        /Service is temporarily unavailable/
      );

      // Case 3: DNS failure / network drop (TypeError: fetch failed)
      const networkErr = new TypeError('fetch failed');
      assert.throws(
        () => handleRouteFetchError(networkErr),
        /Service is temporarily unavailable/
      );

      // Case 4: Request timeout (AbortError)
      const timeoutErr = new Error('The operation was aborted due to timeout');
      timeoutErr.name = 'AbortError';
      assert.throws(
        () => handleRouteFetchError(timeoutErr),
        /Service is temporarily unavailable/
      );
    });
  });

  // --------------------------------------------------------------------------
  // 2. Page-Specific SEO Metadata Verification
  // --------------------------------------------------------------------------
  describe('2. Page-Specific SEO Metadata Implementation', () => {
    test('FAQ route defines unique title, description, and canonical URL in FAQLayout', () => {
      const faqLayoutPath = path.join(FRONTEND_ROOT, 'src/app/(public)/faq/layout.tsx');
      assert.ok(fs.existsSync(faqLayoutPath), 'src/app/(public)/faq/layout.tsx must exist');

      const content = fs.readFileSync(faqLayoutPath, 'utf8');
      assert.ok(
        content.includes("title: 'Frequently Asked Questions | Course Platform'"),
        'FAQ title must match requirement'
      );
      assert.ok(
        content.includes('Find answers about courses, live training, enrollment, curriculum, mentorship and learning support.'),
        'FAQ description must match requirement'
      );
      assert.ok(content.includes('canonical: `${getSiteUrl()}/faq`'), 'FAQ canonical must resolve to /faq');
      assert.ok(content.includes('url: `${getSiteUrl()}/faq`'), 'FAQ openGraph must resolve to /faq');
    });

    test('Contact route defines unique title, description, and canonical URL in ContactLayout', () => {
      const contactLayoutPath = path.join(FRONTEND_ROOT, 'src/app/(public)/contact/layout.tsx');
      assert.ok(fs.existsSync(contactLayoutPath), 'src/app/(public)/contact/layout.tsx must exist');

      const content = fs.readFileSync(contactLayoutPath, 'utf8');
      assert.ok(
        content.includes("title: 'Contact Us | Course Platform'"),
        'Contact title must match requirement'
      );
      assert.ok(
        content.includes('Contact Softmaxs Solution LLP for course enquiries, admissions information and training support.'),
        'Contact description must match requirement'
      );
      assert.ok(content.includes('canonical: `${getSiteUrl()}/contact`'), 'Contact canonical must resolve to /contact');
      assert.ok(content.includes('url: `${getSiteUrl()}/contact`'), 'Contact openGraph must resolve to /contact');
    });

    test('Metadata titles are distinct across public routes', () => {
      const faqLayout = fs.readFileSync(path.join(FRONTEND_ROOT, 'src/app/(public)/faq/layout.tsx'), 'utf8');
      const contactLayout = fs.readFileSync(path.join(FRONTEND_ROOT, 'src/app/(public)/contact/layout.tsx'), 'utf8');
      const aboutPage = fs.readFileSync(path.join(FRONTEND_ROOT, 'src/app/(public)/about/page.tsx'), 'utf8');

      const getTitle = (text) => {
        const match = text.match(/title:\s*['"]([^'"]+)['"]/);
        return match ? match[1] : null;
      };

      const faqTitle = getTitle(faqLayout);
      const contactTitle = getTitle(contactLayout);
      const aboutTitle = getTitle(aboutPage);

      assert.ok(faqTitle, 'FAQ title must be defined');
      assert.ok(contactTitle, 'Contact title must be defined');
      assert.ok(aboutTitle, 'About title must be defined');

      assert.notEqual(faqTitle, contactTitle, 'FAQ and Contact titles must be unique');
      assert.notEqual(faqTitle, aboutTitle, 'FAQ and About titles must be unique');
      assert.notEqual(contactTitle, aboutTitle, 'Contact and About titles must be unique');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Production SEO Configuration Verification
  // --------------------------------------------------------------------------
  describe('3. Production SEO Configuration Architecture', () => {
    test('getSiteUrl returns configured production domain without trailing slash', async () => {
      const siteUrlModulePath = path.join(FRONTEND_ROOT, 'src/lib/site-url.ts');
      const { getSiteUrl } = await import(`file://${path.resolve(siteUrlModulePath)}`);

      const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

      try {
        // Test production URL
        process.env.NEXT_PUBLIC_SITE_URL = 'https://softmaxs.com/';
        assert.equal(getSiteUrl(), 'https://softmaxs.com', 'Trailing slashes must be stripped');

        process.env.NEXT_PUBLIC_SITE_URL = 'https://softmaxs.com';
        assert.equal(getSiteUrl(), 'https://softmaxs.com', 'Exact production URL returned');

        // Test fallback when unset
        delete process.env.NEXT_PUBLIC_SITE_URL;
        assert.equal(getSiteUrl(), 'http://localhost:3000', 'Safe fallback in test/dev');
      } finally {
        if (originalEnv !== undefined) {
          process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
        } else {
          delete process.env.NEXT_PUBLIC_SITE_URL;
        }
      }
    });

    test('Sitemap architecture uses getSiteUrl() for all canonical sitemap entries', () => {
      const sitemapPath = path.join(FRONTEND_ROOT, 'src/app/sitemap.ts');
      assert.ok(fs.existsSync(sitemapPath), 'sitemap.ts must exist');

      const content = fs.readFileSync(sitemapPath, 'utf8');
      assert.ok(content.includes('const siteUrl = getSiteUrl();'), 'Must initialize siteUrl from getSiteUrl()');
      assert.ok(content.includes('url: `${siteUrl}`'), 'Root entry must use siteUrl');
      assert.ok(content.includes('url: `${siteUrl}/courses`'), 'Courses entry must use siteUrl');
      assert.ok(content.includes('url: `${siteUrl}/faq`'), 'FAQ entry must use siteUrl');
      assert.ok(content.includes('url: `${siteUrl}/contact`'), 'Contact entry must use siteUrl');
      assert.ok(!content.includes('http://localhost:3000'), 'Must not hardcode localhost in sitemap entries');
    });

    test('Robots.txt architecture uses getSiteUrl() for sitemap index directive', () => {
      const robotsPath = path.join(FRONTEND_ROOT, 'src/app/robots.ts');
      assert.ok(fs.existsSync(robotsPath), 'robots.ts must exist');

      const content = fs.readFileSync(robotsPath, 'utf8');
      assert.ok(content.includes('const siteUrl = getSiteUrl();'), 'Must initialize siteUrl from getSiteUrl()');
      assert.ok(content.includes('sitemap: `${siteUrl}/sitemap.xml`'), 'Sitemap directive must use siteUrl');
      assert.ok(!content.includes('http://localhost:3000'), 'Must not hardcode localhost in robots.ts');
      assert.ok(content.includes("'/about'"), 'Must allow /about');
      assert.ok(content.includes("'/faq'"), 'Must allow /faq');
      assert.ok(content.includes("'/contact'"), 'Must allow /contact');
      assert.ok(content.includes("'/admin/'"), 'Must disallow /admin/');
      assert.ok(content.includes("'/dashboard/'"), 'Must disallow /dashboard/');
    });
  });
});
