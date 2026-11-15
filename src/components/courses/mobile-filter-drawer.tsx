'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category } from '@/types/course';
import { Button } from '@/components/ui/button';
import { CourseFilters } from '@/components/courses/course-filters';
import { SlidersHorizontal, X } from 'lucide-react';

interface MobileFilterDrawerProps {
  categories: Category[];
  totalCourses?: number;
}

export function MobileFilterDrawer({ categories, totalCourses }: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Count active filters to display badge
  const activeFilterCount = [
    searchParams.get('search'),
    searchParams.get('category'),
    searchParams.get('level') && searchParams.get('level') !== 'all' ? searchParams.get('level') : null,
    searchParams.get('price') && searchParams.get('price') !== 'all' ? searchParams.get('price') : null,
  ].filter(Boolean).length;

  // Handle Escape key and body lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden mb-6">
      {/* Mobile Filter Trigger Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Catalog Filter
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {totalCourses !== undefined ? `${totalCourses} ${totalCourses === 1 ? 'Cohort' : 'Cohorts'}` : 'All Cohorts'}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2 font-bold border-slate-300 dark:border-slate-700 h-10 px-4"
          aria-label="Open filter drawer"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Slide-Out Drawer Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Course Filters"
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Filter Courses
                </h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close filter drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <CourseFilters
                categories={categories}
                totalCourses={totalCourses}
                isDrawer
                onApply={() => setIsOpen(false)}
              />
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => setIsOpen(false)}
                className="w-full font-bold shadow-md shadow-blue-500/20"
              >
                Apply Filters {totalCourses !== undefined ? `(${totalCourses})` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileFilterDrawer;
