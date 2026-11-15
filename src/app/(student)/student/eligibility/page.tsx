'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { DashboardHeading } from '@/components/dashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ErrorState } from '@/components/ui/error-state';
import { apiClient } from '@/lib/api/client';
import {
  fetchCourseEligibility,
  fetchStudentEligibilityResult,
  submitStudentEligibilityCheck,
} from '@/lib/api/student';
import type {
  EligibilityConfiguration,
  EligibilityResult,
} from '@/types/student';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface CourseOption {
  id: number;
  course_name: string;
  slug: string;
  is_free?: boolean;
}

export default function StudentEligibilityPage() {
  const { toast } = useToast();

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [eligibilityConfig, setEligibilityConfig] = useState<EligibilityConfiguration | null>(null);
  const [previousResult, setPreviousResult] = useState<EligibilityResult | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form State
  const [answers, setAnswers] = useState<Record<string, string>>({
    qualification: 'graduate',
    percentage: '',
    stream: '',
    age: '',
    experience: 'fresher_allowed',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Load initial courses from public catalog & student enrollments
  const loadAvailableCourses = useCallback(async () => {
    setIsLoadingCourses(true);
    try {
      const res = await apiClient.get('/api/courses?limit=24');
      const items: CourseOption[] =
        res.data?.data?.items || res.data?.data || res.data?.items || [];

      setCourses(items);
      if (items.length > 0 && !selectedCourseId) {
        setSelectedCourseId(items[0].id);
      }
    } catch (err) {
      console.warn('Failed to load courses for eligibility dropdown:', getErrorMessage(err));
    } finally {
      setIsLoadingCourses(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    loadAvailableCourses();
  }, [loadAvailableCourses]);

  // 2. When selected course changes, fetch eligibility config & student result
  const loadCourseEligibility = useCallback(async (courseId: number) => {
    setIsLoadingConfig(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const [configData, resultData] = await Promise.all([
        fetchCourseEligibility(courseId),
        fetchStudentEligibilityResult(courseId).catch(() => ({
          has_checked: false,
          result: null,
          eligible: null,
        } as EligibilityResult)),
      ]);

      setEligibilityConfig(configData);
      setPreviousResult(resultData);

      // Pre-fill default stream if eligible streams exist
      if (configData.eligible_streams && configData.eligible_streams.length > 0) {
        setAnswers(prev => ({
          ...prev,
          stream: configData.eligible_streams ? configData.eligible_streams[0] : '',
        }));
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseEligibility(selectedCourseId);
    }
  }, [selectedCourseId, loadCourseEligibility]);

  const handleInputChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (eligibilityConfig?.minimum_percentage && !answers.percentage) {
      errors.percentage = 'Percentage or academic marks score is required.';
    } else if (answers.percentage) {
      const pct = parseFloat(answers.percentage);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        errors.percentage = 'Please enter a valid percentage between 0 and 100.';
      }
    }

    if ((eligibilityConfig?.minimum_age || eligibilityConfig?.maximum_age) && !answers.age) {
      errors.age = 'Age is required for assessment.';
    } else if (answers.age) {
      const ageNum = parseInt(answers.age, 10);
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
        errors.age = 'Please enter a valid age.';
      }
    }

    // Validate required custom questions
    (eligibilityConfig?.custom_questions || []).forEach(q => {
      if (q.required && !answers[q.key]) {
        errors[q.key] = `${q.question} is required.`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await submitStudentEligibilityCheck(selectedCourseId, answers);

      toast({
        type: res.eligible ? 'success' : 'info',
        title: res.eligible ? 'Eligibility Confirmed!' : 'Assessment Completed',
        message: res.message || (res.eligible ? 'You meet all criteria for this program.' : 'Review assessment feedback.'),
      });

      // Refresh latest result
      await loadCourseEligibility(selectedCourseId);
    } catch (err) {
      toast({
        type: 'error',
        title: 'Assessment Failed',
        message: getErrorMessage(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Student Portal', href: '/student/dashboard' },
          { label: 'Course Eligibility' },
        ]}
        showHome
        homeHref="/"
      />

      {/* Page Heading */}
      <DashboardHeading
        eyebrow="Academic Admissions"
        title="Course Eligibility Assessment"
        description="Verify your prerequisite eligibility for live cohorts and intensive tracks using our server-validated criteria."
        action={
          <div className="flex items-center gap-2">
            {selectedCourseId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCourseEligibility(selectedCourseId)}
                disabled={isLoadingConfig}
                className="h-9"
                aria-label="Refresh eligibility criteria"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingConfig ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Link href="/courses">
              <Button size="sm" variant="primary" className="h-9">
                Browse Courses <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Course Selector Dropdown Card */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label
              htmlFor="course-select"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block"
            >
              Select Course Program to Assess
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose any published course to check your admission eligibility status.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <select
              id="course-select"
              value={selectedCourseId || ''}
              onChange={e => setSelectedCourseId(Number(e.target.value))}
              disabled={isLoadingCourses}
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 font-medium"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {isLoadingConfig && (
        <div className="space-y-6 animate-pulse">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      )}

      {/* Error State */}
      {!isLoadingConfig && isError && (
        <ErrorState
          title="Unable to Load Eligibility Rules"
          description={errorMessage || 'An error occurred while loading eligibility criteria for this course.'}
          onRetry={() => selectedCourseId && loadCourseEligibility(selectedCourseId)}
          retryLabel="Retry Loading"
        />
      )}

      {/* Main Content Area */}
      {!isLoadingConfig && !isError && eligibilityConfig && (
        <div className="space-y-6">
          {/* Eligibility Disabled Notice */}
          {!eligibilityConfig.eligibility_enabled ? (
            <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                    Open Enrollment — No Eligibility Assessment Required
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-2xl">
                    This course is open to all students without strict prerequisite requirements. You may enroll immediately in free cohorts or register for demo sessions.
                  </p>
                  <div className="pt-2">
                    <Link href={`/courses/${selectedCourse?.slug || ''}`}>
                      <Button variant="primary" size="sm" className="text-xs font-semibold">
                        View Program Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Verified Result & Requirements Summary (1/3) */}
              <div className="space-y-6">
                {/* Result Card */}
                {previousResult?.has_checked && (
                  <Card className={previousResult.eligible ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Assessment Result
                        </span>
                        <Badge variant={previousResult.eligible ? 'success' : 'warning'}>
                          {previousResult.eligible ? 'Eligible' : 'Not Eligible'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base text-slate-900 dark:text-white pt-1">
                        {previousResult.eligible ? 'Admission Prerequisite Met' : 'Criteria Incomplete'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      {previousResult.message && (
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {previousResult.message}
                        </p>
                      )}

                      {previousResult.checked_at && (
                        <p className="text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <Clock className="w-3.5 h-3.5" />
                          Assessed: {formatDateKolkata(previousResult.checked_at)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Requirements Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Course Prerequisite Rules</CardTitle>
                    <CardDescription className="text-xs">
                      Minimum qualifications required by academic mentors for {selectedCourse?.course_name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    {eligibilityConfig.minimum_qualification && (
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Min Qualification:</span>
                        <span className="font-semibold capitalize text-slate-900 dark:text-white">
                          {eligibilityConfig.minimum_qualification}
                        </span>
                      </div>
                    )}

                    {eligibilityConfig.minimum_percentage !== null && eligibilityConfig.minimum_percentage !== undefined && (
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Min Academic Score:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {eligibilityConfig.minimum_percentage}%
                        </span>
                      </div>
                    )}

                    {eligibilityConfig.eligible_streams && eligibilityConfig.eligible_streams.length > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Allowed Streams:</span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {eligibilityConfig.eligible_streams.join(', ')}
                        </span>
                      </div>
                    )}

                    {(eligibilityConfig.minimum_age || eligibilityConfig.maximum_age) && (
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Age Bracket:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {eligibilityConfig.minimum_age || 'Any'} – {eligibilityConfig.maximum_age || 'Any'} yrs
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">Experience:</span>
                      <span className="font-semibold capitalize text-slate-900 dark:text-white">
                        {eligibilityConfig.experience_required === 'experience_required'
                          ? 'Prior Experience Required'
                          : 'Freshers Allowed'}
                      </span>
                    </div>

                    {eligibilityConfig.disclaimer && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 mt-2">
                        <p className="text-[11px] leading-relaxed">
                          <strong>Note:</strong> {eligibilityConfig.disclaimer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Assessment Questionnaire Form (2/3) */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prerequisite Assessment Form</CardTitle>
                    <CardDescription>
                      Provide your academic credentials and background details. Your submission will be evaluated server-side.
                    </CardDescription>
                  </CardHeader>

                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                      {/* Qualification Select */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Highest Completed Qualification
                        </label>
                        <select
                          value={answers.qualification}
                          onChange={e => handleInputChange('qualification', e.target.value)}
                          className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="10th">10th Standard / Matriculation</option>
                          <option value="12th">12th Standard / Higher Secondary</option>
                          <option value="diploma">Polytechnic Diploma</option>
                          <option value="graduate">Bachelor&apos;s Degree / Graduate</option>
                          <option value="post_graduate">Master&apos;s Degree / Post Graduate</option>
                        </select>
                      </div>

                      {/* Percentage Input */}
                      <Input
                        id="eligibility-percentage"
                        label="Academic Score / Percentage (%)"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g. 72.5"
                        value={answers.percentage}
                        onChange={e => handleInputChange('percentage', e.target.value)}
                        error={formErrors.percentage}
                      />

                      {/* Stream Input */}
                      <Input
                        id="eligibility-stream"
                        label="Academic Stream / Branch"
                        type="text"
                        placeholder="e.g. Computer Science, B.Com, Mechanical, Any"
                        value={answers.stream}
                        onChange={e => handleInputChange('stream', e.target.value)}
                        error={formErrors.stream}
                      />

                      {/* Age Input */}
                      <Input
                        id="eligibility-age"
                        label="Current Age (Years)"
                        type="number"
                        min="10"
                        max="100"
                        placeholder="e.g. 22"
                        value={answers.age}
                        onChange={e => handleInputChange('age', e.target.value)}
                        error={formErrors.age}
                      />

                      {/* Experience Select */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Work Experience Level
                        </label>
                        <select
                          value={answers.experience}
                          onChange={e => handleInputChange('experience', e.target.value)}
                          className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="fresher_allowed">Fresher / College Student</option>
                          <option value="experience_required">1+ Years Professional Experience</option>
                        </select>
                      </div>

                      {/* Dynamic Custom Questions */}
                      {(eligibilityConfig.custom_questions || []).map(q => (
                        <div key={q.key} className="space-y-1.5 pt-2">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            {q.question} {q.required && <span className="text-red-500">*</span>}
                          </label>

                          {q.field_type === 'select' && q.options ? (
                            <select
                              value={answers[q.key] || ''}
                              onChange={e => handleInputChange(q.key, e.target.value)}
                              className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            >
                              <option value="">Select an option</option>
                              {q.options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              id={`q-${q.key}`}
                              type={q.field_type === 'number' ? 'number' : 'text'}
                              value={answers[q.key] || ''}
                              onChange={e => handleInputChange(q.key, e.target.value)}
                              placeholder={`Enter ${q.question.toLowerCase()}`}
                              error={formErrors[q.key]}
                            />
                          )}
                        </div>
                      ))}
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Submissions are validated against academic rules.
                      </span>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        Evaluate Eligibility
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
