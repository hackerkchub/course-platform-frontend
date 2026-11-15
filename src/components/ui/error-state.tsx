import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this section. Please try again.',
  icon: IconProp = AlertCircle,
  onRetry,
  retryLabel = 'Try Again',
  isRetrying = false,
  className,
  children,
}: ErrorStateProps) {
  const renderIcon = () => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    const IconComponent = IconProp as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-8 h-8 text-red-600 dark:text-red-400" />;
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-red-200/80 dark:border-red-950/80 bg-red-50/40 dark:bg-red-950/20 backdrop-blur-xs transition-all',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/70 flex items-center justify-center mb-4 text-red-600 dark:text-red-400 shadow-xs">
        {renderIcon()}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {onRetry && (
        <div className="mt-5">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            isLoading={isRetrying}
            className="border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50 gap-2 shadow-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{retryLabel}</span>
          </Button>
        </div>
      )}

      {children && <div className="mt-5 w-full">{children}</div>}
    </div>
  );
}

export default ErrorState;
