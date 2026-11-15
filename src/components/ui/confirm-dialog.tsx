'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'danger' | 'default';
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  confirmVariant,
  isLoading = false,
  icon: CustomIcon,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger' || confirmVariant === 'destructive' || confirmVariant === 'danger';
  const isWarning = variant === 'warning' || confirmVariant === 'warning';

  const handleDismiss = () => {
    if (isLoading) return;
    onClose?.();
    onCancel?.();
  };

  const DefaultIcon = isDanger
    ? AlertTriangle
    : isWarning
    ? AlertCircle
    : HelpCircle;

  const IconComponent = CustomIcon || DefaultIcon;

  const iconContainerClass = isDanger
    ? 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400'
    : isWarning
    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
    : 'bg-[#173D70]/10 text-[#173D70] dark:bg-blue-950/80 dark:text-blue-400';

  const confirmButtonVariant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' =
    confirmVariant === 'destructive' || confirmVariant === 'danger' || isDanger
      ? 'destructive'
      : confirmVariant === 'secondary'
      ? 'secondary'
      : confirmVariant === 'outline'
      ? 'outline'
      : confirmVariant === 'ghost'
      ? 'ghost'
      : confirmVariant === 'success'
      ? 'success'
      : 'primary';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleDismiss}
      className="max-w-md p-6"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
            iconContainerClass
          )}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <DialogFooter className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDismiss}
          disabled={isLoading}
          className="text-xs font-semibold"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={confirmButtonVariant}
          onClick={onConfirm}
          isLoading={isLoading}
          disabled={isLoading}
          className="text-xs font-semibold"
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default ConfirmDialog;
