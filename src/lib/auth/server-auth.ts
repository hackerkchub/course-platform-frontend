import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserProfile, UserRole } from '@/types/auth';
import { normalizeUserProfile } from './normalize';

export { normalizeUserProfile };

const backendUrl = (
  process.env.BACKEND_URL ||
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.guidexa.in'
)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

/**
 * Authoritative Server-Side Session Verification
 * Forwards HTTP-only cookies to backend GET /api/auth/me
 */
export async function verifyServerSession(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  if (!cookieStore.has('access_token') && !cookieStore.has('refresh_token')) {
    return null;
  }

  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (!json || !json.success) {
      return null;
    }

    return normalizeUserProfile(json.data?.user || json.data);
  } catch (error) {
    console.error('Server session verification error:', error);
    return null;
  }
}

/**
 * Enforces role authorization in Server Components / Layouts
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserProfile> {
  const user = await verifyServerSession();

  if (!user) {
    redirect('/login');
  }

  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  return user;
}
