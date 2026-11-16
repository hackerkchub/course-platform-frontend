import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from './endpoints';

/**
 * In browser environments, use same-origin relative URLs ('') so requests route through
 * Next.js rewrite proxy (/api/* -> BACKEND_URL/api/*).
 * This ensures cookies (SameSite=Lax) are set and sent as first-party cookies without cross-origin rejection.
 * On server-side / build-time, use the canonical BACKEND_URL.
 */
export const apiBaseUrl =
  typeof window !== 'undefined'
    ? ''
    : (
        process.env.BACKEND_URL ||
        process.env.INTERNAL_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'https://api.guidexa.in'
      )
        .trim()
        .replace(/\/+$/, '')
        .replace(/\/api$/, '');

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: Error | null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignore non-401 errors, or auth endpoints to prevent endless loops
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/logout') ||
      originalRequest.url?.includes('/api/auth/google') ||
      originalRequest.url?.includes('/api/auth/me')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call backend refresh endpoint (browser forwards httpOnly refresh_token cookie)
      await axios.post(`${apiBaseUrl}${API_ENDPOINTS.auth.refresh}`, {}, { withCredentials: true });
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error);
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (
          currentPath.startsWith('/student') ||
          currentPath.startsWith('/admin') ||
          currentPath.startsWith('/counsellor')
        ) {
          window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}&session_expired=true`;
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
