import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
        404 — Page Not Found
      </h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
        The learning page or resource you are seeking does not exist or may have been relocated.
      </p>
      <Link href="/">
        <Button variant="primary" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Button>
      </Link>
    </div>
  );
}
