import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no items to display right now.',
  icon: IconProp = Inbox,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  className,
  children,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    const IconComponent = IconProp as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-8 h-8 text-[#173D70] dark:text-blue-400" />;
  };

  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xs transition-all',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#173D70]/10 dark:bg-blue-950/60 flex items-center justify-center mb-4 text-[#173D70] dark:text-blue-400 shadow-xs">
        {renderIcon()}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button
            size="sm"
            variant={actionVariant}
            onClick={onAction}
            className="shadow-sm font-semibold"
          >
            {actionLabel}
          </Button>
        </div>
      )}

      {children && <div className="mt-5 w-full">{children}</div>}
    </div>
  );
}

export default EmptyState;
