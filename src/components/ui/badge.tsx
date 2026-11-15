import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'accent';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors';

  const variants = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    accent: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export default Badge;
