'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DashboardHeading,
  DashboardSection,
  DataTable,
  SearchFilterToolbar,
  DataTableColumn,
  LeadDetailsDrawer,
} from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { adminLeadsApi } from '@/lib/api/admin-leads';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type { DemoLeadItem } from '@/types/admin-lead';
import {
  Calendar,
  Video,
  ExternalLink,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  Eye,
  AlertCircle,
} from 'lucide-react';

export default function CounsellorDemosPage() {
  const [demos, setDemos] = useState<DemoLeadItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Selected lead for drawer
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const fetchDemos = useCallback(
    async (targetPage = 1, search = '') => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          limit,
          status: 'scheduled', // strictly scheduled demo sessions
        };
        if (search.trim()) {
          params.search = search.trim();
        }

        const res = await adminLeadsApi.getLeads(params);
        setDemos(res.leads);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setPage(res.pagination.page);
      } catch (err) {
        setIsError(true);
        setErrorMessage(getErrorMessage(err, 'Failed to fetch scheduled demos'));
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchDemos(page, searchQuery);
  }, [fetchDemos, page, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleOpenLead = (lead: DemoLeadItem) => {
    setSelectedLeadId(lead.id);
    setIsDrawerOpen(true);
  };

  const handleMarkCompleted = useCallback(
    async (leadId: number) => {
      try {
        await adminLeadsApi.updateLead(leadId, { status: 'completed' });
        fetchDemos(page, searchQuery);
      } catch (err) {
        alert(getErrorMessage(err, 'Failed to mark demo completed'));
      }
    },
    [fetchDemos, page, searchQuery]
  );

  const columns: DataTableColumn<DemoLeadItem>[] = useMemo(
    () => [
      {
        key: 'scheduled_at',
        header: 'Scheduled Date & Time',
        render: (demo) => (
          <div className="flex flex-col">
            <span className="font-semibold text-teal-700 dark:text-teal-400 text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {demo.scheduled_at ? formatDateKolkata(demo.scheduled_at) : 'Date TBD'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Ref: {demo.reference_no}
            </span>
          </div>
        ),
      },
      {
        key: 'student',
        header: 'Candidate Info',
        render: (demo) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {demo.student_name}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <a href={`tel:${demo.phone}`} className="hover:text-teal-600 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {demo.phone}
              </a>
              <span className="text-slate-300">|</span>
              <a href={`mailto:${demo.email}`} className="hover:text-teal-600 flex items-center gap-1 truncate max-w-[140px]">
                <Mail className="w-3 h-3 text-slate-400" />
                {demo.email}
              </a>
            </div>
          </div>
        ),
      },
      {
        key: 'course',
        header: 'Course & Format',
        render: (demo) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
              {demo.course_name || `Course #${demo.course_id}`}
            </span>
            <span className="text-xs text-slate-500 capitalize flex items-center gap-1 mt-0.5">
              <Video className="w-3 h-3 text-slate-400" />
              {demo.preferred_demo_type ? `${demo.preferred_demo_type} Demo` : 'Online Demo'}
            </span>
          </div>
        ),
      },
      {
        key: 'meeting',
        header: 'Meeting Link',
        render: (demo) => (
          <div>
            {demo.meeting_link ? (
              <a
                href={demo.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-medium border border-teal-200 dark:border-teal-800 transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Session</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                Link pending
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Desk Actions',
        align: 'right',
        render: (demo) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarkCompleted(demo.id)}
              className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenLead(demo)}
              className="text-xs flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Details
            </Button>
          </div>
        ),
      },
    ],
    [handleMarkCompleted]
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Counsellor Desk', href: '/counsellor/dashboard' },
          { label: 'Demo Schedules' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Scheduled Demo Classes"
          subtitle="Manage active demo calendar, join virtual classrooms, and record student participation."
        />
        <Button
          variant="outline"
          onClick={() => fetchDemos(page, searchQuery)}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Schedules
        </Button>
      </div>

      {/* Search Toolbar */}
      <SearchFilterToolbar
        searchPlaceholder="Search scheduled demos by student, phone, or email..."
        onSearch={handleSearch}
      />

      {/* Error Notice */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load scheduled demos</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchDemos(page, searchQuery)}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Demos Table */}
      <DashboardSection
        title={`Upcoming Sessions (${totalCount})`}
        subtitle="Confirmed demo sessions waiting for execution or completion."
      >
        <DataTable
          columns={columns}
          data={demos}
          isLoading={isLoading}
          emptyMessage="No scheduled demo classes found. Qualify pending leads to book new sessions."
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

      {/* Lead Details Drawer */}
      <LeadDetailsDrawer
        leadId={selectedLeadId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={() => fetchDemos(page, searchQuery)}
      />
    </div>
  );
}
