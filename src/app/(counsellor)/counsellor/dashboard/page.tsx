'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DashboardHeading,
  StatsGrid,
  StatCard,
  DashboardSection,
  DataTable,
  SearchFilterToolbar,
  DataTableColumn,
  LeadDetailsDrawer,
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { adminLeadsApi } from '@/lib/api/admin-leads';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { DemoLeadItem } from '@/types/admin-lead';
import {
  Inbox,
  Clock,
  Calendar,
  CheckCircle,
  RefreshCw,
  Phone,
  Mail,
  User,
  Eye,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface DemoRequestsSummary {
  total: number;
  pending: number;
  contacted: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export default function CounsellorDashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<DemoLeadItem[]>([]);
  const [summary, setSummary] = useState<DemoRequestsSummary>({
    total: 0,
    pending: 0,
    contacted: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Selected lead for drawer
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Quick action state
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLeads = useCallback(
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

        const res = await adminLeadsApi.getLeads(params);
        setLeads(res.leads);

        if (res.summary) {
          setSummary({
            total: Number(res.summary.total || 0),
            pending: Number(res.summary.pending || 0),
            contacted: Number(res.summary.contacted || 0),
            scheduled: Number(res.summary.scheduled || 0),
            completed: Number(res.summary.completed || 0),
            cancelled: Number(res.summary.cancelled || 0),
          });
        }

        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } catch (err) {
        setIsError(true);
        setErrorMessage(getErrorMessage(err, 'Failed to retrieve demo leads.'));
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchLeads(page, searchQuery, statusFilter);
  }, [fetchLeads, page, searchQuery, statusFilter]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const handleOpenLead = (lead: DemoLeadItem) => {
    setSelectedLeadId(lead.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLeadId(null);
  };

  const handleAcceptLeadQuick = async (lead: DemoLeadItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user?.id) {
      setFeedback({ type: 'error', message: 'You must be signed in to accept a lead.' });
      return;
    }
    setActionLoadingId(lead.id);
    setFeedback(null);
    try {
      await adminLeadsApi.updateLead(lead.id, {
        assigned_to: user.id,
        status: lead.status === 'pending' ? 'contacted' : lead.status,
      });
      setFeedback({
        type: 'success',
        message: `Lead #${lead.reference_no || lead.id} accepted and assigned to you.`,
      });
      await fetchLeads(page, searchQuery, statusFilter);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(err, 'Failed to accept lead.'),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkContactedQuick = async (lead: DemoLeadItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoadingId(lead.id);
    setFeedback(null);
    try {
      await adminLeadsApi.updateLead(lead.id, {
        status: 'contacted',
      });
      setFeedback({
        type: 'success',
        message: `Lead #${lead.reference_no || lead.id} marked as Contacted.`,
      });
      await fetchLeads(page, searchQuery, statusFilter);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(err, 'Failed to update lead status.'),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Columns definition for leads table
  const columns: DataTableColumn<DemoLeadItem>[] = useMemo(
    () => [
      {
        id: 'reference_no',
        header: 'Ref No',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {row.reference_no ? `#${row.reference_no}` : `#${row.id}`}
          </span>
        ),
      },
      {
        id: 'student',
        header: 'Student Lead',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-white">
              {row.student_name}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {row.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {row.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: 'course',
        header: 'Program / Course',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {row.course_name || 'Archived / Unknown Course'}
          </span>
        ),
      },
      {
        id: 'mode',
        header: 'Mode',
        cell: ({ row }) => (
          <span className="text-xs capitalize text-slate-600 dark:text-slate-400">
            {row.preferred_demo_type || 'Online'}
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
              : row.status === 'contacted'
              ? 'outline'
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
        id: 'counselor',
        header: 'Assigned',
        cell: ({ row }) => {
          const isAssignedToMe = Number(row.assigned_to) === Number(user?.id);
          return (
            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <User className="w-3 h-3 text-slate-400" />
              {isAssignedToMe ? (
                <span className="font-semibold text-teal-700 dark:text-teal-400">You</span>
              ) : (
                row.assigned_user_name || (
                  <span className="text-amber-600 dark:text-amber-400 italic font-normal">
                    Unassigned
                  </span>
                )
              )}
            </span>
          );
        },
      },
      {
        id: 'created_at',
        header: 'Inquired On',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {formatDateKolkata(row.created_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        align: 'right',
        cell: ({ row }) => {
          const isAssignedToMe = Number(row.assigned_to) === Number(user?.id);
          const isUnassigned = !row.assigned_to;
          const isActionBusy = actionLoadingId === row.id;

          return (
            <div
              className="flex items-center justify-end gap-1.5"
              onClick={e => e.stopPropagation()}
            >
              {isUnassigned && (
                <Button
                  size="sm"
                  variant="primary"
                  className="h-7 px-2.5 text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1"
                  onClick={e => handleAcceptLeadQuick(row, e)}
                  disabled={isActionBusy}
                  title="Accept and assign this lead to yourself"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </Button>
              )}

              {isAssignedToMe && row.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 flex items-center gap-1"
                  onClick={e => handleMarkContactedQuick(row, e)}
                  disabled={isActionBusy}
                  title="Mark initial contact completed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Contacted</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs flex items-center gap-1 text-slate-700 dark:text-slate-300"
                onClick={() => handleOpenLead(row)}
                title="View full lead details, notes, and schedule"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Manage</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [user?.id, actionLoadingId, page, searchQuery, statusFilter]
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Refresh */}
      <DashboardHeading
        title="Counsellor Lead Pipeline"
        description="Student inquiries, trial demo requests, and counseling follow-up activities."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Counsellor Desk', href: '/counsellor/dashboard' },
              { label: 'Desk Overview' },
            ]}
          />
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeads(page, searchQuery, statusFilter)}
            disabled={isLoading}
            className="h-9"
            aria-label="Refresh leads pipeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded text-slate-500"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Real Metrics Grid */}
      <StatsGrid columns={4} isLoading={isLoading} loadingCount={4}>
        <StatCard
          title="Pending Inquiries"
          value={summary.pending}
          icon={Inbox}
          description="Awaiting initial contact"
        />
        <StatCard
          title="Contacted & Active"
          value={summary.contacted}
          icon={Clock}
          description="Counseling in progress"
        />
        <StatCard
          title="Scheduled Sessions"
          value={summary.scheduled}
          icon={Calendar}
          description="Confirmed live trial classes"
        />
        <StatCard
          title="Completed & Converted"
          value={summary.completed}
          icon={CheckCircle}
          description="Successfully counseled leads"
        />
      </StatsGrid>

      {/* 3. Demo Leads Pipeline Section */}
      <DashboardSection
        title="Student Demo Leads"
        description="Manage incoming inquiry tickets, filter by consultation status, and review details"
        variant="card"
      >
        <div className="space-y-4">
          <SearchFilterToolbar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search leads by student name, email, phone, or reference..."
            resultCount={leads.length}
            totalCount={totalCount}
            onReset={handleResetFilters}
            filters={
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'pending', 'contacted', 'scheduled', 'completed', 'cancelled'] as const).map(
                  status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={statusFilter === status ? 'primary' : 'outline'}
                      className="h-8 text-xs capitalize"
                      onClick={() => handleStatusFilterChange(status)}
                    >
                      {status}
                    </Button>
                  )
                )}
              </div>
            }
          />

          <DataTable<DemoLeadItem>
            columns={columns}
            data={leads}
            keyExtractor={item => item.id}
            isLoading={isLoading}
            loadingRowCount={5}
            isError={isError}
            errorTitle="Unable to load demo leads"
            errorDescription={errorMessage || 'An error occurred while fetching the leads pipeline.'}
            onRetry={() => fetchLeads(page, searchQuery, statusFilter)}
            onRowClick={handleOpenLead}
            emptyTitle="No Leads Found"
            emptyDescription={
              searchQuery || statusFilter !== 'all'
                ? 'No student inquiries match your selected search query or status filter.'
                : 'There are currently no demo inquiries in the counselor pipeline.'
            }
            emptyActionLabel={
              searchQuery || statusFilter !== 'all' ? 'Reset Filters' : undefined
            }
            onEmptyAction={
              searchQuery || statusFilter !== 'all' ? handleResetFilters : undefined
            }
            pagination={
              totalPages > 1 ? (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={limit}
                  onPageChange={setPage}
                />
              ) : null
            }
          />
        </div>
      </DashboardSection>

      {/* Detailed Lead Drawer */}
      <LeadDetailsDrawer
        leadId={selectedLeadId}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onLeadUpdated={() => fetchLeads(page, searchQuery, statusFilter)}
      />
    </div>
  );
}

