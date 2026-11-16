'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchInstructorBatches,
  type InstructorBatchItem,
} from '@/lib/api/instructor-portal';

export default function InstructorBatchesPage() {
  const [batches, setBatches] = useState<InstructorBatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchInstructorBatches();
        setBatches(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load batches');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <AlertCircle className="mx-auto h-8 w-8" />
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Assigned Batches</h1>
        <p className="text-sm text-muted-foreground">
          Batches where you are assigned as primary instructor or batch mentor.
        </p>
      </div>

      {batches.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No Batches Assigned</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You do not currently have any active or upcoming batches assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {batch.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Batch ID: #{batch.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground">{batch.batch_name}</h3>
                  <p className="text-xs font-medium text-muted-foreground">{batch.course_name}</p>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Starts: {batch.start_date || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{batch.class_days || 'Mon, Wed, Fri'} • {batch.class_timing || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>{batch.enrolled_count} Students Enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>{batch.conducted_sessions} / {batch.total_sessions} Sessions Conducted</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <Link
                  href={`/instructor/schedule?batch_id=${batch.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Clock className="h-3.5 w-3.5" /> Sessions
                </Link>
                <Link
                  href={`/instructor/students?batch_id=${batch.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  View Students <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
