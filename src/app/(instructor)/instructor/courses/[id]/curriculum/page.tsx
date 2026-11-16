'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchInstructorCourseDetails,
  createInstructorModule,
  updateInstructorModule,
  deleteInstructorModule,
  createInstructorLesson,
  deleteInstructorLesson,
} from '@/lib/api/instructor-portal';

export default function InstructorCurriculumPage() {
  const params = useParams();
  const courseId = Number(params?.id);

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded modules state
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  // Module modal state
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  // Lesson modal state
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('video');
  const [contentUrl, setContentUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  async function loadCourse() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInstructorCourseDetails(courseId);
      setCourse(data);

      // Auto expand all modules
      if (Array.isArray(data.modules)) {
        const expanded: Record<number, boolean> = {};
        data.modules.forEach((m: any) => {
          expanded[m.id] = true;
        });
        setExpandedModules(expanded);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  function toggleModule(id: number) {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleCreateModule(e: React.FormEvent) {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    try {
      setIsSubmittingModule(true);
      await createInstructorModule(courseId, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim() || undefined,
        display_order: (course?.modules?.length || 0) + 1,
      });
      setModuleTitle('');
      setModuleDesc('');
      setIsAddModuleOpen(false);
      await loadCourse();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create module');
    } finally {
      setIsSubmittingModule(false);
    }
  }

  async function handleDeleteModule(moduleId: number) {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await deleteInstructorModule(moduleId);
      await loadCourse();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete module');
    }
  }

  async function handleCreateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!activeModuleId || !lessonTitle.trim()) return;
    try {
      setIsSubmittingLesson(true);
      await createInstructorLesson(activeModuleId, {
        title: lessonTitle.trim(),
        lesson_type: lessonType,
        content_url: contentUrl.trim() || undefined,
        duration_minutes: Number(durationMinutes) || 0,
        is_preview: isFreePreview,
      });
      setLessonTitle('');
      setContentUrl('');
      setIsAddLessonOpen(false);
      await loadCourse();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create lesson');
    } finally {
      setIsSubmittingLesson(false);
    }
  }

  async function handleDeleteLesson(lessonId: number) {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteInstructorLesson(lessonId);
      await loadCourse();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete lesson');
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <AlertCircle className="mx-auto h-8 w-8" />
        <p className="mt-2 text-sm">{error || 'Course not found'}</p>
        <Link href="/instructor/courses" className="mt-4 inline-block text-sm underline">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/instructor/courses"
            className="rounded-lg border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Curriculum Manager
            </div>
            <h1 className="text-2xl font-bold text-foreground">{course.course_name}</h1>
          </div>
        </div>

        {course.can_manage_curriculum && (
          <button
            onClick={() => setIsAddModuleOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Module
          </button>
        )}
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {(!course.modules || course.modules.length === 0) ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Modules Added</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start building your course structure by adding the first module.
            </p>
            {course.can_manage_curriculum && (
              <button
                onClick={() => setIsAddModuleOpen(true)}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Create First Module
              </button>
            )}
          </div>
        ) : (
          course.modules.map((mod: any, modIdx: number) => {
            const isExpanded = expandedModules[mod.id] ?? true;
            return (
              <div key={mod.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
                {/* Module Bar */}
                <div className="flex items-center justify-between bg-muted/30 px-5 py-4">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="flex flex-1 items-center gap-3 text-left font-semibold text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>
                      Module {modIdx + 1}: {mod.title}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      ({mod.lessons?.length || 0} lessons)
                    </span>
                  </button>

                  {course.can_manage_curriculum && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveModuleId(mod.id);
                          setIsAddLessonOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <Plus className="h-3.5 w-3.5" /> Lesson
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Lessons in Module */}
                {isExpanded && (
                  <div className="divide-y border-t bg-card">
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No lessons in this module yet.
                      </div>
                    ) : (
                      mod.lessons.map((lesson: any, lesIdx: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between px-6 py-3 transition hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground">
                              {modIdx + 1}.{lesIdx + 1}
                            </span>
                            {lesson.lesson_type === 'video' ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : lesson.lesson_type === 'quiz' ? (
                              <HelpCircle className="h-4 w-4 text-amber-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-emerald-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{lesson.lesson_type}</span>
                                {lesson.duration_seconds > 0 && (
                                  <span>• {Math.round(lesson.duration_seconds / 60)} mins</span>
                                )}
                                {lesson.is_preview && (
                                  <span className="rounded bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-600">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {course.can_manage_curriculum && (
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="rounded p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Module */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Add Curriculum Module</h3>
            <form onSubmit={handleCreateModule} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Fundamental Concepts"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
                <textarea
                  rows={3}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Overview of topics covered in this module..."
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModule}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingModule ? 'Adding...' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Add Lesson</h3>
            <form onSubmit={handleCreateLesson} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Introduction to Backpropagation"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="article">Article / Notes</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Duration (Mins)</label>
                  <input
                    type="number"
                    min="0"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Content / Video URL</label>
                <input
                  type="text"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="previewCheckbox"
                  checked={isFreePreview}
                  onChange={(e) => setIsFreePreview(e.target.checked)}
                  className="rounded border"
                />
                <label htmlFor="previewCheckbox" className="text-xs text-foreground">
                  Allow Free Preview before purchase
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLesson}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingLesson ? 'Adding...' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
