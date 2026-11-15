import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export function Breadcrumbs({
  items,
  showHome = false,
  homeHref = '/',
  className,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1', className)}
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
        {showHome && (
          <li className="flex items-center gap-1.5">
            <Link
              href={homeHref}
              aria-label="Home"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus-ring rounded-sm p-0.5"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[240px]"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 inline mr-1 shrink-0" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-slate-500 hover:text-[#173D70] dark:hover:text-blue-400 transition-colors truncate max-w-[120px] sm:max-w-[180px] focus-ring rounded-sm"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 inline mr-1 shrink-0" />}
                  {item.label}
                </Link>
              )}

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
