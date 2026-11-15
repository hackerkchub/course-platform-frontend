'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import {
  fetchStudentEnrollments,
  fetchCourseReviews,
  submitCourseReview,
  updateStudentReview,
  deleteStudentReview,
} from '@/lib/api/student';
import type { StudentEnrollment, CourseReview } from '@/types/student';
import { DashboardHeading } from '@/components/dashboard/DashboardHeading';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import {
  Star,
  MessageSquare,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BookOpen,
  X,
  Send,
  RefreshCw,
} from 'lucide-react';

interface LocalReviewRecord {
  reviewId: number;
  courseId: number;
  rating: number;
  title: string | null;
  text: string | null;
  moderation_status: 'pending' | 'approved' | 'rejected';
  updatedAt: string;
}

const STORAGE_PREFIX = 'softmaxs_student_reviews_u';

function getStoredReviewsForUser(userId?: number | string | null): Record<number, LocalReviewRecord> {
  if (typeof window === 'undefined' || !userId) return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const sanitized: Record<number, LocalReviewRecord> = {};
    for (const [key, val] of Object.entries(parsed)) {
      const courseId = Number(key);
      if (
        !isNaN(courseId) &&
        courseId > 0 &&
        val &&
        typeof val === 'object' &&
        typeof (val as LocalReviewRecord).reviewId === 'number' &&
        (val as LocalReviewRecord).reviewId > 0
      ) {
        const item = val as LocalReviewRecord;
        sanitized[courseId] = {
          reviewId: Number(item.reviewId),
          courseId,
          rating: Math.max(1, Math.min(5, Number(item.rating) || 5)),
          title: typeof item.title === 'string' ? item.title : null,
          text: typeof item.text === 'string' ? item.text : null,
          moderation_status:
            item.moderation_status === 'approved' || item.moderation_status === 'rejected'
              ? item.moderation_status
              : 'pending',
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
        };
      }
    }
    return sanitized;
  } catch {
    return {};
  }
}

function saveStoredReviewsForUser(
  userId: number | string | undefined | null,
  records: Record<number, LocalReviewRecord>
) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${userId}`, JSON.stringify(records));
  } catch {
    // ignore quota/storage errors
  }
}

export default function StudentReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User-scoped local storage cache of reviews submitted/tracked by authenticated student
  const [localReviews, setLocalReviews] = useState<Record<number, LocalReviewRecord>>({});

  useEffect(() => {
    if (user?.id) {
      setLocalReviews(getStoredReviewsForUser(user.id));
    } else {
      setLocalReviews({});
    }
  }, [user?.id]);

  // Modal states
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewReviewsModalOpen, setIsViewReviewsModalOpen] = useState(false);

  // Active target course / review
  const [selectedCourse, setSelectedCourse] = useState<StudentEnrollment['course'] | null>(null);
  const [editingReview, setEditingReview] = useState<LocalReviewRecord | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  // Form states
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formText, setFormText] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Fetch Student Enrollments
  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
    isError: isEnrollmentsError,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useQuery({
    queryKey: ['student', 'enrollments', 'for-reviews'],
    queryFn: () => fetchStudentEnrollments({ limit: 50, status: 'all' }),
    staleTime: 60000,
  });

  const enrollments = enrollmentsData?.items || [];

  // 2. Fetch public reviews for selected course (when viewing reviews modal)
  const {
    data: publicReviewsData,
    isLoading: isLoadingPublicReviews,
  } = useQuery({
    queryKey: ['course-reviews', selectedCourse?.id],
    queryFn: () => (selectedCourse?.id ? fetchCourseReviews(selectedCourse.id, { limit: 20 }) : null),
    enabled: !!selectedCourse?.id && isViewReviewsModalOpen,
    staleTime: 30000,
  });

  // Check if any public review matches student's user name
  const publicReviews = useMemo(
    () => publicReviewsData?.reviews || [],
    [publicReviewsData?.reviews]
  );

  // Safely sync approved review details strictly by authoritative numeric reviewId
  useEffect(() => {
    if (!user?.id || !selectedCourse?.id || publicReviews.length === 0) return;
    const existingLocal = localReviews[selectedCourse.id];
    if (!existingLocal?.reviewId) return;

    // Strict ownership verification: match ONLY by authoritative numeric reviewId
    const verifiedPublicMatch = publicReviews.find(
      (r: CourseReview) => r.id === existingLocal.reviewId
    );

    if (verifiedPublicMatch && existingLocal.moderation_status !== 'approved') {
      setLocalReviews((prev) => {
        const updated = {
          ...prev,
          [selectedCourse.id]: {
            ...existingLocal,
            rating: verifiedPublicMatch.rating,
            title: verifiedPublicMatch.title ?? existingLocal.title,
            text: verifiedPublicMatch.text ?? existingLocal.text,
            moderation_status: 'approved' as const,
            updatedAt: verifiedPublicMatch.created_at || existingLocal.updatedAt,
          },
        };
        saveStoredReviewsForUser(user.id, updated);
        return updated;
      });
    }
  }, [publicReviews, selectedCourse?.id, user?.id, localReviews]);

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
      const resp = (err as { response?: { data?: { message?: string } } }).response;
      if (resp?.data?.message) return resp.data.message;
      const msg = (err as { message?: string }).message;
      if (msg) return msg;
    }
    return fallback;
  };

  // Mutations
  const submitMutation = useMutation({
    mutationFn: async ({
      courseId,
      rating,
      title,
      text,
    }: {
      courseId: number;
      rating: number;
      title?: string;
      text?: string;
    }) => {
      return submitCourseReview(courseId, { rating, title, text });
    },
    onSuccess: (res, vars) => {
      toast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Your review has been submitted and is awaiting administrative moderation.',
      });
      // Store in user-scoped local cache
      const updated = {
        ...localReviews,
        [vars.courseId]: {
          reviewId: res.id,
          courseId: vars.courseId,
          rating: vars.rating,
          title: vars.title || null,
          text: vars.text || null,
          moderation_status: 'pending' as const,
          updatedAt: new Date().toISOString(),
        },
      };
      setLocalReviews(updated);
      saveStoredReviewsForUser(user?.id, updated);
      setIsWriteModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['course-reviews', vars.courseId] });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to submit review');
      setFormError(msg);
      toast({
        type: 'error',
        title: 'Submission Failed',
        message: msg,
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (vars: {
      reviewId: number;
      courseId: number;
      rating?: number;
      title?: string;
      text?: string;
    }) => {
      return updateStudentReview(vars.reviewId, { rating: vars.rating, title: vars.title, text: vars.text });
    },
    onSuccess: (res, vars) => {
      toast({
        type: 'success',
        title: 'Review Updated',
        message: 'Review updated and resubmitted for moderation. Status has been reset to pending.',
      });
      const updated = {
        ...localReviews,
        [vars.courseId]: {
          reviewId: vars.reviewId,
          courseId: vars.courseId,
          rating: vars.rating || 5,
          title: vars.title || null,
          text: vars.text || null,
          moderation_status: 'pending' as const,
          updatedAt: new Date().toISOString(),
        },
      };
      setLocalReviews(updated);
      saveStoredReviewsForUser(user?.id, updated);
      setIsEditModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['course-reviews', vars.courseId] });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to update review');
      setFormError(msg);
      toast({
        type: 'error',
        title: 'Update Failed',
        message: msg,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return deleteStudentReview(reviewId);
    },
    onSuccess: () => {
      toast({
        type: 'success',
        title: 'Review Deleted',
        message: 'Your review was deleted successfully.',
      });
      if (deletingCourseId) {
        const copy = { ...localReviews };
        delete copy[deletingCourseId];
        setLocalReviews(copy);
        saveStoredReviewsForUser(user?.id, copy);
        queryClient.invalidateQueries({ queryKey: ['course-reviews', deletingCourseId] });
      }
      setIsDeleteDialogOpen(false);
      setDeletingReviewId(null);
      setDeletingCourseId(null);
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to delete review');
      toast({
        type: 'error',
        title: 'Deletion Failed',
        message: msg,
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const resetForm = () => {
    setFormRating(5);
    setFormHoverRating(0);
    setFormTitle('');
    setFormText('');
    setFormError(null);
  };

  const handleOpenWriteModal = (course: StudentEnrollment['course']) => {
    setSelectedCourse(course);
    resetForm();
    setIsWriteModalOpen(true);
  };

  const handleOpenEditModal = (course: StudentEnrollment['course'], review: LocalReviewRecord) => {
    setSelectedCourse(course);
    setEditingReview(review);
    setFormRating(review.rating);
    setFormTitle(review.title || '');
    setFormText(review.text || '');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (courseId: number, reviewId: number) => {
    setDeletingCourseId(courseId);
    setDeletingReviewId(reviewId);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenViewReviews = (course: StudentEnrollment['course']) => {
    setSelectedCourse(course);
    setIsViewReviewsModalOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse?.id) return;
    if (formRating < 1 || formRating > 5) {
      setFormError('Rating must be between 1 and 5 stars');
      return;
    }

    submitMutation.mutate({
      courseId: selectedCourse.id,
      rating: formRating,
      title: formTitle.trim() || undefined,
      text: formText.trim() || undefined,
    });
  };

  const handleUpdateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !selectedCourse?.id) return;
    if (formRating < 1 || formRating > 5) {
      setFormError('Rating must be between 1 and 5 stars');
      return;
    }

    editMutation.mutate({
      reviewId: editingReview.reviewId,
      courseId: selectedCourse.id,
      rating: formRating,
      title: formTitle.trim() || undefined,
      text: formText.trim() || undefined,
    });
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = interactive
            ? (formHoverRating || formRating) >= star
            : rating >= star;
          return (
            <button
              key={star}
              type={interactive ? 'button' : 'button'}
              disabled={!interactive}
              onClick={() => onSelect && onSelect(star)}
              onMouseEnter={() => interactive && setFormHoverRating(star)}
              onMouseLeave={() => interactive && setFormHoverRating(0)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              }`}
            >
              <Star
                className={`w-5 h-5 ${
                  filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/student/dashboard' },
          { label: 'My Reviews' },
        ]}
      />

      <DashboardHeading
        title="My Course Reviews"
        description="Share your learning experience and feedback for enrolled courses. Reviews are moderated by our academic team to maintain community quality."
      />

      {/* Moderation Policy Notice Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-1 text-sm text-blue-900">
          <p className="font-semibold text-blue-950">Verified Enrollment &amp; Moderation Policy</p>
          <p className="text-blue-800 leading-relaxed">
            The platform enforces verified enrollment: only students enrolled in a course may review it, with one review permitted per course.
            To prevent spam, all submissions and edits undergo staff moderation before appearing on public course pages.
            Editing an approved review will automatically reset its status to <strong className="font-medium text-blue-950">Pending</strong> until re-approved.
          </p>
        </div>
      </div>

      {/* Content Area */}
      {isLoadingEnrollments ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isEnrollmentsError ? (
        <ErrorState
          title="Failed to Load Courses"
          description={enrollmentsError instanceof Error ? enrollmentsError.message : 'Could not fetch your enrolled courses.'}
          onRetry={() => refetchEnrollments()}
          retryLabel="Retry Loading"
        />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No Enrolled Courses Found"
          description="You need to be enrolled in at least one course to submit course reviews."
          actionLabel="Browse Courses"
          onAction={() => {
            window.location.href = '/courses';
          }}
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Enrolled Courses &amp; Review Status ({enrollments.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const localReview = localReviews[course.id];

              return (
                <Card key={enrollment.enrollment_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Course Information */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900 text-base sm:text-lg">
                            {course.course_name}
                          </h3>
                          {enrollment.batch && (
                            <Badge variant="outline" className="text-xs">
                              {enrollment.batch.name}
                            </Badge>
                          )}
                          <Badge
                            variant={enrollment.enrollment_status === 'completed' ? 'success' : 'default'}
                            className="text-xs capitalize"
                          >
                            {enrollment.enrollment_status}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500">
                          Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>

                        {/* Current Review Status / Rating display */}
                        {localReview ? (
                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              {renderStars(localReview.rating)}
                              <span className="text-xs font-semibold text-slate-700">
                                {localReview.rating} / 5
                              </span>
                            </div>

                            {localReview.moderation_status === 'approved' ? (
                              <Badge variant="success" className="gap-1 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approved &amp; Published
                              </Badge>
                            ) : localReview.moderation_status === 'pending' ? (
                              <Badge variant="warning" className="gap-1 text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                Awaiting Staff Moderation
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Rejected
                              </Badge>
                            )}

                            {localReview.title && (
                              <span className="text-xs text-slate-600 italic">
                                &ldquo;{localReview.title}&rdquo;
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="pt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs text-slate-500">
                              Not Reviewed Yet
                            </Badge>
                            <span className="text-xs text-slate-500">
                              Have you started learning? Share your experience with the community.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        {localReview ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditModal(course, localReview)}
                              className="gap-1.5"
                            >
                              <Edit3 className="w-4 h-4 text-slate-600" />
                              Edit Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDeleteModal(course.id, localReview.reviewId)}
                              className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenWriteModal(course)}
                            className="gap-1.5"
                          >
                            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                            Write a Review
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenViewReviews(course)}
                          className="gap-1.5 text-slate-600"
                        >
                          <MessageSquare className="w-4 h-4" />
                          View Course Reviews
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Write Review */}
      {isWriteModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Write Course Review</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCourse.course_name}</p>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  {renderStars(formRating, true, (r) => setFormRating(r))}
                  <span className="text-sm font-semibold text-slate-800">
                    {formHoverRating || formRating} Star{(formHoverRating || formRating) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Review Headline / Title (Optional)
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Comprehensive, clear concepts and hands-on projects"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Detailed Feedback (Optional)
                </label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="What did you like the most? How did the curriculum and projects help your learning?"
                  rows={4}
                  maxLength={1000}
                  className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-right text-[10px] text-slate-400 mt-1">
                  {formText.length}/1000 characters
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  After submission, this review will be marked as <strong>Pending Moderation</strong> and reviewed by our quality team before being displayed publicly.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWriteModalOpen(false)}
                  disabled={submitMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitMutation.isPending}
                  className="gap-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Review */}
      {isEditModalOpen && selectedCourse && editingReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Your Review</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCourse.course_name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  {renderStars(formRating, true, (r) => setFormRating(r))}
                  <span className="text-sm font-semibold text-slate-800">
                    {formHoverRating || formRating} Star{(formHoverRating || formRating) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Review Headline / Title (Optional)
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Comprehensive, clear concepts and hands-on projects"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Detailed Feedback (Optional)
                </label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="What did you like the most?"
                  rows={4}
                  maxLength={1000}
                  className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Moderation Reset:</strong> Saving edits will automatically revert this review&apos;s status to <strong>Pending Moderation</strong> and temporarily exclude it from public view until re-verified.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={editMutation.isPending}
                  className="gap-2"
                >
                  {editMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Save &amp; Resubmit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Course Reviews */}
      {isViewReviewsModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Course Reviews</h3>
                <p className="text-xs text-slate-500">{selectedCourse.course_name}</p>
              </div>
              <button
                onClick={() => setIsViewReviewsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {isLoadingPublicReviews ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : publicReviews.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No Approved Reviews Yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Approved student reviews will appear here once verified by the moderation team.
                  </p>
                </div>
              ) : (
                publicReviews.map((rev: CourseReview) => (
                  <div key={rev.id} className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{rev.user_name}</span>
                        {rev.is_verified_enrollment && (
                          <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                            Verified Student
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(rev.rating)}
                      </div>
                    </div>
                    {rev.title && (
                      <p className="text-xs font-semibold text-slate-800">{rev.title}</p>
                    )}
                    {rev.text && (
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.text}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsViewReviewsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: Delete Review */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingReviewId(null);
          setDeletingCourseId(null);
        }}
        onConfirm={() => {
          if (deletingReviewId) {
            deleteMutation.mutate(deletingReviewId);
          }
        }}
        title="Delete Your Review"
        description="Are you sure you want to permanently delete your review for this course? You may submit a new review later if you remain enrolled."
        confirmLabel="Delete Review"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
