import React from 'react';
import { cn } from '@/lib/utils';
import { StatCard } from './StatCard';
import type { StatsGridProps } from '@/types/dashboard';

export function StatsGrid({
  columns = 4,
  gap = 'md',
  children,
  stats,
  isLoading = false,
  loadingCount = 4,
  className,
}: StatsGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  if (isLoading && (!children || (stats && stats.length > 0))) {
    const count = stats && stats.length > 0 ? stats.length : loadingCount;
    return (
      <div
        className={cn(
          'grid w-full min-w-0',
          columnClasses[columns],
          gapClasses[gap],
          className
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <StatCard
            key={`stat-skeleton-${index}`}
            title="Loading..."
            value="--"
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid w-full min-w-0',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {stats && stats.length > 0
        ? stats.map((stat, index) => (
            <StatCard key={`${stat.title}-${index}`} {...stat} />
          ))
        : children}
    </div>
  );
}

export default StatsGrid;
