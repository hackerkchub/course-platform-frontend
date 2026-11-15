import React from 'react';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/server-auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { DashboardNavConfig } from '@/types/dashboard';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Heart,
  Calendar,
  Award,
  Star,
  User,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Student Portal',
  robots: { index: false, follow: false },
};

const studentNavConfig: DashboardNavConfig = {
  title: 'Student Portal',
  brandHref: '/student/dashboard',
  brandIcon: GraduationCap,
  roleBadge: 'Student',
  roleBadgeVariant: 'primary',
  items: [
    { label: 'Overview', href: '/student/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'My Courses', href: '/student/courses', icon: BookOpen },
    { label: 'Wishlist', href: '/student/wishlist', icon: Heart },
    { label: 'Demo Classes', href: '/student/demo-classes', icon: Calendar },
    { label: 'Eligibility', href: '/student/eligibility', icon: Award },
    { label: 'My Reviews', href: '/student/reviews', icon: Star },
    { label: 'Profile & Settings', href: '/student/profile', icon: User },
  ],
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side role check
  const user = await requireRole(['user', 'counsellor', 'admin', 'super_admin']);

  return (
    <DashboardShell user={user} navConfig={studentNavConfig}>
      {children}
    </DashboardShell>
  );
}
