import {
  GraduationCap,
  Headphones,
  ShieldAlert,
  LayoutDashboard,
  BookOpen,
  Heart,
  Calendar,
  Award,
  Star,
  User,
  Inbox,
  FileCheck,
  FolderTree,
  Users,
  UserCheck,
  FileCheck2,
  MessageSquare,
  Image as ImageIcon,
  Activity,
  ClipboardCheck,
  Clock,
  FileText,
  Layers,
  Settings,
  Mail,
  Bell,
  CalendarCheck,
  MessageCircle,
  UserPlus,
  LucideIcon,
} from 'lucide-react';
import type { DashboardIconName } from '@/types/dashboard';

/**
 * Centralized static mapping of all serializable dashboard icon identifiers to Lucide components.
 */
export const DASHBOARD_ICONS: Record<DashboardIconName, LucideIcon> = {
  GraduationCap,
  Headphones,
  ShieldAlert,
  LayoutDashboard,
  BookOpen,
  Heart,
  Calendar,
  Award,
  Star,
  User,
  Inbox,
  FileCheck,
  FolderTree,
  Users,
  UserCheck,
  FileCheck2,
  MessageSquare,
  Image: ImageIcon,
  Activity,
  ClipboardCheck,
  Clock,
  FileText,
  Layers,
  Settings,
  Mail,
  Bell,
  CalendarCheck,
  MessageCircle,
  UserPlus,
};

/**
 * Resolves a serializable dashboard icon identifier into its Lucide component.
 * Provides LayoutDashboard as a safe fallback for unmapped or undefined identifiers.
 */
export function resolveDashboardIcon(
  iconName: DashboardIconName | string | undefined,
  fallback: LucideIcon = LayoutDashboard
): LucideIcon {
  if (!iconName) {
    return fallback;
  }
  return DASHBOARD_ICONS[iconName as DashboardIconName] || fallback;
}

export default resolveDashboardIcon;
