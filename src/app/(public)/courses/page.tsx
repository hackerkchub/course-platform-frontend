import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CourseCard as CourseCardType, Category } from '@/types/course';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { CourseCard } from '@/components/courses/course-card';
import { CourseFilters } from '@/components/courses/course-filters';
import { MobileFilterDrawer } from '@/components/courses/mobile-filter-drawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSiteUrl } from '@/lib/site-url';
import {
  ChevronRight,
  FilterX,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'All Courses & Live Cohorts | Modern Engineering Platform',
  description:
    'Browse our comprehensive catalog of live engineering cohorts, full stack masteries, cloud architecture, and backend systems.',
  alternates: {
    canonical: `${siteUrl}/courses`,
  },
  openGraph: {
    title: 'Explore Live Engineering Cohorts | Course Platform',
    description: 'Learn modern software engineering with production-grade curriculum and veteran mentorship.',
    url: `${siteUrl}/courses`,
  },
};

interface CoursesPageProps {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    level?: string;
    price?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page || 1);
  const limit = 12;

  // Build query string for backend API
  const queryParts = new URLSearchParams();
  queryParts.set('page', String(page));
  queryParts.set('limit', String(limit));

  if (resolvedParams.category) queryParts.set('category', resolvedParams.category);
  if (resolvedParams.subcategory) queryParts.set('subcategory', resolvedParams.subcategory);
  if (resolvedParams.level && resolvedParams.level !== 'all') queryParts.set('level', resolvedParams.level);
  if (resolvedParams.sort) queryParts.set('sort', resolvedParams.sort);
  if (resolvedParams.search) queryParts.set('search', resolvedParams.search);

  if (resolvedParams.price === 'free') {
    queryParts.set('max_price', '0');
  } else if (resolvedParams.price === 'paid') {
    queryParts.set('min_price', '1');
  }

  // Fetch courses and categories in parallel
  let courses: CourseCardType[] = [];
  let totalCourses = 0;
  let totalPages = 1;
  let categories: Category[] = [];

  try {
    const [coursesRes, catRes] = await Promise.all([
      serverFetch<PaginatedResponse<CourseCardType>>(
        `${API_ENDPOINTS.courses.list}?${queryParts.toString()}`,
        { revalidate: 60 }
      ),
      serverFetch<ApiResponse<Category[]>>(
        API_ENDPOINTS.categories.list,
        { revalidate: 3600 }
      ),
    ]);

    const rawCourses = coursesRes?.data;
    courses = Array.isArray(rawCourses)
      ? rawCourses
      : ((rawCourses as unknown as { data?: CourseCardType[] })?.data || []);
    totalCourses = coursesRes?.pagination?.total ?? courses.length;
    totalPages =
      coursesRes?.pagination?.total_pages ??
      coursesRes?.pagination?.totalPages ??
      Math.ceil(totalCourses / limit) ??
      1;
    categories = (catRes?.data as unknown as Category[]) || [];
  } catch {
    // Graceful fallback if backend is momentarily unreachable
    courses = [];
    totalCourses = 0;
    totalPages = 1;
    categories = [];
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Catalog Header Banner */}
      <div className="bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-medium">Courses</span>
            {resolvedParams.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-blue-600 dark:text-blue-400 capitalize">
                  {resolvedParams.category.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold dark:bg-blue-950/80 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Industry-Curated Curriculum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Engineering Courses & Live Cohorts
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Choose from full-stack tracks, backend systems, and cloud architecture cohorts led by experienced practitioners.
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm self-start md:self-auto">
              Showing <span className="font-bold text-slate-900 dark:text-white">{courses.length}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalCourses}</span> cohorts
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile Filter Drawer Trigger (< lg) */}
        <Suspense fallback={null}>
          <MobileFilterDrawer categories={categories} totalCourses={totalCourses} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar (>= lg) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
                <CourseFilters categories={categories} totalCourses={totalCourses} />
              </Suspense>
            </div>
          </aside>

          {/* Courses Grid */}
          <main className="lg:col-span-3">
            {courses.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200 dark:border-slate-800">
                    {page > 1 && (
                      <Link
                        href={`/courses?${new URLSearchParams({
                          ...resolvedParams,
                          page: String(page - 1),
                        }).toString()}`}
                      >
                        <Button variant="outline" size="sm" className="gap-1">
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                      </Link>
                    )}

                    <div className="flex items-center gap-1 px-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
                        <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                      </span>
                    </div>

                    {page < totalPages && (
                      <Link
                        href={`/courses?${new URLSearchParams({
                          ...resolvedParams,
                          page: String(page + 1),
                        }).toString()}`}
                      >
                        <Button variant="outline" size="sm" className="gap-1">
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mb-4">
                  <FilterX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  No cohorts match your selected filters
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                  Try adjusting or clearing your search term, category, or tuition parameters to discover available courses.
                </p>
                <div className="flex items-center gap-3">
                  <Link href="/courses">
                    <Button variant="primary">
                      Reset All Filters
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">
                      Request a Custom Batch
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
