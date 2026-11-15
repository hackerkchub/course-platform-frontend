import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware
 * Performs non-authoritative optimistic route redirection based on cookie presence.
 * True cryptographic authorization is enforced server-side via requireRole() and backend API guards.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie =
    request.cookies.has('access_token') || request.cookies.has('refresh_token');

  const isStudentRoute = pathname.startsWith('/student');
  const isAdminRoute = pathname.startsWith('/admin');
  const isCounsellorRoute = pathname.startsWith('/counsellor');

  if (isStudentRoute || isAdminRoute || isCounsellorRoute) {
    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
    '/counsellor/:path*',
  ],
};
