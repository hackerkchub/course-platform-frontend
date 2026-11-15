import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
        Access Restricted
      </h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
        Your current account role does not have authorization to view this panel. Please contact an administrator if you believe this is an error.
      </p>
      <Link href="/">
        <Button variant="primary" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Button>
      </Link>
    </div>
  );
}
