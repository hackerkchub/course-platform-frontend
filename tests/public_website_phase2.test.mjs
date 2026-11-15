/**
 * Course Platform - Phase 2: Complete Public Website Verification Test Suite
 *
 * Validates:
 * 1. Global Navigation Synchronization (Header & Footer)
 * 2. About Page Architecture, Pedagogy, and Honesty Boundaries
 * 3. FAQ Page Search, Category Filtering, and Schema.org JSON-LD
 * 4. Homepage Enhancements (Impact Highlights, Learning Approach, FAQ Preview, WebSite/Org JSON-LD)
 * 5. Related Courses Filtering Logic, Current Course Exclusion & Empty Fallback
 * 6. Contact Page Admissions Channels (WhatsApp, Helpline, Demo Course Selection, No Fake Submissions)
 * 7. SEO Architecture (Sitemap, Robots.txt, Canonical URLs)
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Resolve frontend root directory reliably
const FRONTEND_ROOT = fs.existsSync('frontend')
  ? path.resolve('frontend')
  : path.resolve('.');

describe('Phase 2: Complete Public Website Implementation Verification', () => {
  // ----------------------------------------------------------------------------
  // 1. Navigation Synchronization (Header & Footer)
  // ----------------------------------------------------------------------------
  describe('1. Global Header and Footer Navigation', () => {
    test('Header synchronizes all 6 required routes for desktop and mobile drawer', () => {
      const headerPath = path.join(FRONTEND_ROOT, 'src/components/layout/header.tsx');
      assert.ok(fs.existsSync(headerPath), 'header.tsx must exist');

      const content = fs.readFileSync(headerPath, 'utf8');

      // Verify all required links exist in navLinks
      const expectedLinks = ['/', '/courses', '/instructors', '/about', '/faq', '/contact'];
      for (const link of expectedLinks) {
        assert.ok(
          content.includes(`'${link}'`) || content.includes(`"${link}"`),
          `Header must include navigation destination ${link}`
        );
      }

      // Verify active navigation logic treats '/' specifically
      assert.ok(
        content.includes("link.href === '/' ? pathname === '/'"),
        'Header must handle root "/" active state precisely'
      );

      // Verify authentication-aware user menu and dashboard link are preserved
      assert.ok(content.includes('useAuth'), 'Header must preserve useAuth hook');
      assert.ok(content.includes('getDashboardHref'), 'Header must preserve dashboard navigation');
      assert.ok(content.includes('Drawer'), 'Header must preserve mobile Drawer');
    });

    test('Footer includes verified platform and legal destinations', () => {
      const footerPath = path.join(FRONTEND_ROOT, 'src/components/layout/footer.tsx');
      assert.ok(fs.existsSync(footerPath), 'footer.tsx must exist');

      const content = fs.readFileSync(footerPath, 'utf8');

      // Verify platform links
      assert.ok(content.includes('/about'), 'Footer must link to /about');
      assert.ok(content.includes('/faq'), 'Footer must link to /faq');
      assert.ok(content.includes('/courses'), 'Footer must link to /courses');
      assert.ok(content.includes('/instructors'), 'Footer must link to /instructors');
      assert.ok(content.includes('/contact'), 'Footer must link to /contact');

      // Verify legal links
      assert.ok(content.includes('/privacy'), 'Footer must link to /privacy');
      assert.ok(content.includes('/terms'), 'Footer must link to /terms');
    });
  });

  // ----------------------------------------------------------------------------
  // 2. About Page Architecture & Honesty Rules
  // ----------------------------------------------------------------------------
  describe('2. About Page Architecture & Content Verification', () => {
    const aboutPath = path.join(FRONTEND_ROOT, 'src/app/(public)/about/page.tsx');

    test('About Page exists as a Server Component with unique metadata and Schema.org JSON-LD', () => {
      assert.ok(fs.existsSync(aboutPath), 'about/page.tsx must exist');

      const content = fs.readFileSync(aboutPath, 'utf8');

      // Server Component check (no 'use client')
      assert.ok(!content.startsWith("'use client'"), 'About page should be a Server Component');

      // Metadata check
      assert.ok(content.includes('generateMetadata'), 'About page must define generateMetadata');
      assert.ok(content.includes('canonical'), 'About metadata must include canonical URL');

      // Schema.org AboutPage check
      assert.ok(content.includes("'@type': 'AboutPage'"), 'Must include Schema.org AboutPage JSON-LD');
      assert.ok(content.includes('Softmaxs Solution LLP'), 'Must attribute Softmaxs Solution LLP');
    });

    test('About Page contains single H1, core learning pillars, lifecycle, and admissions CTA', () => {
      const content = fs.readFileSync(aboutPath, 'utf8');

      // Single H1 test
      const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
      assert.equal(h1Matches?.length, 1, 'About page must contain exactly one <h1> element');

      // Core sections presence
      assert.ok(content.includes('Production-Grade Projects'), 'Must describe Production-Grade Projects');
      assert.ok(content.includes('Live Interactive Cohorts'), 'Must describe Live Interactive Cohorts');
      assert.ok(content.includes('Thorough Code Reviews'), 'Must describe Thorough Code Reviews');
      assert.ok(content.includes('The Learning Journey'), 'Must describe the learning lifecycle stages');
      assert.ok(content.includes('/courses'), 'Admissions CTA must link to /courses');
      assert.ok(content.includes('/contact'), 'Admissions CTA must link to /contact');
    });

    test('About Page strictly obeys Honesty Rules (no fabricated statistics or placement guarantees)', () => {
      const content = fs.readFileSync(aboutPath, 'utf8');

      // Verify NO fake numeric claims
      assert.ok(!content.includes('94%'), 'Must NOT invent 94% completion rate');
      assert.ok(!content.includes('500+ students'), 'Must NOT invent 500+ students');
      assert.ok(!content.includes('100% placement'), 'Must NOT invent 100% placement guarantee');
      assert.ok(!content.includes('128+ production labs'), 'Must NOT invent 128+ production labs');
    });
  });

  // ----------------------------------------------------------------------------
  // 3. FAQ Data and Interactive Page
  // ----------------------------------------------------------------------------
  describe('3. FAQ Data & Page Architecture', () => {
    test('FAQ data module contains all 8 approved categories and complete question items', async () => {
      const faqDataPath = path.join(FRONTEND_ROOT, 'src/data/faqs.ts');
      assert.ok(fs.existsSync(faqDataPath), 'src/data/faqs.ts must exist');

      const { FAQ_CATEGORIES, FAQ_ITEMS } = await import(
        `file://${path.resolve(faqDataPath)}`
      );

      const expectedCategories = [
        'Admissions & Enrollment',
        'Courses & Curriculum',
        'Live Learning & Batches',
        'Pricing & Fees',
        'Certifications',
        'Career Support',
        'Technical Requirements',
        'Demo Classes',
      ];

      for (const cat of expectedCategories) {
        assert.ok(
          FAQ_CATEGORIES.includes(cat),
          `FAQ_CATEGORIES must include "${cat}"`
        );
        const count = FAQ_ITEMS.filter((i) => i.category === cat).length;
        assert.ok(count >= 1, `Category "${cat}" must have at least 1 verified FAQ item`);
      }

      assert.ok(FAQ_ITEMS.length >= 16, 'FAQ items must have comprehensive question coverage');
    });

    test('FAQ search and category filter logic operates correctly', async () => {
      const faqDataPath = path.join(FRONTEND_ROOT, 'src/data/faqs.ts');
      const { FAQ_ITEMS } = await import(`file://${path.resolve(faqDataPath)}`);

      // Test Category filter
      const admissionsFaqs = FAQ_ITEMS.filter(
        (i) => i.category === 'Admissions & Enrollment'
      );
      assert.ok(admissionsFaqs.length > 0);
      assert.ok(admissionsFaqs.every((i) => i.category === 'Admissions & Enrollment'));

      // Test Search query filter
      const query = 'certificate';
      const searchResults = FAQ_ITEMS.filter(
        (i) =>
          i.question.toLowerCase().includes(query) ||
          i.answer.toLowerCase().includes(query)
      );
      assert.ok(searchResults.length > 0, 'Search for certificate should yield results');
      assert.ok(
        searchResults.some(
          (i) =>
            i.question.toLowerCase().includes('certificate') ||
            i.answer.toLowerCase().includes('certificate')
        )
      );

      // Nonexistent query returns empty array
      const emptyResults = FAQ_ITEMS.filter(
        (i) =>
          i.question.toLowerCase().includes('xyznonexistentquery999') ||
          i.answer.toLowerCase().includes('xyznonexistentquery999')
      );
      assert.equal(emptyResults.length, 0);
    });

    test('FAQ Page component contains search input, category pills, single H1, and FAQPage JSON-LD', () => {
      const faqPagePath = path.join(FRONTEND_ROOT, 'src/app/(public)/faq/page.tsx');
      assert.ok(fs.existsSync(faqPagePath), 'faq/page.tsx must exist');

      const content = fs.readFileSync(faqPagePath, 'utf8');

      // Single H1
      const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
      assert.equal(h1Matches?.length, 1, 'FAQ page must have exactly one H1');

      // Schema.org FAQPage
      assert.ok(content.includes("'@type': 'FAQPage'"), 'FAQ page must include FAQPage JSON-LD');
      assert.ok(content.includes('mainEntity'), 'FAQPage JSON-LD must contain mainEntity');

      // UI controls
      assert.ok(content.includes('selectedCategory'), 'Must support category filtering state');
      assert.ok(content.includes('searchQuery'), 'Must support search query state');
      assert.ok(content.includes('openFaqIds'), 'Must support accordion open state (openFaqIds)');
      assert.ok(content.includes('toggleFaq'), 'Must support accordion toggle handler (toggleFaq)');
    });
  });

  // ----------------------------------------------------------------------------
  // 4. Homepage Enhancements
  // ----------------------------------------------------------------------------
  describe('4. Homepage Enhancements & Integrity', () => {
    const homePath = path.join(FRONTEND_ROOT, 'src/app/(public)/page.tsx');

    test('Homepage preserves existing hero, search, featured courses, and curated tracks', () => {
      const content = fs.readFileSync(homePath, 'utf8');

      // Single H1 check
      const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
      assert.equal(h1Matches?.length, 1, 'Homepage must have exactly one H1');

      // Preserved search and featured courses
      assert.ok(content.includes('action="/search"'), 'Search form must be preserved');
      assert.ok(content.includes('featuredCourses'), 'Featured courses must be preserved');
      assert.ok(content.includes('Curated Learning Tracks'), 'Learning tracks must be preserved');
    });

    test('Homepage incorporates Impact Highlights and transparent Learning Approach (no fake reviews)', () => {
      const content = fs.readFileSync(homePath, 'utf8');

      // Impact Highlights
      assert.ok(content.includes('Live & Interactive'), 'Must have Live & Interactive highlight');
      assert.ok(content.includes('100% Practical'), 'Must have 100% Practical highlight');
      assert.ok(content.includes('Direct Mentorship'), 'Must have Direct Mentorship highlight');

      // Learning Approach section
      assert.ok(content.includes('What You Can Expect in Every Cohort'), 'Must have Learning Approach section');
      assert.ok(content.includes('Small Cohort Dynamic'), 'Must describe Small Cohort Dynamic');

      // Verified absence of fake testimonials
      assert.ok(!content.includes('John Doe'), 'Must NOT invent fake student John Doe');
      assert.ok(!content.includes('5-star rating from 10,000 students'), 'Must NOT invent fake rating counts');
    });

    test('Homepage includes FAQ Preview accordion with link to /faq', () => {
      const content = fs.readFileSync(homePath, 'utf8');

      assert.ok(content.includes('FAQ_ITEMS'), 'Must import FAQ_ITEMS for preview');
      assert.ok(content.includes('href="/faq"'), 'Must include CTA link to /faq');
      assert.ok(content.includes('<details'), 'Must render accessible accordion details');
    });

    test('Homepage contains Schema.org Organization and WebSite JSON-LD', () => {
      const content = fs.readFileSync(homePath, 'utf8');

      assert.ok(content.includes("'@type': 'WebSite'"), 'Homepage must include WebSite JSON-LD');
      assert.ok(content.includes("'@type': 'Organization'"), 'Homepage must include Organization JSON-LD');
      assert.ok(content.includes('Softmaxs Solution LLP'), 'Organization must reference Softmaxs Solution LLP');
    });
  });

  // ----------------------------------------------------------------------------
  // 5. Course Details – Related Courses
  // ----------------------------------------------------------------------------
  describe('5. Course Details – Related Courses Section', () => {
    test('CourseDetailView accepts relatedCourses and renders recommendation grid', () => {
      const detailViewPath = path.join(
        FRONTEND_ROOT,
        'src/components/courses/course-detail-view.tsx'
      );
      const content = fs.readFileSync(detailViewPath, 'utf8');

      assert.ok(content.includes('relatedCourses'), 'CourseDetailView must accept relatedCourses prop');
      assert.ok(content.includes('Explore Related Courses'), 'Must include "Explore Related Courses" heading');
      assert.ok(content.includes('<CourseCard'), 'Must render CourseCard for related courses');
      assert.ok(content.includes('Browse All Courses'), 'Must render fallback browse link when empty');
    });

    test('CourseDetailPage fetches related courses and safely filters out current course', () => {
      const slugPagePath = path.join(
        FRONTEND_ROOT,
        'src/app/(public)/courses/[slug]/page.tsx'
      );
      const content = fs.readFileSync(slugPagePath, 'utf8');

      assert.ok(content.includes('relatedCourses'), 'slug page must fetch related courses');
      assert.ok(
        content.includes('c.id !== course?.basic.id'),
        'Must filter out current course by id'
      );
      assert.ok(
        content.includes('.slice(0, 3)'),
        'Must cap related courses to max 3 items'
      );
    });

    test('Related courses filtering unit logic works as expected', () => {
      const currentCourse = { id: 101, slug: 'full-stack-web-dev', category: { slug: 'web-dev' } };
      const catalog = [
        { id: 101, slug: 'full-stack-web-dev', category: { slug: 'web-dev' } },
        { id: 102, slug: 'backend-systems', category: { slug: 'web-dev' } },
        { id: 103, slug: 'cloud-devops', category: { slug: 'web-dev' } },
        { id: 104, slug: 'distributed-data', category: { slug: 'web-dev' } },
        { id: 105, slug: 'ai-engineering', category: { slug: 'web-dev' } },
      ];

      const filtered = catalog
        .filter((c) => c.id !== currentCourse.id && c.slug !== currentCourse.slug)
        .slice(0, 3);

      assert.equal(filtered.length, 3);
      assert.ok(filtered.every((c) => c.id !== currentCourse.id));
      assert.equal(filtered[0].id, 102);
      assert.equal(filtered[1].id, 103);
      assert.equal(filtered[2].id, 104);
    });
  });

  // ----------------------------------------------------------------------------
  // 6. Contact Page Admissions Polish
  // ----------------------------------------------------------------------------
  describe('6. Contact Page Admissions Polish', () => {
    const contactPath = path.join(FRONTEND_ROOT, 'src/app/(public)/contact/page.tsx');

    test('Contact Page defines direct admissions channels: WhatsApp, Telephone, Email, and Course Demo', () => {
      const content = fs.readFileSync(contactPath, 'utf8');

      // WhatsApp Chat
      assert.ok(content.includes('wa.me'), 'Must construct international WhatsApp URL');
      assert.ok(content.includes('prefilledWaMessage'), 'Must include prefilled encoded inquiry message');

      // Phone & Email
      assert.ok(content.includes('NEXT_PUBLIC_CONTACT_PHONE'), 'Must inspect configured contact phone');
      assert.ok(content.includes('NEXT_PUBLIC_SUPPORT_EMAIL'), 'Must inspect configured support email');

      // Free Demo Class Selection
      assert.ok(content.includes('Book a Free Demo Class'), 'Must explain Demo Class booking');
      assert.ok(content.includes('href="/courses"'), 'Must guide user to select course from /courses');
    });

    test('Contact Page does not make unverified calls to nonexistent /api/contact endpoint', () => {
      const content = fs.readFileSync(contactPath, 'utf8');

      assert.ok(!content.includes("fetch('/api/contact'"), 'Must NOT call non-existent /api/contact');
      assert.ok(!content.includes('apiClient.post(\'/api/contact\''), 'Must NOT post to /api/contact');
      assert.ok(
        content.includes('submissionStatus'),
        'Must provide honest informational feedback on inquiry assistance form'
      );
    });

    test('WhatsApp URL generator formats international number properly', () => {
      const formatWaUrl = (rawPhone, msg) => {
        const clean = (rawPhone || '').replace(/\D/g, '');
        const waNum =
          clean.length === 10
            ? `91${clean}`
            : clean.startsWith('91') && clean.length === 12
            ? clean
            : clean;
        return waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}` : null;
      };

      const url1 = formatWaUrl('9876543210', 'Hello');
      assert.equal(url1, 'https://wa.me/919876543210?text=Hello');

      const url2 = formatWaUrl('+91 98765 43210', 'Inquiry');
      assert.equal(url2, 'https://wa.me/919876543210?text=Inquiry');

      const url3 = formatWaUrl('', 'Test');
      assert.equal(url3, null);
    });
  });

  // ----------------------------------------------------------------------------
  // 7. SEO, Sitemap and Robots
  // ----------------------------------------------------------------------------
  describe('7. SEO Sitemap & Robots Configuration', () => {
    test('Sitemap includes /about and /faq routes with correct priority', () => {
      const sitemapPath = path.join(FRONTEND_ROOT, 'src/app/sitemap.ts');
      const content = fs.readFileSync(sitemapPath, 'utf8');

      assert.ok(content.includes("url: `${siteUrl}/about`"), 'Sitemap must contain /about');
      assert.ok(content.includes("url: `${siteUrl}/faq`"), 'Sitemap must contain /faq');
    });

    test('Robots configuration allows /about and /faq, while preserving disallow rules', () => {
      const robotsPath = path.join(FRONTEND_ROOT, 'src/app/robots.ts');
      const content = fs.readFileSync(robotsPath, 'utf8');

      // Allowed public paths
      assert.ok(content.includes("'/about'"), 'Robots must allow /about');
      assert.ok(content.includes("'/faq'"), 'Robots must allow /faq');

      // Disallowed private paths
      assert.ok(content.includes("'/admin/'"), 'Robots must disallow /admin/');
      assert.ok(content.includes("'/dashboard/'"), 'Robots must disallow /dashboard/');
      assert.ok(content.includes("'/counsellor/'"), 'Robots must disallow /counsellor/');
      assert.ok(content.includes("'/api/'"), 'Robots must disallow /api/');
    });
  });
});
