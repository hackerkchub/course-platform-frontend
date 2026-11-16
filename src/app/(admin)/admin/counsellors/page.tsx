'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { adminCounsellorsApi } from '@/lib/api/admin-counsellors';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type {
  CounsellorItem,
  CounsellorSummary,
  CounsellorDetailsResponse,
} from '@/types/admin-counsellor';
import {
  Headphones,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Plus,
  UserPlus,
  RefreshCw,
  Eye,
  Power,
  AlertCircle,
  Inbox,
  Award,
} from 'lucide-react';

export default function AdminCounsellorsPage() {
  const { toast } = useToast();

  // Counsellors list and pagination state
  const [counsellors, setCounsellors] = useState<CounsellorItem[]>([]);
  const [summary, setSummary] = useState<CounsellorSummary>({
    total: 0,
    active: 0,
    blocked: 0,
    google_linked: 0,
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

  // Dialog States
  const [isProvisionOpen, setIsProvisionOpen] = useState<boolean>(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState<boolean>(false);
  const [detailsCounsellor, setDetailsCounsellor] = useState<CounsellorDetailsResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState<boolean>(false);

  // Status Action Target
  const [statusTarget, setStatusTarget] = useState<CounsellorItem | null>(null);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState<boolean>(false);

  // Form states for Provisioning
  const [provisionName, setProvisionName] = useState<string>('');
  const [provisionEmail, setProvisionEmail] = useState<string>('');
  const [provisionPhone, setProvisionPhone] = useState<string>('');
  const [provisionError, setProvisionError] = useState<string>('');
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);

  // Form states for Promotion
  const [promoteEmail, setPromoteEmail] = useState<string>('');
  const [promoteError, setPromoteError] = useState<string>('');
  const [isPromoting, setIsPromoting] = useState<boolean>(false);

  // Fetch counsellors
  const fetchCounsellors = useCallback(
    async (targetPage = 1, search = '', status = 'all') => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      try {
        const res = await adminCounsellorsApi.getCounsellors({
          page: targetPage,
          limit,
          search,
          status: status as 'all' | 'active' | 'blocked',
        });

        setCounsellors(res.counsellors);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setPage(res.pagination.page);
        if (res.summary) {
          setSummary(res.summary);
        }
      } catch (err) {
        setIsError(true);
        setErrorMessage(getErrorMessage(err, 'Failed to fetch counsellors list'));
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchCounsellors(page, searchQuery, statusFilter);
  }, [fetchCounsellors, page, searchQuery, statusFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  // Open Details Modal
  const handleOpenDetails = useCallback(
    async (counsellor: CounsellorItem) => {
      setIsDetailsOpen(true);
      setIsDetailsLoading(true);
      try {
        const data = await adminCounsellorsApi.getCounsellorDetails(counsellor.id);
        setDetailsCounsellor(data);
      } catch (err) {
        toast({
          type: 'error',
          title: 'Error loading details',
          message: getErrorMessage(err, 'Failed to load counsellor metrics'),
        });
        setIsDetailsOpen(false);
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [toast]
  );

  // Handle Provisioning Submit
  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError('');

    if (!provisionName.trim() || provisionName.trim().length < 2) {
      setProvisionError('Please enter a valid full name (at least 2 characters)');
      return;
    }

    if (!provisionEmail.trim() || !provisionEmail.includes('@')) {
      setProvisionError('Please enter a valid official Google email address');
      return;
    }

    if (provisionPhone.trim() && !/^[6-9][0-9]{9}$/.test(provisionPhone.trim())) {
      setProvisionError('Phone must be a valid 10-digit Indian mobile number');
      return;
    }

    setIsProvisioning(true);
    try {
      await adminCounsellorsApi.provisionCounsellor({
        name: provisionName.trim(),
        email: provisionEmail.trim().toLowerCase(),
        phone: provisionPhone.trim() || null,
      });

      toast({
        type: 'success',
        title: 'Counsellor Provisioned',
        message: `Account created for ${provisionEmail.trim().toLowerCase()}. The counsellor can now sign in using Google.`,
      });

      setIsProvisionOpen(false);
      setProvisionName('');
      setProvisionEmail('');
      setProvisionPhone('');
      fetchCounsellors(1, searchQuery, statusFilter);
    } catch (err) {
      setProvisionError(getErrorMessage(err, 'Failed to provision counsellor account'));
    } finally {
      setIsProvisioning(false);
    }
  };

  // Handle Promote Student Submit
  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteError('');

    if (!promoteEmail.trim() || !promoteEmail.includes('@')) {
      setPromoteError('Please enter the existing student email address');
      return;
    }

    setIsPromoting(true);
    try {
      await adminCounsellorsApi.promoteStudent({
        email: promoteEmail.trim().toLowerCase(),
      });

      toast({
        type: 'success',
        title: 'Student Promoted',
        message: `User ${promoteEmail.trim().toLowerCase()} has been promoted to Counsellor successfully.`,
      });

      setIsPromoteOpen(false);
      setPromoteEmail('');
      fetchCounsellors(1, searchQuery, statusFilter);
    } catch (err) {
      setPromoteError(getErrorMessage(err, 'Failed to promote student account'));
    } finally {
      setIsPromoting(false);
    }
  };

  // Handle Status Toggle Confirmation
  const handleConfirmStatusToggle = async () => {
    if (!statusTarget) return;

    const newStatus = statusTarget.status === 'active' ? 'blocked' : 'active';
    setIsStatusSubmitting(true);

    try {
      await adminCounsellorsApi.updateStatus(statusTarget.id, newStatus);

      toast({
        type: 'success',
        title: newStatus === 'blocked' ? 'Account Deactivated' : 'Account Activated',
        message:
          newStatus === 'blocked'
            ? `${statusTarget.name} has been deactivated and all active sessions were revoked.`
            : `${statusTarget.name} has been reactivated successfully.`,
      });

      setStatusTarget(null);
      fetchCounsellors(page, searchQuery, statusFilter);
    } catch (err) {
      toast({
        type: 'error',
        title: 'Status Update Failed',
        message: getErrorMessage(err, 'Failed to update counsellor status'),
      });
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  // Table Columns Definition
  const columns: DataTableColumn<CounsellorItem>[] = useMemo(
    () => [
      {
        key: 'counsellor',
        header: 'Counsellor Profile',
        className: 'min-w-[220px]',
        render: (item) => (
          <div className="flex items-center gap-3">
            {item.avatar_url ? (
              <Image
                src={item.avatar_url}
                alt={item.name}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                unoptimized
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                {item.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="truncate">{item.email}</span>
                {item.phone && (
                  <>
                    <span>•</span>
                    <span>{item.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        render: () => (
          <Badge variant="accent" className="font-semibold text-[11px] px-2.5 py-0.5">
            Counsellor
          </Badge>
        ),
      },
      {
        key: 'google_id_linked',
        header: 'Google Auth Status',
        render: (item) =>
          item.google_id_linked ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Linked</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-800/60">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Pending Login</span>
            </span>
          ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item) =>
          item.status === 'active' ? (
            <Badge variant="success" className="text-[11px] px-2 py-0.5">
              Active
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-[11px] px-2 py-0.5">
              Blocked
            </Badge>
          ),
      },
      {
        key: 'last_login_at',
        header: 'Last Login',
        render: (item) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
            {item.last_login_at ? formatDateKolkata(item.last_login_at) : 'Never signed in'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (item) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOpenDetails(item)}
              aria-label={`View details for ${item.name}`}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/50"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStatusTarget(item)}
              aria-label={item.status === 'active' ? `Deactivate ${item.name}` : `Activate ${item.name}`}
              className={
                item.status === 'active'
                  ? 'p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50'
                  : 'p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              }
            >
              <Power className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleOpenDetails]
  );

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Staff & Counsellors' },
        ]}
      />

      {/* Header Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Staff & Counsellor Management"
          subtitle="Provision academic counselors, manage active desk access, and monitor student admissions lead allocation."
        />
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPromoteOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Promote Student</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsProvisionOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Counsellor</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <StatsGrid columns={4}>
        <StatCard
          title="Total Counsellors"
          value={summary.total}
          icon={Headphones}
          description="Provisioned academic counselors"
        />
        <StatCard
          title="Active Desks"
          value={summary.active}
          icon={UserCheck}
          description="Operational counselors with portal access"
        />
        <StatCard
          title="Suspended / Blocked"
          value={summary.blocked}
          icon={ShieldAlert}
          description="Deactivated staff accounts"
        />
        <StatCard
          title="Google Account Linked"
          value={summary.google_linked}
          icon={CheckCircle2}
          description="Completed initial OAuth sign-in"
        />
      </StatsGrid>

      {/* Main Section */}
      <DashboardSection
        title="Counsellor Desk Registry"
        subtitle="Manage authentication status, view live Google linking state, and control access permissions."
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <SearchFilterToolbar
                searchPlaceholder="Search counsellors by name or email..."
                onSearch={handleSearch}
                filterOptions={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active Desks', value: 'active' },
                  { label: 'Blocked / Suspended', value: 'blocked' },
                ]}
                activeFilter={statusFilter}
                onFilterChange={handleStatusFilterChange}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCounsellors(page, searchQuery, statusFilter)}
              disabled={isLoading}
              className="self-end sm:self-auto flex items-center gap-1.5 text-xs text-slate-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Error Notice */}
          {isError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Unable to load counsellors</p>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchCounsellors(page, searchQuery, statusFilter)}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            data={counsellors}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? 'No counsellors found matching your search criteria.'
                : 'No counsellors have been provisioned yet. Use the "Provision Counsellor" button above to add one.'
            }
          />

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={limit}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </DashboardSection>

      {/* Provision Counsellor Modal */}
      <Dialog
        isOpen={isProvisionOpen}
        onClose={() => {
          if (!isProvisioning) {
            setIsProvisionOpen(false);
            setProvisionError('');
          }
        }}
        title="Provision New Counsellor"
        description="Pre-provision an academic counselor account. The counselor will link their account automatically upon first signing in with Google."
        className="max-w-md"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4 pt-2">
          {provisionError && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{provisionError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Ananya Sen"
              value={provisionName}
              onChange={(e) => setProvisionName(e.target.value)}
              required
              disabled={isProvisioning}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Official Google Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="e.g. ananya.sen@softmaxs.com"
              value={provisionEmail}
              onChange={(e) => setProvisionEmail(e.target.value)}
              required
              disabled={isProvisioning}
            />
            <p className="text-[11px] text-slate-500">
              Must match the email address the counselor will use to sign in via Google.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mobile Contact Number (Optional)
            </label>
            <Input
              type="tel"
              placeholder="e.g. 9876543210"
              value={provisionPhone}
              onChange={(e) => setProvisionPhone(e.target.value)}
              disabled={isProvisioning}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProvisionOpen(false)}
              disabled={isProvisioning}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isProvisioning}
              isLoading={isProvisioning}
            >
              Provision Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Promote Student Modal */}
      <Dialog
        isOpen={isPromoteOpen}
        onClose={() => {
          if (!isPromoting) {
            setIsPromoteOpen(false);
            setPromoteError('');
          }
        }}
        title="Promote Existing Student to Counsellor"
        description="Upgrade an existing registered student account to Counsellor. Their existing Google identity and login credentials will be preserved."
        className="max-w-md"
      >
        <form onSubmit={handlePromoteSubmit} className="space-y-4 pt-2">
          {promoteError && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{promoteError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Student Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="e.g. karan.student@example.com"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              required
              disabled={isPromoting}
            />
            <p className="text-[11px] text-slate-500">
              Enter the exact email of the student you wish to promote to Counsellor desk.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 space-y-1">
            <p className="font-semibold">Role Elevation Notice:</p>
            <p>
              This user will immediately receive access to the Counsellor Desk (`/counsellor/dashboard`), demo lead pipeline, and eligibility consultations.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPromoteOpen(false)}
              disabled={isPromoting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPromoting}
              isLoading={isPromoting}
            >
              Confirm Promotion
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Counsellor Details Modal */}
      <Dialog
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailsCounsellor(null);
        }}
        title="Counsellor Profile & Telemetry"
        className="max-w-lg"
      >
        {isDetailsLoading || !detailsCounsellor ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500">Loading counselor telemetry...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Header info */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              {detailsCounsellor.counsellor.avatar_url ? (
                <Image
                  src={detailsCounsellor.counsellor.avatar_url}
                  alt={detailsCounsellor.counsellor.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                  {detailsCounsellor.counsellor.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">
                    {detailsCounsellor.counsellor.name}
                  </h3>
                  <Badge variant="accent" className="text-[10px] py-0 px-2">
                    Counsellor
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{detailsCounsellor.counsellor.email}</p>
                {detailsCounsellor.counsellor.phone && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {detailsCounsellor.counsellor.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Assigned Demo Leads</span>
                  <Inbox className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {detailsCounsellor.metrics.assigned_leads}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Completed Leads</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {detailsCounsellor.metrics.completed_leads}
                </div>
              </div>
            </div>

            {/* Metadata list */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Google OAuth Account:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailsCounsellor.counsellor.google_id_linked
                    ? 'Connected & Verified'
                    : 'Pending Initial Sign-In'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account Access Status:</span>
                <Badge
                  variant={detailsCounsellor.counsellor.status === 'active' ? 'success' : 'destructive'}
                  className="text-[10px] py-0 px-2"
                >
                  {detailsCounsellor.counsellor.status === 'active' ? 'Active' : 'Blocked / Suspended'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Active Session:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {detailsCounsellor.counsellor.last_login_at
                    ? formatDateKolkata(detailsCounsellor.counsellor.last_login_at)
                    : 'Never signed in'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Provisioned On:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatDateKolkata(detailsCounsellor.counsellor.created_at)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Confirm Deactivation / Activation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(statusTarget)}
        title={
          statusTarget?.status === 'active'
            ? `Deactivate ${statusTarget?.name}?`
            : `Activate ${statusTarget?.name}?`
        }
        description={
          statusTarget?.status === 'active'
            ? `Are you sure you want to deactivate ${statusTarget?.name}? This will immediately block their access to the Counsellor Desk and revoke all active login sessions across devices.`
            : `Are you sure you want to reactivate ${statusTarget?.name}? They will regain access to their assigned demo leads upon their next Google sign-in.`
        }
        confirmLabel={
          statusTarget?.status === 'active'
            ? 'Deactivate & Invalidate Sessions'
            : 'Activate Account'
        }
        confirmVariant={statusTarget?.status === 'active' ? 'destructive' : 'primary'}
        isLoading={isStatusSubmitting}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
