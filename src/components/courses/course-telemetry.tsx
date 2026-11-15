'use client';

import { useEffect, useRef } from 'react';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface CourseTelemetryProps {
  courseId: number;
}

const TELEMETRY_SESSION_KEY = 'cp_telemetry_sid';

/**
 * Safely retrieves or generates an anonymous, client-side session ID.
 * Persists in sessionStorage so all page views in the current browser session share the same ID.
 * Never stores authentication tokens or personally identifiable data.
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = window.sessionStorage.getItem(TELEMETRY_SESSION_KEY);
    if (!sid) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        sid = crypto.randomUUID();
      } else {
        sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
      }
      // Ensure length stays <= 64 characters per backend schema constraints
      sid = sid.substring(0, 64);
      window.sessionStorage.setItem(TELEMETRY_SESSION_KEY, sid);
    }
    return sid;
  } catch {
    // If browser blocks storage (e.g. strict incognito mode), fallback to an in-memory session string
    return 'sid_ephemeral_' + Date.now().toString(36);
  }
}

function resolveDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function resolveReferrerSource(): 'organic' | 'direct' | 'social' | 'campaign' {
  if (typeof document === 'undefined' || !document.referrer) return 'direct';
  const ref = document.referrer.toLowerCase();
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('duckduckgo.')) return 'organic';
  if (ref.includes('t.co') || ref.includes('twitter.') || ref.includes('linkedin.') || ref.includes('instagram.') || ref.includes('facebook.')) return 'social';
  if (typeof window !== 'undefined' && window.location.search.includes('utm_')) return 'campaign';
  return 'direct';
}

export function CourseTelemetry({ courseId }: CourseTelemetryProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate telemetry pings from component re-renders or Strict Mode double-invocations
    if (trackedRef.current) return;
    trackedRef.current = true;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const payload = {
      session_id: sessionId,
      referrer: typeof document !== 'undefined' && document.referrer ? document.referrer.slice(0, 500) : null,
      source: resolveReferrerSource(),
      device_type: resolveDeviceType(),
    };

    // Non-blocking silent telemetry ping
    apiClient.post(API_ENDPOINTS.analytics.view(courseId), payload).catch(() => {
      // Telemetry failures must never break the user experience or throw UI errors
    });
  }, [courseId]);

  return null;
}
export default CourseTelemetry;

