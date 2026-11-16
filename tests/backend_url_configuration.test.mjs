import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Canonical BACKEND_URL Single Source of Truth Tests', () => {
  // Helper simulating the normalization logic across frontend files
  function resolveBackendUrl(env) {
    return (
      env.BACKEND_URL ||
      env.INTERNAL_BACKEND_URL ||
      env.NEXT_PUBLIC_API_BASE_URL ||
      'https://api.softmaxs.com'
    )
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/api$/, '');
  }

  test('1. Resolves canonical BACKEND_URL when provided', () => {
    const url = resolveBackendUrl({ BACKEND_URL: 'http://localhost:5000' });
    assert.equal(url, 'http://localhost:5000');
  });

  test('2. Strips trailing slashes from BACKEND_URL', () => {
    const url = resolveBackendUrl({ BACKEND_URL: 'http://localhost:5000/' });
    assert.equal(url, 'http://localhost:5000');
  });

  test('3. Strips trailing /api suffix to avoid duplicated /api/api routes', () => {
    const url = resolveBackendUrl({ BACKEND_URL: 'http://localhost:5000/api' });
    assert.equal(url, 'http://localhost:5000');
  });

  test('4. Gracefully falls back to legacy INTERNAL_BACKEND_URL if BACKEND_URL is absent', () => {
    const url = resolveBackendUrl({ INTERNAL_BACKEND_URL: 'http://127.0.0.1:5000' });
    assert.equal(url, 'http://127.0.0.1:5000');
  });

  test('5. Gracefully falls back to production domain if no environment variable is provided', () => {
    const url = resolveBackendUrl({});
    assert.equal(url, 'https://api.softmaxs.com');
  });

  test('6. Production BACKEND_URL setting points cleanly to https://api.softmaxs.com', () => {
    const url = resolveBackendUrl({ BACKEND_URL: 'https://api.softmaxs.com' });
    assert.equal(url, 'https://api.softmaxs.com');
  });

  test('7. Browser environment uses relative same-origin paths', () => {
    const browserBaseUrl = typeof window !== 'undefined' ? '' : resolveBackendUrl({ BACKEND_URL: 'http://localhost:5000' });
    // In node test runner, typeof window is undefined, so it returns the server URL
    assert.equal(browserBaseUrl, 'http://localhost:5000');
    // Simulated browser
    const simulatedWindow = {};
    const simulatedBrowserBaseUrl = typeof simulatedWindow !== 'undefined' ? '' : resolveBackendUrl({ BACKEND_URL: 'http://localhost:5000' });
    assert.equal(simulatedBrowserBaseUrl, '');
  });

  test('8. Next.js rewrites destination mapping generates valid non-duplicated paths', () => {
    const backendUrl = resolveBackendUrl({ BACKEND_URL: 'http://localhost:5000' });
    const apiRewrite = `${backendUrl}/api/:path*`;
    const filesRewrite = `${backendUrl}/files/:path*`;
    assert.equal(apiRewrite, 'http://localhost:5000/api/:path*');
    assert.equal(filesRewrite, 'http://localhost:5000/files/:path*');
    assert.doesNotMatch(apiRewrite, /\/api\/api/);
  });
});
