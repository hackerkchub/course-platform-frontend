import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { InstructorProfile, CourseCard as CourseCardType } from '@/types/course';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { CourseCard } from '@/components/courses/course-card';
import { getSiteUrl } from '@/lib/site-url';
import {
  Briefcase,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { LinkedinIcon, TwitterIcon, GithubIcon } from '@/components/ui/social-icons';

interface InstructorDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: InstructorDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = getSiteUrl();
  try {
    const res = await serverFetch<ApiResponse<InstructorProfile>>(
      API_ENDPOINTS.instructors.byId(Number(id)),
      { revalidate: 3600 }
    );
    const instructor = res?.data as unknown as InstructorProfile;
    if (!instructor) return { title: 'Instructor Not Found' };

    const title = `${instructor.name} | Faculty & Mentor Profile`;
    const description = instructor.bio || `Explore live cohorts and engineering mentorship led by ${instructor.name}.`;
    const canonical = `${siteUrl}/instructors/${id}`;
    const ogImage = instructor.photo_url || `${siteUrl}/images/og-default.jpg`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Course Platform',
        images: [{ url: ogImage, alt: instructor.name }],
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: 'Faculty Profile' };
  }
}

export default async function InstructorDetailPage({ params }: InstructorDetailPageProps) {
  const { id } = await params;
  const instructorId = Number(id);

  let instructor: InstructorProfile | null = null;
  let courses: CourseCardType[] = [];

  try {
    const [insRes, coursesRes] = await Promise.all([
      serverFetch<ApiResponse<InstructorProfile>>(
        API_ENDPOINTS.instructors.byId(instructorId),
        { revalidate: 3600 }
      ),
      serverFetch<PaginatedResponse<CourseCardType>>(
        `${API_ENDPOINTS.courses.list}?instructor_id=${instructorId}&limit=12`,
        { revalidate: 60 }
      ),
    ]);

    instructor = (insRes?.data as unknown as InstructorProfile) || null;
    const raw = coursesRes?.data;
    courses = Array.isArray(raw) ? raw : ((raw as unknown as { data?: CourseCardType[] })?.data || []);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      notFound();
    }
    throw new Error('Faculty profile service is temporarily unavailable');
  }

  if (!instructor) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const sameAsLinks = instructor.social_links
    ? [
        instructor.social_links.linkedin,
        instructor.social_links.twitter,
        instructor.social_links.github,
        instructor.social_links.website,
      ].filter((link): link is string => Boolean(link && typeof link === 'string' && link.trim()))
    : [];

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: instructor.name,
    ...(instructor.designation ? { jobTitle: instructor.designation } : {}),
    ...(instructor.bio ? { description: instructor.bio } : {}),
    ...(instructor.photo_url ? { image: instructor.photo_url } : {}),
    url: `${siteUrl}/instructors/${instructor.id}`,
    ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
  };

  const serializedJsonLd = JSON.stringify(personJsonLd).replace(/</g, '\\u003c');

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Schema.org Person JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedJsonLd }}
      />
      {/* Breadcrumbs Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/instructors" className="hover:text-blue-400 transition-colors">
              Faculty
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-200">{instructor.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {instructor.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={instructor.photo_url}
                alt={instructor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-xl">
                {instructor.name.charAt(0)}
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                {instructor.name}
              </h1>
              {instructor.designation && (
                <p className="text-sm sm:text-base text-slate-300">
                  {instructor.designation}
                </p>
              )}
              {instructor.experience_years !== null && instructor.experience_years !== undefined && (
                <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                  <Briefcase className="w-4 h-4" />
                  <span>{instructor.experience_years}+ Years Professional Engineering Experience</span>
                </div>
              )}

              {/* Social links */}
              {instructor.social_links && (
                <div className="flex items-center gap-3 pt-2 text-slate-400">
                  {instructor.social_links.linkedin && (
                    <a
                      href={instructor.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <LinkedinIcon className="w-5 h-5" />
                    </a>
                  )}
                  {instructor.social_links.twitter && (
                    <a
                      href={instructor.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-sky-400 transition-colors"
                      aria-label="Twitter"
                    >
                      <TwitterIcon className="w-5 h-5" />
                    </a>
                  )}
                  {instructor.social_links.github && (
                    <a
                      href={instructor.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="GitHub"
                    >
                      <GithubIcon className="w-5 h-5" />
                    </a>
                  )}
                  {instructor.social_links.website && (
                    <a
                      href={instructor.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors"
                      aria-label="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Bio Section */}
        {instructor.bio && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              About {instructor.name}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {instructor.bio}
            </p>
          </div>
        )}

        {/* Taught Courses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Courses Led by {instructor.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {courses.length} active {courses.length === 1 ? 'cohort' : 'cohorts'}
              </p>
            </div>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
              No active courses currently assigned to this faculty member.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
