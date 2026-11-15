'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  DashboardHeading,
  StatsGrid,
  StatCard,
  DashboardSection,
  DataTable,
  SearchFilterToolbar,
  DataTableColumn,
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import {
  BookOpen,
  Calendar,
  Award,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import type { StudentEnrollment, DemoRequest as StudentDemoRequest } from '@/types/student';

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [demoRequests, setDemoRequests] = useState<StudentDemoRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchStudentData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const [enrollRes, demoRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.enrollments.myList),
        apiClient.get(API_ENDPOINTS.demo.myRequests),
      ]);

      if (enrollRes.status === 'fulfilled') {
        const payload = enrollRes.value.data;
        const items: StudentEnrollment[] =
          payload?.data?.items || payload?.data || payload?.items || [];
        setEnrollments(Array.isArray(items) ? items : []);
      } else {
        const msg = getErrorMessage(enrollRes.reason);
        console.warn('Student enrollments fetch notice:', msg);
      }

      if (demoRes.status === 'fulfilled') {
        const payload = demoRes.value.data;
        const items: StudentDemoRequest[] =
          payload?.data?.requests || payload?.data || [];
        setDemoRequests(Array.isArray(items) ? items : []);
      }

      // If both failed with network/500
      if (enrollRes.status === 'rejected' && demoRes.status === 'rejected') {
        setIsError(true);
        setErrorMessage(getErrorMessage(enrollRes.reason));
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // Real verified metrics calculated directly from API data
  const getEnrollmentStatus = (e: StudentEnrollment): string => {
    return e.enrollment_status || (e as unknown as { status: string }).status || 'active';
  };

  const activeCount = useMemo(
    () => enrollments.filter(e => getEnrollmentStatus(e) === 'active').length,
    [enrollments]
  );
  const demoCount = useMemo(() => demoRequests.length, [demoRequests]);
  const certCount = useMemo(
    () => enrollments.filter(e => getEnrollmentStatus(e) === 'completed').length,
    [enrollments]
  );

  // Filtered enrolled courses
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(item => {
      const status = getEnrollmentStatus(item);
      const batchName = item.batch?.name || (item.batch as unknown as { batch_name?: string })?.batch_name || '';
      const matchesSearch =
        !searchQuery.trim() ||
        item.course?.course_name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        batchName.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchesStatus =
        statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchQuery, statusFilter]);

  // Enrollment columns definition
  const enrollmentColumns: DataTableColumn<StudentEnrollment>[] = useMemo(
    () => [
      {
        id: 'course',
        header: 'Course Program',
        cell: ({ row }) => {
          const batchName =
            row.batch?.name || (row.batch as unknown as { batch_name?: string })?.batch_name || 'Standard Cohort';
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 dark:text-white">
                {row.course?.course_name || 'Enrolled Course'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {batchName}
              </span>
            </div>
          );
        },
      },
      {
        id: 'progress',
        header: 'Curriculum Progress',
        cell: ({ row }) => {
          const pct = Math.min(100, Math.max(0, row.progress_percentage ?? (row as unknown as { progress?: { percentage?: number } }).progress?.percentage ?? 0));
          return (
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{pct}% Completed</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = getEnrollmentStatus(row);
          const variant =
            status === 'active'
              ? 'success'
              : status === 'completed'
              ? 'primary'
              : status === 'expired'
              ? 'destructive'
              : 'outline';
          return (
            <Badge variant={variant} className="capitalize">
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'enrolled_at',
        header: 'Enrolled On',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {formatDateKolkata(row.enrolled_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        align: 'right',
        cell: ({ row }) => {
          const courseId = row.course?.id;
          const learnHref = courseId
            ? `/student/courses/${courseId}/learn${row.last_lesson_id ? `?lessonId=${row.last_lesson_id}` : ''}`
            : '/student/courses';

          return (
            <Link href={learnHref}>
              <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Resume <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          );
        },
      },
    ],
    []
  );

  // Demo sessions columns definition
  const demoColumns: DataTableColumn<StudentDemoRequest>[] = useMemo(
    () => [
      {
        id: 'ref',
        header: 'Ref No',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {row.reference_no ? `#${row.reference_no}` : `#${row.id}`}
          </span>
        ),
      },
      {
        id: 'course',
        header: 'Course / Topic',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {row.course_name || `Course #${row.course_id}`}
          </span>
        ),
      },
      {
        id: 'mode',
        header: 'Preferred Mode',
        cell: ({ row }) => (
          <span className="text-xs capitalize text-slate-600 dark:text-slate-400">
            {row.preferred_demo_type || 'Online Live'}
          </span>
        ),
      },
      {
        id: 'schedule',
        header: 'Scheduled Slot',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {row.scheduled_at
              ? formatDateKolkata(row.scheduled_at)
              : row.preferred_date
              ? `${row.preferred_date} (${row.preferred_time || 'TBD'})`
              : 'Awaiting Counselor'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const variant =
            row.status === 'scheduled'
              ? 'accent'
              : row.status === 'completed'
              ? 'success'
              : row.status === 'cancelled'
              ? 'destructive'
              : 'warning';
          return (
            <Badge variant={variant} className="capitalize">
              {row.status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Action',
        align: 'right',
        cell: ({ row }) => {
          if (row.status === 'scheduled' && row.meeting_link) {
            return (
              <a
                href={row.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Join Live <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </a>
            );
          }
          return (
            <Link href="/student/demo-classes">
              <span className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium">
                Details
              </span>
            </Link>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Heading with Breadcrumbs & Action */}
      <DashboardHeading
        title="Learning Dashboard"
        description="Welcome back! Track your active cohort programs, scheduled trial classes, and learning milestones."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Student Portal', href: '/student/dashboard' },
              { label: 'Learning Dashboard' },
            ]}
          />
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStudentData}
              disabled={isLoading}
              className="h-9"
              aria-label="Refresh dashboard data"
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

      {/* 2. Real Metrics Grid */}
      <StatsGrid columns={3} isLoading={isLoading} loadingCount={3}>
        <StatCard
          title="Active Courses"
          value={activeCount}
          icon={BookOpen}
          description="Enrolled cohort programs"
        />
        <StatCard
          title="Demo Sessions"
          value={demoCount}
          icon={Calendar}
          description="Scheduled trial classes"
        />
        <StatCard
          title="Certifications"
          value={certCount}
          icon={Award}
          description="Completed course programs"
        />
      </StatsGrid>

      {/* 3. Enrolled Courses Section */}
      <DashboardSection
        title="My Enrolled Courses"
        description="Active and completed curricula with lesson progress and video access"
        variant="card"
      >
        <div className="space-y-4">
          <SearchFilterToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Filter enrolled courses by title or cohort..."
            resultCount={filteredEnrollments.length}
            totalCount={enrollments.length}
            onReset={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            filters={
              <div className="flex items-center gap-1.5">
                {(['all', 'active', 'completed'] as const).map(tab => (
                  <Button
                    key={tab}
                    size="sm"
                    variant={statusFilter === tab ? 'primary' : 'outline'}
                    className="h-8 text-xs capitalize"
                    onClick={() => setStatusFilter(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            }
          />

          <DataTable<StudentEnrollment>
            columns={enrollmentColumns}
            data={filteredEnrollments}
            keyExtractor={item => item.enrollment_id}
            isLoading={isLoading}
            loadingRowCount={3}
            isError={isError}
            errorTitle="Unable to load courses"
            errorDescription={errorMessage || 'An error occurred while fetching your enrollments.'}
            onRetry={fetchStudentData}
            emptyTitle="No Course Enrollments Found"
            emptyDescription={
              searchQuery || statusFilter !== 'all'
                ? 'No enrolled courses match your current search and filter criteria.'
                : 'You have not enrolled in any courses yet. Browse our live cohort programs to begin learning.'
            }
            emptyActionLabel={
              searchQuery || statusFilter !== 'all' ? 'Reset Filters' : 'Explore Catalog'
            }
            onEmptyAction={
              searchQuery || statusFilter !== 'all'
                ? () => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }
                : () => {
                    window.location.href = '/courses';
                  }
            }
          />
        </div>
      </DashboardSection>

      {/* 4. Trial Demo Sessions Section */}
      <DashboardSection
        title="Demo Sessions & Consultations"
        description="Your scheduled live demo sessions and counselor appointments"
        variant="card"
      >
        <DataTable<StudentDemoRequest>
          columns={demoColumns}
          data={demoRequests}
          keyExtractor={item => item.id}
          isLoading={isLoading}
          loadingRowCount={2}
          emptyTitle="No Trial Sessions Requested"
          emptyDescription="You do not have any pending or scheduled demo classes. Book a trial session from any course page."
          emptyActionLabel="Find a Trial Class"
          onEmptyAction={() => {
            window.location.href = '/courses';
          }}
        />
      </DashboardSection>
    </div>
  );
}

