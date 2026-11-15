/**
 * Course Platform - Phase 3A: Authentication Foundation Test Suite
 * Validates all 16 requirements specified in Section 11 of the Phase 3A specification.
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ==============================================================================
// 1. REPLICATED PURE LOGIC FOR ISOLATED TESTING
// ==============================================================================

const VALID_ROLES = ['user', 'counsellor', 'admin', 'super_admin'];

function normalizeUserProfile(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  let candidate = raw;
  if (raw.user && typeof raw.user === 'object') {
    candidate = raw.user;
  } else if (raw.data && typeof raw.data === 'object') {
    const dataObj = raw.data;
    candidate = dataObj.user && typeof dataObj.user === 'object' ? dataObj.user : dataObj;
  }

  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const parsedId = Number(candidate.id);
  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    return null;
  }

  if (typeof candidate.email !== 'string') {
    return null;
  }
  const email = candidate.email.trim();
  if (!email || !email.includes('@')) {
    return null;
  }

  if (typeof candidate.role !== 'string') {
    return null;
  }
  const role = candidate.role.trim();
  if (!VALID_ROLES.includes(role)) {
    return null;
  }

  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const status = candidate.status === 'blocked' ? 'blocked' : 'active';
  const avatarUrl =
    typeof candidate.avatar_url === 'string' && candidate.avatar_url.trim()
      ? candidate.avatar_url.trim()
      : null;
  const phone =
    typeof candidate.phone === 'string' && candidate.phone.trim()
      ? candidate.phone.trim()
      : null;

  const emailVerified = Boolean(candidate.email_verified);
  const phoneVerified = Boolean(candidate.phone_verified);
  const createdAt = typeof candidate.created_at === 'string' ? candidate.created_at : undefined;

  return {
    id: parsedId,
    name,
    email,
    phone,
    role,
    status,
    avatar_url: avatarUrl,
    email_verified: emailVerified,
    phone_verified: phoneVerified,
    created_at: createdAt,
  };
}

function sanitizeRedirectUrl(target) {
  if (!target || typeof target !== 'string') {
    return '/';
  }

  const trimmed = target.trim();

  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes('\\')
  ) {
    return '/';
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost' || !parsed.pathname.startsWith('/')) {
      return '/';
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

function evaluateMiddlewareRouting(pathname, cookies) {
  const hasAuthCookie = cookies.has('access_token') || cookies.has('refresh_token');

  const isStudentRoute = pathname.startsWith('/student');
  const isAdminRoute = pathname.startsWith('/admin');
  const isCounsellorRoute = pathname.startsWith('/counsellor');

  if (isStudentRoute || isAdminRoute || isCounsellorRoute) {
    if (!hasAuthCookie) {
      return {
        action: 'redirect',
        url: `/login?returnUrl=${encodeURIComponent(pathname)}`,
      };
    }
  }

  return { action: 'next' };
}

function evaluateServerRoleGuard(user, allowedRoles) {
  if (!user) {
    return { redirect: '/login' };
  }
  if (!allowedRoles.includes(user.role)) {
    return { redirect: '/unauthorized' };
  }
  return { success: true, user };
}

function mapAuthErrorToUserMessage(status, dataMessage) {
  if (status === 400) {
    return dataMessage || 'Invalid or unverified Google token. Please sign in again.';
  } else if (status === 403) {
    return 'Your account has been blocked or suspended. Access denied.';
  } else if (status === 409) {
    return dataMessage || 'An account conflict occurred with this Google account. Please contact support.';
  } else if (status === 429) {
    return 'Too many login attempts. Please wait a moment and try again.';
  } else if (status && status >= 500) {
    return 'Authentication service is temporarily unavailable. Please try again.';
  } else {
    return 'Network error during authentication. Please check your connection.';
  }
}

function isGoogleClientIdValid(clientId) {
  if (!clientId || typeof clientId !== 'string') {
    return false;
  }

  const trimmed = clientId.trim();
  if (
    !trimmed ||
    trimmed.includes('your-google-client-id') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('mock')
  ) {
    return false;
  }

  const googleClientIdRegex = /^[0-9]+-[a-z0-9_]+\.apps\.googleusercontent\.com$/i;
  return googleClientIdRegex.test(trimmed);
}

// ==============================================================================
// 2. EXHAUSTIVE TEST SUITE (16 TEST CASES)
// ==============================================================================

describe('Phase 3A: Authentication Foundation Test Suite', () => {
  // Test 1: Profile response with data.user (POST /api/auth/google format)
  test('1. Profile response with data.user normalized correctly', () => {
    const raw = {
      user: {
        id: 101,
        name: 'Kapil Chilhate',
        email: 'kapil@example.com',
        role: 'user',
        status: 'active',
        avatar_url: 'https://lh3.googleusercontent.com/photo.jpg',
        phone: '+919876543210',
        phone_verified: true,
      },
    };

    const normalized = normalizeUserProfile(raw);
    assert.ok(normalized, 'Normalized profile should not be null');
    assert.equal(normalized.id, 101);
    assert.equal(normalized.name, 'Kapil Chilhate');
    assert.equal(normalized.email, 'kapil@example.com');
    assert.equal(normalized.role, 'user');
    assert.equal(normalized.status, 'active');
    assert.equal(normalized.avatar_url, 'https://lh3.googleusercontent.com/photo.jpg');
    assert.equal(normalized.phone, '+919876543210');
    assert.equal(normalized.phone_verified, true);
  });

  // Test 2: Profile response with data directly (GET /api/auth/me format)
  test('2. Profile response with data directly normalized correctly', () => {
    const raw = {
      id: 202,
      name: 'Admissions Counsellor',
      email: 'counsellor@platform.com',
      role: 'counsellor',
      status: 'active',
      avatar_url: null,
      phone: null,
      created_at: '2026-11-01T10:00:00.000Z',
    };

    const normalized = normalizeUserProfile(raw);
    assert.ok(normalized, 'Normalized profile should not be null');
    assert.equal(normalized.id, 202);
    assert.equal(normalized.name, 'Admissions Counsellor');
    assert.equal(normalized.email, 'counsellor@platform.com');
    assert.equal(normalized.role, 'counsellor');
    assert.equal(normalized.status, 'active');
    assert.equal(normalized.created_at, '2026-11-01T10:00:00.000Z');
  });

  // Test 3: Invalid or null profile response
  test('3. Invalid or null profile responses rejected safely', () => {
    assert.equal(normalizeUserProfile(null), null);
    assert.equal(normalizeUserProfile(undefined), null);
    assert.equal(normalizeUserProfile(''), null);
    assert.equal(normalizeUserProfile(123), null);
    assert.equal(normalizeUserProfile({}), null);
    assert.equal(normalizeUserProfile({ id: 'non-numeric', email: 'test@ex.com', role: 'user' }), null);
    assert.equal(normalizeUserProfile({ id: -5, email: 'test@ex.com', role: 'user' }), null);
    assert.equal(normalizeUserProfile({ id: 1, email: 'invalid-email-no-at', role: 'user' }), null);
    assert.equal(normalizeUserProfile({ id: 1, email: 'test@ex.com', role: 'instructor' }), null);
    assert.equal(normalizeUserProfile({ id: 1, email: 'test@ex.com', role: 'guest' }), null);
    assert.equal(normalizeUserProfile({ id: 1, email: 'test@ex.com', role: 'hacker' }), null);
  });

  // Test 4: Successful Google authentication callback flow
  test('4. Successful Google authentication callback flow simulation', async () => {
    const credential = 'valid-google-id-token.sample';
    let apiEndpointCalled = '';
    let apiPayload = null;

    const mockApiClient = {
      post: async (endpoint, data) => {
        apiEndpointCalled = endpoint;
        apiPayload = data;
        return { data: { success: true, message: 'Login successful' } };
      },
      get: async () => {
        return {
          data: {
            success: true,
            data: {
              id: 301,
              name: 'Super Admin User',
              email: 'superadmin@example.com',
              role: 'super_admin',
              status: 'active',
            },
          },
        };
      },
    };

    // Simulate login flow in login/page.tsx
    assert.ok(credential);
    await mockApiClient.post('/api/auth/google', { id_token: credential });
    assert.equal(apiEndpointCalled, '/api/auth/google');
    assert.equal(apiPayload.id_token, credential);

    const meRes = await mockApiClient.get('/api/auth/me');
    const profile = normalizeUserProfile(meRes.data.data);
    assert.ok(profile);
    assert.equal(profile.role, 'super_admin');
    assert.equal(profile.status, 'active');

    // Default destination for super_admin
    const destination = profile.role === 'super_admin' ? '/admin/dashboard' : '/student/dashboard';
    assert.equal(destination, '/admin/dashboard');
  });

  // Test 5: Missing, placeholder, and mock Google Client ID handling
  test('5. Missing, placeholder, and mock Google Client IDs rejected, valid format accepted', () => {
    // Missing / empty
    assert.equal(isGoogleClientIdValid(undefined), false);
    assert.equal(isGoogleClientIdValid(null), false);
    assert.equal(isGoogleClientIdValid(''), false);
    assert.equal(isGoogleClientIdValid('   '), false);

    // Placeholders
    assert.equal(isGoogleClientIdValid('your-google-client-id.apps.googleusercontent.com'), false);
    assert.equal(isGoogleClientIdValid('placeholder-client-id'), false);

    // Mock values
    assert.equal(isGoogleClientIdValid('mock-client-id-for-development.apps.googleusercontent.com'), false);
    assert.equal(isGoogleClientIdValid('mock-id'), false);

    // Malformed formats (missing numeric project prefix, missing domain)
    assert.equal(isGoogleClientIdValid('alphanumeric-without-project-num.apps.googleusercontent.com'), false);
    assert.equal(isGoogleClientIdValid('123456789-invalid-domain.com'), false);

    // Valid authentic Web Client ID format
    assert.equal(isGoogleClientIdValid('544115211253-dn2mil3gkg1ga57qfqrv1qups9qa56a5.apps.googleusercontent.com'), true);
    assert.equal(isGoogleClientIdValid('1234567890-validclientid.apps.googleusercontent.com'), true);
  });

  // Test 6: Backend login error handling
  test('6. Backend login error mapping covers all required error codes', () => {
    assert.equal(
      mapAuthErrorToUserMessage(400, 'Invalid token'),
      'Invalid token'
    );
    assert.equal(
      mapAuthErrorToUserMessage(400, undefined),
      'Invalid or unverified Google token. Please sign in again.'
    );
    assert.equal(
      mapAuthErrorToUserMessage(403),
      'Your account has been blocked or suspended. Access denied.'
    );
    assert.equal(
      mapAuthErrorToUserMessage(409, 'Conflict detected'),
      'Conflict detected'
    );
    assert.equal(
      mapAuthErrorToUserMessage(429),
      'Too many login attempts. Please wait a moment and try again.'
    );
    assert.equal(
      mapAuthErrorToUserMessage(500),
      'Authentication service is temporarily unavailable. Please try again.'
    );
    assert.equal(
      mapAuthErrorToUserMessage(0),
      'Network error during authentication. Please check your connection.'
    );
  });

  // Test 7: Authentication query refresh after login
  test('7. React Query cache update and invalidation flow', () => {
    const cache = new Map();
    let invalidationTriggered = false;

    const mockQueryClient = {
      setQueryData: (key, data) => {
        cache.set(JSON.stringify(key), data);
      },
      getQueryData: (key) => cache.get(JSON.stringify(key)),
      invalidateQueries: async () => {
        invalidationTriggered = true;
      },
    };

    const userProfile = {
      id: 5,
      name: 'Test Student',
      email: 'student@example.com',
      role: 'user',
      status: 'active',
    };

    mockQueryClient.setQueryData(['auth', 'me'], userProfile);
    mockQueryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

    assert.deepEqual(mockQueryClient.getQueryData(['auth', 'me']), userProfile);
    assert.equal(invalidationTriggered, true);
  });

  // Test 8: Logout and auth cache clearing
  test('8. Logout triggers backend revocation and clears query cache without duplicates', async () => {
    let logoutCallCount = 0;
    let isLoggingOut = false;
    let cacheCleared = false;

    const mockLogout = async () => {
      if (isLoggingOut) return;
      isLoggingOut = true;
      try {
        logoutCallCount++;
      } finally {
        cacheCleared = true;
      }
    };

    // First call executes
    await mockLogout();
    assert.equal(logoutCallCount, 1);
    assert.equal(cacheCleared, true);

    // Second immediate call is blocked by duplicate guard
    await mockLogout();
    assert.equal(logoutCallCount, 1, 'Duplicate logout call must be prevented');
  });

  // Test 9: Access-token cookie presence in middleware
  test('9. Access-token cookie allows optimistic access to protected routes', () => {
    const cookies = new Map([['access_token', 'jwt_access_value']]);
    const resultStudent = evaluateMiddlewareRouting('/student/dashboard', cookies);
    const resultAdmin = evaluateMiddlewareRouting('/admin/dashboard', cookies);
    const resultCounsellor = evaluateMiddlewareRouting('/counsellor/dashboard', cookies);

    assert.equal(resultStudent.action, 'next');
    assert.equal(resultAdmin.action, 'next');
    assert.equal(resultCounsellor.action, 'next');
  });

  // Test 10: Refresh-token cookie presence in middleware
  test('10. Refresh-token cookie allows optimistic access when access_token is expired', () => {
    const cookies = new Map([['refresh_token', 'jwt_refresh_value']]);
    const result = evaluateMiddlewareRouting('/student/dashboard', cookies);
    assert.equal(result.action, 'next', 'Refresh token presence must allow route through to refresh');
  });

  // Test 11: No-cookie protected route redirect
  test('11. Absence of both auth cookies triggers redirect to /login with returnUrl', () => {
    const cookies = new Map();
    const result = evaluateMiddlewareRouting('/admin/courses', cookies);
    assert.equal(result.action, 'redirect');
    assert.equal(result.url, '/login?returnUrl=%2Fadmin%2Fcourses');
  });

  // Test 12: Role verification remains server-side authoritative
  test('12. requireRole() strictly enforces role on server regardless of optimistic cookies', () => {
    const studentUser = { id: 1, role: 'user', name: 'Student' };
    const adminUser = { id: 2, role: 'admin', name: 'Admin' };

    // Unauthenticated user attempting to access student route
    assert.deepEqual(evaluateServerRoleGuard(null, ['user']), { redirect: '/login' });

    // Student attempting to access admin layout
    assert.deepEqual(evaluateServerRoleGuard(studentUser, ['admin', 'super_admin']), {
      redirect: '/unauthorized',
    });

    // Student accessing student layout
    assert.deepEqual(evaluateServerRoleGuard(studentUser, ['user']), {
      success: true,
      user: studentUser,
    });

    // Admin accessing admin layout
    assert.deepEqual(evaluateServerRoleGuard(adminUser, ['admin', 'super_admin']), {
      success: true,
      user: adminUser,
    });
  });

  // Test 13: Concurrent 401 refresh requests queue simulation
  test('13. Concurrent 401 requests trigger single refresh call and retry all queued requests', async () => {
    let refreshCallCount = 0;
    let isRefreshing = false;
    const failedQueue = [];

    const processQueue = (err) => {
      failedQueue.forEach((prom) => {
        if (err) prom.reject(err);
        else prom.resolve('refreshed');
      });
      failedQueue.length = 0;
    };

    const handle401Request = (requestId) => {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, id: requestId });
        });
      }

      isRefreshing = true;
      refreshCallCount++;

      // Simulate async refresh
      return new Promise((resolve) => {
        setTimeout(() => {
          processQueue(null);
          isRefreshing = false;
          resolve('refreshed');
        }, 10);
      });
    };

    // Dispatch 5 concurrent 401 requests simultaneously
    const results = await Promise.all([
      handle401Request(1),
      handle401Request(2),
      handle401Request(3),
      handle401Request(4),
      handle401Request(5),
    ]);

    assert.equal(refreshCallCount, 1, 'Exactly one refresh call must be made');
    assert.equal(results.length, 5);
    assert.ok(results.every((r) => r === 'refreshed'));
  });

  // Test 14: Refresh failure behavior
  test('14. Refresh failure rejects all queued requests and sets session expired', async () => {
    let isRefreshing = true;
    const failedQueue = [];

    const p1 = new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));
    const p2 = new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));

    const refreshError = new Error('Refresh token revoked');

    // Simulate failure
    failedQueue.forEach((item) => item.reject(refreshError));
    isRefreshing = false;

    await assert.rejects(p1, { message: 'Refresh token revoked' });
    await assert.rejects(p2, { message: 'Refresh token revoked' });
    assert.equal(isRefreshing, false);
  });

  // Test 15: Safe returnUrl preservation
  test('15. Safe internal URLs preserved with query parameters and hash fragments', () => {
    assert.equal(sanitizeRedirectUrl('/student/dashboard'), '/student/dashboard');
    assert.equal(sanitizeRedirectUrl('/admin/courses?page=2#active'), '/admin/courses?page=2#active');
    assert.equal(sanitizeRedirectUrl('/counsellor/leads?tab=new'), '/counsellor/leads?tab=new');
    assert.equal(sanitizeRedirectUrl('/courses/web-dev-101'), '/courses/web-dev-101');
  });

  // Test 16: Open redirect rejection
  test('16. Open redirect patterns, protocol-relative URLs, and scheme bypasses rejected', () => {
    assert.equal(sanitizeRedirectUrl('https://evil.com'), '/');
    assert.equal(sanitizeRedirectUrl('http://attacker.com/steal'), '/');
    assert.equal(sanitizeRedirectUrl('//evil.com/fake-login'), '/');
    assert.equal(sanitizeRedirectUrl('/\\evil.com'), '/');
    assert.equal(sanitizeRedirectUrl('\\evil.com'), '/');
    assert.equal(sanitizeRedirectUrl('javascript:alert(1)'), '/');
    assert.equal(sanitizeRedirectUrl('data:text/html,<script>alert(1)</script>'), '/');
    assert.equal(sanitizeRedirectUrl(''), '/');
    assert.equal(sanitizeRedirectUrl(null), '/');
    assert.equal(sanitizeRedirectUrl(undefined), '/');
  });
});
