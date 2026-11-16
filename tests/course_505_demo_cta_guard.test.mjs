import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

describe('Course 505 Demo Settings UI & CTA Guard Frontend Unit Tests', () => {
  test('1. admin-courses.ts exports getDemoSettings and updateDemoSettings', async () => {
    const filePath = path.resolve('frontend/src/lib/api/admin-courses.ts');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(content.includes('getDemoSettings('), 'adminCoursesApi must define getDemoSettings');
    assert.ok(content.includes('updateDemoSettings('), 'adminCoursesApi must define updateDemoSettings');
    assert.ok(content.includes('API_ENDPOINTS.demo.adminSettings('), 'Must call API_ENDPOINTS.demo.adminSettings');
  });

  test('2. admin-course.ts exports AdminDemoSettings and UpdateDemoSettingsPayload', async () => {
    const filePath = path.resolve('frontend/src/types/admin-course.ts');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(content.includes('export interface AdminDemoSettings'), 'Must export AdminDemoSettings');
    assert.ok(content.includes('export interface UpdateDemoSettingsPayload'), 'Must export UpdateDemoSettingsPayload');
    assert.ok(content.includes("allowed_demo_types?: ('live' | 'recorded')[];"), 'Must type allowed_demo_types');
    assert.ok(content.includes('requires_approval: boolean;'), 'Must type requires_approval');
  });

  test('3. Course Editor includes Demo Class Settings sub-tab in STEP_3_TABS', async () => {
    const filePath = path.resolve('frontend/src/app/(admin)/admin/courses/[id]/edit/page.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(
      content.includes("{ id: 'demo', label: 'Demo Class Settings' }"),
      'STEP_3_TABS must include Demo Class Settings'
    );
  });

  test('4. Course Editor includes all required form controls for demo settings', async () => {
    const filePath = path.resolve('frontend/src/app/(admin)/admin/courses/[id]/edit/page.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    // Controls
    assert.ok(content.includes('Enable Demo Class'), 'Must have Enable Demo Class toggle');
    assert.ok(content.includes('Enable Student Demo Requests'), 'Must have Enable Student Demo Requests toggle');
    assert.ok(content.includes('Live Interactive Demo (Instructor-led)'), 'Must have Live demo checkbox');
    assert.ok(content.includes('Recorded Demo Overview (Self-paced)'), 'Must have Recorded demo checkbox');
    assert.ok(content.includes('Admin / Counsellor Approval Required'), 'Must have Admin Approval Required toggle');
    assert.ok(content.includes('Currently Accepting New Requests'), 'Must have Accepting Requests toggle');
    assert.ok(content.includes('Demo Duration (Minutes)'), 'Must have Demo Duration selector');
    assert.ok(content.includes('Meeting Platform'), 'Must have Meeting Platform input');
    assert.ok(content.includes('Max Requests Per Slot'), 'Must have Max Requests input');
    assert.ok(content.includes('handleSaveDemoSettings'), 'Must have handleSaveDemoSettings handler');
  });

  test('5. Course Detail View implements CTA Guard for desktop and mobile', async () => {
    const filePath = path.resolve('frontend/src/components/courses/course-detail-view.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    // Logic condition
    assert.ok(
      content.includes('const isDemoAvailable = Boolean(course.demo?.demo_enabled && course.demo?.demo_request_enabled);'),
      'Must define isDemoAvailable based on course.demo flags'
    );

    // Desktop CTA guard
    assert.ok(
      content.includes('isFree ? ('),
      'Desktop CTA must handle isFree'
    );
    assert.ok(
      content.includes(': isDemoAvailable ? ('),
      'Desktop CTA must check isDemoAvailable'
    );
    assert.ok(
      content.includes('Book Free Demo Class'),
      'Desktop CTA must show Book Free Demo Class when demo enabled'
    );
    assert.ok(
      content.includes('Enquire About Course'),
      'Desktop CTA must fall back to Enquire About Course when demo disabled'
    );

    // Mobile CTA guard
    assert.ok(
      content.includes('Book Demo'),
      'Mobile CTA must show Book Demo when demo enabled'
    );
    assert.ok(
      content.includes('Enquire Now'),
      'Mobile CTA must fall back to Enquire Now when demo disabled'
    );
    assert.ok(
      content.includes('/contact?course='),
      'Fallback CTAs must route to /contact?course='
    );
  });

  test('6. CTA Guard pure logic evaluation: free, paid with demo, paid without demo, null demo', () => {
    // Pure logic simulation of course-detail-view.tsx rules
    function resolveCTA(course) {
      const isFree = Boolean(course.pricing?.is_free) || course.pricing?.price === 0;
      const isDemoAvailable = Boolean(course.demo?.demo_enabled && course.demo?.demo_request_enabled);

      if (isFree) return 'FREE_ENROLL';
      if (isDemoAvailable) return 'BOOK_DEMO';
      return 'ENQUIRE_COURSE';
    }

    // Case 1: Free Course
    const freeCourse = {
      pricing: { is_free: 1, price: 0 },
      demo: { demo_enabled: true, demo_request_enabled: true },
    };
    assert.strictEqual(resolveCTA(freeCourse), 'FREE_ENROLL', 'Free course must show FREE_ENROLL regardless of demo');

    // Case 2: Paid Course with Demo Enabled (e.g. Course 505)
    const paidDemoCourse = {
      pricing: { is_free: 0, price: 4999 },
      demo: { demo_enabled: true, demo_request_enabled: true },
    };
    assert.strictEqual(resolveCTA(paidDemoCourse), 'BOOK_DEMO', 'Paid course with demo enabled must show BOOK_DEMO');

    // Case 3: Paid Course with Demo Disabled
    const paidNoDemoCourse = {
      pricing: { is_free: 0, price: 4999 },
      demo: { demo_enabled: false, demo_request_enabled: false },
    };
    assert.strictEqual(resolveCTA(paidNoDemoCourse), 'ENQUIRE_COURSE', 'Paid course with demo disabled must show ENQUIRE_COURSE');

    // Case 4: Paid Course with null/missing demo settings
    const paidNullDemoCourse = {
      pricing: { is_free: 0, price: 4999 },
      demo: null,
    };
    assert.strictEqual(resolveCTA(paidNullDemoCourse), 'ENQUIRE_COURSE', 'Paid course with null demo must fall back to ENQUIRE_COURSE');

    // Case 5: Paid Course with demo_enabled=true but demo_request_enabled=false
    const paidPartialDemoCourse = {
      pricing: { is_free: 0, price: 4999 },
      demo: { demo_enabled: true, demo_request_enabled: false },
    };
    assert.strictEqual(resolveCTA(paidPartialDemoCourse), 'ENQUIRE_COURSE', 'Partial demo flags must fall back to ENQUIRE_COURSE');
  });
});
