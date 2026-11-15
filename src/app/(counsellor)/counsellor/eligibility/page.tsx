'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DashboardHeading,
  DashboardSection,
  DataTable,
  DataTableColumn,
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { Dialog } from '@/components/ui/dialog';
import { adminEligibilityApi } from '@/lib/api/admin-eligibility';
import { adminCoursesApi } from '@/lib/api/admin-courses';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type { EligibilityCheckItem } from '@/types/admin-eligibility';
import type { AdminCourseItem } from '@/types/admin-course';
import {
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function CounsellorEligibilityPage() {
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');

  const [checks, setChecks] = useState<EligibilityCheckItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [resultFilter, setResultFilter] = useState<'eligible' | 'not_eligible' | ''>('');

  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);
  const [isLoadingChecks, setIsLoadingChecks] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Answers Inspector Modal
  const [inspectTarget, setInspectTarget] = useState<EligibilityCheckItem | null>(null);

  // Load courses
  useEffect(() => {
    async function loadCourses() {
      setIsLoadingCourses(true);
      try {
        const res = await adminCoursesApi.getCourses({ limit: 100 });
        setCourses(res.courses);
        if (res.courses.length > 0) {
          setSelectedCourseId(res.courses[0].id);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load courses'));
      } finally {
        setIsLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  // Load Checks for Course
  const fetchChecks = useCallback(
    async (courseId: number, targetPage = 1) => {
      setIsLoadingChecks(true);
      setError('');
      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          limit,
        };
        if (resultFilter) {
          params.result = resultFilter;
        }

        const res = await adminEligibilityApi.getCourseChecks(courseId, params);
        setChecks(res.checks);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setPage(res.pagination.page);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to fetch eligibility submissions'));
      } finally {
        setIsLoadingChecks(false);
      }
    },
    [limit, resultFilter]
  );

  useEffect(() => {
    if (selectedCourseId) {
      fetchChecks(Number(selectedCourseId), page);
    } else {
      setChecks([]);
      setTotalCount(0);
    }
  }, [selectedCourseId, page, fetchChecks]);

  const columns: DataTableColumn<EligibilityCheckItem>[] = useMemo(
    () => [
      {
        key: 'id',
        header: '#',
        render: (item) => <span className="font-mono text-xs text-slate-400">#{item.id}</span>,
        className: 'w-10 text-center',
      },
      {
        key: 'student',
        header: 'Candidate Info',
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
              {item.student_name || `User #${item.user_id}`}
            </span>
            <span className="text-xs text-slate-500">
              {item.student_email || `ID: ${item.user_id}`}
            </span>
          </div>
        ),
      },
      {
        key: 'result',
        header: 'Eligibility Outcome',
        render: (item) => (
          <div className="flex items-center gap-1.5">
            {item.is_eligible ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                ELIGIBLE
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                NOT ELIGIBLE
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: 'reasons',
        header: 'Evaluation Summary',
        render: (item) => (
          <div className="max-w-xs text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {item.reasons && item.reasons.length > 0 ? (
              item.reasons.join('; ')
            ) : (
              <span className="text-slate-400 italic">Criteria fully satisfied</span>
            )}
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Checked At',
        render: (item) => (
          <span className="text-xs text-slate-500">
            {formatDateKolkata(item.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Answers',
        align: 'right',
        render: (item) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInspectTarget(item)}
            className="text-xs flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Inspect Answers
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Counsellor Desk', href: '/counsellor/dashboard' },
          { label: 'Eligibility Consultations' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Student Eligibility Consultations"
          subtitle="Audit candidate responses, educational backgrounds, and automated qualification evaluations."
        />
        <Button
          variant="outline"
          onClick={() => selectedCourseId && fetchChecks(Number(selectedCourseId), page)}
          disabled={isLoadingChecks}
          className="self-start sm:self-auto flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChecks ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Course Selector & Result Filter */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Course Program:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(Number(e.target.value));
              setPage(1);
            }}
            disabled={isLoadingCourses}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 font-medium max-w-sm truncate"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_name} ({c.course_code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Outcome Filter:</span>
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value as '' | 'eligible' | 'not_eligible');
              setPage(1);
            }}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5"
          >
            <option value="">All Results</option>
            <option value="eligible">Eligible Candidates Only</option>
            <option value="not_eligible">Not Eligible Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <DashboardSection
        title={`Candidate Submissions (${totalCount})`}
        subtitle="Log of automated eligibility self-assessments completed by prospects."
      >
        <DataTable
          columns={columns}
          data={checks}
          isLoading={isLoadingChecks}
          emptyMessage="No eligibility checks found for the selected course."
        />

        {!isLoadingChecks && totalPages > 1 && (
          <div className="mt-6 flex justify-end">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </DashboardSection>

      {/* Answers Inspector Dialog */}
      <Dialog
        isOpen={Boolean(inspectTarget)}
        onClose={() => setInspectTarget(null)}
        title="Candidate Eligibility Responses"
        description={`Applicant: ${inspectTarget?.student_name || `User #${inspectTarget?.user_id}`} • Submitted ${inspectTarget ? formatDateKolkata(inspectTarget.created_at) : ''}`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 font-medium">Evaluation Result:</span>
            {inspectTarget?.is_eligible ? (
              <Badge variant="success">QUALIFIED / ELIGIBLE</Badge>
            ) : (
              <Badge variant="destructive">NOT QUALIFIED</Badge>
            )}
          </div>

          {inspectTarget?.reasons && inspectTarget.reasons.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-xs text-rose-800 space-y-1">
              <span className="font-semibold block mb-0.5">Evaluation Remarks:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {inspectTarget.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Submitted Answer Payload
            </h5>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 space-y-2 max-h-60 overflow-y-auto">
              {inspectTarget?.answers && Object.keys(inspectTarget.answers).length > 0 ? (
                Object.entries(inspectTarget.answers).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No answers recorded.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInspectTarget(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
