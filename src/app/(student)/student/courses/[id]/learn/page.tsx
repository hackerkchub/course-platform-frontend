'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ErrorState } from '@/components/ui/error-state';
import { CoursePlayer } from '@/components/student/CoursePlayer';
import { CurriculumSidebar } from '@/components/student/CurriculumSidebar';
import { CourseMaterialsModal } from '@/components/student/CourseMaterialsModal';
import {
  fetchStudentCurriculum,
  saveLessonProgress,
  fetchCourseMaterials,
} from '@/lib/api/student';
import type {
  StudentCurriculumResponse,
  CurriculumLesson,
  CourseMaterial,
} from '@/types/student';
import { getErrorMessage } from '@/lib/utils';
import {
  ArrowLeft,
  Award,
  FolderOpen,
} from 'lucide-react';

export default function CourseLearningPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const courseId = Number(params?.id);
  const targetLessonId = searchParams.get('lessonId')
    ? Number(searchParams.get('lessonId'))
    : null;

  const [curriculumData, setCurriculumData] = useState<StudentCurriculumResponse | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [currentLesson, setCurrentLesson] = useState<CurriculumLesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState<boolean>(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Flattened ordered list of all lessons for sequential navigation
  const allLessons = useMemo(() => {
    if (!curriculumData?.modules) return [];
    const sortedMods = [...curriculumData.modules].sort((a, b) => a.display_order - b.display_order);
    const flat: CurriculumLesson[] = [];
    sortedMods.forEach(m => {
      const sortedLessons = [...(m.lessons || [])].sort((a, b) => a.display_order - b.display_order);
      sortedLessons.forEach(l => flat.push(l));
    });
    return flat;
  }, [curriculumData]);

  // Load course curriculum
  const loadCurriculum = useCallback(async () => {
    if (!courseId || isNaN(courseId)) {
      setIsError(true);
      setErrorMessage('Invalid course ID provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const data = await fetchStudentCurriculum(courseId);
      setCurriculumData(data);

      // Select initial lesson
      const sortedMods = [...(data.modules || [])].sort((a, b) => a.display_order - b.display_order);
      const flat: CurriculumLesson[] = [];
      sortedMods.forEach(m => {
        const sorted = [...(m.lessons || [])].sort((a, b) => a.display_order - b.display_order);
        sorted.forEach(l => flat.push(l));
      });

      if (flat.length > 0) {
        if (targetLessonId) {
          const match = flat.find(l => l.id === targetLessonId);
          setCurrentLesson(match || flat[0]);
        } else {
          // Select first incomplete lesson or first lesson
          const firstIncomplete = flat.find(l => !l.progress?.completed);
          setCurrentLesson(firstIncomplete || flat[0]);
        }
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, targetLessonId]);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  // Load downloadable course materials
  const loadMaterials = useCallback(async () => {
    if (!courseId) return;
    setIsLoadingMaterials(true);
    try {
      const data = await fetchCourseMaterials(courseId);
      setMaterials(data);
    } catch (err) {
      console.warn('Failed to fetch course materials:', getErrorMessage(err));
    } finally {
      setIsLoadingMaterials(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // References for throttling, flush on unmount/lesson-change, and stale-response protection
  const latestRequestTimeRef = useRef<number>(0);
  const lastSavedSecondRef = useRef<Record<number, number>>({});
  const activeLessonRef = useRef<CurriculumLesson | null>(null);

  useEffect(() => {
    activeLessonRef.current = currentLesson;
  }, [currentLesson]);

  // Authoritative progress synchronization function
  const syncProgress = useCallback(
    async (lessonId: number, seconds: number, isCompleted: boolean, force = false) => {
      if (!lessonId || isNaN(lessonId)) return;
      const roundedSeconds = Math.max(0, Math.floor(seconds));
      const lastSaved = lastSavedSecondRef.current[lessonId] ?? -1;

      // Rule 10: Do not send progress updates when no meaningful position change occurred (unless force)
      if (!force && lastSaved === roundedSeconds) return;

      // Rule 2: Routine updates throttled to at most once every 15 seconds (unless force)
      const now = Date.now();
      if (!force && now - latestRequestTimeRef.current < 15000) return;

      latestRequestTimeRef.current = now;
      const requestTimestamp = now;

      try {
        const res = await saveLessonProgress(lessonId, {
          completed: isCompleted,
          last_position_seconds: roundedSeconds,
        });

        // Rule 8: Prevent stale async responses from overwriting newer playback progress
        if (requestTimestamp >= latestRequestTimeRef.current) {
          lastSavedSecondRef.current[lessonId] = roundedSeconds;
          // Synchronize local lesson progress state
          setCurriculumData((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              modules: prev.modules.map((m) => ({
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId
                    ? {
                        ...l,
                        progress: {
                          completed: res.completed,
                          last_position_seconds: res.last_position_seconds,
                        },
                      }
                    : l
                ),
              })),
            };
          });
        }
      } catch (err) {
        // Failed progress request is logged without falsely showing successful sync
        console.warn('Playback progress synchronization notice:', getErrorMessage(err));
      }
    },
    []
  );

  // Position update callback passed to CoursePlayer
  const handlePositionUpdate = useCallback(
    (seconds: number, force = false) => {
      if (!currentLesson) return;
      syncProgress(
        currentLesson.id,
        seconds,
        Boolean(currentLesson.progress?.completed),
        force
      );
    },
    [currentLesson, syncProgress]
  );

  // Flush playback progress on lesson change
  const handleSelectLesson = (lesson: CurriculumLesson) => {
    if (currentLesson && currentLesson.id !== lesson.id) {
      const lastPos = currentLesson.progress?.last_position_seconds || 0;
      syncProgress(currentLesson.id, lastPos, Boolean(currentLesson.progress?.completed), true);
    }
    setCurrentLesson(lesson);
    router.replace(`/student/courses/${courseId}/learn?lessonId=${lesson.id}`, { scroll: false });
  };

  // Flush playback progress on component unmount
  useEffect(() => {
    return () => {
      const active = activeLessonRef.current;
      if (active) {
        const lastPos = active.progress?.last_position_seconds || 0;
        syncProgress(active.id, lastPos, Boolean(active.progress?.completed), true);
      }
    };
  }, [syncProgress]);

  // Previous & Next navigation
  const currentIndex = useMemo(() => {
    if (!currentLesson) return -1;
    return allLessons.findIndex(l => l.id === currentLesson.id);
  }, [allLessons, currentLesson]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allLessons.length - 1;

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      handleSelectLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      handleSelectLesson(allLessons[currentIndex + 1]);
    }
  };

  const handleMarkComplete = async (completed: boolean) => {
    if (!currentLesson) return;
    setIsSavingProgress(true);

    try {
      const currentSeconds = currentLesson.progress?.last_position_seconds || 0;
      const res = await saveLessonProgress(currentLesson.id, {
        completed,
        last_position_seconds: currentSeconds,
      });

      // Update throttle cache to prevent duplicate request
      lastSavedSecondRef.current[currentLesson.id] = currentSeconds;
      latestRequestTimeRef.current = Date.now();

      // Update local state smoothly
      setCurrentLesson(prev =>
        prev ? { ...prev, progress: { ...prev.progress, completed: res.completed, last_position_seconds: res.last_position_seconds } } : null
      );

      // Update lesson in curriculum data
      setCurriculumData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          modules: prev.modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l =>
              l.id === currentLesson.id
                ? { ...l, progress: { ...l.progress, completed: res.completed, last_position_seconds: res.last_position_seconds } }
                : l
            ),
          })),
        };
      });

      toast({
        type: 'success',
        title: completed ? 'Lesson Completed!' : 'Lesson Marked Incomplete',
        message: completed
          ? 'Your progress has been recorded successfully.'
          : 'Lesson progress has been reset.',
      });

      // Show course completion celebration if authoritative backend confirms completion
      if (res.course_completed) {
        setShowCelebration(true);
      } else if (completed && hasNext) {
        // Automatically proceed to next lesson on completion
        handleNextLesson();
      }
    } catch (err) {
      toast({
        type: 'error',
        title: 'Progress Update Failed',
        message: getErrorMessage(err),
      });
    } finally {
      setIsSavingProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Student Portal', href: '/student/dashboard' },
            { label: 'My Courses', href: '/student/courses' },
            { label: 'Learning Player' },
          ]}
          showHome
        />
        <ErrorState
          title="Curriculum Access Restricted"
          description={errorMessage || 'You may not have active enrollment permissions for this course, or access has expired.'}
          onRetry={loadCurriculum}
          retryLabel="Retry Loading Curriculum"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Learning Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/student/courses">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-1.5 text-xs font-semibold shrink-0"
              aria-label="Back to My Courses"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              My Courses
            </Button>
          </Link>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enrolled Course #{courseId}
            </p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {currentLesson?.title || 'Course Learning Interface'}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMaterialsOpen(true)}
            className="text-xs font-semibold gap-1.5 h-9"
          >
            <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Resources {materials.length > 0 && `(${materials.length})`}
          </Button>
        </div>
      </div>

      {/* Main Two-Column Learning Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Player Stage (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <CoursePlayer
            lesson={currentLesson}
            onMarkComplete={handleMarkComplete}
            onPositionUpdate={handlePositionUpdate}
            onPreviousLesson={handlePreviousLesson}
            onNextLesson={handleNextLesson}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isSavingProgress={isSavingProgress}
          />
        </div>

        {/* Right Column: Curriculum Syllabus Sidebar (1/3 width) */}
        <div className="lg:col-span-1">
          <CurriculumSidebar
            modules={curriculumData?.modules || []}
            currentLessonId={currentLesson?.id}
            onSelectLesson={handleSelectLesson}
          />
        </div>
      </div>

      {/* Downloadable Materials Modal */}
      <CourseMaterialsModal
        isOpen={isMaterialsOpen}
        onClose={() => setIsMaterialsOpen(false)}
        materials={materials}
        isLoading={isLoadingMaterials}
        onRefresh={loadMaterials}
        courseTitle={currentLesson?.title}
      />

      {/* Authoritative Course Completion Banner / Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Course Completed!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Congratulations! You have completed all published lessons in this course program. Your verified completion status has been updated.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowCelebration(false)}
                className="text-xs font-semibold px-6"
              >
                Continue Reviewing
              </Button>
              <Link href="/student/courses">
                <Button type="button" variant="outline" className="text-xs font-semibold">
                  Back to My Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
