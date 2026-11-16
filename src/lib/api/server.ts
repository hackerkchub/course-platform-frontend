import { cookies } from 'next/headers';
import { ApiResponse } from '@/types/api';

const backendUrl = (
  process.env.BACKEND_URL ||
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.guidexa.in'
)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

interface ServerFetchOptions extends RequestInit {
  tags?: string[];
  revalidate?: number | false;
}

interface ServerCustomError extends Error {
  status?: number;
  data?: unknown;
}

/**
 * Server-side native fetch wrapper for React Server Components (RSC)
 * Automatically forwards incoming client HTTP-only cookies to the backend Express server
 */
export async function serverFetch<T = unknown>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<ApiResponse<T>> {
  let cookieHeader = '';
  try {
    const cookieStore = await cookies();
    cookieHeader = cookieStore.toString();
  } catch {
    // In static rendering or sitemap/robots, cookies() may not be available
  }

  const url = endpoint.startsWith('http') ? endpoint : `${backendUrl}${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }

  const nextOptions: Record<string, unknown> = {};
  if (options.tags) {
    nextOptions.tags = options.tags;
  }
  if (options.revalidate !== undefined) {
    nextOptions.revalidate = options.revalidate;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    ...(Object.keys(nextOptions).length > 0 ? { next: nextOptions } : {}),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const errorMsg =
      typeof data.message === 'string'
        ? data.message
        : `Backend request failed with HTTP ${response.status}`;
    const error: ServerCustomError = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as unknown as ApiResponse<T>;
}

export default serverFetch;
