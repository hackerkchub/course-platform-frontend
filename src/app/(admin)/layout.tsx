import React from 'react';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/server-auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { DashboardNavConfig } from '@/types/dashboard';
import {
  ShieldAlert,
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  UserCheck,
  Inbox,
  FileCheck2,
  MessageSquare,
  Image,
  Activity,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Command Center',
  robots: { index: false, follow: false },
};

const adminNavConfig: DashboardNavConfig = {
  title: 'Admin Center',
  brandHref: '/admin/dashboard',
  brandIcon: ShieldAlert,
  roleBadge: 'Administrator',
  roleBadgeVariant: 'destructive',
  items: [
    { label: 'Executive Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Courses Management', href: '/admin/courses', icon: BookOpen },
    { label: 'Categories & Taxonomy', href: '/admin/categories', icon: FolderTree },
    { label: 'Instructors Registry', href: '/admin/instructors', icon: Users },
    { label: 'Enrollments Ledger', href: '/admin/enrollments', icon: UserCheck },
    { label: 'Demo Leads Desk', href: '/admin/leads', icon: Inbox },
    { label: 'Eligibility Rules', href: '/admin/eligibility', icon: FileCheck2 },
    { label: 'Review Moderation', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Media Library', href: '/admin/media', icon: Image },
    { label: 'System Health', href: '/admin/system', icon: Activity },
  ],
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side role check strictly enforcing admin or super_admin
  const user = await requireRole(['admin', 'super_admin']);

  return (
    <DashboardShell user={user} navConfig={adminNavConfig}>
      {children}
    </DashboardShell>
  );
}
