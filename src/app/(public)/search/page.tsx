import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CourseCard as CourseCardType, Category, Subcategory } from '@/types/course';
import { ApiResponse } from '@/types/api';
import { CourseCard } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Layers, BookOpen } from 'lucide-react';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search Results for "${q}" | Course Platform` : 'Search Courses & Topics',
    description: 'Find online live cohorts, modules, and instructors.',
  };
}

interface SearchCatalogResult {
  courses: CourseCardType[];
  categories: Category[];
  subcategories: Subcategory[];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || '').trim();

  let searchResults: SearchCatalogResult = {
    courses: [],
    categories: [],
    subcategories: [],
  };

  if (query.length >= 2) {
    try {
      const res = await serverFetch<ApiResponse<SearchCatalogResult>>(
        `${API_ENDPOINTS.courses.search}?q=${encodeURIComponent(query)}&limit=20`,
        { revalidate: 30 }
      );
      if (res?.data) {
        searchResults = res.data as unknown as SearchCatalogResult;
      }
    } catch {
      searchResults = { courses: [], categories: [], subcategories: [] };
    }
  }

  const hasResults =
    (searchResults.courses && searchResults.courses.length > 0) ||
    (searchResults.categories && searchResults.categories.length > 0) ||
    (searchResults.subcategories && searchResults.subcategories.length > 0);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {query ? `Search results for "${query}"` : 'Search Catalog'}
            </h1>
            <form action="/search" method="GET" className="relative flex items-center">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search by topic, skill, framework (e.g. Next.js, Docker, Microservices)..."
                className="w-full h-12 pl-11 pr-24 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <Button type="submit" size="sm" className="absolute right-2 font-semibold">
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {query.length < 2 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Type at least 2 characters to search
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Search by course title, technology stack, category, or module topic.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['React', 'Next.js', 'Node.js', 'System Design', 'Cloud'].map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                  <Button variant="outline" size="sm" className="text-xs rounded-full">
                    {tag}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        ) : hasResults ? (
          <div className="space-y-10">
            {/* Matching Categories & Subcategories */}
            {(searchResults.categories?.length > 0 || searchResults.subcategories?.length > 0) && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Matching Categories & Tracks</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {searchResults.categories?.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                        <Sparkles className="w-3 h-3" />
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                  {searchResults.subcategories?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/courses?subcategory=${sub.slug}`}
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:border-slate-400 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        {sub.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Courses */}
            {searchResults.courses?.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Matching Courses ({searchResults.courses.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                No individual courses directly matched &quot;{query}&quot;, but relevant categories were identified above.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No matching results for &quot;{query}&quot;
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Check for typos or try searching with more general engineering terms.
            </p>
            <Link href="/courses">
              <Button variant="primary" size="sm">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
