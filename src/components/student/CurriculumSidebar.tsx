'use client';

import React, { useState } from 'react';
import type { CurriculumModule, CurriculumLesson } from '@/types/student';
import { formatDuration } from '@/lib/utils';
import {
  Video,
  FileText,
  ClipboardList,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export interface CurriculumSidebarProps {
  modules: CurriculumModule[];
  currentLessonId?: number;
  onSelectLesson: (lesson: CurriculumLesson) => void;
  className?: string;
}

export function CurriculumSidebar({
  modules,
  currentLessonId,
  onSelectLesson,
  className = '',
}: CurriculumSidebarProps) {
  // By default, expand all modules or expand the module containing currentLessonId
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    modules.forEach(m => {
      initial[m.id] = true;
    });
    return initial;
  });

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'article':
        return FileText;
      case 'assignment':
      case 'quiz':
        return ClipboardList;
      default:
        return BookOpen;
    }
  };

  // Sort modules by display_order
  const sortedModules = [...modules].sort((a, b) => a.display_order - b.display_order);

  // Overall calculations
  let totalLessons = 0;
  let completedLessons = 0;
  sortedModules.forEach(m => {
    (m.lessons || []).forEach(l => {
      totalLessons++;
      if (l.progress?.completed) {
        completedLessons++;
      }
    });
  });

  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden ${className}`}>
      {/* Header with Progress Bar */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Course Syllabus
          </h2>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {completedLessons}/{totalLessons} Done
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Overall Completion</span>
            <span className="font-bold text-slate-900 dark:text-white">{overallPct}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules and Lessons List */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] divide-y divide-slate-100 dark:divide-slate-800/80">
        {sortedModules.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No published modules available.
          </div>
        ) : (
          sortedModules.map((module, mIdx) => {
            const isExpanded = Boolean(expandedModules[module.id]);
            const sortedLessons = [...(module.lessons || [])].sort(
              (a, b) => a.display_order - b.display_order
            );

            const moduleCompletedCount = sortedLessons.filter(l => l.progress?.completed).length;

            return (
              <div key={module.id} className="bg-white dark:bg-slate-900">
                {/* Module Header Trigger */}
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Module {mIdx + 1}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {module.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {moduleCompletedCount}/{sortedLessons.length}
                  </span>
                </button>

                {/* Lessons Accordion Content */}
                {isExpanded && (
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 divide-y divide-slate-100/80 dark:divide-slate-800/40">
                    {sortedLessons.map((lesson, lIdx) => {
                      const Icon = getLessonIcon(lesson.lesson_type);
                      const isCurrent = lesson.id === currentLessonId;
                      const isCompleted = Boolean(lesson.progress?.completed);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => onSelectLesson(lesson)}
                          className={`w-full p-3.5 pl-8 flex items-center justify-between gap-3 text-left transition-all ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-l-4 border-blue-600 text-blue-900 dark:text-blue-200'
                              : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                            )}
                            <div className="min-w-0">
                              <p className={`text-xs font-medium truncate ${isCurrent ? 'font-bold text-blue-900 dark:text-white' : ''}`}>
                                {lIdx + 1}. {lesson.title}
                              </p>
                              {lesson.duration_seconds > 0 && (
                                <p className="text-[11px] text-slate-400">
                                  {formatDuration(lesson.duration_seconds)}
                                </p>
                              )}
                            </div>
                          </div>

                          {lesson.is_preview && !isCompleted && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-1.5 py-0.5 rounded shrink-0">
                              Preview
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CurriculumSidebar;
