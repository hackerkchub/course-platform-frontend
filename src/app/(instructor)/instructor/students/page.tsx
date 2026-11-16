'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  BookOpen,
  CheckCircle2,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchInstructorStudents,
  type InstructorStudentItem,
} from '@/lib/api/instructor-portal';

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<InstructorStudentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  async function loadStudents() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchInstructorStudents({
        search: search.trim() || undefined,
        page,
        limit,
      });
      setStudents(res.students || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, [page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadStudents();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Enrolled Students</h1>
          <p className="text-sm text-muted-foreground">
            Students enrolled across courses and batches you instruct.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Students Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? 'Try adjusting your search criteria.' : 'No active student enrollments for your assigned courses.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5">Attendance</th>
                  <th className="px-6 py-3.5">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr key={student.enrollment_id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{student.student_name}</div>
                      <div className="text-xs text-muted-foreground">{student.student_email}</div>
                      {student.student_phone && (
                        <div className="text-xs text-muted-foreground">{student.student_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{student.course_name}</div>
                      <div className="text-xs text-muted-foreground">{student.course_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>{student.completed_lessons_count} Lessons completed</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{student.attended_sessions_count} Sessions attended</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(student.enrolled_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
            <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded border px-2.5 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="rounded border px-2.5 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
