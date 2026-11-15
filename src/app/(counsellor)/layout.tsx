import React from 'react';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/server-auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { DashboardNavConfig } from '@/types/dashboard';
import {
  Headphones,
  LayoutDashboard,
  Inbox,
  Calendar,
  FileCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Counsellor Lead Desk',
  robots: { index: false, follow: false },
};

const counsellorNavConfig: DashboardNavConfig = {
  title: 'Counsellor Desk',
  brandHref: '/counsellor/dashboard',
  brandIcon: Headphones,
  roleBadge: 'Counsellor',
  roleBadgeVariant: 'accent',
  items: [
    { label: 'Desk Overview', href: '/counsellor/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Demo Leads Pipeline', href: '/counsellor/leads', icon: Inbox },
    { label: 'Demo Schedules', href: '/counsellor/demos', icon: Calendar },
    { label: 'Eligibility Consultations', href: '/counsellor/eligibility', icon: FileCheck },
  ],
};

export default async function CounsellorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side role check strictly enforcing counsellor, admin, or super_admin
  const user = await requireRole(['counsellor', 'admin', 'super_admin']);

  return (
    <DashboardShell user={user} navConfig={counsellorNavConfig}>
      {children}
    </DashboardShell>
  );
}
