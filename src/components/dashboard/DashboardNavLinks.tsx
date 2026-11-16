'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { resolveDashboardIcon } from './icons';
import type { DashboardNavItem } from '@/types/dashboard';

export interface DashboardNavLinksProps {
  items: DashboardNavItem[];
  onItemClick?: () => void;
  className?: string;
}

export function DashboardNavLinks({
  items,
  onItemClick,
  className,
}: DashboardNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-1', className)} aria-label="Dashboard navigation">
      {items.map(item => {
        const Icon = resolveDashboardIcon(item.icon);
        const isRootDashboard =
          item.href === '/admin/dashboard' ||
          item.href === '/student/dashboard' ||
          item.href === '/counsellor/dashboard';

        const isActive = item.exact || isRootDashboard
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all focus-ring',
              isActive
                ? 'bg-[#173D70]/10 text-[#173D70] font-bold shadow-xs dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-[#173D70] dark:text-blue-400'
                    : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                )}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={cn(
                  'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                  isActive
                    ? 'bg-[#173D70] text-white dark:bg-blue-600'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default DashboardNavLinks;
