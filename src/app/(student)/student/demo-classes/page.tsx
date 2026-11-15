'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import {
  DashboardHeading,
  DataTable,
  DataTableColumn,
  SearchFilterToolbar,
} from '@/components/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ErrorState } from '@/components/ui/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  fetchStudentDemoRequests,
  cancelStudentDemoRequest,
} from '@/lib/api/student';
import type { DemoRequest, DemoStatus } from '@/types/student';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import {
  Video,
  ArrowRight,
  RefreshCw,
  Ban,
  HelpCircle,
} from 'lucide-react';

export default function StudentDemoClassesPage() {
  const { toast } = useToast();
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requestToCancel, setRequestToCancel] = useState<DemoRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const loadDemoRequests = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const data = await fetchStudentDemoRequests();
      setDemoRequests(data);
    } catch (err) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDemoRequests();
  }, [loadDemoRequests]);

  const filteredRequests = useMemo(() => {
    return demoRequests.filter(req => {
      const courseName = req.course_name?.toLowerCase() || '';
      const refNo = req.reference_no?.toLowerCase() || '';
      const matchesSearch =
        !searchQuery.trim() ||
        courseName.includes(searchQuery.toLowerCase().trim()) ||
        refNo.includes(searchQuery.toLowerCase().trim());

      const matchesStatus =
        statusFilter === 'all' || req.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [demoRequests, searchQuery, statusFilter]);

  const handleCancelConfirm = async () => {
    if (!requestToCancel) return;
    setIsCancelling(true);

    try {
      await cancelStudentDemoRequest(requestToCancel.id);
      toast({
        type: 'success',
        title: 'Demo Request Cancelled',
        message: 'Your trial session request has been cancelled successfully.',
      });
      setRequestToCancel(null);
      await loadDemoRequests();
    } catch (err) {
      toast({
        type: 'error',
        title: 'Cancellation Failed',
        message: getErrorMessage(err),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: DemoStatus | string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="primary" className="capitalize">Scheduled</Badge>;
      case 'contacted':
        return <Badge variant="secondary" className="capitalize">Contacted</Badge>;
      case 'completed':
        return <Badge variant="success" className="capitalize">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="capitalize">Cancelled</Badge>;
      default:
        return <Badge variant="warning" className="capitalize">Pending Review</Badge>;
    }
  };

  const columns: DataTableColumn<DemoRequest>[] = useMemo(
    () => [
      {
        id: 'ref',
        header: 'Reference #',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {row.reference_no ? `#${row.reference_no}` : `#${row.id}`}
          </span>
        ),
      },
      {
        id: 'course',
        header: 'Course Program',
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
              {row.course_name || `Course #${row.course_id}`}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              Mode: {row.preferred_demo_type || 'Live'} Session
            </span>
          </div>
        ),
      },
      {
        id: 'requested',
        header: 'Preferred Slot',
        cell: ({ row }) => (
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
            {row.preferred_date ? (
              <span>{row.preferred_date} ({row.preferred_time || 'Flexible'})</span>
            ) : (
              <span className="text-slate-400">Any Available Slot</span>
            )}
          </div>
        ),
      },
      {
        id: 'scheduled',
        header: 'Confirmed Schedule',
        cell: ({ row }) => (
          <div className="text-xs">
            {row.scheduled_at ? (
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatDateKolkata(row.scheduled_at)}
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Awaiting Confirmation</span>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.status),
      },
      {
        id: 'actions',
        header: 'Action',
        align: 'right',
        cell: ({ row }) => {
          const isPending = row.status === 'pending';
          const isScheduled = row.status === 'scheduled';

          return (
            <div className="flex items-center justify-end gap-2">
              {isScheduled && row.meeting_link && (
                <a
                  href={row.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className="h-8 text-xs font-semibold gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Live
                  </Button>
                </a>
              )}

              {isPending && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setRequestToCancel(row)}
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 font-semibold"
                  aria-label={`Cancel demo request #${row.reference_no || row.id}`}
                >
                  <Ban className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Student Portal', href: '/student/dashboard' },
          { label: 'Demo Classes' },
        ]}
        showHome
        homeHref="/"
      />

      {/* Page Heading */}
      <DashboardHeading
        eyebrow="Trial Learning"
        title="Demo Sessions & Consultations"
        description="Track your booked live trial classes, scheduled cohort previews, and counselor appointments."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoRequests}
              disabled={isLoading}
              className="h-9"
              aria-label="Refresh demo sessions"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/courses">
              <Button size="sm" variant="primary" className="h-9">
                Book a Trial Class <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search & Status Filters */}
      <SearchFilterToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by course name or reference #..."
        resultCount={filteredRequests.length}
        totalCount={demoRequests.length}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('all');
        }}
        filters={
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'pending', 'scheduled', 'completed', 'cancelled'] as const).map(tab => (
              <Button
                key={tab}
                size="sm"
                variant={statusFilter === tab ? 'primary' : 'outline'}
                className="h-8 text-xs font-semibold capitalize shrink-0"
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        }
      />

      {/* Error State */}
      {!isLoading && isError && (
        <ErrorState
          title="Unable to Load Demo Sessions"
          description={errorMessage || 'An error occurred while fetching your demo requests.'}
          onRetry={loadDemoRequests}
          retryLabel="Retry Loading"
        />
      )}

      {/* Data Table */}
      {!isError && (
        <DataTable<DemoRequest>
          columns={columns}
          data={filteredRequests}
          keyExtractor={item => item.id}
          isLoading={isLoading}
          loadingRowCount={3}
          emptyTitle="No Demo Sessions Found"
          emptyDescription={
            searchQuery || statusFilter !== 'all'
              ? 'No requested demo classes match your active filter criteria.'
              : 'You have not registered for any trial classes yet. Explore courses to book a live demo with an industry mentor.'
          }
          emptyActionLabel={
            searchQuery || statusFilter !== 'all' ? 'Reset Filters' : 'Find a Trial Session'
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
      )}

      {/* Rescheduling Support Policy Note */}
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Need to reschedule your trial class? You can cancel your pending request and book a new preferred date from the course page.</span>
          </div>
          <Link href="/contact">
            <Button variant="outline" size="sm" className="text-xs font-semibold h-8">
              Admissions Help
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Request Cancellation */}
      <ConfirmDialog
        isOpen={Boolean(requestToCancel)}
        onClose={() => setRequestToCancel(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Demo Class Request?"
        description={
          requestToCancel
            ? `Are you sure you want to cancel your trial request #${requestToCancel.reference_no || requestToCancel.id} for "${requestToCancel.course_name}"?`
            : undefined
        }
        confirmLabel="Cancel Request"
        cancelLabel="Keep Request"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}
