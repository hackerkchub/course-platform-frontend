'use client';

import React, { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Category, CourseLevel } from '@/types/course';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, RotateCcw } from 'lucide-react';

interface CourseFiltersProps {
  categories: Category[];
  totalCourses?: number;
  onApply?: () => void;
  isDrawer?: boolean;
}

export function CourseFilters({
  categories,
  totalCourses,
  onApply,
  isDrawer = false,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentLevel = searchParams.get('level') || 'all';
  const currentPrice = searchParams.get('price') || 'all';
  const currentSort = searchParams.get('sort') || 'popular';

  const updateFilters = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page to 1 when filters change
      params.delete('page');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const hasActiveFilters =
    Boolean(currentSearch) ||
    Boolean(currentCategory) ||
    currentLevel !== 'all' ||
    currentPrice !== 'all';

  return (
    <div
      className={`flex flex-col space-y-6 ${
        isDrawer
          ? 'p-0 bg-transparent border-0 shadow-none'
          : 'p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Header */}
      {!isDrawer && (
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Filter Courses
            </h2>
            {totalCourses !== undefined && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalCourses} {totalCourses === 1 ? 'course' : 'courses'} found
              </p>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={isPending}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 h-8 px-2 gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Search
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by title or topic..."
            value={currentSearch}
            onChange={(e) => updateFilters('search', e.target.value || null)}
            className="pr-8 text-sm"
          />
          {currentSearch ? (
            <button
              onClick={() => updateFilters('search', null)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Category
        </label>
        <div className="flex flex-col space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => updateFilters('category', null)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              !currentCategory
                ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilters('category', isSelected ? null : cat.slug)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat.course_count !== undefined && (
                  <span className="text-xs text-slate-400 ml-2">
                    {cat.course_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Level Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Difficulty Level
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['all', 'beginner', 'intermediate', 'advanced'] as Array<'all' | CourseLevel>).map(
            (lvl) => {
              const isSelected = currentLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => updateFilters('level', lvl)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize text-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {lvl === 'all' ? 'All Levels' : lvl}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tuition & Fee
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'free', label: 'Free' },
            { id: 'paid', label: 'Paid' },
          ].map((item) => {
            const isSelected = currentPrice === item.id;
            return (
              <button
                key={item.id}
                onClick={() => updateFilters('price', item.id)}
                className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Sort By
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateFilters('sort', e.target.value)}
          className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newly Published</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {isDrawer && onApply && (
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={onApply}
            className="w-full font-bold shadow-sm"
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}
export default CourseFilters;
