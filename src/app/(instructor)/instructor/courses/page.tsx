'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  Users,
  CheckCircle2,
  Lock,
  Edit3,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  fetchInstructorCourses,
  type InstructorCourseItem,
} from '@/lib/api/instructor-portal';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<InstructorCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchInstructorCourses();
        setCourses(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <AlertCircle className="mx-auto h-8 w-8" />
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Assigned Courses</h1>
          <p className="text-sm text-muted-foreground">
            Courses you have been assigned to instruct or manage curriculum for.
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No Courses Assigned Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You currently have no courses assigned. Contact an administrator to assign you to courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md"
            >
              {/* Thumbnail / Header */}
              <div className="relative h-44 w-full bg-muted">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.course_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                    <BookOpen className="h-12 w-12 opacity-40" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {course.is_primary ? (
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                      Primary Instructor
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                      Co-Instructor
                    </span>
                  )}
                  <span className="rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                    {course.course_level}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex-1 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">{course.course_code}</div>
                  <h3 className="text-lg font-bold leading-snug text-foreground line-clamp-2">
                    {course.course_name}
                  </h3>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>{course.batch_count} Active Batches</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>{course.enrolled_students_count} Students</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  {course.can_manage_curriculum ? (
                    <Link
                      href={`/instructor/courses/${course.id}/curriculum`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Manage Curriculum
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      Curriculum View Only
                    </span>
                  )}

                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Public Page <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
