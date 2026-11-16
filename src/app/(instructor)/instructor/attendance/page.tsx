'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import {
  fetchInstructorSessions,
  fetchSessionAttendance,
  saveSessionAttendance,
  type InstructorSessionItem,
  type SessionAttendanceSheet,
} from '@/lib/api/instructor-portal';

export default function InstructorAttendancePage() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get('session_id') ? Number(searchParams.get('session_id')) : null;

  const [sessions, setSessions] = useState<InstructorSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(initialSessionId);
  const [sheet, setSheet] = useState<SessionAttendanceSheet | null>(null);

  // Editable records map: student_id -> { status, notes }
  const [recordsMap, setRecordsMap] = useState<Record<number, { status: 'present' | 'absent' | 'late' | 'excused'; notes: string }>>({});

  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load available sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        setIsLoadingSessions(true);
        const data = await fetchInstructorSessions();
        setSessions(data);
        if (!selectedSessionId && data.length > 0) {
          setSelectedSessionId(data[0].id);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load sessions');
      } finally {
        setIsLoadingSessions(false);
      }
    }
    loadSessions();
  }, []);

  // Load attendance sheet when session changes
  useEffect(() => {
    if (!selectedSessionId) return;

    async function loadSheet() {
      try {
        setIsLoadingSheet(true);
        setError(null);
        setSaveSuccess(false);
        const data = await fetchSessionAttendance(selectedSessionId!);
        setSheet(data);

        // Prepopulate records
        const initialMap: Record<number, { status: any; notes: string }> = {};
        data.students.forEach((s) => {
          initialMap[s.student_id] = {
            status: s.attendance_status || 'present',
            notes: s.notes || '',
          };
        });
        setRecordsMap(initialMap);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load session attendance');
      } finally {
        setIsLoadingSheet(false);
      }
    }

    loadSheet();
  }, [selectedSessionId]);

  function handleStatusChange(studentId: number, status: 'present' | 'absent' | 'late' | 'excused') {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status,
      },
    }));
  }

  function handleNotesChange(studentId: number, notes: string) {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        notes,
      },
    }));
  }

  function markAll(status: 'present' | 'absent') {
    if (!sheet) return;
    const updated = { ...recordsMap };
    sheet.students.forEach(s => {
      updated[s.student_id] = {
        ...(updated[s.student_id] || { notes: '' }),
        status,
      };
    });
    setRecordsMap(updated);
  }

  async function handleSaveAttendance() {
    if (!selectedSessionId || !sheet) return;
    try {
      setIsSaving(true);
      setError(null);
      const records = sheet.students.map(s => ({
        student_id: s.student_id,
        status: recordsMap[s.student_id]?.status || 'present',
        notes: recordsMap[s.student_id]?.notes || undefined,
      }));

      await saveSessionAttendance(selectedSessionId, records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Session Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Mark and verify student attendance records for conducted batch sessions.
          </p>
        </div>

        {sheet && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAll('present')}
              className="rounded-md border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Mark All Present
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Attendance
            </button>
          </div>
        )}
      </div>

      {/* Session Selector */}
      <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="text-sm font-semibold text-foreground whitespace-nowrap">
          Select Session:
        </label>
        {isLoadingSessions ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : sessions.length === 0 ? (
          <span className="text-sm text-muted-foreground">No sessions available. Please schedule a session first.</span>
        ) : (
          <select
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.batch_name} — {s.title || `Session #${s.session_number}`} ({s.session_date})
              </option>
            ))}
          </select>
        )}
      </div>

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Attendance records saved successfully!
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Attendance Sheet Table */}
      {isLoadingSheet ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sheet && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="border-b bg-muted/30 px-6 py-3.5 flex justify-between items-center text-xs text-muted-foreground">
            <span>
              <strong>Course:</strong> {sheet.session.course_name} • <strong>Batch:</strong> {sheet.session.batch_name}
            </span>
            <span>
              <strong>Total Enrolled:</strong> {sheet.students.length}
            </span>
          </div>

          {sheet.students.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No students enrolled in this course batch.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Attendance Status</th>
                    <th className="px-6 py-3.5">Notes / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sheet.students.map((student) => {
                    const currentStatus = recordsMap[student.student_id]?.status || 'present';
                    const currentNotes = recordsMap[student.student_id]?.notes || '';
                    return (
                      <tr key={student.student_id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{student.student_name}</div>
                          <div className="text-xs text-muted-foreground">{student.student_email}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(student.student_id, status)}
                                className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition ${
                                  currentStatus === status
                                    ? status === 'present'
                                      ? 'bg-emerald-600 text-white'
                                      : status === 'absent'
                                      ? 'bg-rose-600 text-white'
                                      : status === 'late'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-blue-600 text-white'
                                    : 'border bg-background text-muted-foreground hover:bg-muted'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={currentNotes}
                            onChange={(e) => handleNotesChange(student.student_id, e.target.value)}
                            className="w-full max-w-xs rounded border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
