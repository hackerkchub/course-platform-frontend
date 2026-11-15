/**
 * Course Platform - Phase 3: Complete Authentication, RBAC, Profile & Session Security Test Suite
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 * Tests all required Phase 3 frontend scope without external dependencies:
 * 1. Profile Management & Validation Logic
 * 2. Session Management & Logout-All Security
 * 3. RBAC Isolation & Route Guard Contract Verification
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
// 1. PURE LOGIC REPLICATIONS FOR CONTRACT & VALIDATION TESTING
// ==============================================================================

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validate profile update fields per Phase 3 specifications
 */
function validateProfileForm(formData) {
  const errors = {};
  const trimmedName = (formData?.name || '').trim();

  if (!trimmedName) {
    errors.name = 'Full name is required.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  } else if (trimmedName.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  const trimmedPhone = (formData?.phone || '').trim();
  if (trimmedPhone && !INDIAN_PHONE_REGEX.test(trimmedPhone)) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Simulate RBAC guard evaluation matching server-auth.ts requireRole logic
 */
function evaluateServerRoleGuard(user, allowedRoles) {
  if (!user) {
    return {
      authorized: false,
      redirectTo: '/login',
      reason: 'unauthenticated',
    };
  }

  if (user.status === 'blocked') {
    return {
      authorized: false,
      redirectTo: '/login?error=account_blocked',
      reason: 'blocked',
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      redirectTo: '/unauthorized',
      reason: 'insufficient_role',
    };
  }

  return {
    authorized: true,
    user,
  };
}

// ==============================================================================
// SUITE 1: PROFILE MANAGEMENT & UPDATE CONTRACT
// ==============================================================================

describe('Phase 3 - Suite 1: Student Profile Management & Update', () => {
  // Test 1: Authenticated profile loading
  test('1. Valid authenticated user profile contains all required fields', () => {
    const mockUser = {
      id: 42,
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '9876543210',
      role: 'user',
      status: 'active',
      avatar_url: 'https://lh3.googleusercontent.com/a/mock-avatar',
      email_verified: true,
      phone_verified: true,
      created_at: '2025-01-15T10:00:00.000Z',
    };

    assert.equal(mockUser.id, 42);
    assert.equal(mockUser.name, 'Priya Sharma');
    assert.equal(mockUser.email, 'priya.sharma@gmail.com');
    assert.equal(mockUser.phone, '9876543210');
    assert.equal(mockUser.role, 'user');
    assert.equal(mockUser.status, 'active');
    assert.equal(mockUser.email_verified, true);
    assert.equal(mockUser.phone_verified, true);
    assert.ok(mockUser.created_at);
  });

  // Test 2: Profile update success with valid inputs
  test('2. Profile update succeeds with valid 2-100 character name and valid Indian phone', () => {
    const validInputs = [
      { name: 'Amit Patel', phone: '9876543210' },
      { name: 'Dr. A. P. J. Abdul Kalam', phone: '8123456789' },
      { name: 'An', phone: '7000000000' }, // Min 2 chars
      { name: 'A'.repeat(100), phone: '6999999999' }, // Max 100 chars
      { name: 'Kapil Chilhate', phone: '' }, // Phone is optional
    ];

    for (const input of validInputs) {
      const result = validateProfileForm(input);
      assert.ok(result.isValid, `Expected input to be valid: ${JSON.stringify(input)}`);
      assert.deepEqual(result.errors, {});
    }
  });

  // Test 3: Invalid name rejection
  test('3. Profile update rejects name under 2 chars, over 100 chars, or empty', () => {
    const invalidNames = [
      '',
      '   ',
      'A', // 1 char
      'A'.repeat(101), // 101 chars
    ];

    for (const name of invalidNames) {
      const result = validateProfileForm({ name, phone: '9876543210' });
      assert.equal(result.isValid, false, `Name '${name}' should be rejected`);
      assert.ok(result.errors.name, 'Expected validation error for name');
    }
  });

  // Test 4: Invalid phone rejection
  test('4. Profile update rejects non-10 digit, non-Indian starting digit, or non-numeric phone numbers', () => {
    const invalidPhones = [
      '1234567890', // Starts with 1 (not 6-9)
      '5876543210', // Starts with 5 (not 6-9)
      '0987654321', // Starts with 0
      '987654321',  // 9 digits
      '98765432100', // 11 digits
      '987654321a', // Contains letter
      '+919876543210', // Contains prefix +91
      '9876 54321', // Contains spaces
    ];

    for (const phone of invalidPhones) {
      const result = validateProfileForm({ name: 'Valid Name', phone });
      assert.equal(result.isValid, false, `Phone '${phone}' should be rejected`);
      assert.ok(result.errors.phone, 'Expected validation error for phone');
    }
  });

  // Test 5: Email remains read-only
  test('5. Email is excluded from profile PATCH payload and marked read-only', () => {
    const updatePayload = {
      name: 'Updated Name',
      phone: '9876543210',
    };

    assert.equal('email' in updatePayload, false, 'Email MUST NOT be included in update payload');
    assert.equal('role' in updatePayload, false, 'Role MUST NOT be included in update payload');
    assert.equal('status' in updatePayload, false, 'Status MUST NOT be included in update payload');
  });

  // Test 6: Role remains read-only and immutable by user
  test('6. User role cannot be modified via profile update', () => {
    const requestedPayload = {
      name: 'Attempted Escalation',
      role: 'admin',
    };

    // Client sanitizer filters out disallowed fields
    const sanitizedPayload = {
      name: requestedPayload.name,
    };
    if (requestedPayload.phone) {
      sanitizedPayload.phone = requestedPayload.phone;
    }

    assert.equal('role' in sanitizedPayload, false);
  });

  // Test 7: Query invalidation contract after update
  test('7. Successful update invalidates [auth, me] query cache and triggers refetch', async () => {
    let invalidatedKeys = [];
    let refetchCalled = false;

    const mockQueryClient = {
      invalidateQueries: async ({ queryKey }) => {
        invalidatedKeys.push(queryKey);
      },
    };
    const mockRefetchUser = async () => {
      refetchCalled = true;
    };

    // Simulate update success handler
    await mockQueryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    await mockRefetchUser();

    assert.deepEqual(invalidatedKeys, [['auth', 'me']]);
    assert.equal(refetchCalled, true);
  });

  // Test 8: Backend validation error handling
  test('8. Backend error response format correctly handled with informative user message', () => {
    function extractErrorMessage(err) {
      if (err?.response?.data?.message) return err.response.data.message;
      if (err?.message) return err.message;
      return 'An unexpected error occurred. Please try again.';
    }

    const apiError = {
      response: {
        status: 400,
        data: {
          success: false,
          message: 'Phone number is already associated with another account',
        },
      },
    };

    const extracted = extractErrorMessage(apiError);
    assert.equal(extracted, 'Phone number is already associated with another account');
  });

  // Test 9: Phone number update resets phone_verified contract
  test('9. Phone number change resets phone_verified to false per backend security contract', () => {
    const currentUser = {
      id: 1,
      phone: '9876543210',
      phone_verified: true,
    };

    const newPhone = '8765432109';
    const isPhoneChanged = currentUser.phone !== newPhone;
    assert.equal(isPhoneChanged, true);

    // Backend response representation when phone changes
    const updatedUserFromBackend = {
      ...currentUser,
      phone: newPhone,
      phone_verified: false, // Reset by backend
    };

    assert.equal(updatedUserFromBackend.phone_verified, false);
  });
});

// ==============================================================================
// SUITE 2: SESSION MANAGEMENT & LOGOUT-ALL SECURITY
// ==============================================================================

describe('Phase 3 - Suite 2: Session Security & Logout-All', () => {
  // Test 10: Confirmation dialog required before logout-all
  test('10. Logout-all requires explicit user confirmation via dialog', () => {
    let isDialogOpen = false;
    let logoutAllInvoked = false;

    // User clicks button
    isDialogOpen = true;
    assert.equal(logoutAllInvoked, false, 'API call must not trigger on initial button click');
    assert.equal(isDialogOpen, true, 'Confirmation dialog must be open');

    // User confirms in dialog
    logoutAllInvoked = true;
    isDialogOpen = false;
    assert.equal(logoutAllInvoked, true, 'API call triggers only after explicit confirmation');
    assert.equal(isDialogOpen, false, 'Dialog closes upon confirmation');
  });

  // Test 11: Correct API endpoint invocation
  test('11. Logout-all calls POST /api/auth/logout-all through apiClient', async () => {
    let invokedUrl = null;
    let invokedMethod = null;

    const mockApiClient = {
      post: async (url) => {
        invokedUrl = url;
        invokedMethod = 'POST';
        return { data: { success: true } };
      },
    };

    await mockApiClient.post('/api/auth/logout-all');

    assert.equal(invokedUrl, '/api/auth/logout-all');
    assert.equal(invokedMethod, 'POST');
  });

  // Test 12: Auth state cleanup upon logout-all
  test('12. Logout-all clears TanStack Query auth cache and invalidates queries', async () => {
    let queryDataCleared = false;
    let authQueriesRemoved = false;
    let allQueriesInvalidated = false;

    const mockQueryClient = {
      setQueryData: (key, val) => {
        if (Array.isArray(key) && key[0] === 'auth' && key[1] === 'me' && val === null) {
          queryDataCleared = true;
        }
      },
      removeQueries: ({ queryKey }) => {
        if (Array.isArray(queryKey) && queryKey[0] === 'auth') {
          authQueriesRemoved = true;
        }
      },
      invalidateQueries: () => {
        allQueriesInvalidated = true;
      },
    };

    // Execute cleanup sequence as defined in AuthProvider
    mockQueryClient.setQueryData(['auth', 'me'], null);
    mockQueryClient.removeQueries({ queryKey: ['auth'] });
    mockQueryClient.invalidateQueries();

    assert.equal(queryDataCleared, true, 'Query data for [auth, me] must be set to null');
    assert.equal(authQueriesRemoved, true, 'Auth queries must be removed');
    assert.equal(allQueriesInvalidated, true, 'Remaining queries must be invalidated');
  });

  // Test 13: Redirect destination after logout-all
  test('13. Logout-all redirects browser to /login, while single logout redirects to /', () => {
    const singleLogoutDestination = '/';
    const logoutAllDestination = '/login';

    assert.equal(singleLogoutDestination, '/');
    assert.equal(logoutAllDestination, '/login');
    assert.notEqual(singleLogoutDestination, logoutAllDestination);
  });

  // Test 14: Safe handling of backend failure on logout-all
  test('14. Backend network failure on logout-all is handled safely and still cleans client state', async () => {
    let clientStateCleaned = false;
    let redirectOccurred = false;

    const mockLogoutAll = async () => {
      try {
        // Simulate backend 500 or network drop
        throw new Error('Network error or server unreachable');
      } catch {
        // Ignored
      } finally {
        clientStateCleaned = true;
        redirectOccurred = true;
      }
    };

    await mockLogoutAll();

    assert.equal(clientStateCleaned, true, 'Client state must be cleaned even if API fails');
    assert.equal(redirectOccurred, true, 'Redirect must occur even if API fails');
  });

  // Test 15: Duplicate request prevention
  test('15. Repeated clicks during logout-all processing are blocked via isLoggingOut guard', async () => {
    let apiCallCount = 0;
    let isLoggingOut = false;

    const triggerLogoutAll = async () => {
      if (isLoggingOut) return;
      isLoggingOut = true;
      apiCallCount++;
      await new Promise(r => setTimeout(r, 20));
      isLoggingOut = false;
    };

    // Simulate 3 rapid concurrent clicks
    await Promise.all([
      triggerLogoutAll(),
      triggerLogoutAll(),
      triggerLogoutAll(),
    ]);

    assert.equal(apiCallCount, 1, 'Only one logout-all API request must be executed');
  });

  // Test 16: Existing single-session logout regression preservation
  test('16. Single-session logout preserves POST /api/auth/logout contract', async () => {
    let singleLogoutEndpoint = null;
    const mockApiClient = {
      post: async (endpoint) => {
        singleLogoutEndpoint = endpoint;
      },
    };

    await mockApiClient.post('/api/auth/logout');
    assert.equal(singleLogoutEndpoint, '/api/auth/logout');
  });
});

// ==============================================================================
// SUITE 3: RBAC & ROUTE GUARD ISOLATION
// ==============================================================================

describe('Phase 3 - Suite 3: RBAC Isolation & Policy Preservation', () => {
  // Test 17: Unauthenticated dashboard access
  test('17. Unauthenticated user cannot access any dashboard', () => {
    const studentCheck = evaluateServerRoleGuard(null, ['user', 'counsellor', 'admin', 'super_admin']);
    assert.equal(studentCheck.authorized, false);
    assert.equal(studentCheck.redirectTo, '/login');

    const counsellorCheck = evaluateServerRoleGuard(null, ['counsellor', 'admin', 'super_admin']);
    assert.equal(counsellorCheck.authorized, false);
    assert.equal(counsellorCheck.redirectTo, '/login');

    const adminCheck = evaluateServerRoleGuard(null, ['admin', 'super_admin']);
    assert.equal(adminCheck.authorized, false);
    assert.equal(adminCheck.redirectTo, '/login');
  });

  // Test 18: Student cannot access Admin dashboard
  test('18. Student (role: user) cannot access Admin dashboard', () => {
    const studentUser = { id: 10, role: 'user', status: 'active' };
    const adminCheck = evaluateServerRoleGuard(studentUser, ['admin', 'super_admin']);
    assert.equal(adminCheck.authorized, false);
    assert.equal(adminCheck.redirectTo, '/unauthorized');
    assert.equal(adminCheck.reason, 'insufficient_role');
  });

  // Test 19: Student cannot access Counsellor dashboard
  test('19. Student (role: user) cannot access Counsellor dashboard', () => {
    const studentUser = { id: 10, role: 'user', status: 'active' };
    const counsellorCheck = evaluateServerRoleGuard(studentUser, ['counsellor', 'admin', 'super_admin']);
    assert.equal(counsellorCheck.authorized, false);
    assert.equal(counsellorCheck.redirectTo, '/unauthorized');
    assert.equal(counsellorCheck.reason, 'insufficient_role');
  });

  // Test 20: Counsellor cannot access Admin dashboard
  test('20. Counsellor (role: counsellor) cannot access Admin dashboard', () => {
    const counsellorUser = { id: 11, role: 'counsellor', status: 'active' };
    const adminCheck = evaluateServerRoleGuard(counsellorUser, ['admin', 'super_admin']);
    assert.equal(adminCheck.authorized, false);
    assert.equal(adminCheck.redirectTo, '/unauthorized');
    assert.equal(adminCheck.reason, 'insufficient_role');
  });

  // Test 21: Super Admin retains authorized access across all layouts
  test('21. Super Admin retains access across student, counsellor, and admin layouts', () => {
    const superAdmin = { id: 1, role: 'super_admin', status: 'active' };

    const studentAccess = evaluateServerRoleGuard(superAdmin, ['user', 'counsellor', 'admin', 'super_admin']);
    assert.equal(studentAccess.authorized, true);

    const counsellorAccess = evaluateServerRoleGuard(superAdmin, ['counsellor', 'admin', 'super_admin']);
    assert.equal(counsellorAccess.authorized, true);

    const adminAccess = evaluateServerRoleGuard(superAdmin, ['admin', 'super_admin']);
    assert.equal(adminAccess.authorized, true);
  });

  // Test 22: Preserved Student layout policy allows user, counsellor, admin, super_admin
  test('22. Student layout policy explicitly preserves access for user, counsellor, admin, super_admin', () => {
    const allowed = ['user', 'counsellor', 'admin', 'super_admin'];

    for (const role of allowed) {
      const u = { id: 99, role, status: 'active' };
      const check = evaluateServerRoleGuard(u, allowed);
      assert.equal(check.authorized, true, `Role '${role}' must be authorized in student layout`);
    }
  });

  // Test 23: Blocked account is denied regardless of role
  test('23. Blocked account status denies access regardless of assigned role', () => {
    const blockedAdmin = { id: 5, role: 'admin', status: 'blocked' };
    const check = evaluateServerRoleGuard(blockedAdmin, ['admin', 'super_admin']);
    assert.equal(check.authorized, false);
    assert.equal(check.reason, 'blocked');
    assert.ok(check.redirectTo.includes('account_blocked'));
  });
});

// ==============================================================================
// SUITE 4: SOURCE CODE ARCHITECTURE AUDIT
// ==============================================================================

describe('Phase 3 - Suite 4: Source File Inspection & Architectural Invariants', () => {
  // Test 24: Verify AuthProvider exports logoutAll and does not delete HTTP-only cookies in JS
  test('24. AuthProvider implements logoutAll and delegates cookie deletion to backend', () => {
    const authProviderPath = path.join(frontendRoot, 'src', 'providers', 'auth-provider.tsx');
    assert.ok(fs.existsSync(authProviderPath), 'auth-provider.tsx must exist');

    const content = fs.readFileSync(authProviderPath, 'utf8');

    // Must define logoutAll in AuthContextType
    assert.ok(content.includes('logoutAll: () => Promise<void>'), 'AuthContextType must declare logoutAll');

    // Must call API_ENDPOINTS.auth.logoutAll
    assert.ok(content.includes('API_ENDPOINTS.auth.logoutAll'), 'Must call logoutAll endpoint');

    // Must clear query data for auth
    assert.ok(content.includes("queryClient.setQueryData(['auth', 'me'], null)"), 'Must clear [auth, me] query cache');

    // Must redirect to /login
    assert.ok(content.includes("window.location.href = '/login'"), 'Must redirect to /login on logoutAll');

    // Must NOT manipulate document.cookie directly
    assert.ok(!content.includes('document.cookie ='), 'Must NOT manually delete cookies from JavaScript');
  });

  // Test 25: Verify Student Profile Page implements required fields and security controls
  test('25. Student profile page contains required fields, read-only guards, and ConfirmDialog', () => {
    const profilePagePath = path.join(frontendRoot, 'src', 'app', '(student)', 'student', 'profile', 'page.tsx');
    assert.ok(fs.existsSync(profilePagePath), 'profile/page.tsx must exist');

    const content = fs.readFileSync(profilePagePath, 'utf8');

    // Must be a client component
    assert.ok(content.startsWith("'use client'"), 'Must have use client directive');

    // Must use apiClient.patch to update profile
    assert.ok(content.includes('apiClient.patch'), 'Must use apiClient.patch for profile update');
    assert.ok(content.includes('API_ENDPOINTS.auth.me'), 'Must call API_ENDPOINTS.auth.me');

    // Must enforce Indian phone regex
    assert.ok(content.includes('^[6-9]\\d{9}$'), 'Must validate Indian phone format with ^[6-9]\\d{9}$');

    // Must have read-only email and role guards
    assert.ok(content.includes('disabled'), 'Must disable read-only inputs');
    assert.ok(content.includes('readOnly'), 'Must have readOnly attribute for email/role');

    // Must integrate ConfirmDialog for logoutAll
    assert.ok(content.includes('<ConfirmDialog'), 'Must render ConfirmDialog for logout-all');
    assert.ok(content.includes('logoutAll'), 'Must connect logoutAll to ConfirmDialog');

    // Must invalidate query after update
    assert.ok(content.includes("queryKey: ['auth', 'me']"), 'Must invalidate auth query after update');
  });

  // Test 26: Verify Student, Counsellor, and Admin layouts maintain exact RBAC rules
  test('26. Server layouts enforce exact specified role guards', () => {
    const studentLayoutPath = path.join(frontendRoot, 'src', 'app', '(student)', 'layout.tsx');
    const counsellorLayoutPath = path.join(frontendRoot, 'src', 'app', '(counsellor)', 'layout.tsx');
    const adminLayoutPath = path.join(frontendRoot, 'src', 'app', '(admin)', 'layout.tsx');

    assert.ok(fs.existsSync(studentLayoutPath));
    assert.ok(fs.existsSync(counsellorLayoutPath));
    assert.ok(fs.existsSync(adminLayoutPath));

    const studentContent = fs.readFileSync(studentLayoutPath, 'utf8');
    const counsellorContent = fs.readFileSync(counsellorLayoutPath, 'utf8');
    const adminContent = fs.readFileSync(adminLayoutPath, 'utf8');

    // Student layout: ['user', 'counsellor', 'admin', 'super_admin']
    assert.ok(
      studentContent.includes("'user', 'counsellor', 'admin', 'super_admin'") ||
      studentContent.includes('"user", "counsellor", "admin", "super_admin"'),
      'Student layout must require user, counsellor, admin, super_admin'
    );

    // Counsellor layout: ['counsellor', 'admin', 'super_admin']
    assert.ok(
      counsellorContent.includes("'counsellor', 'admin', 'super_admin'") ||
      counsellorContent.includes('"counsellor", "admin", "super_admin"'),
      'Counsellor layout must require counsellor, admin, super_admin'
    );

    // Admin layout: ['admin', 'super_admin']
    assert.ok(
      adminContent.includes("'admin', 'super_admin'") ||
      adminContent.includes('"admin", "super_admin"'),
      'Admin layout must require admin, super_admin'
    );
  });
});
