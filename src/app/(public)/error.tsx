'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, BookOpen, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';

interface PublicErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    // Client-side logging for diagnostics without leaking to UI
    console.error('[PublicError]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="max-w-xl w-full p-8 sm:p-10 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <Badge variant="default" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[11px]">
            Service Temporarily Unavailable
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            We are experiencing a temporary connection issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Our course platform is temporarily unable to reach the catalog service. Please try reloading this page or return to our course directory.
          </p>
        </div>

        {/* Retry and Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="md"
            variant="primary"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 font-bold px-6"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/courses" className="w-full sm:w-auto">
            <Button size="md" variant="outline" className="w-full sm:w-auto gap-2 font-semibold px-6">
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Admissions</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
