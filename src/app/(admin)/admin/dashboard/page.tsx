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
  Users,
  BookOpen,
  UserCheck,
  Activity,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Inbox,
  Clock,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface AdminDashboardOverview {
  total_students: number;
  total_courses: number;
  total_enrollments: number;
  total_views: number;
  conversion_rate: number;
}

interface AdminTodayStats {
  views: number;
  enrollments: number;
  demo_requests: number;
  enquiries: number;
}

interface TopCourseItem {
  id: number;
  course_name: string;
  slug: string;
  total_views: number;
  unique_visitors: number;
  enrollment_count: number;
}

interface DemoFunnel {
  pending: number;
  contacted: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  converted: number;
}

interface RecentEnrollmentItem {
  id: number;
  course_id: number;
  course_name: string;
  user_id: number;
  email: string;
  status: string;
  enrolled_at: string;
}

interface AdminDashboardData {
  overview: AdminDashboardOverview;
  today_stats: AdminTodayStats;
  top_courses: TopCourseItem[];
  demo_funnel: DemoFunnel;
  recent_enrollments: RecentEnrollmentItem[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [enrollmentSearch, setEnrollmentSearch] = useState<string>('');

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const res = await apiClient.get(API_ENDPOINTS.analytics.adminDashboard);
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        setIsError(true);
        setErrorMessage(res.data?.message || 'Failed to retrieve admin dashboard overview.');
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Filtered top courses
  const filteredCourses = useMemo(() => {
    if (!data?.top_courses) return [];
    if (!courseSearch.trim()) return data.top_courses;
    return data.top_courses.filter(c =>
      c.course_name.toLowerCase().includes(courseSearch.toLowerCase().trim())
    );
  }, [data?.top_courses, courseSearch]);

  // Filtered recent enrollments
  const filteredEnrollments = useMemo(() => {
    if (!data?.recent_enrollments) return [];
    if (!enrollmentSearch.trim()) return data.recent_enrollments;
    const term = enrollmentSearch.toLowerCase().trim();
    return data.recent_enrollments.filter(
      e => e.email.toLowerCase().includes(term) || e.course_name.toLowerCase().includes(term)
    );
  }, [data?.recent_enrollments, enrollmentSearch]);

  // Top course columns
  const courseColumns: DataTableColumn<TopCourseItem>[] = useMemo(
    () => [
      {
        id: 'course_name',
        header: 'Course Title',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-white">
              {row.course_name}
            </span>
            <span className="text-xs text-slate-400 font-mono">/{row.slug}</span>
          </div>
        ),
      },
      {
        id: 'total_views',
        header: 'Total Views',
        align: 'right',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {row.total_views.toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        id: 'unique_visitors',
        header: 'Unique Visitors',
        align: 'right',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
            {row.unique_visitors.toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        id: 'enrollment_count',
        header: 'Enrollments',
        align: 'right',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {row.enrollment_count.toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        id: 'conversion',
        header: 'Conv. Rate',
        align: 'right',
        cell: ({ row }) => {
          const rate =
            row.unique_visitors > 0
              ? ((row.enrollment_count / row.unique_visitors) * 100).toFixed(1)
              : '0.0';
          return (
            <Badge variant="outline" className="font-mono text-xs">
              {rate}%
            </Badge>
          );
        },
      },
      {
        id: 'action',
        header: 'Action',
        align: 'right',
        cell: ({ row }) => (
          <Link href={`/courses/${row.slug}`} target="_blank">
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              View <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        ),
      },
    ],
    []
  );

  // Recent enrollment columns
  const enrollmentColumns: DataTableColumn<RecentEnrollmentItem>[] = useMemo(
    () => [
      {
        id: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            #{row.id}
          </span>
        ),
      },
      {
        id: 'learner',
        header: 'Learner Account',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {row.email}
          </span>
        ),
      },
      {
        id: 'course',
        header: 'Course Program',
        cell: ({ row }) => (
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {row.course_name}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const variant =
            row.status === 'active'
              ? 'success'
              : row.status === 'completed'
              ? 'primary'
              : row.status === 'expired'
              ? 'destructive'
              : 'outline';
          return (
            <Badge variant={variant} className="capitalize">
              {row.status}
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
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Action */}
      <DashboardHeading
        title="Executive Command Center"
        description="Real-time platform performance metrics, enrollment ledgers, and catalog engagement."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Admin Center', href: '/admin/dashboard' },
              { label: 'Executive Dashboard' },
            ]}
          />
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="h-9"
              aria-label="Refresh executive dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin/courses">
              <Button size="sm" variant="primary" className="h-9">
                Manage Courses <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. Real Metrics Grid */}
      <StatsGrid columns={4} isLoading={isLoading} loadingCount={4}>
        <StatCard
          title="Total Learners"
          value={data?.overview?.total_students ?? 0}
          icon={Users}
          description="Platform-wide registered students"
        />
        <StatCard
          title="Published Courses"
          value={data?.overview?.total_courses ?? 0}
          icon={BookOpen}
          description="Active catalog courses"
        />
        <StatCard
          title="Total Enrollments"
          value={data?.overview?.total_enrollments ?? 0}
          icon={UserCheck}
          description="Cohort & self-paced enrollments"
          trend={
            data?.today_stats?.enrollments
              ? { value: `+${data.today_stats.enrollments} today`, direction: 'up' }
              : undefined
          }
        />
        <StatCard
          title="Platform Views"
          value={data?.overview?.total_views ?? 0}
          icon={Activity}
          description={
            data ? `${data.overview.conversion_rate}% conversion rate` : 'Catalog views'
          }
          trend={
            data?.today_stats?.views
              ? { value: `+${data.today_stats.views} today`, direction: 'up' }
              : undefined
          }
        />
      </StatsGrid>

      {/* 3. Demo Inquiries Funnel Overview */}
      <DashboardSection
        title="Demo Inquiries & Counseling Funnel"
        description="Lead distribution across demo request stages"
        variant="card"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Pending Review</span>
              <Inbox className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.demo_funnel?.pending ?? 0}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Contacted</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.demo_funnel?.contacted ?? 0}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Scheduled</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.demo_funnel?.scheduled ?? 0}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Converted</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.demo_funnel?.converted ?? 0}
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* 4. Top Performing Courses Section */}
      <DashboardSection
        title="Top Performing Courses"
        description="Courses with highest platform engagement and catalog views"
        variant="card"
      >
        <div className="space-y-4">
          <SearchFilterToolbar
            searchValue={courseSearch}
            onSearchChange={setCourseSearch}
            searchPlaceholder="Filter top courses by name..."
            resultCount={filteredCourses.length}
            totalCount={data?.top_courses?.length ?? 0}
            onReset={() => setCourseSearch('')}
          />

          <DataTable<TopCourseItem>
            columns={courseColumns}
            data={filteredCourses}
            keyExtractor={item => item.id}
            isLoading={isLoading}
            loadingRowCount={4}
            isError={isError}
            errorTitle="Unable to load top courses"
            errorDescription={errorMessage || 'An error occurred while fetching course analytics.'}
            onRetry={fetchAdminData}
            emptyTitle="No Course Analytics Recorded"
            emptyDescription={
              courseSearch
                ? 'No courses match your search criteria.'
                : 'Catalog analytics will populate as students view and enroll in courses.'
            }
            emptyActionLabel={courseSearch ? 'Clear Search' : undefined}
            onEmptyAction={courseSearch ? () => setCourseSearch('') : undefined}
          />
        </div>
      </DashboardSection>

      {/* 5. Recent Platform Enrollments Section */}
      <DashboardSection
        title="Recent Platform Enrollments"
        description="Real-time stream of latest learner admissions and cohort enrollments"
        variant="card"
      >
        <div className="space-y-4">
          <SearchFilterToolbar
            searchValue={enrollmentSearch}
            onSearchChange={setEnrollmentSearch}
            searchPlaceholder="Filter enrollments by student email or course..."
            resultCount={filteredEnrollments.length}
            totalCount={data?.recent_enrollments?.length ?? 0}
            onReset={() => setEnrollmentSearch('')}
          />

          <DataTable<RecentEnrollmentItem>
            columns={enrollmentColumns}
            data={filteredEnrollments}
            keyExtractor={item => item.id}
            isLoading={isLoading}
            loadingRowCount={4}
            isError={isError}
            errorTitle="Unable to load recent enrollments"
            errorDescription={errorMessage || 'An error occurred while fetching enrollment records.'}
            onRetry={fetchAdminData}
            emptyTitle="No Recent Enrollments"
            emptyDescription={
              enrollmentSearch
                ? 'No enrollments match your search query.'
                : 'Recent learner admissions will appear here in real-time as registrations occur.'
            }
            emptyActionLabel={enrollmentSearch ? 'Clear Search' : undefined}
            onEmptyAction={enrollmentSearch ? () => setEnrollmentSearch('') : undefined}
          />
        </div>
      </DashboardSection>
    </div>
  );
}

