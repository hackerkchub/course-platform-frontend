import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardNavLinks } from './DashboardNavLinks';
import { resolveDashboardIcon } from './icons';
import type { DashboardNavConfig } from '@/types/dashboard';
import type { UserProfile } from '@/types/auth';

export interface DashboardSidebarProps {
  user: UserProfile;
  navConfig: DashboardNavConfig;
  className?: string;
}

export function DashboardSidebar({
  user,
  navConfig,
}: DashboardSidebarProps) {
  const BrandIcon = resolveDashboardIcon(navConfig.brandIcon);

  return (
    <aside
      className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 select-none"
      aria-label="Desktop sidebar"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <Link
          href={navConfig.brandHref}
          className="flex items-center gap-2.5 focus-ring rounded-lg"
          aria-label={`${navConfig.title} Home`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#173D70] flex items-center justify-center text-white shadow-xs">
            <BrandIcon className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            {navConfig.title}
          </span>
        </Link>
      </div>

      {/* User Information Card */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name || 'User avatar'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#173D70]/10 text-[#173D70] dark:bg-blue-900/60 dark:text-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user.name || user.email}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={navConfig.roleBadgeVariant || 'default'}
                className="text-[10px] px-1.5 py-0 uppercase font-bold tracking-wider"
              >
                {navConfig.roleBadge}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <DashboardNavLinks items={navConfig.items} />
      </div>

      {/* Footer Return Link */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#173D70] dark:hover:text-blue-400 transition-colors focus-ring rounded-md py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </Link>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
