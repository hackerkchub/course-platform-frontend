'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  siblingCount?: number;
  disabled?: boolean;
  className?: string;
  showItemCount?: boolean;
}

export function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 5 + siblingCount * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  siblingCount = 1,
  disabled = false,
  className,
  showItemCount = false,
}: PaginationProps) {
  if (totalPages <= 0) {
    return null;
  }

  const clampedPage = Math.max(1, Math.min(currentPage, totalPages));
  const pages = generatePaginationRange(clampedPage, totalPages, siblingCount);

  const isFirstPage = clampedPage <= 1;
  const isLastPage = clampedPage >= totalPages;

  const handlePageClick = (page: number) => {
    if (disabled || page === clampedPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  const renderItemSummary = () => {
    if (!showItemCount || totalItems === undefined || totalItems === null) {
      return null;
    }
    if (pageSize && pageSize > 0) {
      const start = (clampedPage - 1) * pageSize + 1;
      const end = Math.min(clampedPage * pageSize, totalItems);
      return (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{start}</span> to{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{end}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> results
        </span>
      );
    }
    return (
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Total <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> results
      </span>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 select-none',
        className
      )}
    >
      {/* Item Count Summary (if enabled) */}
      <div className="order-2 sm:order-1 text-center sm:text-left">
        {renderItemSummary()}
      </div>

      {/* Pagination Controls */}
      <div className="order-1 sm:order-2 flex items-center gap-1 sm:gap-1.5">
        {/* Previous Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handlePageClick(clampedPage - 1)}
          disabled={disabled || isFirstPage}
          aria-label="Go to previous page"
          className="h-8 px-2 sm:px-2.5 text-xs gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Mobile Compact Page Indicator (< 640px) */}
        <span className="inline-flex sm:hidden items-center px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {clampedPage} / {totalPages}
        </span>

        {/* Desktop Number Buttons (>= 640px) */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((pageItem, index) => {
            if (pageItem === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isCurrent = pageItem === clampedPage;

            return (
              <button
                key={pageItem}
                type="button"
                onClick={() => handlePageClick(pageItem)}
                disabled={disabled}
                aria-label={`Page ${pageItem}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-semibold transition-all focus-ring',
                  isCurrent
                    ? 'bg-[#173D70] text-white shadow-xs dark:bg-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                )}
              >
                {pageItem}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handlePageClick(clampedPage + 1)}
          disabled={disabled || isLastPage}
          aria-label="Go to next page"
          className="h-8 px-2 sm:px-2.5 text-xs gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
