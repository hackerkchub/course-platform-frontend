'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchInstructorSessions,
  fetchInstructorBatches,
  createInstructorSession,
  updateInstructorSession,
  type InstructorSessionItem,
  type InstructorBatchItem,
} from '@/lib/api/instructor-portal';

export default function InstructorSchedulePage() {
  const [sessions, setSessions] = useState<InstructorSessionItem[]>([]);
  const [batches, setBatches] = useState<InstructorBatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New session modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [sessionNumber, setSessionNumber] = useState(1);
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [sessionsData, batchesData] = await Promise.all([
        fetchInstructorSessions(),
        fetchInstructorBatches(),
      ]);
      setSessions(sessionsData);
      setBatches(batchesData);
      if (batchesData.length > 0 && !selectedBatchId) {
        setSelectedBatchId(batchesData[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatchId || !sessionDate) return;
    try {
      setIsSubmitting(true);
      await createInstructorSession({
        batch_id: Number(selectedBatchId),
        session_number: Number(sessionNumber),
        session_date: sessionDate,
        start_time: startTime ? `${startTime}:00` : null,
        end_time: endTime ? `${endTime}:00` : null,
        title: title.trim() || undefined,
      });
      setIsAddOpen(false);
      setTitle('');
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(session: InstructorSessionItem) {
    const nextStatus = session.status === 'scheduled' ? 'conducted' : 'scheduled';
    try {
      await updateInstructorSession(session.id, { status: nextStatus });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update session status');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Class Schedule & Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Schedule live class sessions and track attendance for your batches.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Schedule Session
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Sessions Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Sessions Scheduled</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &apos;Schedule Session&apos; above to plan your upcoming lectures.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Session</th>
                  <th className="px-6 py-3.5">Batch / Course</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {session.title || `Session #${session.session_number}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Session #{session.session_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{session.batch_name}</div>
                      <div className="text-xs text-muted-foreground">{session.course_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{session.session_date}</span>
                      </div>
                      {session.start_time && (
                        <div className="text-xs text-muted-foreground">
                          {session.start_time} - {session.end_time || 'TBD'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(session)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          session.status === 'conducted'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : session.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        }`}
                      >
                        {session.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/instructor/attendance?session_id=${session.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Attendance ({session.attendance_marked_count})
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Schedule Session */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Schedule Batch Session</h3>
            <form onSubmit={handleCreateSession} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Batch</label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_name} ({b.course_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Session Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Session Date</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Topic / Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Neural Architecture & Backprop"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
