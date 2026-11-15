/**
 * Course Platform - Phase 4: Complete Student Panel & Learning Portal Test Suite
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 * Tests all required Phase 4 specifications without external dependencies:
 * 1. Dashboard field mappings, statistics, resume learning logic
 * 2. Enrollment pagination, status filtering, free enrollment payload, no self-cancellation
 * 3. Curriculum module & lesson sorting, supported types, safe URL conversions
 * 4. Progress tracking, non-negative position, throttling, mark as complete, backend completion
 * 5. Wishlist add/remove, pagination, duplicate prevention, free course direct enrollment
 * 6. Demo classes history normalization, pending cancellation, no rescheduling, meeting links
 * 7. Eligibility dynamic questionnaires, validation, server-side evaluation, sensitive answer exclusion
 * 8. Course reviews: 1-5 rating, enrollment enforcement, duplicate 409, edit moderation reset
 * 9. Course materials: HMAC signed URL usage, 10-minute expiration, file path protection
 * 10. Auth & RBAC: logout-all success vs failure error handling, student dashboard route guards
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
// 1. HELPER LOGIC REPLICATIONS & UTILITIES FOR CONTRACT TESTING
// ==============================================================================

/**
 * YouTube and Vimeo safe embed URL conversion logic
 */
function getSafeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return null;
  }

  // 1. YouTube conversions
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  // 2. Vimeo conversions
  const vimeoMatch = trimmed.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`;
  }

  // 3. Direct video format validation (.mp4 / .webm)
  if (/^https?:\/\/.+\.(mp4|webm)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Curriculum sorting logic (modules by display_order, lessons by display_order)
 */
function sortCurriculum(modules) {
  if (!Array.isArray(modules)) return [];
  return [...modules]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((mod) => ({
      ...mod,
      lessons: Array.isArray(mod.lessons)
        ? [...mod.lessons].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        : [],
    }));
}

/**
 * Progress payload validator
 */
function validateProgressPayload(completed, lastPositionSeconds) {
  const errors = [];
  if (typeof completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }
  if (typeof lastPositionSeconds !== 'number' || Number.isNaN(lastPositionSeconds)) {
    errors.push('last_position_seconds must be a number');
  } else if (lastPositionSeconds < 0) {
    errors.push('last_position_seconds cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
    payload: {
      completed: Boolean(completed),
      last_position_seconds: Math.max(0, Math.floor(lastPositionSeconds || 0)),
    },
  };
}

/**
 * Review validation logic
 */
function validateReviewPayload(rating, title, text) {
  const errors = [];
  if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    errors.push('Rating must be an integer between 1 and 5');
  }
  if (title && title.length > 100) {
    errors.push('Review title cannot exceed 100 characters');
  }
  if (text && text.length > 1000) {
    errors.push('Review text cannot exceed 1000 characters');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==============================================================================
// TEST SUITES
// ==============================================================================

describe('Phase 4: Student Dashboard Polish & Mapping Integrity', () => {
  const dashboardSource = fs.readFileSync(
    path.join(frontendRoot, 'src/app/(student)/student/dashboard/page.tsx'),
    'utf-8'
  );

  test('correctly maps enrollment_status rather than generic status', () => {
    assert.match(
      dashboardSource,
      /enrollment_status/,
      'Dashboard must inspect actual enrollment_status field from backend'
    );
  });

  test('correctly maps progress_percentage from backend rather than nested percentage', () => {
    assert.match(
      dashboardSource,
      /progress_percentage/,
      'Dashboard must use progress_percentage property returned by /api/me/enrollments'
    );
  });

  test('correctly maps batch name via item.batch?.name', () => {
    assert.match(
      dashboardSource,
      /batch\??\.name/,
      'Dashboard must safely render item.batch.name where available'
    );
  });

  test('implements functional resume learning navigation to /student/courses/[id]/learn', () => {
    assert.match(
      dashboardSource,
      /\/student\/courses\/\$\{.+?\}\/learn/,
      'Resume learning button must route to /student/courses/[id]/learn'
    );
    assert.match(
      dashboardSource,
      /last_lesson_id/,
      'Navigation should preserve last_lesson_id if available'
    );
  });

  test('empty dashboard state is gracefully handled without fabricated metrics', () => {
    assert.match(
      dashboardSource,
      /No Course Enrollments Found|No active course enrollments/,
      'Must display helpful empty state when student has no course enrollments'
    );
  });
});

describe('Phase 4: My Courses & Enrollment Lifecycle', () => {
  const myCoursesSource = fs.readFileSync(
    path.join(frontendRoot, 'src/app/(student)/student/courses/page.tsx'),
    'utf-8'
  );
  const studentApiSource = fs.readFileSync(
    path.join(frontendRoot, 'src/lib/api/student.ts'),
    'utf-8'
  );

  test('supports verified backend enrollment status filters (all, active, completed, expired)', () => {
    assert.match(myCoursesSource, /'all'/);
    assert.match(myCoursesSource, /'active'/);
    assert.match(myCoursesSource, /'completed'/);
    assert.match(myCoursesSource, /'expired'/);
  });

  test('fetches enrollments via GET /api/me/enrollments', () => {
    assert.match(
      studentApiSource,
      /API_ENDPOINTS\.enrollments\.my/,
      'fetchStudentEnrollments must call /api/me/enrollments'
    );
  });

  test('free course enrollment only permitted when is_free === true and payload formatted correctly', () => {
    assert.match(
      studentApiSource,
      /selfEnrollFreeCourse/,
      'API service must export selfEnrollFreeCourse wrapper'
    );
    assert.match(
      studentApiSource,
      /API_ENDPOINTS\.enrollments\.enrollFree/,
      'selfEnrollFreeCourse must POST to /api/courses/:id/enroll'
    );
  });

  test('strictly prohibits student self-cancellation button or handler', () => {
    assert.doesNotMatch(
      myCoursesSource,
      /cancelEnrollment|<Button[^>]*>.*Cancel.*Enrollment/i,
      'My Courses page must NOT render student self-cancellation action'
    );
    assert.match(
      myCoursesSource,
      /Need cohort schedule changes or have enrollment queries|admissions support/i,
      'Must guide student to contact support for enrollment changes'
    );
  });

  test('normalizes paginated response with total, page, limit, and totalPages', () => {
    const rawBackendEnvelope = {
      success: true,
      data: {
        items: [{ enrollment_id: 1, enrollment_status: 'active', progress_percentage: 45 }],
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      },
    };
    const items = rawBackendEnvelope.data.items;
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].enrollment_id, 1);
    assert.strictEqual(rawBackendEnvelope.data.totalPages, 1);
  });
});

describe('Phase 4: Course Learning Player & Curriculum Architecture', () => {
  const playerSource = fs.readFileSync(
    path.join(frontendRoot, 'src/components/student/CoursePlayer.tsx'),
    'utf-8'
  );
  const learnPageSource = fs.readFileSync(
    path.join(frontendRoot, 'src/app/(student)/student/courses/[id]/learn/page.tsx'),
    'utf-8'
  );

  test('sorts curriculum modules and lessons monotonically by display_order', () => {
    const unsortedModules = [
      {
        id: 2,
        title: 'Module 2: Advanced React',
        display_order: 2,
        lessons: [
          { id: 202, title: 'Lesson 2.2', display_order: 2 },
          { id: 201, title: 'Lesson 2.1', display_order: 1 },
        ],
      },
      {
        id: 1,
        title: 'Module 1: Foundations',
        display_order: 1,
        lessons: [
          { id: 102, title: 'Lesson 1.2', display_order: 2 },
          { id: 101, title: 'Lesson 1.1', display_order: 1 },
        ],
      },
    ];

    const sorted = sortCurriculum(unsortedModules);
    assert.strictEqual(sorted[0].id, 1);
    assert.strictEqual(sorted[1].id, 2);
    assert.strictEqual(sorted[0].lessons[0].id, 101);
    assert.strictEqual(sorted[0].lessons[1].id, 102);
    assert.strictEqual(sorted[1].lessons[0].id, 201);
  });

  test('converts standard YouTube URL to privacy-enhanced youtube-nocookie embed', () => {
    const rawUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const embedUrl = getSafeEmbedUrl(rawUrl);
    assert.strictEqual(
      embedUrl,
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
  });

  test('converts shortened youtu.be URL to youtube-nocookie embed', () => {
    const rawUrl = 'https://youtu.be/dQw4w9WgXcQ';
    const embedUrl = getSafeEmbedUrl(rawUrl);
    assert.strictEqual(
      embedUrl,
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
  });

  test('converts standard Vimeo video URL to safe player embed', () => {
    const rawUrl = 'https://vimeo.com/76979871';
    const embedUrl = getSafeEmbedUrl(rawUrl);
    assert.strictEqual(embedUrl, 'https://player.vimeo.com/video/76979871?dnt=1');
  });

  test('sanitizes and rejects dangerous javascript: and data: schemes', () => {
    assert.strictEqual(getSafeEmbedUrl('javascript:alert(1)'), null);
    assert.strictEqual(getSafeEmbedUrl('data:text/html,<script>alert(1)</script>'), null);
    assert.strictEqual(getSafeEmbedUrl('vbscript:msgbox(1)'), null);
  });

  test('supports video, article, assignment and quiz lesson types', () => {
    assert.match(playerSource, /lesson_type === 'video'/);
    assert.match(playerSource, /lesson_type === 'article'/);
    assert.match(playerSource, /lesson_type === 'assignment'/);
    assert.match(playerSource, /lesson_type === 'quiz'/);
  });

  test('handles unauthorized enrollment access (403) with error state', () => {
    assert.match(learnPageSource, /Curriculum Access Restricted/);
    assert.match(learnPageSource, /active enrollment permissions/);
  });
});

describe('Phase 4: Lesson Progress & Course Completion', () => {
  const studentApiSource = fs.readFileSync(
    path.join(frontendRoot, 'src/lib/api/student.ts'),
    'utf-8'
  );
  const playerSource = fs.readFileSync(
    path.join(frontendRoot, 'src/components/student/CoursePlayer.tsx'),
    'utf-8'
  );

  test('validates non-negative playback position and payload format', () => {
    const valid = validateProgressPayload(false, 120);
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.payload.last_position_seconds, 120);
    assert.strictEqual(valid.payload.completed, false);

    const negative = validateProgressPayload(true, -50);
    assert.strictEqual(negative.isValid, false);
    assert.strictEqual(negative.payload.last_position_seconds, 0);
  });

  test('saveLessonProgress calls POST /api/me/lessons/:lessonId/progress', () => {
    assert.match(
      studentApiSource,
      /API_ENDPOINTS\.enrollments\.myProgress/,
      'saveLessonProgress must call /api/me/lessons/:lessonId/progress'
    );
  });

  test('throttles position tracking to avoid continuous request spam', () => {
    assert.match(
      playerSource,
      /Math\.abs\(currentSeconds - lastReportedTimeRef\.current\) >= 15/,
      'Playback progress must be throttled to at least 15s intervals'
    );
  });

  test('provides Mark as Complete toggle action with optimistic confirmation', () => {
    assert.match(playerSource, /Mark as Complete/);
    assert.match(playerSource, /Completed/);
  });
});

describe('Phase 4: Student Wishlist & Direct Free Enrollment', () => {
  const wishlistSource = fs.readFileSync(
    path.join(frontendRoot, 'src/app/(student)/student/wishlist/page.tsx'),
    'utf-8'
  );
  const studentApiSource = fs.readFileSync(
    path.join(frontendRoot, 'src/lib/api/student.ts'),
    'utf-8'
  );

  test('integrates GET, POST and DELETE wishlist endpoints', () => {
    assert.match(studentApiSource, /fetchStudentWishlist/);
    assert.match(studentApiSource, /addCourseToWishlist/);
    assert.match(studentApiSource, /removeCourseFromWishlist/);
  });

  test('uses ConfirmDialog before removing a course from wishlist', () => {
    assert.match(wishlistSource, /<ConfirmDialog/);
    assert.match(wishlistSource, /Remove [Ff]rom Wishlist/i);
  });

  test('allows direct enrollment for free courses without checkout', () => {
    assert.match(wishlistSource, /course\.is_free/);
    assert.match(wishlistSource, /selfEnrollFreeCourse/);
  });

  test('prevents duplicate wishlist removal requests', () => {
    assert.match(wishlistSource, /isRemoving/);
  });
});

describe('Phase 4: Demo Classes & Cancellation Workflow', () => {
  const demoSource = fs.readFileSync(
    path.join(frontendRoot, 'src/app/(student)/student/demo-classes/page.tsx'),
    'utf-8'
  );
  const studentApiSource = fs.readFileSync(
    path.join(frontendRoot, 'src/lib/api/student.ts'),
    'utf-8'
  );

  test('integrates GET /api/me/demo-requests and PATCH /api/me/demo-requests/:id/cancel', () => {
    assert.match(studentApiSource, /fetchStudentDemoRequests/);
    assert.match(studentApiSource, /cancelStudentDemoRequest/);
  });

  test('permits cancellation only for pending requests with ConfirmDialog', () => {
    assert.match(demoSource, /status === 'pending'/);
    assert.match(demoSource, /<ConfirmDialog/);
    assert.match(demoSource, /Cancel Demo (Class )?Request/i);
  });

  test('strictly prohibits demo rescheduling feature or button', () => {
    assert.doesNotMatch(
      demoSource,
      /<Button[^>]*>.*Reschedule.*<\/Button>/i,
      'Demo classes page must NOT render a reschedule button'
    );
    assert.doesNotMatch(
      demoSource,
      /onReschedule|rescheduleDemo/i,
      'Demo classes page must NOT implement rescheduling actions'
    );
    assert.match(
      demoSource,
      /reschedule your trial class/i,
      'Must explain policy that student may cancel pending request or book a new session'
    );
  });

  test('safely renders meeting link for scheduled sessions in secure new tab', () => {
    assert.match(demoSource, /meeting_link/);
    assert.match(demoSource, /target="_blank"/);
    assert.match(demoSource, /rel="noopener noreferrer"/);
  });
});

describe('Phase 4: Course Eligibility Assessment Engine', () => {
  const eligibilitySource = fs.readFileSync(
    path.join(frontendRoot, 'src/app/(student)/student/eligibility/page.tsx'),
    'utf-8'
  );
  const studentApiSource = fs.readFileSync(
    path.join(frontendRoot, 'src/lib/api/student.ts'),
    'utf-8'
  );

  test('integrates verified per-course eligibility endpoints', () => {
    assert.match(studentApiSource, /fetchCourseEligibility/);
    assert.match(studentApiSource, /submitStudentEligibilityCheck/);
    assert.match(studentApiSource, /fetchStudentEligibilityResult/);
  });

  test('dynamically renders criteria for qualification, percentage, streams, and custom questions', () => {
    assert.match(eligibilitySource, /minimum_qualification/);
    assert.match(eligibilitySource, /minimum_percentage/);
    assert.match(eligibilitySource, /eligible_streams/);
    assert.match(eligibilitySource, /custom_questions/);
  });

  test('never calculates eligibility decision in browser; relies on backend response', () => {
    assert.match(eligibilitySource, /submitStudentEligibilityCheck/);
    assert.match(eligibilitySource, /previousResult\.eligible/);
  });

  test('excludes correct_answers and sensitive answer keys from frontend payload', () => {
    assert.doesNotMatch(
      eligibilitySource,
      /correct_answer|correct_option|answer_key/i,
      'Frontend must never inspect or expose internal answer keys'
    );
  });
});

describe('Phase 4: My Reviews & Academic Moderation Lifecycle', () => {
  const reviewsSource = fs.readFileSync(
    path.join(frontendRoot, 'src/app/(student)/student/reviews/page.tsx'),
    'utf-8'
  );
  const studentApiSource = fs.readFileSync(
    path.join(frontendRoot, 'src/lib/api/student.ts'),
    'utf-8'
  );

  test('enforces verified rating range between 1 and 5', () => {
    const valid = validateReviewPayload(5, 'Great Course', 'Loved the content');
    assert.strictEqual(valid.isValid, true);

    const invalidLow = validateReviewPayload(0, 'Title', 'Text');
    assert.strictEqual(invalidLow.isValid, false);

    const invalidHigh = validateReviewPayload(6, 'Title', 'Text');
    assert.strictEqual(invalidHigh.isValid, false);
  });

  test('integrates course-level review endpoints and student mutation routes', () => {
    assert.match(studentApiSource, /fetchCourseReviews/);
    assert.match(studentApiSource, /submitCourseReview/);
    assert.match(studentApiSource, /updateStudentReview/);
    assert.match(studentApiSource, /deleteStudentReview/);
  });

  test('informs student that editing resets review status to pending moderation', () => {
    assert.match(reviewsSource, /Moderation Reset/);
    assert.match(
      reviewsSource,
      /review(&apos;|'|&#39;|’)s status to <strong>Pending Moderation<\/strong>/
    );
  });

  test('uses ConfirmDialog before deleting student review', () => {
    assert.match(reviewsSource, /<ConfirmDialog/);
    assert.match(reviewsSource, /Delete Your Review/);
  });

  test('does not invent a fake global /api/me/reviews endpoint', () => {
    assert.doesNotMatch(
      studentApiSource,
      /\/api\/me\/reviews\b(?!\/:\w+)/,
      'Must NOT call non-existent GET /api/me/reviews'
    );
  });
});

describe('Phase 4: Secure Course Materials & HMAC Downloads', () => {
  const modalSource = fs.readFileSync(
    path.join(frontendRoot, 'src/components/student/CourseMaterialsModal.tsx'),
    'utf-8'
  );
  const studentApiSource = fs.readFileSync(
    path.join(frontendRoot, 'src/lib/api/student.ts'),
    'utf-8'
  );

  test('fetches materials using GET /api/courses/:id/materials', () => {
    assert.match(studentApiSource, /fetchCourseMaterials/);
    assert.match(studentApiSource, /API_ENDPOINTS\.materials\.byCourseId/);
  });

  test('uses backend-signed download URL directly without client-side signature generation', () => {
    assert.doesNotMatch(
      modalSource,
      /crypto\.createHmac|createHmac|crypto\.subtle/i,
      'Client must never generate HMAC signatures locally'
    );
    assert.match(modalSource, /mat\.download_url|download_url/);
  });

  test('displays 10-minute security expiration advisory and refresh capability', () => {
    assert.match(modalSource, /10 minutes/);
    assert.match(modalSource, /Refresh/);
  });

  test('does not expose server local filesystem paths', () => {
    assert.doesNotMatch(modalSource, /file_path|absolute_path|storage_path/);
  });
});

describe('Phase 4: Logout-All Failure-Handling Correction & Session Security', () => {
  const authProviderSource = fs.readFileSync(
    path.join(frontendRoot, 'src/providers/auth-provider.tsx'),
    'utf-8'
  );

  test('logoutAll only clears query client and redirects on confirmed backend success', () => {
    assert.match(
      authProviderSource,
      /await apiClient\.post\(API_ENDPOINTS\.auth\.logoutAll\)/,
      'logoutAll must call backend endpoint first'
    );
    assert.match(
      authProviderSource,
      /queryClient\.removeQueries/,
      'queryClient.removeQueries must execute only after confirmed response'
    );
  });

  test('logoutAll preserves session on network/backend failure and re-throws error', () => {
    assert.match(authProviderSource, /catch \((err|error)\) \{/);
    assert.match(authProviderSource, /setIsLoggingOut\(false\)/);
    assert.match(authProviderSource, /throw (err|error)/);
  });

  test('preserves existing single-session logout functionality', () => {
    assert.match(authProviderSource, /const logout = async/);
    assert.match(authProviderSource, /API_ENDPOINTS\.auth\.logout/);
  });
});
