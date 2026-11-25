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
import { CourseHeroSearch } from '@/components/courses/course-hero-search';
import { ActiveFilterChips } from '@/components/courses/active-filter-chips';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSiteUrl } from '@/lib/site-url';
import {
  ChevronRight,
  ChevronLeft,
  FilterX,
  SearchX,
  Sparkles,
  BookOpen,
  Layers,
  Cpu,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Compass,
  Code2,
  Server,
  Brain,
} from 'lucide-react';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Find the Skills That Move You Forward | Guidexa Courses',
  description:
    'Explore learning programs designed to help you strengthen your technical skills, build practical experience and move towards your goals.',
  alternates: {
    canonical: `${siteUrl}/courses`,
  },
  openGraph: {
    title: 'Find the Skills That Move You Forward | Guidexa Courses',
    description:
      'Explore learning programs designed to help you strengthen your technical skills, build practical experience and move towards your goals.',
    url: `${siteUrl}/courses`,
    siteName: 'Guidexa',
    type: 'website',
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
    courses = [];
    totalCourses = 0;
    totalPages = 1;
    categories = [];
  }

  const isFilteredOrSearched = Boolean(
    resolvedParams.search ||
    resolvedParams.category ||
    (resolvedParams.level && resolvedParams.level !== 'all') ||
    (resolvedParams.price && resolvedParams.price !== 'all')
  );

  // Featured courses to highlight when browsing initial catalog
  const featuredCourses = courses.filter((c) => c.is_featured || c.is_trending).slice(0, 3);
  const showFeaturedSection = !isFilteredOrSearched && page === 1 && featuredCourses.length > 0;

  // JSON-LD structured schema for search engines
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Guidexa Course Catalog',
    description: 'Explore learning programs designed to strengthen engineering capabilities.',
    url: `${siteUrl}/courses`,
    numberOfItems: courses.length,
    itemListElement: courses.slice(0, 10).map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: c.course_name,
      url: `${siteUrl}/courses/${c.slug}`,
      description: c.short_description,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Courses',
        item: `${siteUrl}/courses`,
      },
      ...(resolvedParams.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: resolvedParams.category.replace(/-/g, ' '),
              item: `${siteUrl}/courses?category=${resolvedParams.category}`,
            },
          ]
        : []),
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* 1. COURSES HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/90 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6"
          >
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

          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
            {/* Pill Highlights */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Learn New Skills
              </span>
              <span className="text-blue-300 dark:text-blue-700">•</span>
              <span>Build Real Projects</span>
              <span className="text-blue-300 dark:text-blue-700">•</span>
              <span>Grow Your Knowledge</span>
            </div>

            {/* Primary Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Find the Skills That Move You Forward.
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Explore learning programs designed to help you strengthen your technical skills, build practical experience and move towards your goals.
            </p>
          </div>

          {/* Integrated Search Bar */}
          <Suspense fallback={<div className="h-14 max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />}>
            <CourseHeroSearch />
          </Suspense>
        </div>
      </section>

      {/* 2. CATEGORY DISCOVERY SECTION */}
      {categories.length > 0 && (
        <section className="border-b border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Explore by Discipline</span>
              </div>
              <Link
                href="/courses"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                View all categories
              </Link>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              <Link
                href="/courses"
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  !resolvedParams.category
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Programs ({totalCourses})
              </Link>
              {categories.map((cat) => {
                const isSelected = resolvedParams.category === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`/courses?category=${cat.slug}`}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.course_count !== undefined && (
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.course_count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED COURSES SHOWCASE (Displayed when browsing default catalog) */}
      {showFeaturedSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white shadow-xl mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Cohorts</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Start Learning Something New.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 max-w-xl">
                  Explore programs designed to help you develop practical skills and expand your knowledge.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((fc) => (
                <div key={fc.id} className="text-slate-900 dark:text-white">
                  <CourseCard course={fc} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. MAIN CATALOG LAYOUT */}
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

          {/* Courses Main Catalog */}
          <main className="lg:col-span-3">
            {/* Active Filter Chips Bar */}
            <Suspense fallback={null}>
              <ActiveFilterChips
                categories={categories}
                totalCourses={totalCourses}
                currentCount={courses.length}
              />
            </Suspense>

            {courses.length > 0 ? (
              <div className="space-y-8">
                {/* Course Cards Grid */}
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
                        <Button variant="outline" size="sm" className="gap-1 font-semibold">
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                      </Link>
                    )}

                    <div className="flex items-center gap-1 px-3">
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
                        <Button variant="outline" size="sm" className="gap-1 font-semibold">
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : resolvedParams.search ? (
              /* Search No Results State */
              <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center mb-4">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  No Courses Found.
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                  We could not find any cohorts matching &ldquo;{resolvedParams.search}&rdquo;. Try another keyword or clear your filters to explore more learning opportunities.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/courses">
                    <Button variant="primary">
                      Reset Filters
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">
                      Request Course Topic
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Empty Catalog State */
              <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mb-4">
                  <FilterX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  We&apos;re Preparing Something for You.
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                  No courses are available for this selection right now. Try adjusting your filters or explore other programs.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/courses">
                    <Button variant="primary">
                      Clear All Filters
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">
                      Talk with an Advisor
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 5. COURSE SELECTION GUIDANCE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Program Pathways</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Not Sure Where to Start?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Choose the path that best matches your current experience and career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pathway 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  New to Programming
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Start with algorithmic fundamentals, syntax basics, and engineering workflows designed for absolute beginners.
                </p>
                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Programming fundamentals</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Problem solving basics</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700">
                <Link
                  href="/courses?level=beginner"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Explore Beginner Tracks
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pathway 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Web Development
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Master modern frontend and full-stack ecosystems including React, Next.js, TypeScript, and modern UI architectures.
                </p>
                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Next.js & React ecosystems</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>End-to-end full stack web</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700">
                <Link
                  href="/courses?category=web-development"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Explore Web Tracks
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pathway 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Backend & Cloud Systems
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deep dive into distributed systems, database scaling, microservices architecture, and cloud deployment pipelines.
                </p>
                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Distributed architecture</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cloud & DevOps automation</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700">
                <Link
                  href="/courses?category=backend-systems"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Explore Backend Tracks
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pathway 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  AI & Emerging Tech
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Harness modern generative models, vector search, AI agent architectures, and machine learning pipelines.
                </p>
                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Applied AI & LLM tooling</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Production model integration</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700">
                <Link
                  href="/courses?category=data-science-ai"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Explore AI Tracks
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LEARNING BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-lg">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>The Guidexa Standard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Learn More Than Just Theory.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Every cohort is structured to help you develop verifiable engineering depth and real-world execution ability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Structured Learning</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clear step-by-step curriculum designed to build solid engineering foundations without confusing leaps or gaps.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Practical Experience</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hands-on coding labs and real production scenarios that prepare you for modern engineering teams and complex codebases.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Project-Based Learning</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Build portfolio-grade applications with full test coverage, robust CI/CD, and clean documentation to prove your skills.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Progress Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stay accountable with automated milestone tracking, code evaluations, and personalized guidance from mentor check-ins.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
