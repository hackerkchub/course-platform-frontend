/**
 * Course Platform - Phase 8: Production Readiness (Task A + Task B) Verification Test Suite
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 * Tests all Phase 8 Task B requirements:
 * 1. FreeEnrollButton navigation to /student/dashboard and elimination of /dashboard
 * 2. Unauthenticated login redirect and returnUrl preservation
 * 3. Loading, error, and duplicate submission handling
 * 4. Privacy Policy page existence, metadata, canonical URL, single H1, and verified content
 * 5. Terms of Service page existence, metadata, canonical URL, single H1, and verified content
 * 6. Footer navigation resolving to /privacy and /terms
 * 7. Sitemap and Robots configuration including legal pages
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

describe('Phase 8 - Task B1: Free Enrollment Navigation Fix', () => {
  const buttonPath = path.join(frontendRoot, 'src/components/courses/free-enroll-button.tsx');

  test('free-enroll-button.tsx exists on disk', () => {
    assert.ok(fs.existsSync(buttonPath), 'free-enroll-button.tsx must exist');
  });

  test('free-enroll-button.tsx completely eliminates obsolete /dashboard destinations', () => {
    const content = fs.readFileSync(buttonPath, 'utf8');

    // Must NOT contain push to un-scoped '/dashboard'
    assert.ok(
      !content.includes("router.push('/dashboard')"),
      'Must NOT contain router.push(\'/dashboard\')'
    );
    assert.ok(
      !content.includes('router.push("/dashboard")'),
      'Must NOT contain router.push("/dashboard")'
    );
    assert.ok(
      !content.includes('router.push(`/dashboard`)'),
      'Must NOT contain router.push(`/dashboard`)'
    );
  });

  test('free-enroll-button.tsx correctly navigates to /student/dashboard on enroll success and already-enrolled click', () => {
    const content = fs.readFileSync(buttonPath, 'utf8');

    // Must navigate to /student/dashboard
    const occurrences = (content.match(/router\.push\('\/student\/dashboard'\)/g) || []).length;
    assert.ok(
      occurrences >= 2,
      `Expected at least 2 occurrences of router.push('/student/dashboard'), found ${occurrences}`
    );
  });

  test('free-enroll-button.tsx preserves unauthenticated redirect with returnUrl', () => {
    const content = fs.readFileSync(buttonPath, 'utf8');

    assert.ok(
      content.includes("router.push(`/login?returnUrl=/courses/${courseSlug}`)"),
      'Must redirect unauthenticated user to /login with course returnUrl'
    );
  });

  test('free-enroll-button.tsx preserves duplicate submission prevention and error handling', () => {
    const content = fs.readFileSync(buttonPath, 'utf8');

    assert.ok(content.includes('disabled={loading}'), 'Must disable button while loading');
    assert.ok(content.includes('apiClient.post(API_ENDPOINTS.enrollments.enrollFree(courseId))'), 'Must call enrollFree endpoint');
    assert.ok(content.includes('setErrorMsg('), 'Must capture and display error message on failure');
  });
});

describe('Phase 8 - Task B2: Privacy Policy Page Implementation', () => {
  const privacyPath = path.join(frontendRoot, 'src/app/(public)/privacy/page.tsx');

  test('privacy/page.tsx exists as a Server Component', () => {
    assert.ok(fs.existsSync(privacyPath), 'privacy/page.tsx must exist');

    const content = fs.readFileSync(privacyPath, 'utf8');
    assert.ok(!content.startsWith("'use client'"), 'Privacy policy should be a Server Component');
  });

  test('privacy/page.tsx defines metadata with unique title, description, and canonical URL', () => {
    const content = fs.readFileSync(privacyPath, 'utf8');

    assert.ok(content.includes('generateMetadata'), 'Must export generateMetadata');
    assert.ok(content.includes('Privacy Policy | Course Platform'), 'Title must identify Privacy Policy');
    assert.ok(content.includes('canonical: canonicalUrl'), 'Must set canonical URL');
    assert.ok(content.includes('${siteUrl}/privacy'), 'Canonical URL must use siteUrl/privacy');
    assert.ok(content.includes('openGraph:'), 'Must include Open Graph metadata');
  });

  test('privacy/page.tsx contains exactly one H1 element', () => {
    const content = fs.readFileSync(privacyPath, 'utf8');
    const h1Matches = content.match(/<h1[\s>][\s\S]*?<\/h1>/gi) || [];

    assert.equal(h1Matches.length, 1, `Expected exactly 1 <h1>, found ${h1Matches.length}`);
    assert.ok(h1Matches[0].includes('Privacy Policy'), 'H1 must contain "Privacy Policy"');
  });

  test('privacy/page.tsx reflects verified data practices without fabricated claims', () => {
    const content = fs.readFileSync(privacyPath, 'utf8');

    // Verified platform capabilities
    assert.ok(content.includes('Softmaxs Solution LLP'), 'Must attribute Softmaxs Solution LLP');
    assert.ok(content.includes('Google Account Authentication') || content.includes('Google OAuth'), 'Must describe Google OAuth');
    assert.ok(content.includes('access_token') && content.includes('refresh_token'), 'Must describe JWT auth cookies');
    assert.ok(content.includes('SHA-256'), 'Must describe SHA-256 hashed token storage');
    assert.ok(content.includes('HMAC'), 'Must describe HMAC expiring download links');

    // Content honesty rules: no fake address or registration numbers
    assert.ok(!content.includes('CIN:'), 'Must not invent corporate CIN number');
    assert.ok(!content.includes('GSTIN:'), 'Must not invent fake GSTIN number');
    assert.ok(!content.includes('ISO 27001'), 'Must not invent unverified ISO certification');
  });
});

describe('Phase 8 - Task B3: Terms of Service Page Implementation', () => {
  const termsPath = path.join(frontendRoot, 'src/app/(public)/terms/page.tsx');

  test('terms/page.tsx exists as a Server Component', () => {
    assert.ok(fs.existsSync(termsPath), 'terms/page.tsx must exist');

    const content = fs.readFileSync(termsPath, 'utf8');
    assert.ok(!content.startsWith("'use client'"), 'Terms of service should be a Server Component');
  });

  test('terms/page.tsx defines metadata with unique title, description, and canonical URL', () => {
    const content = fs.readFileSync(termsPath, 'utf8');

    assert.ok(content.includes('generateMetadata'), 'Must export generateMetadata');
    assert.ok(content.includes('Terms of Service | Course Platform'), 'Title must identify Terms of Service');
    assert.ok(content.includes('canonical: canonicalUrl'), 'Must set canonical URL');
    assert.ok(content.includes('${siteUrl}/terms'), 'Canonical URL must use siteUrl/terms');
    assert.ok(content.includes('openGraph:'), 'Must include Open Graph metadata');
  });

  test('terms/page.tsx contains exactly one H1 element', () => {
    const content = fs.readFileSync(termsPath, 'utf8');
    const h1Matches = content.match(/<h1[\s>][\s\S]*?<\/h1>/gi) || [];

    assert.equal(h1Matches.length, 1, `Expected exactly 1 <h1>, found ${h1Matches.length}`);
    assert.ok(h1Matches[0].includes('Terms of Service'), 'H1 must contain "Terms of Service"');
  });

  test('terms/page.tsx reflects verified rules without fabricated guarantees', () => {
    const content = fs.readFileSync(termsPath, 'utf8');

    assert.ok(content.includes('Softmaxs Solution LLP'), 'Must attribute Softmaxs Solution LLP');
    assert.ok(content.includes('Student Code of Conduct'), 'Must outline Code of Conduct');
    assert.ok(content.includes('Intellectual Property'), 'Must describe Intellectual Property');
    assert.ok(content.includes('No Job Guarantees') || content.includes('employment'), 'Must honestly disclose no job guarantee');
    assert.ok(content.includes('Review Moderation'), 'Must describe review moderation');
  });
});

describe('Phase 8 - Task B4: Footer Legal Navigation', () => {
  const footerPath = path.join(frontendRoot, 'src/components/layout/footer.tsx');

  test('footer.tsx links to /privacy and /terms', () => {
    const content = fs.readFileSync(footerPath, 'utf8');

    assert.ok(content.includes('href="/privacy"'), 'Footer must link to /privacy');
    assert.ok(content.includes('href="/terms"'), 'Footer must link to /terms');
  });
});

describe('Phase 8 - Task C & D: Sitemap and Robots SEO Verification', () => {
  const sitemapPath = path.join(frontendRoot, 'src/app/sitemap.ts');
  const robotsPath = path.join(frontendRoot, 'src/app/robots.ts');

  test('sitemap.ts includes /privacy and /terms', () => {
    const content = fs.readFileSync(sitemapPath, 'utf8');

    assert.ok(content.includes('url: `${siteUrl}/privacy`'), 'Sitemap must include /privacy');
    assert.ok(content.includes('url: `${siteUrl}/terms`'), 'Sitemap must include /terms');
  });

  test('robots.ts allows /privacy and /terms while maintaining critical disallow rules', () => {
    const content = fs.readFileSync(robotsPath, 'utf8');

    assert.ok(content.includes("'/privacy'"), 'Robots must allow /privacy');
    assert.ok(content.includes("'/terms'"), 'Robots must allow /terms');
    assert.ok(content.includes("'/admin/'"), 'Robots must disallow /admin/');
    assert.ok(content.includes("'/counsellor/'"), 'Robots must disallow /counsellor/');
    assert.ok(content.includes("'/api/'"), 'Robots must disallow /api/');
    assert.ok(content.includes("'/dashboard/'"), 'Robots must maintain /dashboard/ disallow');
  });
});
