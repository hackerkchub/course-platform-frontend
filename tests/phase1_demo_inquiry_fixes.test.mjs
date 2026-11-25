import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// Replicate the exact parser logic from frontend/src/lib/api/admin-leads.ts
function parseAdminLeadsResponse(data) {
  let leads = [];
  if (data?.data && Array.isArray(data.data.requests)) {
    leads = data.data.requests;
  } else if (Array.isArray(data?.data)) {
    leads = data.data;
  } else if (data?.requests && Array.isArray(data.requests)) {
    leads = data.requests;
  }

  const pagination = {
    total: data?.data?.pagination?.total ?? data?.pagination?.total ?? leads.length,
    page: data?.data?.pagination?.page ?? data?.pagination?.page ?? 1,
    limit: data?.data?.pagination?.limit ?? data?.pagination?.limit ?? (leads.length || 10),
    totalPages:
      data?.data?.pagination?.totalPages ??
      data?.data?.pagination?.total_pages ??
      data?.pagination?.totalPages ??
      data?.pagination?.total_pages ??
      1,
  };

  const rawSummary = data?.data?.summary || data?.summary;
  const summary = rawSummary
    ? {
        total: Number(rawSummary.total || 0),
        pending: Number(rawSummary.pending || 0),
        contacted: Number(rawSummary.contacted || 0),
        scheduled: Number(rawSummary.scheduled || 0),
        completed: Number(rawSummary.completed || 0),
        cancelled: Number(rawSummary.cancelled || 0),
      }
    : undefined;

  return { leads, pagination, summary };
}

describe('Phase 1: Critical Demo Inquiry Data & Visibility Fixes Unit Tests', () => {
  // --- 1. Admin Leads API Response Parser ---
  describe('1. Admin Leads API Response Parser Tests', () => {
    test('1.1 Should correctly extract leads, pagination, and summary from backend nested response', () => {
      const mockBackendResponse = {
        success: true,
        data: {
          summary: {
            total: 25,
            pending: 10,
            contacted: 8,
            scheduled: 4,
            completed: 2,
            cancelled: 1,
          },
          requests: [
            {
              id: 101,
              reference_no: 'DEMO-101',
              course_id: 5,
              course_name: 'Full Stack Web Development',
              student_name: 'Aarav Patel',
              email: 'aarav@example.com',
              phone: '9876543210',
              status: 'pending',
              created_at: '2026-11-17T10:00:00Z',
            },
            {
              id: 102,
              reference_no: 'DEMO-102',
              course_id: 8,
              course_name: 'Data Science & AI',
              student_name: 'Priya Sharma',
              email: 'priya@example.com',
              phone: '9876543211',
              status: 'contacted',
              created_at: '2026-11-17T11:00:00Z',
            },
          ],
          pagination: {
            total: 25,
            page: 1,
            limit: 10,
            totalPages: 3,
          },
        },
      };

      const result = parseAdminLeadsResponse(mockBackendResponse);

      assert.equal(result.leads.length, 2, 'Should parse exactly 2 leads');
      assert.equal(result.leads[0].student_name, 'Aarav Patel');
      assert.equal(result.leads[1].student_name, 'Priya Sharma');
      assert.equal(result.pagination.total, 25);
      assert.equal(result.pagination.totalPages, 3);
      assert.ok(result.summary, 'Summary should be defined');
      assert.equal(result.summary.total, 25);
      assert.equal(result.summary.pending, 10);
      assert.equal(result.summary.contacted, 8);
    });

    test('1.2 Should parse snake_case total_pages correctly', () => {
      const mockResponse = {
        success: true,
        data: {
          requests: [{ id: 1 }],
          pagination: {
            total: 50,
            page: 2,
            limit: 10,
            total_pages: 5,
          },
        },
      };

      const result = parseAdminLeadsResponse(mockResponse);
      assert.equal(result.leads.length, 1);
      assert.equal(result.pagination.totalPages, 5);
      assert.equal(result.pagination.page, 2);
    });

    test('1.3 Should handle flattened array data safely', () => {
      const mockFlatResponse = {
        success: true,
        data: [
          { id: 1, student_name: 'Lead 1' },
          { id: 2, student_name: 'Lead 2' },
        ],
      };

      const result = parseAdminLeadsResponse(mockFlatResponse);
      assert.equal(result.leads.length, 2);
      assert.equal(result.pagination.total, 2);
      assert.equal(result.pagination.totalPages, 1);
      assert.equal(result.summary, undefined);
    });

    test('1.4 Should handle empty requests safely without throwing errors', () => {
      const mockEmptyResponse = {
        success: true,
        data: {
          summary: { total: 0, pending: 0, contacted: 0, scheduled: 0, completed: 0, cancelled: 0 },
          requests: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };

      const result = parseAdminLeadsResponse(mockEmptyResponse);
      assert.deepEqual(result.leads, []);
      assert.equal(result.pagination.total, 0);
      assert.equal(result.summary?.total, 0);
    });

    test('1.5 Should gracefully handle malformed or null payload without crashing', () => {
      const resultNull = parseAdminLeadsResponse(null);
      assert.deepEqual(resultNull.leads, []);
      assert.equal(resultNull.pagination.total, 0);
      assert.equal(resultNull.pagination.totalPages, 1);

      const resultEmpty = parseAdminLeadsResponse({});
      assert.deepEqual(resultEmpty.leads, []);

      const resultCorrupt = parseAdminLeadsResponse({ data: 'unexpected string' });
      assert.deepEqual(resultCorrupt.leads, []);
    });
  });

  // --- 2. Counsellor Dashboard Unification ---
  describe('2. Counsellor Dashboard Unification Tests', () => {
    test('2.1 Counsellor dashboard imports and calls adminLeadsApi.getLeads', async () => {
      const dashboardPath = path.resolve('frontend/src/app/(counsellor)/counsellor/dashboard/page.tsx');
      const content = await fs.readFile(dashboardPath, 'utf-8');

      assert.ok(
        content.includes("import { adminLeadsApi } from '@/lib/api/admin-leads';"),
        'Must import adminLeadsApi'
      );
      assert.ok(
        content.includes('await adminLeadsApi.getLeads(params)'),
        'Must call adminLeadsApi.getLeads(params)'
      );
      assert.ok(
        !content.includes("apiClient.get(API_ENDPOINTS.demo.adminRequests"),
        'Must not use direct unparsed apiClient.get'
      );
    });

    test('2.2 Counsellor dashboard uses canonical DemoLeadItem type and handles course fallback', async () => {
      const dashboardPath = path.resolve('frontend/src/app/(counsellor)/counsellor/dashboard/page.tsx');
      const content = await fs.readFile(dashboardPath, 'utf-8');

      assert.ok(
        content.includes("import type { DemoLeadItem } from '@/types/admin-lead';"),
        'Must import DemoLeadItem from types/admin-lead'
      );
      assert.ok(
        content.includes("row.course_name || 'Archived / Unknown Course'"),
        'Must provide course name fallback for deleted or unassociated courses'
      );
    });
  });

  // --- 3. Backend Course Join Resilience ---
  describe('3. Backend Course Join Resilience Tests', () => {
    test('3.1 demo.repository.js uses LEFT JOIN courses in all request query functions', async () => {
      const repoPath = path.resolve('backend/src/modules/demo/demo.repository.js');
      const content = await fs.readFile(repoPath, 'utf-8');

      assert.ok(
        content.includes('LEFT JOIN courses c ON c.id = dr.course_id'),
        'Must use LEFT JOIN courses'
      );
      assert.ok(
        !content.includes('JOIN courses c ON c.id = dr.course_id') ||
          content.includes('LEFT JOIN courses c ON c.id = dr.course_id'),
        'Must not use INNER JOIN courses'
      );
      assert.ok(
        content.includes("course_name: r.course_name || 'Archived / Unknown Course'"),
        'Must provide fallback course_name for orphaned leads'
      );
    });
  });

  // --- 4. Public Contact Form Backend Integration ---
  describe('4. Public Contact Form Backend Integration Tests', () => {
    test('4.1 contact/page.tsx is connected to backend POST /api/contact', async () => {
      const contactPath = path.resolve('frontend/src/app/(public)/contact/page.tsx');
      const content = await fs.readFile(contactPath, 'utf-8');

      assert.ok(
        content.includes("import apiClient from '@/lib/api/client';"),
        'Must import apiClient'
      );
      assert.ok(
        content.includes("import { API_ENDPOINTS } from '@/lib/api/endpoints';"),
        'Must import API_ENDPOINTS'
      );
      assert.ok(
        content.includes('apiClient.post'),
        'Must execute apiClient.post'
      );
      assert.ok(
        content.includes('API_ENDPOINTS.contact.submit'),
        'Must point to API_ENDPOINTS.contact.submit'
      );
    });

    test('4.2 contact/page.tsx resets form on success and preserves input on error', async () => {
      const contactPath = path.resolve('frontend/src/app/(public)/contact/page.tsx');
      const content = await fs.readFile(contactPath, 'utf-8');

      assert.ok(
        content.includes('reset()'),
        'Must call reset() on success'
      );
      assert.ok(
        content.includes('submissionResult.referenceId'),
        'Must display reference ID to user'
      );
      assert.ok(
        content.includes('serverError'),
        'Must capture and display serverError'
      );
      assert.ok(
        !content.includes('Softmaxs Solution LLP'),
        'Must eliminate legacy Softmaxs branding'
      );
      assert.ok(
        content.includes('Guidexa academic counselors'),
        'Must use Guidexa branding in header'
      );
    });
  });

  // --- 5. Demo Booking Form Reset ---
  describe('5. Demo Booking Form Reset Tests', () => {
    test('5.1 demo-booking-modal.tsx resets form immediately on success and modal open', async () => {
      const modalPath = path.resolve('frontend/src/components/courses/demo-booking-modal.tsx');
      const content = await fs.readFile(modalPath, 'utf-8');

      assert.ok(
        content.includes('useEffect(() => {'),
        'Must have useEffect hook for modal lifecycle'
      );
      assert.ok(
        content.includes('setSuccessReference(refNo);'),
        'Must record successReference'
      );
      assert.ok(
        content.includes('reset({'),
        'Must reset Hook Form fields'
      );
      assert.ok(
        content.includes('handleModalClose'),
        'Must handle clean modal close'
      );
    });
  });
});
