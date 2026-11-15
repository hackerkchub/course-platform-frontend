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
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminReviewsApi } from '@/lib/api/admin-reviews';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type { AdminReviewItem, ModerationStatus } from '@/types/admin-review';
import {
  Star,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  User,
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Action states
  const [approveTarget, setApproveTarget] = useState<AdminReviewItem | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const [rejectTarget, setRejectTarget] = useState<AdminReviewItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  const fetchReviews = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError('');
      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          limit,
          sort: sortBy,
        };
        if (statusFilter && statusFilter !== 'all') {
          params.moderation_status = statusFilter;
        }
        if (ratingFilter) {
          params.rating = Number(ratingFilter);
        }

        const res = await adminReviewsApi.getReviews(params);
        setReviews(res.reviews);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setPage(res.pagination.page);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to fetch reviews'));
      } finally {
        setIsLoading(false);
      }
    },
    [limit, sortBy, statusFilter, ratingFilter]
  );

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setIsApproving(true);
    setError('');
    setSuccess('');
    try {
      await adminReviewsApi.moderateReview(approveTarget.id, {
        moderation_status: 'approved',
      });
      setSuccess(`Review #${approveTarget.id} approved and published to public catalog.`);
      setApproveTarget(null);
      fetchReviews(page);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to approve review'));
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;

    setIsRejecting(true);
    setError('');
    setSuccess('');
    try {
      await adminReviewsApi.moderateReview(rejectTarget.id, {
        moderation_status: 'rejected',
        reason: rejectReason.trim() || null,
      });
      setSuccess(`Review #${rejectTarget.id} rejected.`);
      setRejectTarget(null);
      setRejectReason('');
      fetchReviews(page);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reject review'));
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = (st: ModerationStatus) => {
    switch (st) {
      case 'approved':
        return <Badge variant="success">APPROVED</Badge>;
      case 'pending':
        return <Badge variant="warning">PENDING REVIEW</Badge>;
      case 'rejected':
        return <Badge variant="destructive">REJECTED</Badge>;
      default:
        return <Badge variant="default">{st}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const columns: DataTableColumn<AdminReviewItem>[] = useMemo(
    () => [
      {
        key: 'id',
        header: '#',
        render: (item) => <span className="font-mono text-xs text-slate-400">{item.id}</span>,
        className: 'w-10 text-center',
      },
      {
        key: 'course',
        header: 'Course & Student',
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
              {item.course_name || `Course #${item.course_id}`}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <User className="w-3 h-3 text-slate-400" />
              <span>{item.user_name || `Student #${item.user_id}`}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'review',
        header: 'Rating & Feedback Content',
        render: (item) => (
          <div className="flex flex-col gap-1 max-w-md">
            <div className="flex items-center gap-2">
              {renderStars(item.rating)}
              {item.title && (
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                  &quot;{item.title}&quot;
                </span>
              )}
            </div>
            {item.text && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {item.text}
              </p>
            )}
            {item.moderation_reason && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 italic">
                Rejection reason: {item.moderation_reason}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item) => getStatusBadge(item.moderation_status),
      },
      {
        key: 'date',
        header: 'Submitted',
        render: (item) => (
          <span className="text-xs text-slate-500">
            {formatDateKolkata(item.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Moderation',
        align: 'right',
        render: (item) => (
          <div className="flex items-center justify-end gap-1.5">
            {item.moderation_status !== 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApproveTarget(item)}
                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 flex items-center gap-1"
                title="Approve Review"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </Button>
            )}
            {item.moderation_status !== 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectTarget(item)}
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 flex items-center gap-1"
                title="Reject Review"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            )}
          </div>
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
          { label: 'Review Moderation' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Course Reviews Moderation"
          subtitle="Audit student feedback, evaluate ratings, and enforce community standards before publication."
        />
        <Button
          variant="outline"
          onClick={() => fetchReviews(page)}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
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

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchFilterToolbar
          searchPlaceholder="Queue filter options..."
          filterOptions={[
            { label: 'All Reviews', value: 'all' },
            { label: 'Pending Moderation', value: 'pending' },
            { label: 'Approved (Live)', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]}
          activeFilter={statusFilter}
          onFilterChange={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
        />

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs ml-auto">
          <span className="text-slate-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'rating_high' | 'rating_low')}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <DashboardSection
        title={`Reviews Queue (${totalCount})`}
        subtitle="Submitted course evaluations requiring editorial authorization."
      >
        <DataTable
          columns={columns}
          data={reviews}
          isLoading={isLoading}
          emptyMessage="No reviews in queue matching criteria."
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

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={Boolean(approveTarget)}
        title="Approve Course Review"
        description={`Are you sure you want to approve this ${approveTarget?.rating}-star review for "${approveTarget?.course_name}"? It will become publicly visible immediately.`}
        confirmLabel={isApproving ? 'Approving...' : 'Approve & Publish'}
        confirmVariant="primary"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Reject Dialog with Reason */}
      <Dialog
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject Course Review"
        description="Provide an internal reason for rejecting this review. Rejected reviews remain invisible to other students."
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rejection Reason (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Inappropriate language, spam, or promotional links..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={500}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isRejecting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
