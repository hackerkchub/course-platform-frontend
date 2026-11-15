'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface FreeEnrollButtonProps {
  courseId: number;
  courseSlug: string;
  isAlreadyEnrolled?: boolean;
  className?: string;
}

export function FreeEnrollButton({
  courseId,
  courseSlug,
  isAlreadyEnrolled = false,
  className,
}: FreeEnrollButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [enrolled, setEnrolled] = useState<boolean>(isAlreadyEnrolled);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?returnUrl=/courses/${courseSlug}`);
      return;
    }

    if (enrolled) {
      router.push('/student/dashboard');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await apiClient.post(API_ENDPOINTS.enrollments.enrollFree(courseId));
      setEnrolled(true);
      router.push('/student/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(axiosErr.response?.data?.message || axiosErr.message || 'Enrollment failed.');
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return (
      <Button
        variant="success"
        size="lg"
        onClick={() => router.push('/student/dashboard')}
        className={`w-full font-bold gap-2 ${className || ''}`}
      >
        <CheckCircle2 className="w-5 h-5" />
        Go to Dashboard
      </Button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Button
        variant="primary"
        size="lg"
        onClick={handleEnroll}
        disabled={loading}
        className={`w-full font-extrabold shadow-lg shadow-blue-500/25 gap-2 text-base ${className || ''}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Enrolling...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Enroll For Free</span>
          </>
        )}
      </Button>
      {errorMsg && (
        <p className="text-xs text-rose-500 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
export default FreeEnrollButton;
