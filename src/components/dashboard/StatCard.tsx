import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { StatCardProps } from '@/types/dashboard';

export function StatCard({
  title,
  value,
  icon: IconProp,
  description,
  trend,
  footer,
  badge,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('relative overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs', className)}>
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    );
  }

  const renderIcon = () => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    const IconComponent = IconProp as React.ComponentType<{ className?: string }>;
    return (
      <div className="w-10 h-10 rounded-xl bg-[#173D70]/10 text-[#173D70] dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
        <IconComponent className="w-5 h-5" />
      </div>
    );
  };

  const renderTrend = () => {
    if (!trend) return null;
    const { value: trendValue, direction = 'neutral', label } = trend;

    const isUp = direction === 'up';
    const isDown = direction === 'down';

    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

    const textColor = isUp
      ? 'text-emerald-600 dark:text-emerald-400'
      : isDown
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-slate-500 dark:text-slate-400';

    const bgBadge = isUp
      ? 'bg-emerald-50 dark:bg-emerald-950/40'
      : isDown
      ? 'bg-rose-50 dark:bg-rose-950/40'
      : 'bg-slate-100 dark:bg-slate-800';

    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
        <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md', bgBadge, textColor)}>
          <Icon className="w-3 h-3 shrink-0" />
          <span>{trendValue}</span>
        </span>
        {label && (
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            {label}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card
      role="region"
      aria-label={`${title}: ${value}`}
      className={cn(
        'relative overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all hover:shadow-sm',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <div className="space-y-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
              {title}
            </h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
        </div>
        {renderIcon()}
      </CardHeader>

      <CardContent className="space-y-1.5">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>

        {renderTrend()}

        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
            {description}
          </p>
        )}

        {footer && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
