import React from 'react';
import { cn } from '@/lib/utils';
import type { DashboardHeadingProps } from '@/types/dashboard';

export function DashboardHeading({
  title,
  description,
  subtitle,
  eyebrow,
  badge,
  breadcrumb,
  action,
  className,
  children,
}: DashboardHeadingProps) {
  const displayDescription = description || subtitle;

  return (
    <header className={cn('space-y-2 select-none', className)}>
      {/* Optional Breadcrumb Slot */}
      {breadcrumb && <div className="mb-1">{breadcrumb}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          {/* Optional Eyebrow / Category Label */}
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-wider text-[#173D70] dark:text-blue-400">
              {eyebrow}
            </p>
          )}

          {/* Primary Page Title (H1) with optional badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {/* Optional Subtitle / Description */}
          {displayDescription && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {displayDescription}
            </p>
          )}
        </div>

        {/* Optional Action Controls Slot (e.g. Primary button, filter toggle, export) */}
        {action && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            {action}
          </div>
        )}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </header>
  );
}

export default DashboardHeading;
