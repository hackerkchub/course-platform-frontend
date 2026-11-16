import React from 'react';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/server-auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { DashboardNavConfig } from '@/types/dashboard';

export const metadata: Metadata = {
  title: 'Instructor Portal | SoftMaxs',
  robots: { index: false, follow: false },
};

const instructorNavConfig: DashboardNavConfig = {
  title: 'Instructor Portal',
  brandHref: '/instructor/dashboard',
  brandIcon: 'GraduationCap',
  roleBadge: 'Instructor',
  roleBadgeVariant: 'primary',
  items: [
    { label: 'Overview', href: '/instructor/dashboard', icon: 'LayoutDashboard', exact: true },
    { label: 'My Courses', href: '/instructor/courses', icon: 'BookOpen' },
    { label: 'My Batches', href: '/instructor/batches', icon: 'Layers' },
    { label: 'Enrolled Students', href: '/instructor/students', icon: 'Users' },
    { label: 'Demo Bookings', href: '/instructor/demos', icon: 'CalendarCheck' },
    { label: 'Class Schedule', href: '/instructor/schedule', icon: 'Clock' },
    { label: 'Attendance', href: '/instructor/attendance', icon: 'ClipboardCheck' },
    { label: 'Study Materials', href: '/instructor/materials', icon: 'FileText' },
    { label: 'Profile & Bio', href: '/instructor/profile', icon: 'Settings' },
  ],
};

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side role check strictly enforcing instructor, admin, or super_admin
  const user = await requireRole(['instructor', 'admin', 'super_admin']);

  return (
    <DashboardShell user={user} navConfig={instructorNavConfig}>
      {children}
    </DashboardShell>
  );
}
