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
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import {
  Inbox,
  Clock,
  Calendar,
  CheckCircle,
  RefreshCw,
  Phone,
  Mail,
  User,
} from 'lucide-react';

interface DemoLeadItem {
  id: number;
  reference_no: string;
  course_id: number;
  course_name: string;
  student_name: string;
  email: string;
  phone: string;
  city?: string | null;
  preferred_demo_type?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled' | string;
  assigned_to?: number | null;
  assigned_user_name?: string | null;
  admin_notes?: string | null;
  scheduled_at?: string | null;
  follow_up_at?: string | null;
  created_at: string;
}

interface DemoRequestsSummary {
  total: number;
  pending: number;
  contacted: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export default function CounsellorDashboardPage() {
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

        const res = await apiClient.get(API_ENDPOINTS.demo.adminRequests, { params });
        const payload = res.data;

        if (payload?.success) {
          const data = payload.data || {};
          const items: DemoLeadItem[] = data.requests || [];
          setLeads(Array.isArray(items) ? items : []);

          if (data.summary) {
            setSummary({
              total: Number(data.summary.total || 0),
              pending: Number(data.summary.pending || 0),
              contacted: Number(data.summary.contacted || 0),
              scheduled: Number(data.summary.scheduled || 0),
              completed: Number(data.summary.completed || 0),
              cancelled: Number(data.summary.cancelled || 0),
            });
          }

          const pagination = data.pagination || payload.pagination || {};
          setTotalCount(Number(pagination.total || items.length));
          setTotalPages(Number(pagination.total_pages || Math.ceil((pagination.total || 1) / limit) || 1));
        } else {
          setIsError(true);
          setErrorMessage(payload?.message || 'Failed to retrieve demo leads.');
        }
      } catch (err) {
        setIsError(true);
        setErrorMessage(getErrorMessage(err));
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
            {row.course_name}
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
        cell: ({ row }) => (
          <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <User className="w-3 h-3 text-slate-400" />
            {row.assigned_user_name || 'Unassigned'}
          </span>
        ),
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
    ],
    []
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
    </div>
  );
}

