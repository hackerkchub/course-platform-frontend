import React from 'react';
import { cn } from '@/lib/utils';
import type { DashboardSectionProps } from '@/types/dashboard';

export function DashboardSection({
  title,
  description,
  subtitle,
  icon: IconProp,
  action,
  variant = 'plain',
  className,
  children,
}: DashboardSectionProps) {
  const isCard = variant === 'card';
  const displayDescription = description || subtitle;

  const renderIcon = () => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    const IconComponent = IconProp as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-5 h-5 text-[#173D70] dark:text-blue-400 shrink-0" />;
  };

  const hasHeader = Boolean(title || displayDescription || action || IconProp);

  return (
    <section
      aria-label={title || 'Dashboard Section'}
      className={cn(
        'w-full min-w-0 transition-all',
        isCard
          ? 'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4 sm:space-y-6'
          : 'space-y-4',
        className
      )}
    >
      {hasHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5">
              {renderIcon()}
              {title && (
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {title}
                </h2>
              )}
            </div>
            {displayDescription && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-normal">
                {displayDescription}
              </p>
            )}
          </div>

          {action && (
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              {action}
            </div>
          )}
        </div>
      )}

      {children && <div className="min-w-0">{children}</div>}
    </section>
  );
}

export default DashboardSection;
