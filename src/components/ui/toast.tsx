'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; message?: string }) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    ({ type = 'info', title, message }: { type?: ToastType; title: string; message?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-lg border backdrop-blur-md animate-fade-in transition-all',
              t.type === 'success' && 'bg-emerald-50/95 border-emerald-200 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100',
              t.type === 'error' && 'bg-red-50/95 border-red-200 text-red-950 dark:bg-red-950/90 dark:border-red-800 dark:text-red-100',
              t.type === 'info' && 'bg-white/95 border-slate-200 text-slate-900 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-100'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm">
              <p className="font-semibold">{t.title}</p>
              {t.message && <p className="text-xs opacity-90 mt-0.5">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
