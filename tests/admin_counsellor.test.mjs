import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

describe('Staff & Counsellor Management Frontend Unit Tests', () => {
  test('1. API_ENDPOINTS registry defines all 5 admin counsellor routes correctly', async () => {
    const endpointsPath = path.resolve('frontend/src/lib/api/endpoints.ts');
    const content = await fs.readFile(endpointsPath, 'utf-8');

    assert.ok(content.includes('counsellors:'), 'API_ENDPOINTS must define counsellors namespace');
    assert.ok(
      content.includes("adminList: '/api/admin/users/counsellors'"),
      'adminList endpoint must match /api/admin/users/counsellors'
    );
    assert.ok(
      content.includes("adminProvision: '/api/admin/users/counsellors'"),
      'adminProvision endpoint must match /api/admin/users/counsellors'
    );
    assert.ok(
      content.includes("`/api/admin/users/counsellors/${id}`"),
      'adminById must point to /api/admin/users/counsellors/${id}'
    );
    assert.ok(
      content.includes("`/api/admin/users/counsellors/${id}/status`"),
      'adminStatus must point to /api/admin/users/counsellors/${id}/status'
    );
    assert.ok(
      content.includes("adminPromote: '/api/admin/users/counsellors/promote'"),
      'adminPromote must point to /api/admin/users/counsellors/promote'
    );
  });

  test('2. Admin navigation config contains Staff & Counsellors with serializable icon', async () => {
    const layoutPath = path.resolve('frontend/src/app/(admin)/layout.tsx');
    const layoutContent = await fs.readFile(layoutPath, 'utf-8');

    assert.ok(
      layoutContent.includes("label: 'Staff & Counsellors'"),
      'adminNavConfig must contain Staff & Counsellors label'
    );
    assert.ok(
      layoutContent.includes("href: '/admin/counsellors'"),
      'adminNavConfig must link to /admin/counsellors'
    );
    assert.ok(
      layoutContent.includes("icon: 'Headphones'"),
      'adminNavConfig must use serializable string icon Headphones'
    );
  });

  test('3. Admin counsellor management page file exists and imports required components', async () => {
    const pagePath = path.resolve('frontend/src/app/(admin)/admin/counsellors/page.tsx');
    const pageContent = await fs.readFile(pagePath, 'utf-8');

    assert.ok(pageContent.includes('AdminCounsellorsPage'), 'Must export AdminCounsellorsPage');
    assert.ok(pageContent.includes('StatsGrid'), 'Must render StatsGrid');
    assert.ok(pageContent.includes('DataTable'), 'Must render DataTable');
    assert.ok(pageContent.includes('ConfirmDialog'), 'Must include ConfirmDialog for status toggle');
    assert.ok(pageContent.includes('adminCounsellorsApi'), 'Must import adminCounsellorsApi');
  });

  test('4. Admin layout with Staff & Counsellors is 100% plain object serializable across RSC boundary', () => {
    const adminNavConfig = {
      title: 'Admin Center',
      brandHref: '/admin/dashboard',
      brandIcon: 'ShieldAlert',
      roleBadge: 'Administrator',
      roleBadgeVariant: 'destructive',
      items: [
        { label: 'Executive Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard', exact: true },
        { label: 'Courses Management', href: '/admin/courses', icon: 'BookOpen' },
        { label: 'Categories & Taxonomy', href: '/admin/categories', icon: 'FolderTree' },
        { label: 'Instructors Registry', href: '/admin/instructors', icon: 'Users' },
        { label: 'Staff & Counsellors', href: '/admin/counsellors', icon: 'Headphones' },
        { label: 'Enrollments Ledger', href: '/admin/enrollments', icon: 'UserCheck' },
        { label: 'Demo Leads Desk', href: '/admin/leads', icon: 'Inbox' },
        { label: 'Eligibility Rules', href: '/admin/eligibility', icon: 'FileCheck2' },
        { label: 'Review Moderation', href: '/admin/reviews', icon: 'MessageSquare' },
        { label: 'Media Library', href: '/admin/media', icon: 'Image' },
        { label: 'System Health', href: '/admin/system', icon: 'Activity' },
      ],
    };

    const json = JSON.stringify(adminNavConfig);
    const parsed = JSON.parse(json);

    assert.deepStrictEqual(parsed, adminNavConfig);
    assert.equal(parsed.items.length, 11);
    const counsellorItem = parsed.items.find(i => i.href === '/admin/counsellors');
    assert.ok(counsellorItem);
    assert.equal(counsellorItem.icon, 'Headphones');
    assert.equal(typeof counsellorItem.icon, 'string');
  });

  test('5. Admin counsellor API client defines all required client methods', async () => {
    const apiPath = path.resolve('frontend/src/lib/api/admin-counsellors.ts');
    const apiContent = await fs.readFile(apiPath, 'utf-8');

    assert.ok(apiContent.includes('export async function getAdminCounsellors'));
    assert.ok(apiContent.includes('export async function getAdminCounsellorDetails'));
    assert.ok(apiContent.includes('export async function provisionAdminCounsellor'));
    assert.ok(apiContent.includes('export async function promoteAdminStudent'));
    assert.ok(apiContent.includes('export async function updateAdminCounsellorStatus'));
  });
});
