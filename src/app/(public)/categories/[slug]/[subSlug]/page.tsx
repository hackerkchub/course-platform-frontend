import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Subcategory, CourseCard as CourseCardType } from '@/types/course';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { CourseCard } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface SubcategoryPageProps {
  params: Promise<{
    slug: string;
    subSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { slug, subSlug } = await params;
  try {
    const res = await serverFetch<ApiResponse<Subcategory>>(
      API_ENDPOINTS.subcategories.detail(slug, subSlug),
      { revalidate: 3600 }
    );
    const sub = res?.data as unknown as Subcategory;
    if (!sub) return { title: 'Subcategory Not Found' };

    return {
      title: `${sub.name} Courses & Cohorts | Course Platform`,
      description: sub.description || `Master ${sub.name} with live practitioner-led cohorts.`,
    };
  } catch {
    return { title: 'Specialized Courses' };
  }
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { slug, subSlug } = await params;

  let subcategory: Subcategory | null = null;
  let courses: CourseCardType[] = [];

  try {
    const [subRes, coursesRes] = await Promise.all([
      serverFetch<ApiResponse<Subcategory>>(
        API_ENDPOINTS.subcategories.detail(slug, subSlug),
        { revalidate: 3600 }
      ),
      serverFetch<PaginatedResponse<CourseCardType>>(
        `${API_ENDPOINTS.courses.list}?category=${slug}&subcategory=${subSlug}&limit=24`,
        { revalidate: 60 }
      ),
    ]);

    subcategory = (subRes?.data as unknown as Subcategory) || null;
    const raw = coursesRes?.data;
    courses = Array.isArray(raw) ? raw : ((raw as unknown as { data?: CourseCardType[] })?.data || []);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      notFound();
    }
    throw new Error('Subcategory service is temporarily unavailable');
  }

  if (!subcategory) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Subcategory Header */}
      <div className="bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/courses" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/categories/${slug}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors capitalize"
            >
              {slug.replace(/-/g, ' ')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-medium">{subcategory.name}</span>
          </nav>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {subcategory.name}
            </h1>
            {subcategory.description && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {subcategory.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Cohorts in {subcategory.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
            </p>
          </div>
          <Link href={`/courses?category=${slug}&subcategory=${subSlug}`}>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              Advanced Filters
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              No active courses in {subcategory.name} currently
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
              Check out all cohorts in the parent category or explore our full curriculum catalog.
            </p>
            <Link href={`/categories/${slug}`}>
              <Button variant="primary" size="sm">
                View All {slug.replace(/-/g, ' ')} Courses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
