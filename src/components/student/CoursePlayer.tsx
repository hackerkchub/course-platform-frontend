'use client';

import React, { useEffect, useRef } from 'react';
import type { CurriculumLesson } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';
import {
  PlayCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Video,
  ClipboardList,
} from 'lucide-react';

export interface CoursePlayerProps {
  lesson: CurriculumLesson | null;
  onMarkComplete: (completed: boolean) => Promise<void>;
  onPositionUpdate: (seconds: number, force?: boolean) => void;
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isSavingProgress?: boolean;
}

export function CoursePlayer({
  lesson,
  onMarkComplete,
  onPositionUpdate,
  onPreviousLesson,
  onNextLesson,
  hasPrevious = false,
  hasNext = false,
  isSavingProgress = false,
}: CoursePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportedTimeRef = useRef<number>(0);

  // Restore playback position when lesson changes
  useEffect(() => {
    lastReportedTimeRef.current = 0;
  }, [lesson?.id]);

  // Flush playback position on unmount or lesson change
  useEffect(() => {
    const videoEl = videoRef.current;
    return () => {
      if (videoEl) {
        const currentSeconds = Math.floor(videoEl.currentTime);
        if (currentSeconds > 0 && currentSeconds !== lastReportedTimeRef.current) {
          lastReportedTimeRef.current = currentSeconds;
          onPositionUpdate(currentSeconds, true);
        }
      }
    };
  }, [lesson?.id, onPositionUpdate]);

  const handleLoadedMetadata = () => {
    const startPosition = Math.max(0, lesson?.progress?.last_position_seconds || 0);
    if (videoRef.current && startPosition > 0 && startPosition < (videoRef.current.duration || Infinity)) {
      videoRef.current.currentTime = startPosition;
    }
  };

  // Throttle time updates to avoid sending requests every tick (report at most every 15s)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentSeconds = Math.floor(videoRef.current.currentTime);
    if (Math.abs(currentSeconds - lastReportedTimeRef.current) >= 15) {
      lastReportedTimeRef.current = currentSeconds;
      onPositionUpdate(currentSeconds, false);
    }
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    const currentSeconds = Math.floor(videoRef.current.currentTime);
    if (currentSeconds !== lastReportedTimeRef.current) {
      lastReportedTimeRef.current = currentSeconds;
      onPositionUpdate(currentSeconds, true);
    }
  };

  const handleEnded = () => {
    if (!videoRef.current) return;
    const currentSeconds = Math.floor(videoRef.current.currentTime);
    if (currentSeconds !== lastReportedTimeRef.current) {
      lastReportedTimeRef.current = currentSeconds;
      onPositionUpdate(currentSeconds, true);
    }
  };

  if (!lesson) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center space-y-3">
        <PlayCircle className="w-16 h-16 text-slate-600 animate-pulse" />
        <h3 className="text-lg font-bold">Select a Lesson to Begin</h3>
        <p className="text-sm text-slate-400 max-w-md">
          Choose a lesson from the course syllabus on the sidebar to start streaming content.
        </p>
      </div>
    );
  }

  // Parse media source securely
  const getMediaSource = (url?: string | null) => {
    if (!url || typeof url !== 'string') return { type: 'none' as const };
    const trimmed = url.trim();
    if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) return { type: 'unsupported' as const };

    // YouTube detection
    const ytMatch = trimmed.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      const startSec = Math.max(0, lesson.progress?.last_position_seconds || 0);
      return {
        type: 'youtube' as const,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?start=${startSec}&rel=0`,
      };
    }

    // Vimeo detection
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo' as const,
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      };
    }

    // Direct MP4 / HTML5 stream
    if (
      /\.(mp4|webm|ogg|m4v|mov)($|\?)/i.test(trimmed) ||
      trimmed.startsWith('/files/') ||
      trimmed.startsWith('http')
    ) {
      return {
        type: 'html5' as const,
        directUrl: trimmed,
      };
    }

    return { type: 'unsupported' as const };
  };

  const mediaSource = getMediaSource(lesson.content_url);
  const isCompleted = Boolean(lesson.progress?.completed);

  return (
    <div className="space-y-6">
      {/* 1. Main Media Stage */}
      <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden shadow-lg border border-slate-800">
        {lesson.lesson_type === 'video' ? (
          <>
            {mediaSource.type === 'html5' && mediaSource.directUrl ? (
              <video
                ref={videoRef}
                src={mediaSource.directUrl}
                controls
                controlsList="nodownload"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
                onEnded={handleEnded}
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : mediaSource.type === 'youtube' && mediaSource.embedUrl ? (
              <iframe
                src={mediaSource.embedUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : mediaSource.type === 'vimeo' && mediaSource.embedUrl ? (
              <iframe
                src={mediaSource.embedUrl}
                title={lesson.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <Video className="w-12 h-12 text-slate-600" />
                <h4 className="text-base font-semibold text-slate-200">Video Stream Unavailable</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  The video stream for this lesson is currently being processed or updated. You can proceed with lesson reading materials.
                </p>
              </div>
            )}
          </>
        ) : lesson.lesson_type === 'article' ? (
          <div className="w-full h-full bg-slate-900 text-slate-200 p-8 sm:p-12 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              Article & Reading Material
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{lesson.title}</h2>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-3">
              {lesson.description ? (
                <p className="whitespace-pre-line">{lesson.description}</p>
              ) : (
                <p>Read through the syllabus instructions and downloadable resources for this module.</p>
              )}
            </div>
          </div>
        ) : lesson.lesson_type === 'assignment' || lesson.lesson_type === 'quiz' ? (
          <div className="w-full h-full bg-slate-900 text-slate-200 p-8 sm:p-12 overflow-y-auto space-y-4 flex flex-col justify-center items-center text-center">
            <ClipboardList className="w-14 h-14 text-blue-400 mb-2" />
            <Badge variant="primary" className="uppercase text-xs tracking-wider">
              {lesson.lesson_type}
            </Badge>
            <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
            <p className="text-sm text-slate-400 max-w-md">
              {lesson.description ||
                'Complete the assigned task and submit your deliverables per your cohort instructor instructions.'}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <HelpCircle className="w-12 h-12 text-slate-600" />
            <h4 className="text-base font-semibold text-slate-200">Content Format Not Supported</h4>
            <p className="text-xs text-slate-500">This lesson type is currently being updated.</p>
          </div>
        )}
      </div>

      {/* 2. Lesson Header & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="secondary" className="capitalize text-xs font-semibold">
              {lesson.lesson_type}
            </Badge>
            {lesson.duration_seconds > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Duration: {formatDuration(lesson.duration_seconds)}
              </span>
            )}
            {isCompleted && (
              <Badge variant="success" className="text-xs gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {lesson.title}
          </h1>
        </div>

        {/* Completion & Next / Prev Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            type="button"
            variant={isCompleted ? 'outline' : 'success'}
            size="sm"
            onClick={() => onMarkComplete(!isCompleted)}
            isLoading={isSavingProgress}
            className="text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPrevious}
              onClick={onPreviousLesson}
              className="text-xs px-2.5"
              aria-label="Previous lesson"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={onNextLesson}
              className="text-xs px-2.5"
              aria-label="Next lesson"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Lesson Description & Notes */}
      {lesson.description && lesson.lesson_type !== 'article' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Lesson Notes & Overview
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {lesson.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default CoursePlayer;
