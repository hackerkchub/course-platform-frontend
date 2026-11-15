import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Category, Subcategory, CourseCard as CourseCardType } from '@/types/course';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { CourseCard } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await serverFetch<ApiResponse<Category>>(
      API_ENDPOINTS.categories.bySlug(slug),
      { revalidate: 3600 }
    );
    const category = res?.data as unknown as Category;
    if (!category) return { title: 'Category Not Found' };

    return {
      title: `${category.name} Courses & Cohorts | Course Platform`,
      description:
        category.description ||
        `Explore industry-grade live courses and cohorts in ${category.name}.`,
    };
  } catch {
    return { title: 'Category Courses' };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let category: Category | null = null;
  let subcategories: Subcategory[] = [];
  let courses: CourseCardType[] = [];

  try {
    const [catRes, subRes, coursesRes] = await Promise.all([
      serverFetch<ApiResponse<Category>>(
        API_ENDPOINTS.categories.bySlug(slug),
        { revalidate: 3600 }
      ),
      serverFetch<ApiResponse<Subcategory[]>>(
        API_ENDPOINTS.subcategories.byCategorySlug(slug),
        { revalidate: 3600 }
      ),
      serverFetch<PaginatedResponse<CourseCardType>>(
        `${API_ENDPOINTS.courses.list}?category=${slug}&limit=24`,
        { revalidate: 60 }
      ),
    ]);

    category = (catRes?.data as unknown as Category) || null;
    subcategories = (subRes?.data as unknown as Subcategory[]) || [];
    const raw = coursesRes?.data;
    courses = Array.isArray(raw) ? raw : ((raw as unknown as { data?: CourseCardType[] })?.data || []);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      notFound();
    }
    throw new Error('Category service is temporarily unavailable');
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Category Header */}
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
            <span className="text-slate-900 dark:text-white font-medium">{category.name}</span>
          </nav>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Specialized Engineering Track</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Subcategories Pills / Cards */}
        {subcategories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Explore Sub-Tracks</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${category.slug}/${sub.slug}`}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block truncate">
                    {sub.name}
                  </span>
                  {sub.total_courses !== undefined && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {sub.total_courses} {sub.total_courses === 1 ? 'course' : 'courses'}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Available Cohorts & Modules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {courses.length} courses in {category.name}
              </p>
            </div>
            <Link href={`/courses?category=${category.slug}`}>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                Filter & Sort
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
                New batches are opening soon in {category.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                Our syllabus for upcoming cohorts in this discipline is in final review.
              </p>
              <Link href="/courses">
                <Button variant="primary" size="sm">
                  View All Available Courses
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
