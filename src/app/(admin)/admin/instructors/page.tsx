'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  RotateCcw,
  Pencil,
  Power,
  ExternalLink,
  Briefcase,
  Globe,
  UserPlus,
} from 'lucide-react';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { LinkedinIcon, TwitterIcon, GithubIcon } from '@/components/ui/social-icons';
import { InstructorFormModal } from '@/components/admin/instructors/InstructorFormModal';
import {
  fetchAdminInstructors,
  deactivateAdminInstructor,
  activateAdminInstructor,
  provisionAdminInstructor,
} from '@/lib/api/instructor';
import type { Instructor } from '@/types/instructor';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';

export default function AdminInstructorsPage() {
  // Query & Filter State
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals & Action State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [instructorToToggle, setInstructorToToggle] = useState<Instructor | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Provisioning State
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [instructorToProvision, setInstructorToProvision] = useState<Instructor | null>(null);
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisionPassword, setProvisionPassword] = useState('');
  const [provisionPhone, setProvisionPhone] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Instructors from API
  const loadInstructors = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      const res = await fetchAdminInstructors({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
      });

      setInstructors(res.items);
      setTotalCount(res.pagination.total);
      setTotalPages(res.pagination.totalPages);

      // Fetch or update overall stats
      if (res.stats) {
        setActiveCount(res.stats.active);
        setInactiveCount(res.stats.inactive);
      }
    } catch (err: unknown) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err, 'Failed to retrieve instructors list.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadInstructors();
  }, [loadInstructors]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (actionSuccessMessage) {
      const timer = setTimeout(() => setActionSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccessMessage]);

  // Handle Add New Instructor
  const handleOpenAddModal = () => {
    setSelectedInstructor(null);
    setFormModalOpen(true);
  };

  // Handle Edit Instructor
  const handleOpenEditModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setFormModalOpen(true);
  };

  // Handle Activate / Deactivate Toggle Dialog
  const handlePromptToggleStatus = (instructor: Instructor) => {
    setInstructorToToggle(instructor);
    setConfirmDialogOpen(true);
  };

  // Execute Status Toggle Mutation
  const handleConfirmToggleStatus = async () => {
    if (!instructorToToggle) return;

    try {
      setIsTogglingStatus(true);
      const isCurrentlyActive = instructorToToggle.status === 'active';

      if (isCurrentlyActive) {
        await deactivateAdminInstructor(instructorToToggle.id);
        setActionSuccessMessage(`Instructor "${instructorToToggle.name}" deactivated successfully.`);
      } else {
        await activateAdminInstructor(instructorToToggle.id);
        setActionSuccessMessage(`Instructor "${instructorToToggle.name}" activated successfully.`);
      }

      setConfirmDialogOpen(false);
      setInstructorToToggle(null);
      await loadInstructors();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to update instructor status.');
      alert(msg);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleOpenProvisionModal = (inst: Instructor) => {
    setInstructorToProvision(inst);
    setProvisionEmail(inst.email || '');
    setProvisionPassword('');
    setProvisionPhone('');
    setProvisionModalOpen(true);
  };

  const handleConfirmProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorToProvision) return;
    try {
      setIsProvisioning(true);
      await provisionAdminInstructor({
        instructor_id: instructorToProvision.id,
        email: provisionEmail.trim() || undefined,
        password: provisionPassword || undefined,
        phone: provisionPhone.trim() || undefined,
      });
      setProvisionModalOpen(false);
      setActionSuccessMessage(`Login identity successfully provisioned for ${instructorToProvision.name}`);
      await loadInstructors();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to provision instructor identity'));
    } finally {
      setIsProvisioning(false);
    }
  };

  // Table Column Definitions
  const columns: DataTableColumn<Instructor>[] = useMemo(
    () => [
      {
        id: 'instructor',
        header: 'Faculty Profile',
        cell: ({ row }) => (
          <div className="flex items-center gap-3.5">
            {row.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.photo_url}
                alt={row.name}
                className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {row.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">
                {row.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">ID #{row.id}</span>
            </div>
          </div>
        ),
      },
      {
        id: 'designation',
        header: 'Designation & Experience',
        cell: ({ row }) => (
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block truncate max-w-xs">
              {row.designation || 'Faculty Member'}
            </span>
            {row.experience_years !== null && row.experience_years !== undefined ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                <Briefcase className="w-3 h-3" />
                <span>{row.experience_years} Years Exp</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">Experience unspecified</span>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={row.status === 'active' ? 'success' : 'secondary'}
            className="capitalize text-xs font-semibold px-2.5 py-0.5"
          >
            {row.status}
          </Badge>
        ),
      },
      {
        id: 'account',
        header: 'User Account & Assignments',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {row.user_id ? (
                <Badge variant={row.user_status === 'blocked' ? 'destructive' : 'success'} className="text-[10px]">
                  {row.user_status === 'blocked' ? 'Blocked' : `User #${row.user_id}`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                  Unprovisioned
                </Badge>
              )}
              {row.google_id_linked && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono">
                  OAuth
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              {row.assigned_courses_count || 0} Courses • {row.assigned_batches_count || 0} Batches
            </div>
          </div>
        ),
      },
      {
        id: 'social',
        header: 'Social & Bio',
        cell: ({ row }) => (
          <div className="space-y-1 max-w-xs">
            {row.bio ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 truncate">
                {row.bio}
              </p>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No bio provided</span>
            )}
            {row.social_links && (
              <div className="flex items-center gap-2 pt-0.5 text-slate-400">
                {row.social_links.linkedin && (
                  <a
                    href={row.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {row.social_links.twitter && (
                  <a
                    href={row.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-500 transition-colors"
                    aria-label="Twitter"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {row.social_links.github && (
                  <a
                    href={row.social_links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    aria-label="GitHub"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {row.social_links.website && (
                  <a
                    href={row.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-600 transition-colors"
                    aria-label="Website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'created_at',
        header: 'Registered',
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {row.created_at ? formatDateKolkata(row.created_at) : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        align: 'right',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Link
              href={`/instructors/${row.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Public Profile"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            {!row.user_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenProvisionModal(row)}
                className="p-2 h-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                title="Provision Login Identity"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEditModal(row)}
              className="p-2 h-auto text-slate-600 hover:text-blue-600 dark:text-slate-300"
              title="Edit Profile"
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePromptToggleStatus(row)}
              className={`p-2 h-auto ${
                row.status === 'active'
                  ? 'text-slate-400 hover:text-amber-600'
                  : 'text-emerald-600 hover:text-emerald-700'
              }`}
              title={row.status === 'active' ? 'Deactivate Instructor' : 'Activate Instructor'}
            >
              <Power className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Admin Dashboard', href: '/admin/dashboard' },
          { label: 'Instructors Registry', href: '/admin/instructors' },
        ]}
      />

      {/* Page Heading & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Instructor Management"
          description="Manage instructors, professional profiles and course faculty information."
        />
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="gap-2 shrink-0 font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Instructor</span>
        </Button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-between animate-fade-in">
          <span>{actionSuccessMessage}</span>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <StatsGrid columns={3}>
        <StatCard
          title="Total Instructors"
          value={totalCount}
          icon={Users}
          description="Registered faculty entities across platform cohorts"
          isLoading={isLoading && instructors.length === 0}
        />
        <StatCard
          title="Active Mentors"
          value={activeCount}
          icon={UserCheck}
          description="Publicly listed in faculty directory & cohorts"
          badge="Active Directory"
          isLoading={isLoading && instructors.length === 0}
        />
        <StatCard
          title="Inactive Mentors"
          value={inactiveCount}
          icon={UserX}
          description="Draft or deactivated instructors hidden from public"
          isLoading={isLoading && instructors.length === 0}
        />
      </StatsGrid>

      {/* Search & Filters Section */}
      <DashboardSection>
        <SearchFilterToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by faculty name, designation, or bio..."
          resultCount={instructors.length}
          totalCount={totalCount}
          filters={
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['all', 'active', 'inactive'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={loadInstructors}
              disabled={isLoading}
              className="gap-1.5 text-xs"
              title="Refresh Records"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          }
        />

        {/* Instructors Data Table */}
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={instructors}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            loadingRowCount={5}
            isError={isError}
            errorTitle="Failed to load instructor records"
            errorDescription={errorMessage}
            onRetry={loadInstructors}
            emptyTitle="No instructors found"
            emptyDescription={
              searchTerm || statusFilter !== 'all'
                ? 'No instructor profiles match your current search and filter criteria.'
                : 'Get started by creating your first faculty profile.'
            }
            emptyActionLabel={
              searchTerm || statusFilter !== 'all' ? 'Reset Filters' : 'Add First Instructor'
            }
            onEmptyAction={
              searchTerm || statusFilter !== 'all'
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPage(1);
                  }
                : handleOpenAddModal
            }
            pagination={
              totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Showing page {page} of {totalPages} ({totalCount} total mentors)
                  </span>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalCount}
                    pageSize={limit}
                  />
                </div>
              ) : undefined
            }
          />
        </div>
      </DashboardSection>

      {/* Add / Edit Instructor Modal */}
      <InstructorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={() => {
          loadInstructors();
          setActionSuccessMessage(
            selectedInstructor
              ? 'Instructor profile updated successfully.'
              : 'New instructor created successfully.'
          );
        }}
        instructor={selectedInstructor}
      />

      {/* Confirmation Dialog for Deactivation / Activation */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          if (!isTogglingStatus) {
            setConfirmDialogOpen(false);
            setInstructorToToggle(null);
          }
        }}
        onConfirm={handleConfirmToggleStatus}
        isLoading={isTogglingStatus}
        title={
          instructorToToggle?.status === 'active'
            ? 'Deactivate Instructor'
            : 'Activate Instructor'
        }
        description={
          instructorToToggle?.status === 'active'
            ? 'Are you sure you want to deactivate this instructor? This instructor will no longer appear in the public active instructor directory.'
            : 'Do you want to activate this instructor and make the profile eligible for public display?'
        }
        confirmLabel={
          instructorToToggle?.status === 'active' ? 'Deactivate' : 'Activate'
        }
        variant={instructorToToggle?.status === 'active' ? 'danger' : 'default'}
      />

      {/* Provision Instructor Login Modal */}
      {provisionModalOpen && instructorToProvision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Provision Instructor Account</h3>
            <p className="text-xs text-muted-foreground">
              Create an authentication account for <strong>{instructorToProvision.name}</strong> to grant instructor portal access.
            </p>

            <form onSubmit={handleConfirmProvision} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Login Email</label>
                <input
                  type="email"
                  required
                  value={provisionEmail}
                  onChange={(e) => setProvisionEmail(e.target.value)}
                  placeholder="instructor@example.com"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={provisionPassword}
                  onChange={(e) => setProvisionPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone Number (optional)</label>
                <input
                  type="tel"
                  value={provisionPhone}
                  onChange={(e) => setProvisionPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setProvisionModalOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isProvisioning ? 'Provisioning...' : 'Provision Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
