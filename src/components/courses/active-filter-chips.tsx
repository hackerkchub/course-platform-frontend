'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, RotateCcw } from 'lucide-react';
import { Category } from '@/types/course';
import { Button } from '@/components/ui/button';

interface ActiveFilterChipsProps {
  categories: Category[];
  totalCourses: number;
  currentCount: number;
}

export function ActiveFilterChips({
  categories,
  totalCourses,
  currentCount,
}: ActiveFilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search');
  const currentCategorySlug = searchParams.get('category');
  const currentLevel = searchParams.get('level');
  const currentPrice = searchParams.get('price');

  const categoryName = currentCategorySlug
    ? categories.find((c) => c.slug === currentCategorySlug)?.name ||
      currentCategorySlug.replace(/-/g, ' ')
    : null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    currentSearch ||
    currentCategorySlug ||
    (currentLevel && currentLevel !== 'all') ||
    (currentPrice && currentPrice !== 'all')
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-900 dark:text-white">{currentCount}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalCourses}</span> cohorts
        </span>

        {currentSearch && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            <span>Query: &ldquo;{currentSearch}&rdquo;</span>
            <button
              onClick={() => removeFilter('search')}
              disabled={isPending}
              className="hover:text-rose-600 transition-colors"
              aria-label="Remove search filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}

        {categoryName && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            <span>Category: {categoryName}</span>
            <button
              onClick={() => removeFilter('category')}
              disabled={isPending}
              className="hover:text-rose-600 transition-colors"
              aria-label="Remove category filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}

        {currentLevel && currentLevel !== 'all' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 capitalize">
            <span>Level: {currentLevel}</span>
            <button
              onClick={() => removeFilter('level')}
              disabled={isPending}
              className="hover:text-rose-600 transition-colors"
              aria-label="Remove level filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}

        {currentPrice && currentPrice !== 'all' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 capitalize">
            <span>Tuition: {currentPrice}</span>
            <button
              onClick={() => removeFilter('price')}
              disabled={isPending}
              className="hover:text-rose-600 transition-colors"
              aria-label="Remove tuition filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          disabled={isPending}
          className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 h-7 px-2.5 gap-1 ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

export default ActiveFilterChips;
