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
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Pagination } from '@/components/ui/pagination';
import { Dialog } from '@/components/ui/dialog';
import { adminEligibilityApi } from '@/lib/api/admin-eligibility';
import { adminCoursesApi } from '@/lib/api/admin-courses';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type {
  EligibilityCheckItem,
  QualificationLevel,
  ExperienceRequirement,
  EligibilityRulesData,
} from '@/types/admin-eligibility';
import type { AdminCourseItem } from '@/types/admin-course';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Save,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Sliders,
} from 'lucide-react';

export default function AdminEligibilityPage() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'rules'>('submissions');
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');

  // Submissions state
  const [checks, setChecks] = useState<EligibilityCheckItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [resultFilter, setResultFilter] = useState<'eligible' | 'not_eligible' | ''>('');
  const [isLoadingChecks, setIsLoadingChecks] = useState<boolean>(false);

  // Rules form state
  const [eligibilityEnabled, setEligibilityEnabled] = useState<boolean>(false);
  const [minQualification, setMinQualification] = useState<QualificationLevel>('any');
  const [minPercentage, setMinPercentage] = useState<number>(50);
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(35);
  const [expRequired, setExpRequired] = useState<ExperienceRequirement>('fresher_allowed');
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [isLoadingRules, setIsLoadingRules] = useState<boolean>(false);
  const [isSavingRules, setIsSavingRules] = useState<boolean>(false);

  // Global Alerts
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Answers Inspector Modal
  const [inspectTarget, setInspectTarget] = useState<EligibilityCheckItem | null>(null);

  // Load courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await adminCoursesApi.getCourses({ limit: 100 });
        setCourses(res.courses);
        if (res.courses.length > 0) {
          setSelectedCourseId(res.courses[0].id);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load courses'));
      }
    }
    loadCourses();
  }, []);

  // Fetch Submissions
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

  // Fetch Rules
  const fetchRules = useCallback(async (courseId: number) => {
    setIsLoadingRules(true);
    setError('');
    try {
      const data = await adminEligibilityApi.getCourseRules(courseId);
      setEligibilityEnabled(Boolean(data.eligibility_enabled));
      setMinQualification(data.minimum_qualification || 'any');
      setMinPercentage(data.minimum_percentage || 50);
      setMinAge(data.minimum_age || 18);
      setMaxAge(data.maximum_age || 35);
      setExpRequired(data.experience_required || 'fresher_allowed');
      setDisclaimer(data.disclaimer || '');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch eligibility rules'));
    } finally {
      setIsLoadingRules(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      if (activeTab === 'submissions') {
        fetchChecks(Number(selectedCourseId), page);
      } else {
        fetchRules(Number(selectedCourseId));
      }
    }
  }, [selectedCourseId, activeTab, page, fetchChecks, fetchRules]);

  // Save Rules
  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    if (maxAge < minAge) {
      setError('Maximum age must be greater than or equal to minimum age.');
      return;
    }

    setIsSavingRules(true);
    setError('');
    setSuccess('');
    try {
      const payload: EligibilityRulesData = {
        eligibility_enabled: eligibilityEnabled,
        minimum_qualification: minQualification,
        minimum_percentage: Number(minPercentage),
        minimum_age: Number(minAge),
        maximum_age: Number(maxAge),
        experience_required: expRequired,
        disclaimer: disclaimer.trim() || null,
      };

      await adminEligibilityApi.updateCourseRules(Number(selectedCourseId), payload);
      setSuccess('Course eligibility rules updated successfully.');
      fetchRules(Number(selectedCourseId));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save eligibility rules'));
    } finally {
      setIsSavingRules(false);
    }
  };

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
        header: 'Applicant Details',
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
        header: 'Evaluation Result',
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
        header: 'Rule Notes',
        render: (item) => (
          <div className="max-w-xs text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {item.reasons && item.reasons.length > 0 ? (
              item.reasons.join('; ')
            ) : (
              <span className="text-slate-400 italic">Criteria fully met</span>
            )}
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date Evaluated',
        render: (item) => (
          <span className="text-xs text-slate-500">
            {formatDateKolkata(item.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (item) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInspectTarget(item)}
            className="text-xs flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Inspect
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
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Eligibility Rules' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Course Eligibility & Verification Rules"
          subtitle="Configure qualification prerequisites and review candidate pre-screening assessments."
        />
        <Button
          variant="outline"
          onClick={() => {
            if (selectedCourseId) {
              if (activeTab === 'submissions') fetchChecks(Number(selectedCourseId), page);
              else fetchRules(Number(selectedCourseId));
            }
          }}
          className="self-start sm:self-auto flex items-center gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Global Course Selector */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          Selected Course Program:
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => {
            setSelectedCourseId(Number(e.target.value));
            setPage(1);
          }}
          className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 font-medium max-w-md truncate"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.course_name} ({c.course_code})
            </option>
          ))}
        </select>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Candidate Submissions ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Configure Eligibility Rules
        </button>
      </div>

      {/* TAB 1: Submissions */}
      {activeTab === 'submissions' && (
        <DashboardSection
          title="Student Eligibility Attempts"
          subtitle="Record of pre-qualification questionnaires submitted by students."
        >
          <div className="flex justify-end mb-4">
            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value as '' | 'eligible' | 'not_eligible');
                setPage(1);
              }}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5"
            >
              <option value="">All Outcomes</option>
              <option value="eligible">Eligible Only</option>
              <option value="not_eligible">Not Eligible Only</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={checks}
            isLoading={isLoadingChecks}
            emptyMessage="No student eligibility submissions for this course."
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
      )}

      {/* TAB 2: Rules Configuration Form */}
      {activeTab === 'rules' && (
        <DashboardSection
          title="Criteria Configuration Engine"
          subtitle="Define algorithmic eligibility gates evaluated during student registration."
        >
          {isLoadingRules ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading rules engine...</p>
          ) : (
            <form onSubmit={handleSaveRules} className="space-y-5 max-w-3xl">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 block">
                    Enable Eligibility Check Gate
                  </span>
                  <span className="text-xs text-slate-500">
                    When enabled, prospective students must verify qualifications before direct enrollment.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eligibilityEnabled}
                    onChange={(e) => setEligibilityEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
                </label>
              </div>

              {/* Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Qualification
                  </label>
                  <select
                    value={minQualification}
                    onChange={(e) => setMinQualification(e.target.value as QualificationLevel)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                  >
                    <option value="any">Any (No minimum requirement)</option>
                    <option value="10th">10th Standard / Matriculation</option>
                    <option value="12th">12th Standard / Higher Secondary</option>
                    <option value="diploma">Polytechnic / Diploma</option>
                    <option value="graduate">Bachelor&apos;s Degree / Graduate</option>
                    <option value="post_graduate">Master&apos;s Degree / Post-Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Academic Percentage (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={minPercentage}
                    onChange={(e) => setMinPercentage(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Age & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Age (Years)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maximum Age (Years)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Experience Policy
                  </label>
                  <select
                    value={expRequired}
                    onChange={(e) => setExpRequired(e.target.value as ExperienceRequirement)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                  >
                    <option value="fresher_allowed">Freshers Allowed</option>
                    <option value="experience_required">Prior Work Experience Required</option>
                  </select>
                </div>
              </div>

              {/* Disclaimer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Public Eligibility Disclaimer
                </label>
                <textarea
                  rows={3}
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  placeholder="Terms, interview requirements, or prerequisite knowledge advisory shown to students..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="submit"
                  disabled={isSavingRules}
                  className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingRules ? 'Saving Rules...' : 'Update Eligibility Rules'}
                </Button>
              </div>
            </form>
          )}
        </DashboardSection>
      )}

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
