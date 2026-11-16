import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

describe('WhatsApp Management & Course-Wise Routing Frontend Tests', () => {
  test('1. social-actions.tsx WhatsAppEnquiryButton uses dynamic course.whatsapp and removes env warnings', async () => {
    const filePath = path.resolve('frontend/src/components/courses/social-actions.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    // Asserts clean dynamic consumption
    assert.ok(content.includes('export function WhatsAppEnquiryButton'), 'Must export WhatsAppEnquiryButton');
    assert.ok(content.includes('whatsapp?: CourseWhatsAppInfo'), 'Must accept whatsapp property');
    assert.ok(
      content.includes('if (!whatsapp?.available || !whatsapp.click_to_chat_url) {\n    return null;\n  }'),
      'Must return null when whatsapp is unavailable or url is missing'
    );
    assert.ok(
      content.includes('window.open(whatsapp.click_to_chat_url'),
      'Must open dynamic click_to_chat_url'
    );

    // Asserts removal of deprecated warning and env variable check
    assert.ok(
      !content.includes('NEXT_PUBLIC_WHATSAPP_NUMBER'),
      'Must NOT depend on process.env.NEXT_PUBLIC_WHATSAPP_NUMBER'
    );
    assert.ok(
      !content.includes('Official WhatsApp admissions line is pending configuration'),
      'Must NOT render pending configuration amber warning'
    );
  });

  test('2. course-detail-view.tsx passes course.whatsapp to WhatsAppEnquiryButton', async () => {
    const filePath = path.resolve('frontend/src/components/courses/course-detail-view.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(
      content.includes('whatsapp={course.whatsapp}'),
      'CourseDetailView must pass course.whatsapp to WhatsAppEnquiryButton'
    );
  });

  test('3. admin-whatsapp.ts exports all 7 required administrative API methods', async () => {
    const filePath = path.resolve('frontend/src/lib/api/admin-whatsapp.ts');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(content.includes('export async function getWhatsAppContacts'), 'Must export getWhatsAppContacts');
    assert.ok(content.includes('export async function getWhatsAppContact'), 'Must export getWhatsAppContact');
    assert.ok(content.includes('export async function createWhatsAppContact'), 'Must export createWhatsAppContact');
    assert.ok(content.includes('export async function updateWhatsAppContact'), 'Must export updateWhatsAppContact');
    assert.ok(content.includes('export async function setDefaultWhatsAppContact'), 'Must export setDefaultWhatsAppContact');
    assert.ok(content.includes('export async function updateWhatsAppContactStatus'), 'Must export updateWhatsAppContactStatus');
    assert.ok(content.includes('export async function deleteWhatsAppContact'), 'Must export deleteWhatsAppContact');
    assert.ok(content.includes('export async function getWhatsAppPreview'), 'Must export getWhatsAppPreview');
  });

  test('4. endpoints.ts defines the complete whatsapp namespace', async () => {
    const filePath = path.resolve('frontend/src/lib/api/endpoints.ts');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(content.includes('whatsapp: {'), 'Must define whatsapp endpoint block');
    assert.ok(content.includes("adminList: '/api/admin/whatsapp'"), 'Must define adminList');
    assert.ok(content.includes("adminCreate: '/api/admin/whatsapp'"), 'Must define adminCreate');
    assert.ok(content.includes("adminSetDefault: (id: number) => `/api/admin/whatsapp/${id}/set-default`"), 'Must define adminSetDefault');
    assert.ok(content.includes("adminStatus: (id: number) => `/api/admin/whatsapp/${id}/status`"), 'Must define adminStatus');
    assert.ok(content.includes("adminDelete: (id: number) => `/api/admin/whatsapp/${id}`"), 'Must define adminDelete');
    assert.ok(content.includes("adminPreview: (id: number) => `/api/admin/whatsapp/${id}/preview`"), 'Must define adminPreview');
  });

  test('5. admin layout navigation includes WhatsApp Desk with MessageCircle icon', async () => {
    const filePath = path.resolve('frontend/src/app/(admin)/layout.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(
      content.includes("{ label: 'WhatsApp Desk', href: '/admin/whatsapp', icon: 'MessageCircle' }"),
      'Must include WhatsApp Desk in adminNavConfig'
    );
  });

  test('6. Course Editor Step 3 includes WhatsApp Admissions Routing sub-tab and form controls', async () => {
    const filePath = path.resolve('frontend/src/app/(admin)/admin/courses/[id]/edit/page.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    assert.ok(
      content.includes("{ id: 'whatsapp', label: 'WhatsApp Admissions' }"),
      'STEP_3_TABS must include WhatsApp Admissions'
    );
    assert.ok(
      content.includes('handleSaveWhatsAppRouting'),
      'Must include handleSaveWhatsAppRouting'
    );
    assert.ok(
      content.includes('Inherit Global Default'),
      'Must offer Inherit Global Default radio option'
    );
    assert.ok(
      content.includes('Assign Specific Line'),
      'Must offer Assign Specific Line radio option'
    );
    assert.ok(
      content.includes('Disable WhatsApp'),
      'Must offer Disable WhatsApp radio option'
    );
  });

  test('7. TypeScript interfaces correctly declare WhatsApp types across modules', async () => {
    const waTypesPath = path.resolve('frontend/src/types/whatsapp.ts');
    const waTypesContent = await fs.readFile(waTypesPath, 'utf-8');
    assert.ok(waTypesContent.includes('export interface WhatsAppContact'), 'Must export WhatsAppContact');
    assert.ok(waTypesContent.includes('export interface CourseWhatsAppInfo'), 'Must export CourseWhatsAppInfo');
    assert.ok(waTypesContent.includes('click_to_chat_url?: string;'), 'Must type click_to_chat_url');

    const courseTypesPath = path.resolve('frontend/src/types/course.ts');
    const courseTypesContent = await fs.readFile(courseTypesPath, 'utf-8');
    assert.ok(courseTypesContent.includes('whatsapp?: CourseWhatsAppInfo;'), 'CourseDetailPayload must include whatsapp property');

    const adminCourseTypesPath = path.resolve('frontend/src/types/admin-course.ts');
    const adminCourseTypesContent = await fs.readFile(adminCourseTypesPath, 'utf-8');
    assert.ok(adminCourseTypesContent.includes('whatsapp_contact_id?: number | null;'), 'AdminCourseItem must include whatsapp_contact_id');
    assert.ok(adminCourseTypesContent.includes('whatsapp_enabled?: boolean;'), 'AdminCourseItem must include whatsapp_enabled');
  });
});
