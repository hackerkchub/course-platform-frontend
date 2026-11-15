import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { SearchFilterToolbarProps } from '@/types/dashboard';

export function SearchFilterToolbar({
  searchValue,
  onSearchChange,
  onSearch,
  searchPlaceholder = 'Search records...',
  filterOptions,
  activeFilter,
  onFilterChange,
  filters,
  resultCount,
  totalCount,
  onReset,
  resetLabel = 'Reset Filters',
  action,
  className,
  children,
}: SearchFilterToolbarProps) {
  const [internalSearch, setInternalSearch] = React.useState('');
  const isControlled = searchValue !== undefined;
  const currentSearch = isControlled ? searchValue : internalSearch;

  const hasSearch = onSearchChange !== undefined || onSearch !== undefined;
  const hasActiveSearch = currentSearch.trim().length > 0;

  const handleInputChange = (val: string) => {
    if (!isControlled) {
      setInternalSearch(val);
    }
    onSearchChange?.(val);
    onSearch?.(val);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalSearch('');
    }
    onSearchChange?.('');
    onSearch?.('');
  };

  return (
    <div
      role="search"
      aria-label="Search and filter toolbar"
      className={cn(
        'w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all',
        className
      )}
    >
      {/* Left / Primary Search and Filters Section */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
        {/* Controlled Search Input */}
        {hasSearch && (
          <div className="relative w-full sm:w-72 md:w-80 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search records"
              className="w-full h-10 pl-9 pr-8 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-ring transition-colors"
            />
            {hasActiveSearch && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-ring rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter Options Dropdown Slot */}
        {filterOptions && filterOptions.length > 0 && (
          <div className="shrink-0">
            <select
              value={activeFilter ?? ''}
              onChange={(e) => onFilterChange?.(e.target.value)}
              aria-label="Filter options"
              className="h-10 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 px-3 focus-ring transition-colors"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Filter Controls Slots */}
        {filters && (
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {filters}
          </div>
        )}

        {/* Optional Reset Filters Button */}
        {onReset && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onReset}
            aria-label={resetLabel}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1.5 h-9 shrink-0 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetLabel}</span>
          </Button>
        )}

        {children}
      </div>

      {/* Right / Secondary Stats and Action Section */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Result Count Summary */}
        {resultCount !== undefined && (
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {totalCount !== undefined ? (
              <span>
                Showing <strong className="text-slate-800 dark:text-slate-200">{resultCount}</strong> of{' '}
                <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong>
              </span>
            ) : (
              <span>
                <strong className="text-slate-800 dark:text-slate-200">{resultCount}</strong> results
              </span>
            )}
          </div>
        )}

        {/* Primary Action Button Slot (e.g. Export, Add New) */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export default SearchFilterToolbar;
