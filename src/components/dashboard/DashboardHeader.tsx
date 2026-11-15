'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogOut, ArrowLeft } from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import { DashboardNavLinks } from './DashboardNavLinks';
import type { DashboardNavConfig } from '@/types/dashboard';
import type { UserProfile } from '@/types/auth';

export interface DashboardHeaderProps {
  user: UserProfile;
  navConfig: DashboardNavConfig;
  className?: string;
}

export function DashboardHeader({
  user,
  navConfig,
}: DashboardHeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, isLoggingOut } = useAuth();
  const BrandIcon = navConfig.brandIcon;

  return (
    <>
      {/* Mobile Topbar (< 1024px) */}
      <header className="lg:hidden h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between select-none shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileOpen}
            className="p-2 -ml-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 focus-ring"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href={navConfig.brandHref}
            className="flex items-center gap-2 focus-ring rounded-md"
            aria-label={`${navConfig.title} Home`}
          >
            <div className="w-7 h-7 rounded-md bg-[#173D70] flex items-center justify-center text-white shrink-0">
              <BrandIcon className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              {navConfig.title}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name || 'User avatar'}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              unoptimized
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#173D70]/10 text-[#173D70] dark:bg-blue-900/60 dark:text-blue-200 flex items-center justify-center font-bold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </header>

      {/* Desktop Topbar (>= 1024px) */}
      <header className="hidden lg:flex h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-8 items-center justify-between select-none shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Current Portal
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {navConfig.title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name || 'User avatar'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                unoptimized
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#173D70]/10 text-[#173D70] dark:bg-blue-900/60 dark:text-blue-200 flex items-center justify-center font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                {user.name || user.email}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {user.role}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={logout}
            disabled={isLoggingOut}
            aria-label="Log out of session"
            className="text-slate-500 hover:text-red-600 dark:hover:text-red-400 gap-1.5 text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Mobile Drawer using existing Drawer primitive */}
      <Drawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        title={navConfig.title}
        position="left"
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Authenticated User Banner in Drawer */}
            <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name || 'User avatar'}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#173D70]/10 text-[#173D70] dark:bg-blue-900/60 dark:text-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.name || user.email}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </div>
                <div className="mt-1">
                  <Badge
                    variant={navConfig.roleBadgeVariant || 'default'}
                    className="text-[9px] px-1.5 py-0 uppercase font-bold"
                  >
                    {navConfig.roleBadge}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation Links inside Drawer */}
            <DashboardNavLinks
              items={navConfig.items}
              onItemClick={() => setIsMobileOpen(false)}
            />
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#173D70] hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus-ring"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </Link>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsMobileOpen(false);
                logout();
              }}
              disabled={isLoggingOut}
              className="w-full justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default DashboardHeader;
