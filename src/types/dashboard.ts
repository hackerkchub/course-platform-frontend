import type { ComponentType } from 'react';
import type { UserProfile } from '@/types/auth';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string | number;
  exact?: boolean;
}

export interface DashboardNavConfig {
  title: string;
  brandHref: string;
  brandIcon: ComponentType<{ className?: string }>;
  roleBadge: string;
  roleBadgeVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'accent';
  items: DashboardNavItem[];
}

export interface DashboardShellProps {
  user: UserProfile;
  navConfig: DashboardNavConfig;
  children: React.ReactNode;
}

export interface StatTrend {
  value: string | number;
  direction?: 'up' | 'down' | 'neutral';
  label?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ComponentType<{ className?: string }> | React.ReactNode;
  description?: string;
  trend?: StatTrend;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export interface StatsGridProps {
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  stats?: StatCardProps[];
  isLoading?: boolean;
  loadingCount?: number;
  className?: string;
}

export interface DashboardHeadingProps {
  title: string;
  description?: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export interface DashboardSectionProps {
  title?: string;
  description?: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }> | React.ReactNode;
  action?: React.ReactNode;
  variant?: 'plain' | 'card';
  className?: string;
  children?: React.ReactNode;
}

export interface DataTableColumn<T> {
  id?: string;
  key?: string;
  header: React.ReactNode | ((column: DataTableColumn<T>) => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (props: { row: T; index: number; value?: unknown }) => React.ReactNode;
  render?: (row: T, index?: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  isLoading?: boolean;
  loadingRowCount?: number;
  isError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRowClick?: (row: T, index: number) => void;
  pagination?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  caption?: string;
}

export interface SearchFilterOption {
  label: string;
  value: string;
}

export interface SearchFilterToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: SearchFilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  filters?: React.ReactNode;
  resultCount?: number;
  totalCount?: number;
  onReset?: () => void;
  resetLabel?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}


