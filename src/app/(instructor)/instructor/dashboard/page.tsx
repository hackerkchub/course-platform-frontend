'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  Users,
  CalendarCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  fetchInstructorOverview,
  updateInstructorDemoStatus,
  type InstructorOverviewResponse,
} from '@/lib/api/instructor-portal';

export default function InstructorDashboardPage() {
  const [data, setData] = useState<InstructorOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingDemoId, setUpdatingDemoId] = useState<number | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchInstructorOverview();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDemoStatus(demoId: number, status: string) {
    try {
      setUpdatingDemoId(demoId);
      await updateInstructorDemoStatus(demoId, { status });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update demo status');
    } finally {
      setUpdatingDemoId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading instructor portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <h3 className="mt-2 text-lg font-semibold text-destructive">Failed to Load Portal</h3>
        <p className="mt-1 text-sm text-destructive/80">{error || 'Unknown error occurred'}</p>
        <button
          onClick={loadData}
          className="mt-4 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { instructor, metrics } = data;

  const statCards = [
    {
      title: 'Assigned Courses',
      value: metrics.assignedCoursesCount,
      icon: BookOpen,
      href: '/instructor/courses',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Active Batches',
      value: metrics.assignedBatchesCount,
      icon: Layers,
      href: '/instructor/batches',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'Total Students',
      value: metrics.totalStudentsCount,
      icon: Users,
      href: '/instructor/students',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Pending Demos',
      value: metrics.pendingDemosCount,
      icon: CalendarCheck,
      href: '/instructor/demos',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {instructor.photo_url ? (
              <img
                src={instructor.photo_url}
                alt={instructor.name}
                className="h-16 w-16 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {instructor.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {instructor.name}</h1>
              <p className="text-sm text-muted-foreground">{instructor.designation || 'Instructor'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/instructor/schedule"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <Clock className="h-4 w-4" />
              Schedule Session
            </Link>
            <Link
              href="/instructor/attendance"
              className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Mark Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-foreground">{card.value}</span>
                <span className="flex items-center text-xs text-muted-foreground group-hover:text-primary">
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Grid: Upcoming Sessions & Pending Demo Requests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Upcoming Sessions</h2>
            </div>
            <Link
              href="/instructor/schedule"
              className="text-xs font-medium text-primary hover:underline"
            >
              View All ({metrics.upcomingSessionsCount})
            </Link>
          </div>

          <div className="divide-y p-2">
            {metrics.upcomingSessions.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No upcoming scheduled sessions.
              </div>
            ) : (
              metrics.upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3.5 transition hover:bg-muted/50 rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {session.title || `Session #${session.session_number}`}
                      </span>
                      <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {session.batch_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.course_name} • {session.session_date} {session.start_time ? `at ${session.start_time}` : ''}
                    </p>
                  </div>
                  <Link
                    href={`/instructor/attendance?session_id=${session.id}`}
                    className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Attendance
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Demo Requests */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-foreground">Pending Demo Inquiries</h2>
            </div>
            <Link
              href="/instructor/demos"
              className="text-xs font-medium text-primary hover:underline"
            >
              View All ({metrics.pendingDemosCount})
            </Link>
          </div>

          <div className="divide-y p-2">
            {metrics.pendingDemos.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No pending demo inquiries for your courses.
              </div>
            ) : (
              metrics.pendingDemos.map((demo) => (
                <div
                  key={demo.id}
                  className="flex items-center justify-between p-3.5 transition hover:bg-muted/50 rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{demo.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {demo.course_name} • Preferred: {demo.demo_date} {demo.demo_time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {demo.student_email} • {demo.student_phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={updatingDemoId === demo.id}
                      onClick={() => handleDemoStatus(demo.id, 'scheduled')}
                      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      disabled={updatingDemoId === demo.id}
                      onClick={() => handleDemoStatus(demo.id, 'cancelled')}
                      className="rounded-md border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
