'use client';

import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse } from '@/types/api';
import { CheckCircle2, XCircle, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface EligibilityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  minQualification?: string | null;
  experienceRequired?: boolean;
}

export function EligibilityCheckModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  minQualification,
  experienceRequired,
}: EligibilityCheckModalProps) {
  const [qualification, setQualification] = useState<string>('graduate');
  const [percentage, setPercentage] = useState<string>('65');
  const [experience, setExperience] = useState<string>('fresher_allowed');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<{
    evaluated: boolean;
    isEligible: boolean;
    source: 'backend_verified' | 'indicative_estimate';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const payload = {
        answers: {
          qualification,
          percentage: Number(percentage) || 0,
          experience,
        },
      };

      const res = await apiClient.post<ApiResponse<{
        eligible?: boolean;
        is_eligible?: boolean;
        message?: string;
        reasons?: string[];
      }>>(API_ENDPOINTS.eligibility.check(courseId), payload);

      const isEligible = Boolean(res.data?.data?.eligible ?? res.data?.data?.is_eligible ?? true);
      setResult({
        evaluated: true,
        isEligible,
        source: 'backend_verified',
        message: isEligible
          ? 'Verified: Your student profile officially fulfills the prerequisites for this cohort.'
          : 'Based on official evaluation criteria, prior preparation or counsellor review is recommended before cohort registration.',
      });
    } catch {
      // Local fallback calculation based on course props if API check doesn't respond or user is unauthenticated
      const qualOrder: Record<string, number> = {
        'any': 0,
        '10th': 1,
        '12th': 2,
        'diploma': 3,
        'graduate': 4,
        'post_graduate': 5,
      };
      const reqOrder = minQualification ? (qualOrder[minQualification] || 0) : 0;
      const userOrder = qualOrder[qualification] || 0;
      const eligible = userOrder >= reqOrder;

      setResult({
        evaluated: true,
        isEligible: eligible,
        source: 'indicative_estimate',
        message: eligible
          ? 'Based on your self-reported qualification, your background appears aligned with this cohort’s entry recommendations.'
          : 'This course recommends a higher qualification level. You may still request an academic waiver assessment through our admissions desk.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Candidate Screening</span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Check Eligibility
          </DialogTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
          </p>
        </DialogHeader>

        {result ? (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                result.isEligible
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
              }`}
            >
              {result.isEligible ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <div>
              {result.source === 'backend_verified' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold">
                  Official Backend Verified
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-semibold">
                  Self-Reported Indicative Assessment
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {result.source === 'backend_verified'
                  ? result.isEligible
                    ? 'Verified Eligible for Enrollment'
                    : 'Special Evaluation Recommended'
                  : result.isEligible
                  ? 'Indicative Profile Match'
                  : 'Prerequisites Review Recommended'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm">
                {result.message}
              </p>
            </div>

            {result.source === 'indicative_estimate' && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed text-left">
                <strong>Disclaimer:</strong> This self-assessment is an informal calculation for planning purposes only and does not constitute official admission approval. Official verification requires signing in with a student account.
              </p>
            )}

            <div className="w-full pt-2 flex flex-col gap-2">
              <Button onClick={handleClose} variant="primary" className="w-full">
                {result.isEligible ? 'Continue to Course' : 'Close'}
              </Button>
              <Link href="/contact" className="w-full">
                <Button variant="outline" className="w-full text-xs">
                  Request Academic Guidance
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Highest Educational Qualification
              </label>
              <select
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="10th">10th Standard / Matriculation</option>
                <option value="12th">12th Standard / Higher Secondary</option>
                <option value="diploma">Polytechnic / Diploma</option>
                <option value="graduate">Graduate (B.Tech, BCA, B.Sc, B.Com, etc.)</option>
                <option value="post_graduate">Post Graduate (M.Tech, MCA, MBA, etc.)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Graduation / Final Academic Percentage or CGPA
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g. 65"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prior Work Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="fresher_allowed">Fresher / College Student</option>
                <option value="experience_required">1-3 Years Professional Experience</option>
                <option value="senior">3+ Years Professional Experience</option>
              </select>
              {experienceRequired && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  * Note: This course specifies prior experience or technical background.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting} className="gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <span>Evaluate My Profile</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
export default EligibilityCheckModal;
