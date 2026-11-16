'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Clock,
  Mail,
  Phone,
  BookOpen,
  Filter,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchInstructorDemos,
  updateInstructorDemoStatus,
  type InstructorDemoItem,
} from '@/lib/api/instructor-portal';

export default function InstructorDemosPage() {
  const [demos, setDemos] = useState<InstructorDemoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update modal
  const [selectedDemo, setSelectedDemo] = useState<InstructorDemoItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('scheduled');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadDemos() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchInstructorDemos({
        status: statusFilter,
      });
      setDemos(res.demos || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load demo requests');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDemos();
  }, [statusFilter]);

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDemo) return;
    try {
      setIsUpdating(true);
      await updateInstructorDemoStatus(selectedDemo.id, {
        status: newStatus,
        notes: adminNotes.trim() || undefined,
      });
      setSelectedDemo(null);
      setAdminNotes('');
      await loadDemos();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update demo status');
    } finally {
      setIsUpdating(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Demo Class Requests</h1>
          <p className="text-sm text-muted-foreground">
            Manage prospective student demo sessions for your courses.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : demos.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Demo Requests</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {statusFilter !== 'all' ? `No demos with status '${statusFilter}'.` : 'No demo class requests received yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {demos.map((demo) => (
              <div
                key={demo.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-base">{demo.student_name}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(demo.status)}`}>
                      {demo.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{demo.course_name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {demo.demo_date} {demo.demo_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {demo.student_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {demo.student_phone}
                    </span>
                  </div>

                  {demo.notes && (
                    <p className="mt-1 text-xs italic text-muted-foreground bg-muted/40 p-2 rounded">
                      Note: {demo.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDemo(demo);
                      setNewStatus(demo.status);
                      setAdminNotes(demo.notes || '');
                    }}
                    className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Update Status */}
      {selectedDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Update Demo Request</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Candidate: {selectedDemo.student_name} • {selectedDemo.course_name}
            </p>

            <form onSubmit={handleStatusUpdate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed / Attended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes / Comments</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Conducted demo via Zoom, student interested in weekend batch..."
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDemo(null)}
                  className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
