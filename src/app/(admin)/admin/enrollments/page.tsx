'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DashboardHeading,
  DashboardSection,
  DataTable,
  SearchFilterToolbar,
  DataTableColumn,
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { Dialog } from '@/components/ui/dialog';
import { adminEnrollmentsApi } from '@/lib/api/admin-enrollments';
import { adminCoursesApi } from '@/lib/api/admin-courses';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type {
  AdminEnrollmentItem,
  EnrollmentStatus,
  EnrollmentSource,
} from '@/types/admin-enrollment';
import type { AdminCourseItem, BatchItem } from '@/types/admin-course';
import {
  Plus,
  RefreshCw,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Mail,
} from 'lucide-react';

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<AdminEnrollmentItem[]>([]);
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Manual Grant Modal
  const [isGrantModalOpen, setIsGrantModalOpen] = useState<boolean>(false);
  const [grantUserId, setGrantUserId] = useState<string>('');
  const [grantCourseId, setGrantCourseId] = useState<number | ''>('');
  const [grantBatchId, setGrantBatchId] = useState<number | ''>('');
  const [courseBatches, setCourseBatches] = useState<BatchItem[]>([]);
  const [grantExpiresAt, setGrantExpiresAt] = useState<string>('');
  const [grantNotes, setGrantNotes] = useState<string>('');
  const [isGranting, setIsGranting] = useState<boolean>(false);

  // Edit Enrollment Modal
  const [editingEnrollment, setEditingEnrollment] = useState<AdminEnrollmentItem | null>(null);
  const [editStatus, setEditStatus] = useState<EnrollmentStatus>('active');
  const [editExpiresAt, setEditExpiresAt] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Load Enrollments
  const fetchEnrollments = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError('');
      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          limit,
        };
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (sourceFilter && sourceFilter !== 'all') params.source = sourceFilter;
        if (selectedCourseId) params.course_id = Number(selectedCourseId);

        const res = await adminEnrollmentsApi.getEnrollments(params);
        setEnrollments(res.enrollments);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setPage(res.pagination.page);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to fetch enrollments'));
      } finally {
        setIsLoading(false);
      }
    },
    [limit, searchQuery, statusFilter, sourceFilter, selectedCourseId]
  );

  // Load Courses for dropdown
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await adminCoursesApi.getCourses({ limit: 100 });
        setCourses(res.courses);
      } catch (err) {
        console.error('Failed to load courses for filter', err);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    fetchEnrollments(page);
  }, [fetchEnrollments, page]);

  // Load batches when grant course changes
  useEffect(() => {
    async function loadBatches(cId: number) {
      try {
        const b = await adminCoursesApi.getBatches(cId);
        setCourseBatches(b);
      } catch {
        setCourseBatches([]);
      }
    }
    if (grantCourseId) {
      loadBatches(Number(grantCourseId));
    } else {
      setCourseBatches([]);
      setGrantBatchId('');
    }
  }, [grantCourseId]);

  // Handle Grant Submit
  const handleGrantEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId || !grantCourseId) return;

    setIsGranting(true);
    setError('');
    setSuccess('');
    try {
      await adminEnrollmentsApi.grantEnrollment({
        user_id: Number(grantUserId),
        course_id: Number(grantCourseId),
        batch_id: grantBatchId ? Number(grantBatchId) : null,
        access_expires_at: grantExpiresAt ? new Date(grantExpiresAt).toISOString() : null,
        notes: grantNotes.trim() || null,
      });

      setSuccess('Course enrollment granted successfully.');
      setIsGrantModalOpen(false);
      setGrantUserId('');
      setGrantCourseId('');
      setGrantBatchId('');
      setGrantExpiresAt('');
      setGrantNotes('');
      fetchEnrollments(1);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to grant enrollment'));
    } finally {
      setIsGranting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: AdminEnrollmentItem) => {
    setEditingEnrollment(item);
    setEditStatus(item.status);
    setEditExpiresAt(item.expires_at ? item.expires_at.slice(0, 16) : '');
    setEditNotes(item.notes || '');
  };

  // Handle Edit Submit
  const handleUpdateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnrollment) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');
    try {
      await adminEnrollmentsApi.updateEnrollment(editingEnrollment.id, {
        enrollment_status: editStatus,
        access_expires_at: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
        notes: editNotes.trim() || null,
      });

      setSuccess(`Enrollment #${editingEnrollment.id} updated successfully.`);
      setEditingEnrollment(null);
      fetchEnrollments(page);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update enrollment'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getSourceBadge = (source: EnrollmentSource) => {
    switch (source) {
      case 'free':
        return <Badge variant="default">FREE TIER</Badge>;
      case 'admin_manual':
        return <Badge variant="accent">ADMIN GRANT</Badge>;
      case 'demo_convert':
        return <Badge variant="success">DEMO CONVERT</Badge>;
      default:
        return <Badge variant="default">{source}</Badge>;
    }
  };

  const getStatusBadge = (st: EnrollmentStatus) => {
    switch (st) {
      case 'active':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'completed':
        return <Badge variant="accent">COMPLETED</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">CANCELLED</Badge>;
      case 'expired':
        return <Badge variant="warning">EXPIRED</Badge>;
      default:
        return <Badge variant="default">{st}</Badge>;
    }
  };

  const columns: DataTableColumn<AdminEnrollmentItem>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        render: (item) => <span className="font-mono text-xs text-slate-400">#{item.id}</span>,
        className: 'w-12 text-center',
      },
      {
        key: 'student',
        header: 'Student',
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {item.student_name || `User #${item.user_id}`}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{item.student_email || `ID: ${item.user_id}`}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'course',
        header: 'Course Enrolled',
        render: (item) => (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
              {item.course_name || `Course #${item.course_id}`}
            </span>
            <span className="text-slate-500 font-mono mt-0.5">
              Batch: {item.batch_name || 'Direct / Self-Paced'}
            </span>
          </div>
        ),
      },
      {
        key: 'source',
        header: 'Enrollment Source',
        render: (item) => getSourceBadge(item.source),
      },
      {
        key: 'status',
        header: 'Access Status',
        render: (item) => getStatusBadge(item.status),
      },
      {
        key: 'dates',
        header: 'Enrolled / Expiry',
        render: (item) => (
          <div className="flex flex-col text-xs text-slate-600 dark:text-slate-400">
            <span>Enrolled: {formatDateKolkata(item.enrolled_at)}</span>
            {item.expires_at ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Expires: {formatDateKolkata(item.expires_at)}
              </span>
            ) : (
              <span className="text-slate-400 italic">Lifetime access</span>
            )}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (item) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(item)}
            className="text-xs flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Manage
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Enrollments Ledger' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Student Enrollments Ledger"
          subtitle="Governs student course permissions, manual access grants, and cohort allocations."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setIsGrantModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Grant Manual Enrollment
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchEnrollments(page)}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="space-y-3">
        <SearchFilterToolbar
          searchPlaceholder="Search enrollments by student name, email, or user ID..."
          onSearch={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
          filterOptions={[
            { label: 'All Statuses', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Completed', value: 'completed' },
            { label: 'Expired', value: 'expired' },
            { label: 'Cancelled', value: 'cancelled' },
          ]}
          activeFilter={statusFilter}
          onFilterChange={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Source Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5"
            >
              <option value="all">All Sources</option>
              <option value="free">Free Tier</option>
              <option value="admin_manual">Admin Manual</option>
              <option value="demo_convert">Demo Convert</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value ? Number(e.target.value) : '');
                setPage(1);
              }}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 max-w-xs truncate"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <DashboardSection
        title={`All Active & Historical Enrollments (${totalCount})`}
        subtitle="Real-time ledger of students with platform learning entitlements."
      >
        <DataTable
          columns={columns}
          data={enrollments}
          isLoading={isLoading}
          emptyMessage="No enrollments found matching the criteria."
        />

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

      {/* Grant Manual Enrollment Dialog */}
      <Dialog
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        title="Grant Manual Student Enrollment"
        description="Provide authorized direct access to course curriculum without automated gateway checkout."
      >
        <form onSubmit={handleGrantEnrollment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student User ID <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 42"
              value={grantUserId}
              onChange={(e) => setGrantUserId(e.target.value)}
              required
            />
            <span className="text-[11px] text-slate-500">
              Numeric user ID from registered user profile or lead inquiry
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Course <span className="text-rose-500">*</span>
            </label>
            <select
              value={grantCourseId}
              onChange={(e) => setGrantCourseId(Number(e.target.value))}
              required
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_name} ({c.course_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assign to Batch (Optional)
            </label>
            <select
              value={grantBatchId}
              onChange={(e) => setGrantBatchId(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="">-- Direct Self-Paced (No Batch) --</option>
              {courseBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_name} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Access Expiry Date (Optional)
            </label>
            <Input
              type="datetime-local"
              value={grantExpiresAt}
              onChange={(e) => setGrantExpiresAt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Administrative Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Offline scholarship grant / partner referral..."
              value={grantNotes}
              onChange={(e) => setGrantNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGrantModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isGranting}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isGranting ? 'Granting Access...' : 'Confirm Enrollment'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Enrollment Modal */}
      <Dialog
        isOpen={Boolean(editingEnrollment)}
        onClose={() => setEditingEnrollment(null)}
        title={`Manage Enrollment #${editingEnrollment?.id}`}
        description={`Student: ${editingEnrollment?.student_name || `User #${editingEnrollment?.user_id}`} • Course: ${editingEnrollment?.course_name}`}
      >
        <form onSubmit={handleUpdateEnrollment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Access Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as EnrollmentStatus)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            >
              <option value="active">Active (Access Allowed)</option>
              <option value="completed">Completed (Graduated)</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled (Revoked)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Access Expiry
            </label>
            <Input
              type="datetime-local"
              value={editExpiresAt}
              onChange={(e) => setEditExpiresAt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingEnrollment(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUpdating}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isUpdating ? 'Saving...' : 'Update Status'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
