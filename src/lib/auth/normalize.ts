import { UserProfile, UserRole } from '@/types/auth';

const VALID_ROLES: ReadonlyArray<UserRole> = ['user', 'counsellor', 'admin', 'super_admin'];

/**
 * Safely normalizes and validates user profile responses from both:
 * - Direct profile payloads: res.data?.data (e.g., GET /api/auth/me)
 * - Nested user payloads: res.data?.data?.user (e.g., POST /api/auth/google)
 *
 * Ensures:
 * 1. Safe handling of null, undefined, primitives, and malformed structures.
 * 2. Strict validation of required fields: positive numeric id, valid email, supported role.
 * 3. Type-safe transformation conforming to UserProfile interface.
 * 4. Preserves backward and forward compatibility without leaking malformed state.
 */
export function normalizeUserProfile(raw: unknown): UserProfile | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  // Resolve candidate: check if nested under `user` or `data`
  let candidate: unknown = obj;
  if (obj.user && typeof obj.user === 'object') {
    candidate = obj.user;
  } else if (obj.data && typeof obj.data === 'object') {
    const dataObj = obj.data as Record<string, unknown>;
    candidate = dataObj.user && typeof dataObj.user === 'object' ? dataObj.user : dataObj;
  }

  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const target = candidate as Record<string, unknown>;

  // 1. Validate ID: positive finite number
  const parsedId = Number(target.id);
  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    return null;
  }

  // 2. Validate Email: non-empty string with '@'
  if (typeof target.email !== 'string') {
    return null;
  }
  const email = target.email.trim();
  if (!email || !email.includes('@')) {
    return null;
  }

  // 3. Validate Role: must be one of the supported UserRole values
  if (typeof target.role !== 'string') {
    return null;
  }
  const role = target.role.trim() as UserRole;
  if (!VALID_ROLES.includes(role)) {
    return null;
  }

  // 4. Validate and sanitize optional fields
  const name = typeof target.name === 'string' ? target.name.trim() : '';
  const status = target.status === 'blocked' ? 'blocked' : 'active';
  const avatarUrl =
    typeof target.avatar_url === 'string' && target.avatar_url.trim()
      ? target.avatar_url.trim()
      : null;
  const phone =
    typeof target.phone === 'string' && target.phone.trim()
      ? target.phone.trim()
      : null;

  const emailVerified = Boolean(target.email_verified);
  const phoneVerified = Boolean(target.phone_verified);
  const createdAt = typeof target.created_at === 'string' ? target.created_at : undefined;

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
