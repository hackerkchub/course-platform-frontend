import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import type { DashboardShellProps } from '@/types/dashboard';

export function DashboardShell({
  user,
  navConfig,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 antialiased">
      {/* Desktop Sidebar (>= 1024px) */}
      <DashboardSidebar user={user} navConfig={navConfig} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar: Desktop Header & Mobile Drawer Trigger */}
        <DashboardHeader user={user} navConfig={navConfig} />

        {/* Primary Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
