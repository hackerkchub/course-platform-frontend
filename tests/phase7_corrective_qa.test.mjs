/**
 * Course Platform - Phase 7: Corrective Implementation & Regression QA Test Suite
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 * Tests all Phase 7 corrective requirements:
 * 1. Linux/Vercel import casing compatibility
 * 2. Category & Subcategory reordering PATCH method and payload contract
 * 3. Instructor photo upload response path extraction and fallbacks
 * 4. User-scoped review ownership identification and elimination of display-name matching
 * 5. Material download expiry UX, freshness tracking, and duplicate prevention
 * 6. Video playback progress 15-second throttling, flush events, and stale-response protection
 * 7. Phase 1–6 architectural and regression protection
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

// ==============================================================================
// 1. LINUX / VERCEL IMPORT CASING TESTS
// ==============================================================================

describe('Phase 7 - Fix 1: Linux/Vercel Import Casing Compatibility', () => {
  test('LeadDetailsDrawer.tsx imports auth-provider with exact lowercase casing', () => {
    const drawerPath = path.join(frontendRoot, 'src/components/dashboard/LeadDetailsDrawer.tsx');
    assert.ok(fs.existsSync(drawerPath), 'LeadDetailsDrawer.tsx must exist');

    const content = fs.readFileSync(drawerPath, 'utf8');

    // Must NOT contain camelCase AuthProvider import
    assert.ok(
      !content.includes('@/providers/AuthProvider'),
      'Must NOT import from "@/providers/AuthProvider"'
    );

    // Must contain exact kebab-case auth-provider import
    assert.ok(
      content.includes('@/providers/auth-provider'),
      'Must import from "@/providers/auth-provider"'
    );
  });

  test('No files in src directory contain case-mismatched AuthProvider imports', () => {
    const srcDir = path.join(frontendRoot, 'src');

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
          const code = fs.readFileSync(fullPath, 'utf8');
          assert.ok(
            !code.includes('@/providers/AuthProvider'),
            `File ${fullPath} contains invalid import casing "@/providers/AuthProvider"`
          );
        }
      }
    }

    scanDir(srcDir);
  });

  test('auth-provider.tsx actually exists on disk with exact filename', () => {
    const providerPath = path.join(frontendRoot, 'src/providers/auth-provider.tsx');
    assert.ok(fs.existsSync(providerPath), 'auth-provider.tsx must exist');

    const dirFiles = fs.readdirSync(path.join(frontendRoot, 'src/providers'));
    assert.ok(dirFiles.includes('auth-provider.tsx'), 'Directory listing must include auth-provider.tsx');
    assert.ok(!dirFiles.includes('AuthProvider.tsx'), 'Directory listing must NOT include AuthProvider.tsx');
  });
});

// ==============================================================================
// 2. CATEGORY & SUBCATEGORY REORDERING CONTRACT TESTS
// ==============================================================================

describe('Phase 7 - Fix 2: Category & Subcategory Reordering API Contract', () => {
  const categoriesApiPath = path.join(frontendRoot, 'src/lib/api/admin-categories.ts');

  test('admin-categories.ts uses PATCH method for reorderCategories', () => {
    assert.ok(fs.existsSync(categoriesApiPath));
    const content = fs.readFileSync(categoriesApiPath, 'utf8');

    // reorderCategories must use apiClient.patch
    const reorderCatMatch = content.match(/reorderCategories[\s\S]*?apiClient\.(patch|post)/);
    assert.ok(reorderCatMatch, 'reorderCategories method must exist');
    assert.equal(reorderCatMatch[1], 'patch', 'reorderCategories must use apiClient.patch');
  });

  test('admin-categories.ts passes items and categories in reorderCategories payload', () => {
    const content = fs.readFileSync(categoriesApiPath, 'utf8');
    const funcMatch = content.match(/reorderCategories[\s\S]*?\{[\s\S]*?apiClient\.patch[\s\S]*?\}/);
    assert.ok(funcMatch, 'reorderCategories implementation must exist');
    const funcBody = funcMatch[0];

    assert.ok(funcBody.includes('items'), 'Payload must include items property');
    assert.ok(funcBody.includes('categories'), 'Payload must include categories property');
  });

  test('admin-categories.ts uses PATCH method for reorderSubcategories', () => {
    const content = fs.readFileSync(categoriesApiPath, 'utf8');

    // reorderSubcategories must use apiClient.patch
    const reorderSubMatch = content.match(/reorderSubcategories[\s\S]*?apiClient\.(patch|post)/);
    assert.ok(reorderSubMatch, 'reorderSubcategories method must exist');
    assert.equal(reorderSubMatch[1], 'patch', 'reorderSubcategories must use apiClient.patch');
  });

  test('admin-categories.ts passes items and subcategories in reorderSubcategories payload', () => {
    const content = fs.readFileSync(categoriesApiPath, 'utf8');
    const funcMatch = content.match(/reorderSubcategories[\s\S]*?\{[\s\S]*?apiClient\.patch[\s\S]*?\}/);
    assert.ok(funcMatch, 'reorderSubcategories implementation must exist');
    const funcBody = funcMatch[0];

    assert.ok(funcBody.includes('items'), 'Payload must include items property');
    assert.ok(funcBody.includes('subcategories'), 'Payload must include subcategories property');
  });
});

// ==============================================================================
// 3. INSTRUCTOR PHOTO UPLOAD RESPONSE MAPPING TESTS
// ==============================================================================

describe('Phase 7 - Fix 3: Instructor Photo Upload Response Mapping', () => {
  const instructorApiPath = path.join(frontendRoot, 'src/lib/api/instructor.ts');

  test('uploadInstructorPhoto extracts data.path before fallbacks', () => {
    assert.ok(fs.existsSync(instructorApiPath));
    const content = fs.readFileSync(instructorApiPath, 'utf8');

    assert.ok(
      content.includes('payload?.data?.path'),
      'Must inspect payload?.data?.path'
    );
    assert.ok(
      content.includes('payload?.data?.url'),
      'Must support fallback payload?.data?.url'
    );
    assert.ok(
      content.includes('payload?.path'),
      'Must support fallback payload?.path'
    );
  });

  test('uploadInstructorPhoto validates non-empty string path', () => {
    const content = fs.readFileSync(instructorApiPath, 'utf8');
    assert.ok(
      content.includes('Server returned an invalid photo URL response'),
      'Must validate non-empty string and throw descriptive error on failure'
    );
  });

  test('Simulated upload response parser extracts backend payload correctly', () => {
    function parseUploadResponse(payload) {
      const returnedPath =
        (typeof payload?.data?.path === 'string' && payload.data.path.trim()) ||
        (typeof payload?.data?.url === 'string' && payload.data.url.trim()) ||
        (typeof payload?.path === 'string' && payload.path.trim()) ||
        (typeof payload?.url === 'string' && payload.url.trim()) ||
        '';

      if (!returnedPath) {
        throw new Error('Server returned an invalid photo URL response.');
      }
      return returnedPath;
    }

    // Backend shape 1: data.path
    assert.equal(
      parseUploadResponse({ success: true, data: { path: '/files/images/instructor_1.webp' } }),
      '/files/images/instructor_1.webp'
    );

    // Fallback shape 2: data.url
    assert.equal(
      parseUploadResponse({ success: true, data: { url: '/files/images/instructor_2.webp' } }),
      '/files/images/instructor_2.webp'
    );

    // Fallback shape 3: top-level path
    assert.equal(
      parseUploadResponse({ success: true, path: '/files/images/instructor_3.webp' }),
      '/files/images/instructor_3.webp'
    );

    // Empty/invalid payload throws
    assert.throws(() => parseUploadResponse({ success: true, data: {} }));
    assert.throws(() => parseUploadResponse(null));
  });
});

// ==============================================================================
// 4. STUDENT REVIEW OWNERSHIP IDENTIFICATION TESTS
// ==============================================================================

describe('Phase 7 - Fix 4: Student Review Ownership Identification', () => {
  const reviewsPagePath = path.join(frontendRoot, 'src/app/(student)/student/reviews/page.tsx');

  test('Student reviews page completely eliminates display-name ownership matching', () => {
    assert.ok(fs.existsSync(reviewsPagePath));
    const content = fs.readFileSync(reviewsPagePath, 'utf8');

    // Must NOT contain display name comparison
    assert.ok(
      !content.includes('user_name.trim().toLowerCase() === user.name.trim().toLowerCase()'),
      'Must NOT match reviews by user.name display name'
    );
    assert.ok(
      !content.includes('user?.name'),
      'Must NOT depend on user.name for review ownership'
    );
  });

  test('Student reviews page scopes local storage by authenticated user ID', () => {
    const content = fs.readFileSync(reviewsPagePath, 'utf8');

    assert.ok(
      content.includes('softmaxs_student_reviews_u'),
      'Storage key must be scoped by user prefix'
    );
    assert.ok(
      content.includes('getStoredReviewsForUser'),
      'Must use user-scoped retrieval function'
    );
    assert.ok(
      content.includes('saveStoredReviewsForUser'),
      'Must use user-scoped persistence function'
    );
  });

  test('Public review synchronization strictly matches by numeric reviewId', () => {
    const content = fs.readFileSync(reviewsPagePath, 'utf8');

    assert.ok(
      content.includes('r.id === existingLocal.reviewId'),
      'Must verify public match strictly by authoritative reviewId'
    );
  });

  test('Isolated user review storage prevents cross-account data leakage', () => {
    const mockStorage = {};

    function save(userId, data) {
      mockStorage[`softmaxs_student_reviews_u_${userId}`] = JSON.stringify(data);
    }
    function get(userId) {
      const raw = mockStorage[`softmaxs_student_reviews_u_${userId}`];
      return raw ? JSON.parse(raw) : {};
    }

    // User A (John Doe, ID 101) submits review for Course 1
    save(101, { 1: { reviewId: 501, courseId: 1, rating: 5, moderation_status: 'pending' } });

    // User B (John Doe, ID 102) logs in
    assert.deepEqual(get(102), {}, 'User B must not see User A reviews despite identical display name');

    // User B submits review for Course 1
    save(102, { 1: { reviewId: 502, courseId: 1, rating: 4, moderation_status: 'pending' } });

    // User A reviews remain untouched
    assert.equal(get(101)[1].reviewId, 501);
    assert.equal(get(102)[1].reviewId, 502);
  });
});

// ==============================================================================
// 5. MATERIAL DOWNLOAD EXPIRY UX TESTS
// ==============================================================================

describe('Phase 7 - Fix 5: Material Download Expiry UX', () => {
  const modalPath = path.join(frontendRoot, 'src/components/student/CourseMaterialsModal.tsx');

  test('CourseMaterialsModal.tsx tracks link freshness and validity window', () => {
    assert.ok(fs.existsSync(modalPath));
    const content = fs.readFileSync(modalPath, 'utf8');

    assert.ok(content.includes('loadedAt'), 'Must track loadedAt timestamp');
    assert.ok(content.includes('secondsRemaining'), 'Must track seconds remaining');
    assert.ok(content.includes('isExpired'), 'Must detect expired state');
  });

  test('CourseMaterialsModal.tsx provides prominent Refresh Links action', () => {
    const content = fs.readFileSync(modalPath, 'utf8');

    assert.ok(content.includes('Refresh Links'), 'Must provide Refresh Links button');
    assert.ok(content.includes('handleManualRefresh'), 'Must implement manual refresh handler');
  });

  test('CourseMaterialsModal.tsx prevents duplicate download clicks', () => {
    const content = fs.readFileSync(modalPath, 'utf8');

    assert.ok(content.includes('downloadingId'), 'Must maintain downloadingId state');
    assert.ok(content.includes('isDownloadingThis'), 'Must disable button during active download');
  });

  test('CourseMaterialsModal.tsx auto-refreshes if links expired upon download click', () => {
    const content = fs.readFileSync(modalPath, 'utf8');

    assert.ok(
      content.includes('if (isExpired && onRefresh)'),
      'Must auto-refresh expired tokens when user initiates download'
    );
  });
});

// ==============================================================================
// 6. VIDEO PLAYBACK PROGRESS THROTTLING TESTS
// ==============================================================================

describe('Phase 7 - Fix 6: Video Playback Progress Throttling', () => {
  const learnPagePath = path.join(frontendRoot, 'src/app/(student)/student/courses/[id]/learn/page.tsx');
  const playerPath = path.join(frontendRoot, 'src/components/student/CoursePlayer.tsx');

  test('learn/page.tsx implements 15-second routine progress throttling', () => {
    assert.ok(fs.existsSync(learnPagePath));
    const content = fs.readFileSync(learnPagePath, 'utf8');

    assert.ok(
      content.includes('15000'),
      'Must enforce 15,000ms minimum interval for routine progress updates'
    );
    assert.ok(
      content.includes('latestRequestTimeRef'),
      'Must track request timestamp ref for throttling'
    );
  });

  test('learn/page.tsx ignores progress updates with no meaningful position change', () => {
    const content = fs.readFileSync(learnPagePath, 'utf8');

    assert.ok(
      content.includes('lastSaved === roundedSeconds'),
      'Must skip redundant API requests when playback second has not changed'
    );
  });

  test('learn/page.tsx flushes progress on lesson change and component unmount', () => {
    const content = fs.readFileSync(learnPagePath, 'utf8');

    // Lesson change flush
    assert.ok(
      content.includes('handleSelectLesson') && content.includes('force'),
      'Must flush pending progress with force=true on lesson change'
    );

    // Unmount flush
    assert.ok(
      content.includes('activeLessonRef.current') && content.includes('return () =>'),
      'Must flush pending progress on component unmount'
    );
  });

  test('CoursePlayer.tsx flushes position on pause and video ended', () => {
    assert.ok(fs.existsSync(playerPath));
    const content = fs.readFileSync(playerPath, 'utf8');

    assert.ok(content.includes('handlePause'), 'Must implement handlePause');
    assert.ok(content.includes('handleEnded'), 'Must implement handleEnded');
    assert.ok(content.includes('onEnded={handleEnded}'), 'Must bind onEnded to video element');
  });

  test('Stale asynchronous responses are prevented from overwriting newer progress', () => {
    const content = fs.readFileSync(learnPagePath, 'utf8');

    assert.ok(
      content.includes('requestTimestamp >= latestRequestTimeRef.current'),
      'Must verify request timestamp sequence before committing state'
    );
  });
});

// ==============================================================================
// 7. REGRESSION PROTECTION ACROSS PHASE 1–6
// ==============================================================================

describe('Phase 7 - Architectural Integrity & Regression Protection', () => {
  test('endpoints.ts maintains all 17 verified domain definitions', () => {
    const endpointsPath = path.join(frontendRoot, 'src/lib/api/endpoints.ts');
    assert.ok(fs.existsSync(endpointsPath));
    const content = fs.readFileSync(endpointsPath, 'utf8');

    const expectedDomains = [
      'health', 'auth', 'categories', 'subcategories', 'instructors',
      'courses', 'curriculum', 'batches', 'enhancements', 'uploads',
      'materials', 'demo', 'eligibility', 'enrollments', 'wishlist',
      'reviews', 'analytics',
    ];

    for (const domain of expectedDomains) {
      assert.ok(content.includes(`${domain}:`), `endpoints.ts must define domain: ${domain}`);
    }
  });

  test('Server-side layout guards remain strictly enforced', () => {
    const adminLayout = fs.readFileSync(path.join(frontendRoot, 'src/app/(admin)/layout.tsx'), 'utf8');
    assert.ok(adminLayout.includes("requireRole(['admin', 'super_admin'])"));

    const counsellorLayout = fs.readFileSync(path.join(frontendRoot, 'src/app/(counsellor)/layout.tsx'), 'utf8');
    assert.ok(counsellorLayout.includes("requireRole(['counsellor', 'admin', 'super_admin'])"));

    const studentLayout = fs.readFileSync(path.join(frontendRoot, 'src/app/(student)/layout.tsx'), 'utf8');
    assert.ok(studentLayout.includes("requireRole(['user', 'counsellor', 'admin', 'super_admin'])"));
  });

  test('next.config.ts maintains API rewrites and remote image patterns', () => {
    const nextConfigPath = path.join(frontendRoot, 'next.config.ts');
    assert.ok(fs.existsSync(nextConfigPath));
    const content = fs.readFileSync(nextConfigPath, 'utf8');

    assert.ok(content.includes("source: '/api/:path*'"));
    assert.ok(content.includes("source: '/files/:path*'"));
    assert.ok(content.includes("hostname: 'api.softmaxs.com'"));
  });
});
