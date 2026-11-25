'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CourseHeroSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleClear = () => {
    setSearchValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchValue(tag);
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', tag);
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const popularTags = ['Full Stack', 'Backend Systems', 'Next.js', 'System Design', 'Cloud Architecture'];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <div className="relative w-full flex items-center">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by topic, skill, or technology (e.g. Next.js, Distributed Systems)..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-13 pl-12 pr-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            aria-label="Search courses"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="absolute right-2 h-9 px-4 rounded-xl font-semibold shadow-sm"
          >
            {isPending ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Quick Search Tag Suggestions */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Popular searches:
        </span>
        {popularTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTagClick(tag)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CourseHeroSearch;
