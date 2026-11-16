'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { normalizeUserProfile } from '@/lib/auth/normalize';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GraduationCap, ShieldCheck, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: number | string;
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt?: (notification?: unknown) => void;
        };
      };
    };
  }
}

/**
 * Safely resolves and validates an internal client redirect target.
 *
 * Security Requirements:
 * 1. Must be a relative path beginning with a single '/'
 * 2. Rejects protocol-relative URLs (e.g. '//example.com')
 * 3. Rejects backslash bypasses (e.g. '/\example.com', '\example.com')
 * 4. Rejects explicit schemes (e.g. 'http:', 'https:', 'javascript:', 'data:')
 * 5. Returns safe fallback '/' if validation fails.
 */
function sanitizeRedirectUrl(target: string | null | undefined): string {
  if (!target || typeof target !== 'string') {
    return '/';
  }

  const trimmed = target.trim();

  // Must begin with a single '/' and not with '//' or '/\'
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes('\\')
  ) {
    return '/';
  }

  try {
    // Parse against a dummy base origin to verify internal path integrity
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost' || !parsed.pathname.startsWith('/')) {
      return '/';
    }

    // Preserve pathname + search parameters + hash for in-app routing
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

/**
 * Validates Google OAuth 2.0 Web Client ID format.
 *
 * Requirements:
 * 1. Must be a non-empty string.
 * 2. Rejects placeholder strings (e.g. 'your-google-client-id').
 * 3. Rejects mock strings (e.g. 'mock-client-id...').
 * 4. Conforms to standard Google Web Client ID format:
 *    <project-number>-<client-hash>.apps.googleusercontent.com
 */
function isGoogleClientIdValid(clientId: string | null | undefined): boolean {
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

  // Standard Google OAuth Web Client ID regex:
  // e.g. 123456789012-exampleclientid1234567890abcdef.apps.googleusercontent.com
  const googleClientIdRegex = /^[0-9]+-[a-z0-9_]+\.apps\.googleusercontent\.com$/i;
  return googleClientIdRegex.test(trimmed);
}

function LoginForm() {
  const searchParams = useSearchParams();
  const rawTarget = searchParams.get('returnUrl') || searchParams.get('redirect') || '/';
  const redirectTarget = sanitizeRedirectUrl(rawTarget);
  const sessionExpired = searchParams.get('session_expired') === 'true';

  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const isGisInitialized = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';
  const isClientIdConfigured = isGoogleClientIdValid(clientId);

  const handleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response?.credential) {
        setError('Failed to obtain credentials from Google. Please try again.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Submit Google ID token to backend POST /api/auth/google
        await apiClient.post(
          API_ENDPOINTS.auth.google,
          { id_token: response.credential },
          { withCredentials: true }
        );

        // 2. Fetch authenticated profile via GET /api/auth/me
        const meRes = await apiClient.get(API_ENDPOINTS.auth.me, {
          withCredentials: true,
        });

        // 3. Normalize response format safely
        const normalizedUser = normalizeUserProfile(
          meRes.data?.data?.user || meRes.data?.data
        );

        // 4. Validate profile role and active status
        if (
          !normalizedUser ||
          !['user', 'counsellor', 'admin', 'super_admin'].includes(normalizedUser.role)
        ) {
          setError('Unable to verify user account permissions. Please contact support.');
          setIsLoading(false);
          return;
        }

        if (normalizedUser.status === 'blocked') {
          setError('Your account has been suspended. Please contact support.');
          setIsLoading(false);
          return;
        }

        // 5. Update React Query authentication cache
        queryClient.setQueryData(['auth', 'me'], normalizedUser);
        await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

        // 6. Safe redirection
        let destination = redirectTarget;
        if (!destination || destination === '/') {
          if (normalizedUser.role === 'admin' || normalizedUser.role === 'super_admin') {
            destination = '/admin/dashboard';
          } else if (normalizedUser.role === 'counsellor') {
            destination = '/counsellor/dashboard';
          } else {
            destination = '/student/dashboard';
          }
        }

        window.location.href = destination;
      } catch (err: unknown) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data = err.response?.data as { message?: string } | undefined;
          const backendMessage = data?.message;

          if (status === 400) {
            setError(
              backendMessage ||
                'Invalid or unverified Google token. Please sign in again.'
            );
          } else if (status === 401) {
            setError(
              backendMessage ||
                'Authentication failed or session expired. Please sign in again.'
            );
          } else if (status === 403) {
            setError('Your account has been blocked or suspended. Access denied.');
          } else if (status === 409) {
            setError(
              backendMessage ||
                'An account conflict occurred with this Google account. Please contact support.'
            );
          } else if (status === 429) {
            setError('Too many login attempts. Please wait a moment and try again.');
          } else if (status && status >= 500) {
            setError('Authentication service is temporarily unavailable. Please try again.');
          } else {
            setError('Network error during authentication. Please check your connection.');
          }
        } else {
          setError('An unexpected error occurred during authentication.');
        }
      }
    },
    [redirectTarget, queryClient]
  );

  // Initialize Google Identity Services once script is ready and Client ID is valid
  useEffect(() => {
    if (!scriptLoaded || !isClientIdConfigured || !clientId) {
      return;
    }

    if (isGisInitialized.current) {
      return;
    }

    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 380,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }

      isGisInitialized.current = true;
    } catch (err) {
      console.error('Failed to initialize Google Identity Services:', err);
      setError('Failed to initialize Google Sign-In. Please reload the page.');
    }
  }, [scriptLoaded, isClientIdConfigured, clientId, handleCredentialResponse]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setScriptError(true)}
      />

      <Card className="w-full max-w-md shadow-xl border-slate-200/80 dark:border-slate-800">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign In to Your Account</CardTitle>
          <CardDescription>
            Access your courses, live cohorts, and verified certificates.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {sessionExpired && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2 dark:bg-red-950/60 dark:border-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {scriptError && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Unable to load Google Identity Services. Please check your internet connection or
                disable content blockers and reload.
              </span>
            </div>
          )}

          {!isClientIdConfigured && (
            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold">Google Sign-In Configuration Required</p>
                <p className="mt-0.5 text-blue-700 dark:text-blue-300">
                  Please configure a valid <code className="font-mono text-[11px] bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your environment to enable live Google authentication.
                </p>
              </div>
            </div>
          )}

          {/* Google Identity Services Render Target */}
          {isLoading ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Authenticating with server...</span>
            </div>
          ) : isClientIdConfigured ? (
            <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
              <div
                ref={googleBtnContainerRef}
                id="google-signin-btn-container"
                className="w-full flex justify-center"
              />
              {!scriptLoaded && !scriptError && (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading Google Identity Services...</span>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="lg"
              disabled
              className="w-full justify-center gap-3 border-slate-300 dark:border-slate-700 opacity-60 cursor-not-allowed"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="font-semibold text-sm">Continue with Google (Setup Required)</span>
            </Button>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secure HTTP-Only session encryption</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-slate-600">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-slate-600">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-blue-600" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
