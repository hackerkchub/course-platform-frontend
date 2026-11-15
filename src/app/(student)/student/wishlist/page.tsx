'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  fetchStudentWishlist,
  removeCourseFromWishlist,
  selfEnrollFreeCourse,
} from '@/lib/api/student';
import type { WishlistCourse } from '@/types/student';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import {
  Heart,
  BookOpen,
  Trash2,
  Star,
  User,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function StudentWishlistPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<WishlistCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [courseToRemove, setCourseToRemove] = useState<WishlistCourse | null>(null);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});

  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const res = await fetchStudentWishlist({
        page: currentPage,
        limit: 9,
      });

      setCourses(res.courses || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Client-side search across loaded wishlist records
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const query = searchQuery.toLowerCase().trim();
    return courses.filter(item => {
      const title = item.course_name?.toLowerCase() || '';
      const instructor = item.instructor?.name?.toLowerCase() || '';
      return title.includes(query) || instructor.includes(query);
    });
  }, [courses, searchQuery]);

  // Handle removing a course from wishlist
  const handleRemoveConfirm = async () => {
    if (!courseToRemove) return;
    setIsRemoving(true);

    try {
      await removeCourseFromWishlist(courseToRemove.id);
      toast({
        type: 'success',
        title: 'Removed from Wishlist',
        message: `${courseToRemove.course_name} has been removed from your saved list.`,
      });
      setCourseToRemove(null);
      await loadWishlist();
    } catch (err) {
      toast({
        type: 'error',
        title: 'Removal Failed',
        message: getErrorMessage(err),
      });
    } finally {
      setIsRemoving(false);
    }
  };

  // Handle instant free self-enrollment directly from wishlist
  const handleFreeEnroll = async (course: WishlistCourse) => {
    if (!course.is_free) return;
    setEnrollingCourseId(course.id);

    try {
      await selfEnrollFreeCourse(course.id);
      toast({
        type: 'success',
        title: 'Enrollment Confirmed!',
        message: `You have successfully enrolled in ${course.course_name}.`,
      });
      // Automatically redirect to enrolled learning interface
      window.location.href = `/student/courses/${course.id}/learn`;
    } catch (err) {
      toast({
        type: 'error',
        title: 'Enrollment Failed',
        message: getErrorMessage(err),
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Student Portal', href: '/student/dashboard' },
          { label: 'Wishlist' },
        ]}
        showHome
        homeHref="/"
      />

      {/* Page Heading */}
      <DashboardHeading
        eyebrow="Saved Programs"
        title="My Wishlist"
        description="Review courses you have saved for future learning. Enroll directly into free cohorts or review program details."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadWishlist}
              disabled={isLoading}
              className="h-9"
              aria-label="Refresh wishlist"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/courses">
              <Button size="sm" variant="primary" className="h-9">
                Explore Courses <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search Bar */}
      <SearchFilterToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter saved courses by title or mentor..."
        resultCount={filteredCourses.length}
        totalCount={totalCount}
        onReset={() => setSearchQuery('')}
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <ErrorState
          title="Unable to Load Your Wishlist"
          description={errorMessage || 'An error occurred while retrieving your saved courses.'}
          onRetry={loadWishlist}
          retryLabel="Retry Loading Wishlist"
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredCourses.length === 0 && (
        <EmptyState
          icon={Heart}
          title={searchQuery ? 'No Saved Courses Match Your Query' : 'Your Wishlist is Empty'}
          description={
            searchQuery
              ? 'Try adjusting your search terms to locate saved courses.'
              : 'Save courses you want to take later by clicking the heart icon on any course card.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Browse Courses'}
          onAction={
            searchQuery
              ? () => setSearchQuery('')
              : () => {
                  window.location.href = '/courses';
                }
          }
        />
      )}

      {/* Wishlist Grid */}
      {!isLoading && !isError && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(item => {
            const hasThumbnailError = thumbnailErrors[item.id] || false;
            const courseUrl = `/courses/${item.slug}`;

            return (
              <Card
                key={item.id}
                className="overflow-hidden flex flex-col justify-between border-slate-200/80 dark:border-slate-800 transition-shadow hover:shadow-md"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {item.thumbnail_url && !hasThumbnailError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail_url}
                        alt={item.course_name}
                        onError={() => setThumbnailErrors(prev => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#173D70] to-blue-600 text-white">
                        <BookOpen className="w-12 h-12 opacity-80" />
                      </div>
                    )}

                    {/* Price or Free Badge */}
                    <div className="absolute top-3 right-3">
                      {item.is_free ? (
                        <Badge variant="success" className="font-bold">
                          Free Course
                        </Badge>
                      ) : (
                        <Badge variant="primary" className="font-bold">
                          {formatCurrency(item.offer_price ?? item.price)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Course Details Content */}
                  <CardContent className="p-5 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400 capitalize">
                        <span>{item.course_level || 'All Levels'}</span>
                        <span>•</span>
                        <span>{item.mode || 'Online'}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {item.course_name}
                      </h3>
                    </div>

                    {/* Instructor & Rating Row */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      {item.instructor ? (
                        <span className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{item.instructor.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Industry Expert</span>
                      )}

                      {(item.rating_avg || 0) > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {item.rating_avg?.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-4 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCourseToRemove(item)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 h-8 px-2.5 font-semibold"
                    aria-label={`Remove ${item.course_name} from wishlist`}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>

                  {item.is_free ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => handleFreeEnroll(item)}
                      isLoading={enrollingCourseId === item.id}
                      disabled={enrollingCourseId === item.id}
                      className="text-xs font-semibold h-8"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Enroll Free
                    </Button>
                  ) : (
                    <Link href={courseUrl}>
                      <Button size="sm" variant="outline" className="text-xs font-semibold h-8">
                        View Details
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

      {/* Confirm Dialog for Removing Item */}
      <ConfirmDialog
        isOpen={Boolean(courseToRemove)}
        onClose={() => setCourseToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove From Wishlist?"
        description={
          courseToRemove
            ? `Are you sure you want to remove "${courseToRemove.course_name}" from your saved courses?`
            : undefined
        }
        confirmLabel="Remove Course"
        cancelLabel="Keep in Wishlist"
        variant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
}
