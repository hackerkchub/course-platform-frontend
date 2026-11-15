import React from 'react';
import {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';
import type { DataTableProps, DataTableColumn } from '@/types/dashboard';

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingRowCount = 5,
  isError = false,
  errorTitle,
  errorDescription,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
  pagination,
  className,
  containerClassName,
  caption,
}: DataTableProps<T>) {
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'left':
      default:
        return 'text-left';
    }
  };

  const renderHeaderContent = (col: DataTableColumn<T>) => {
    if (typeof col.header === 'function') {
      return col.header(col);
    }
    return col.header;
  };

  const renderCellContent = (col: DataTableColumn<T>, row: T, index: number) => {
    if (col.render) {
      return col.render(row, index);
    }
    if (col.cell) {
      const rawValue = col.accessorKey ? row[col.accessorKey] : undefined;
      return col.cell({ row, index, value: rawValue });
    }
    if (col.accessorKey) {
      const val = row[col.accessorKey];
      if (val === null || val === undefined || val === '') {
        return <span className="text-slate-400 dark:text-slate-600">—</span>;
      }
      return String(val);
    }
    return null;
  };

  const resolvedEmptyTitle = emptyTitle || (emptyMessage ? emptyMessage : 'No records available');
  const resolvedEmptyDescription = emptyDescription || (emptyTitle && emptyMessage ? emptyMessage : (emptyMessage ? '' : 'No data matches your current criteria.'));

  return (
    <div className={cn('w-full min-w-0 space-y-4', containerClassName)}>
      <div className={cn('relative w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden', className)}>
        <div className="w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm text-left">
            {caption && <caption className="sr-only">{caption}</caption>}

            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                {columns.map((col, idx) => (
                  <TableHead
                    key={col.id || col.key || String(col.accessorKey) || `col-${idx}`}
                    className={cn(
                      'h-11 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none whitespace-nowrap',
                      getAlignmentClass(col.align),
                      col.headerClassName
                    )}
                  >
                    {renderHeaderContent(col)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Error State */}
              {isError && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-8 text-center">
                    <ErrorState
                      title={errorTitle || 'Failed to load table data'}
                      description={errorDescription || 'An error occurred while fetching records.'}
                      onRetry={onRetry}
                      className="border-0 bg-transparent p-4"
                    />
                  </TableCell>
                </TableRow>
              )}

              {/* Loading Skeleton State */}
              {!isError && isLoading && (
                Array.from({ length: loadingRowCount }).map((_, rowIdx) => (
                  <TableRow key={`skeleton-row-${rowIdx}`} className="border-b border-slate-100 dark:border-slate-800/60">
                    {columns.map((col, colIdx) => (
                      <TableCell key={`skeleton-cell-${rowIdx}-${colIdx}`} className="p-4">
                        <Skeleton className={cn('h-4 rounded-md', colIdx === 0 ? 'w-3/4' : 'w-1/2')} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}

              {/* Empty State */}
              {!isError && !isLoading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-8 text-center">
                    <EmptyState
                      title={resolvedEmptyTitle}
                      description={resolvedEmptyDescription}
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                      className="border-0 bg-transparent p-4"
                    />
                  </TableCell>
                </TableRow>
              )}

              {/* Data Rows */}
              {!isError && !isLoading && data.length > 0 && (
                data.map((row, index) => {
                  const key = keyExtractor ? keyExtractor(row, index) : `row-${index}`;
                  const isClickable = Boolean(onRowClick);

                  return (
                    <TableRow
                      key={key}
                      onClick={isClickable ? () => onRowClick?.(row, index) : undefined}
                      className={cn(
                        'border-b border-slate-100 transition-colors dark:border-slate-800/60',
                        isClickable
                          ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/30'
                      )}
                    >
                      {columns.map((col, colIdx) => (
                        <TableCell
                          key={col.id || col.key || String(col.accessorKey) || `cell-${index}-${colIdx}`}
                          className={cn(
                            'p-4 align-middle text-slate-700 dark:text-slate-300',
                            getAlignmentClass(col.align),
                            col.className
                          )}
                        >
                          {renderCellContent(col, row, index)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </table>
        </div>

        {/* Optional Embedded Pagination Footer */}
        {pagination && (
          <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {pagination}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
