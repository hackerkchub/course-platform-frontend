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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminLeadsApi } from '@/lib/api/admin-leads';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type { DemoLeadItem, LeadStatus } from '@/types/admin-lead';
import {
  RefreshCw,
  Download,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  AlertCircle,
  Eye,
  UserCheck,
  Trash2,
} from 'lucide-react';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<DemoLeadItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Selected lead for drawer
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<LeadStatus>('contacted');
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);

  // Quick Action Dialogs
  const [convertTarget, setConvertTarget] = useState<DemoLeadItem | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<DemoLeadItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setPage(res.pagination.page);
        setSelectedIds([]);
      } catch (err) {
        setIsError(true);
        setErrorMessage(getErrorMessage(err, 'Failed to fetch demo leads'));
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchLeads(page, searchQuery, statusFilter);
  }, [fetchLeads, page, searchQuery, statusFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await adminLeadsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to export leads'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleConvertLead = async () => {
    if (!convertTarget) return;
    setIsConverting(true);
    try {
      await adminLeadsApi.convertLead(convertTarget.id);
      setConvertTarget(null);
      fetchLeads(page, searchQuery, statusFilter);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to convert lead to enrollment'));
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminLeadsApi.deleteLead(deleteTarget.id);
      setDeleteTarget(null);
      fetchLeads(page, searchQuery, statusFilter);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete lead'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(leads.map((l) => l.id));
      } else {
        setSelectedIds([]);
      }
    },
    [leads]
  );

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await adminLeadsApi.bulkUpdate({
        ids: selectedIds,
        status: bulkStatus,
      });
      fetchLeads(page, searchQuery, statusFilter);
      setSelectedIds([]);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update selected leads'));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">PENDING</Badge>;
      case 'contacted':
        return <Badge variant="accent">CONTACTED</Badge>;
      case 'scheduled':
        return <Badge variant="primary">SCHEDULED</Badge>;
      case 'completed':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="default">{status.toUpperCase()}</Badge>;
    }
  };

  const columns: DataTableColumn<DemoLeadItem>[] = useMemo(
    () => [
      {
        key: 'select',
        header: (
          <input
            type="checkbox"
            checked={leads.length > 0 && selectedIds.length === leads.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            aria-label="Select all leads"
          />
        ),
        render: (lead) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(lead.id)}
            onChange={() => handleToggleSelect(lead.id)}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            aria-label={`Select lead ${lead.reference_no}`}
          />
        ),
        className: 'w-10 text-center',
      },
      {
        key: 'reference_no',
        header: 'Ref No',
        render: (lead) => (
          <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
            {lead.reference_no}
          </span>
        ),
      },
      {
        key: 'student',
        header: 'Applicant Information',
        render: (lead) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {lead.student_name}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {lead.phone}
              </span>
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <Mail className="w-3 h-3 text-slate-400" />
                {lead.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'course',
        header: 'Target Course',
        render: (lead) => (
          <div className="flex flex-col">
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
              {lead.course_name || `Course #${lead.course_id}`}
            </span>
            <span className="text-xs text-slate-500 capitalize">
              {lead.preferred_demo_type ? `${lead.preferred_demo_type} Demo` : 'Standard'}
            </span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (lead) => (
          <div className="flex items-center gap-1.5">
            {getStatusBadge(lead.status)}
            {lead.converted_to_enrollment && (
              <Badge variant="success">ENROLLED</Badge>
            )}
          </div>
        ),
      },
      {
        key: 'schedule',
        header: 'Schedule Details',
        render: (lead) => (
          <div className="flex flex-col text-xs text-slate-600 dark:text-slate-400">
            {lead.scheduled_at ? (
              <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-medium">
                <Calendar className="w-3 h-3" />
                {formatDateKolkata(lead.scheduled_at)}
              </span>
            ) : (
              <span className="text-slate-400 italic">Not scheduled</span>
            )}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Management',
        align: 'right',
        render: (lead) => (
          <div className="flex items-center justify-end gap-1.5">
            {!lead.converted_to_enrollment && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConvertTarget(lead)}
                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 flex items-center gap-1"
                title="Convert to Enrollment"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Convert
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedLeadId(lead.id);
                setIsDrawerOpen(true);
              }}
              className="text-xs flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Manage
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteTarget(lead)}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800"
              title="Delete Lead"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [leads, selectedIds, handleSelectAll]
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Demo Leads Desk' },
        ]}
      />

      {/* Heading & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Demo Leads & Inquiry Desk"
          subtitle="Enterprise lead qualification, scheduling, conversion, and follow-up management."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchLeads(page, searchQuery, statusFilter)}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-800 dark:text-teal-200">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <span>{selectedIds.length} lead(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as LeadStatus)}
              className="text-xs rounded-lg border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 p-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="contacted">Mark as Contacted</option>
              <option value="completed">Mark as Completed</option>
              <option value="cancelled">Mark as Cancelled</option>
            </select>
            <Button
              size="sm"
              onClick={handleBulkStatusUpdate}
              disabled={isBulkUpdating}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs py-1"
            >
              {isBulkUpdating ? 'Applying...' : 'Apply Bulk Status'}
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <SearchFilterToolbar
        searchPlaceholder="Search leads by name, email, or phone number..."
        onSearch={handleSearch}
        filterOptions={[
          { label: 'All Statuses', value: 'all' },
          { label: 'Pending (New)', value: 'pending' },
          { label: 'Contacted', value: 'contacted' },
          { label: 'Demo Scheduled', value: 'scheduled' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={handleStatusChange}
      />

      {/* Error Notice */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load demo leads</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchLeads(page, searchQuery, statusFilter)}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Leads Table */}
      <DashboardSection
        title={`All Demo Inquiries (${totalCount})`}
        subtitle="Full operational record of applicant leads."
      >
        <DataTable
          columns={columns}
          data={leads}
          isLoading={isLoading}
          emptyMessage="No demo leads found matching the selected query."
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

      {/* Detailed Lead Drawer */}
      <LeadDetailsDrawer
        leadId={selectedLeadId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={() => fetchLeads(page, searchQuery, statusFilter)}
      />

      {/* Quick Convert Dialog */}
      <ConfirmDialog
        isOpen={Boolean(convertTarget)}
        title="Convert Lead to Student Enrollment"
        description={`Are you sure you want to enroll ${convertTarget?.student_name} into "${convertTarget?.course_name}"?`}
        confirmLabel={isConverting ? 'Converting...' : 'Confirm Enrollment'}
        confirmVariant="primary"
        onConfirm={handleConvertLead}
        onCancel={() => setConvertTarget(null)}
      />

      {/* Quick Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Demo Lead"
        description={`Permanently delete lead ${deleteTarget?.reference_no} (${deleteTarget?.student_name})?`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Lead'}
        confirmVariant="destructive"
        onConfirm={handleDeleteLead}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
