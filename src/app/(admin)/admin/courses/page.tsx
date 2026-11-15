'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DashboardHeading,
  DashboardSection,
  DataTable,
  SearchFilterToolbar,
  DataTableColumn,
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminCoursesApi } from '@/lib/api/admin-courses';
import { getErrorMessage } from '@/lib/utils';
import type { AdminCourseItem, CourseStatus } from '@/types/admin-course';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Edit3,
  Copy,
  Trash2,
  CheckCircle,
  FileEdit,
  AlertCircle,
} from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Course Action Dialogs
  const [deleteTarget, setDeleteTarget] = useState<AdminCourseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [duplicateTarget, setDuplicateTarget] = useState<AdminCourseItem | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<boolean>(false);

  const fetchCourses = useCallback(
    async (targetPage = 1, search = '', status = 'all') => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          limit,
        };
        if (search.trim()) {
          params.search = search.trim();
        }
        if (status && status !== 'all') {
          params.status = status;
        }

        const res = await adminCoursesApi.getCourses(params);
        setCourses(res.courses);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setPage(res.pagination.page);
      } catch (err) {
        setIsError(true);
        setErrorMessage(getErrorMessage(err, 'Failed to fetch course catalog'));
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchCourses(page, searchQuery, statusFilter);
  }, [fetchCourses, page, searchQuery, statusFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleToggleStatus = useCallback(
    async (course: AdminCourseItem, newStatus: CourseStatus) => {
      try {
        await adminCoursesApi.updateStatus(course.id, newStatus);
        fetchCourses(page, searchQuery, statusFilter);
      } catch (err) {
        alert(getErrorMessage(err, 'Failed to update course status'));
      }
    },
    [fetchCourses, page, searchQuery, statusFilter]
  );

  const handleDuplicate = async () => {
    if (!duplicateTarget) return;
    setIsDuplicating(true);
    try {
      await adminCoursesApi.duplicateCourse(duplicateTarget.id);
      setDuplicateTarget(null);
      fetchCourses(page, searchQuery, statusFilter);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to duplicate course'));
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminCoursesApi.deleteCourse(deleteTarget.id);
      setDeleteTarget(null);
      fetchCourses(page, searchQuery, statusFilter);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete course'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">PUBLISHED</Badge>;
      case 'draft':
        return <Badge variant="warning">DRAFT</Badge>;
      case 'archived':
        return <Badge variant="default">ARCHIVED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns: DataTableColumn<AdminCourseItem>[] = useMemo(
    () => [
      {
        key: 'course',
        header: 'Course Details',
        render: (course) => (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.course_name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <BookOpen className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="font-medium text-sm text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-1"
              >
                {course.course_name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono">{course.course_code}</span>
                <span>•</span>
                <span className="capitalize">{course.mode}</span>
                <span>•</span>
                <span className="capitalize">{course.course_level}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category / Track',
        render: (course) => (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {course.category_name || 'General Category'}
            </span>
            <span className="text-slate-500">
              {course.subcategory_name || 'Subcategory'}
            </span>
          </div>
        ),
      },
      {
        key: 'instructor',
        header: 'Instructor',
        render: (course) => (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {course.instructor_name || 'Unassigned'}
            </span>
            {course.instructor_designation && (
              <span className="text-slate-500 line-clamp-1">
                {course.instructor_designation}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'pricing',
        header: 'Pricing',
        render: (course) => (
          <div className="flex flex-col text-xs">
            {course.offer_price && course.offer_price < course.price ? (
              <>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{course.offer_price.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-400 line-through">
                  ₹{course.price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="font-medium text-slate-900 dark:text-slate-100">
                ₹{course.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (course) => (
          <div className="flex items-center gap-1.5">
            {getStatusBadge(course.status)}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (course) => (
          <div className="flex items-center justify-end gap-1">
            <Link href={`/admin/courses/${course.id}/edit`}>
              <Button
                size="sm"
                variant="outline"
                className="text-xs flex items-center gap-1"
                title="Edit Course & Curriculum"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </Button>
            </Link>

            {/* Status Quick Switch */}
            {course.status !== 'published' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleStatus(course, 'published')}
                className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800"
                title="Publish Course"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleStatus(course, 'draft')}
                className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800"
                title="Unpublish to Draft"
              >
                <FileEdit className="w-3.5 h-3.5" />
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setDuplicateTarget(course)}
              className="text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Duplicate Course Structure"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteTarget(course)}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800"
              title="Delete Course"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [handleToggleStatus]
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Courses Management' },
        ]}
      />

      {/* Heading & New Course Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Courses Management"
          subtitle="Design, publish, and manage comprehensive training courses, batches, and curricula."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/admin/courses/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Create Course
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => fetchCourses(page, searchQuery, statusFilter)}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <SearchFilterToolbar
        searchPlaceholder="Search courses by title or course code..."
        onSearch={handleSearch}
        filterOptions={[
          { label: 'All Statuses', value: 'all' },
          { label: 'Published', value: 'published' },
          { label: 'Drafts', value: 'draft' },
          { label: 'Archived', value: 'archived' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={handleStatusFilterChange}
      />

      {/* Error Notice */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load courses</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchCourses(page, searchQuery, statusFilter)}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Courses Table */}
      <DashboardSection
        title={`Course Directory (${totalCount})`}
        subtitle="Catalog of all active, draft, and archived educational programs."
      >
        <DataTable
          columns={columns}
          data={courses}
          isLoading={isLoading}
          emptyMessage="No courses found. Click 'Create Course' to add your first program."
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-6 flex justify-end">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </DashboardSection>

      {/* Duplicate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(duplicateTarget)}
        title="Duplicate Course"
        description={`Do you want to create a copy of "${duplicateTarget?.course_name}"? This will copy all course modules, lessons, and configurations into a new draft.`}
        confirmLabel={isDuplicating ? 'Duplicating...' : 'Duplicate Course'}
        confirmVariant="primary"
        onConfirm={handleDuplicate}
        onCancel={() => setDuplicateTarget(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Course"
        description={`Are you sure you want to soft-delete "${deleteTarget?.course_name}" (${deleteTarget?.course_code})? Students currently enrolled will retain archive access.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Course'}
        confirmVariant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
