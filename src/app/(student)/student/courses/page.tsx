'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  DashboardHeading,
  SearchFilterToolbar,
} from '@/components/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { fetchStudentEnrollments } from '@/lib/api/student';
import type { StudentEnrollment, EnrollmentStatus } from '@/types/student';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import {
  BookOpen,
  Calendar,
  Clock,
  PlayCircle,
  ArrowRight,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const res = await fetchStudentEnrollments({
        page: currentPage,
        limit: 9,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      setEnrollments(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  // Handle client-side search across currently loaded records
  const filteredEnrollments = useMemo(() => {
    if (!searchQuery.trim()) return enrollments;
    const query = searchQuery.toLowerCase().trim();
    return enrollments.filter(item => {
      const courseName = item.course?.course_name?.toLowerCase() || '';
      const batchName = item.batch?.name?.toLowerCase() || '';
      return courseName.includes(query) || batchName.includes(query);
    });
  }, [enrollments, searchQuery]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const getStatusBadge = (status: EnrollmentStatus | string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="primary">Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Student Portal', href: '/student/dashboard' },
          { label: 'My Courses' },
        ]}
        showHome
        homeHref="/"
      />

      {/* Page Heading */}
      <DashboardHeading
        eyebrow="Student Learning"
        title="My Enrolled Courses"
        description="Access your cohort curricula, track progress milestones, and resume video lessons directly."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadEnrollments}
              disabled={isLoading}
              className="h-9"
              aria-label="Refresh enrolled courses"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/courses">
              <Button size="sm" variant="primary" className="h-9">
                Browse Catalog <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <SearchFilterToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter current courses by title or cohort..."
        resultCount={filteredEnrollments.length}
        totalCount={totalCount}
        onReset={() => {
          setSearchQuery('');
          handleStatusChange('all');
        }}
        filters={
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'active', 'completed', 'expired'] as const).map(tab => (
              <Button
                key={tab}
                size="sm"
                variant={statusFilter === tab ? 'primary' : 'outline'}
                className="h-8 text-xs font-semibold capitalize shrink-0"
                onClick={() => handleStatusChange(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        }
      />

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <ErrorState
          title="Unable to Load Your Courses"
          description={errorMessage || 'An error occurred while connecting to the student service. Please try again.'}
          onRetry={loadEnrollments}
          retryLabel="Retry Loading Courses"
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredEnrollments.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={
            searchQuery || statusFilter !== 'all'
              ? 'No Matching Courses Found'
              : 'You Have No Enrolled Courses Yet'
          }
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search terms or clearing status filters to find your enrollments.'
              : 'Browse our industry-curated courses and enroll to start your learning journey.'
          }
          actionLabel={searchQuery || statusFilter !== 'all' ? 'Reset Filters' : 'Explore Courses'}
          onAction={
            searchQuery || statusFilter !== 'all'
              ? () => {
                  setSearchQuery('');
                  handleStatusChange('all');
                }
              : () => {
                  window.location.href = '/courses';
                }
          }
        />
      )}

      {/* Course Cards Grid */}
      {!isLoading && !isError && filteredEnrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map(item => {
            const courseId = item.course?.id;
            const courseName = item.course?.course_name || 'Enrolled Course';
            const batchName = item.batch?.name || 'Standard Cohort';
            const pct = Math.min(100, Math.max(0, item.progress_percentage ?? 0));
            const isCompleted = item.enrollment_status === 'completed';
            const isExpired = item.enrollment_status === 'expired';
            const hasThumbnailError = courseId ? thumbnailErrors[courseId] : false;

            const learnHref = courseId
              ? `/student/courses/${courseId}/learn${item.last_lesson_id ? `?lessonId=${item.last_lesson_id}` : ''}`
              : '#';

            return (
              <Card
                key={item.enrollment_id}
                className="overflow-hidden flex flex-col justify-between border-slate-200/80 dark:border-slate-800 transition-shadow hover:shadow-md"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {item.course?.thumbnail_url && !hasThumbnailError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.course.thumbnail_url}
                        alt={courseName}
                        onError={() => courseId && setThumbnailErrors(prev => ({ ...prev, [courseId]: true }))}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#173D70] to-blue-600 text-white">
                        <BookOpen className="w-12 h-12 opacity-80" />
                      </div>
                    )}

                    {/* Status Badge overlay */}
                    <div className="absolute top-3 right-3 shadow-xs">
                      {getStatusBadge(item.enrollment_status)}
                    </div>
                  </div>

                  {/* Course Details Content */}
                  <CardContent className="p-5 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {batchName}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {courseName}
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                        <span>Course Progress</span>
                        <span className="font-bold text-slate-900 dark:text-white">{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata Dates */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Enrolled:
                        </span>
                        <span>{formatDateKolkata(item.enrolled_at)}</span>
                      </div>

                      {item.access_expires_at && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Access Valid Till:
                          </span>
                          <span className={isExpired ? 'text-red-500 font-semibold' : ''}>
                            {formatDateKolkata(item.access_expires_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  {isExpired ? (
                    <Link href={`/courses/${item.course?.slug || ''}`}>
                      <Button variant="outline" className="w-full text-xs font-semibold">
                        View Course Details
                      </Button>
                    </Link>
                  ) : (
                    <Link href={learnHref} className="w-full block">
                      <Button
                        variant={isCompleted ? 'outline' : 'primary'}
                        className="w-full text-xs font-semibold"
                      >
                        <PlayCircle className="w-4 h-4 mr-1.5" />
                        {isCompleted ? 'Review Course' : pct > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Enrollment Support Note */}
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Need cohort schedule changes or have enrollment queries? Contact our academic admissions support.</span>
          </div>
          <Link href="/contact">
            <Button variant="outline" size="sm" className="text-xs font-semibold h-8">
              Contact Support
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
