'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse } from '@/types/api';
import { CheckCircle2, AlertCircle, Video, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

const demoBookingFormSchema = z.object({
  student_name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(191),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, 'Please enter a valid 10-digit Indian mobile number starting with 6-9'),
  city: z.string().trim().max(100).optional(),
  current_qualification: z.string().trim().max(100).optional(),
  experience_level: z.string().trim().max(50).optional(),
  preferred_demo_type: z.enum(['live', 'recorded']),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid date').optional().or(z.literal('')),
  preferred_time: z.string().trim().max(50).optional(),
  message: z.string().trim().max(500).optional(),
  consent: z.literal(true, {
    message: 'You must agree to receive class notifications',
  }),
  honeypot: z.string().optional(),
});

type DemoBookingFormData = z.infer<typeof demoBookingFormSchema>;

interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
}

export function DemoBookingModal({
  isOpen,
  onClose,
  courseId,
  courseSlug,
  courseTitle,
}: DemoBookingModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoBookingFormData>({
    resolver: zodResolver(demoBookingFormSchema),
    defaultValues: {
      student_name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      preferred_demo_type: 'live',
      consent: true,
      honeypot: '',
    },
  });

  const returnUrl = `/courses/${courseSlug}`;

  const handleRedirectToLogin = () => {
    onClose();
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const onSubmit = async (data: DemoBookingFormData) => {
    if (!user) {
      handleRedirectToLogin();
      return;
    }

    if (isSubmitting || successReference) {
      return; // Prevent duplicate submissions
    }

    setServerError(null);
    try {
      const payload = {
        student_name: data.student_name,
        email: data.email,
        phone: data.phone,
        city: data.city || null,
        current_qualification: data.current_qualification || null,
        experience_level: data.experience_level || null,
        preferred_demo_type: data.preferred_demo_type,
        preferred_date: data.preferred_date || null,
        preferred_time: data.preferred_time || null,
        message: data.message || null,
        consent: true,
        honeypot: data.honeypot || null,
      };

      const res = await apiClient.post<ApiResponse<{ reference_no?: string; message?: string }>>(
        API_ENDPOINTS.demo.request(courseId),
        payload
      );

      const refNo = res.data?.data?.reference_no || 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
      setSuccessReference(refNo);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            error?: string;
            errors?: Array<{ message?: string; path?: string[] }>;
          };
        };
        message?: string;
      };

      if (axiosErr.response?.status === 401) {
        setServerError('Your session has expired. Please sign in to request a demo class.');
      } else if (axiosErr.response?.data?.message) {
        setServerError(axiosErr.response.data.message);
      } else if (axiosErr.response?.data?.errors?.length) {
        setServerError(axiosErr.response.data.errors.map((e) => e.message).filter(Boolean).join(', '));
      } else {
        setServerError(axiosErr.message || 'Failed to submit demo class booking request. Please try again.');
      }
    }
  };

  const handleModalClose = () => {
    if (successReference) {
      reset();
      setSuccessReference(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleModalClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Video className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Free Live Session</span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Book a Demo Session
          </DialogTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Course: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
          </p>
        </DialogHeader>

        {!user ? (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <LogIn className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Student Sign-In Required
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                To reserve your live cohort demo slot and receive your personalized meeting access, please sign in with your student account.
              </p>
            </div>
            <div className="w-full space-y-2 pt-2">
              <Button
                variant="primary"
                onClick={handleRedirectToLogin}
                className="w-full font-bold gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Book Demo
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-slate-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : successReference ? (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Demo Request Confirmed!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your demo slot has been requested successfully. Our academic advisor will contact you with the meeting link.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 w-full text-center">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
                Booking Reference
              </span>
              <span className="text-base font-mono font-bold text-blue-600 dark:text-blue-400">
                {successReference}
              </span>
            </div>
            <Button onClick={handleModalClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {serverError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('student_name')}
                placeholder="e.g. Rahul Sharma"
                error={errors.student_name?.message}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="rahul@example.com"
                  error={errors.email?.message}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="tel"
                  {...register('phone')}
                  placeholder="9876543210"
                  error={errors.phone?.message}
                />
              </div>
            </div>

            {/* Preferred Demo Type & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Demo Type <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('preferred_demo_type')}
                  className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="live">Live Interactive Class</option>
                  <option value="recorded">Self-Paced Recorded Preview</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  {...register('preferred_date')}
                  min={new Date().toISOString().split('T')[0]}
                  error={errors.preferred_date?.message}
                />
              </div>
            </div>

            {/* City & Qualification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  City
                </label>
                <Input
                  {...register('city')}
                  placeholder="e.g. Pune, Bangalore"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Qualification
                </label>
                <Input
                  {...register('current_qualification')}
                  placeholder="e.g. B.Tech / BCA"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Any specific questions or goals? (Optional)
              </label>
              <textarea
                {...register('message')}
                rows={2}
                placeholder="Tell us what you'd like to learn or your career transition goals..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Hidden honeypot */}
            <input
              type="text"
              {...register('honeypot')}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Consent Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="demo-consent"
                {...register('consent')}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="demo-consent" className="text-xs text-slate-500 dark:text-slate-400">
                I agree to be contacted via WhatsApp/Phone/Email regarding class schedules and academic updates.
              </label>
            </div>
            {errors.consent && (
              <p className="text-xs text-rose-500">{errors.consent.message}</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <span>Book Free Session</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
export default DemoBookingModal;
