import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { InstructorProfile } from '@/types/course';
import { ApiResponse } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Globe,
  Briefcase,
} from 'lucide-react';
import { LinkedinIcon, TwitterIcon, GithubIcon } from '@/components/ui/social-icons';

export const metadata: Metadata = {
  title: 'Faculty & Industry Mentors | Course Platform',
  description:
    'Meet the seasoned engineers, architects, and industry practitioners leading our live interactive cohorts.',
};

export default async function InstructorsPage() {
  let instructors: InstructorProfile[] = [];

  try {
    const res = await serverFetch<ApiResponse<InstructorProfile[]>>(
      API_ENDPOINTS.instructors.list,
      { revalidate: 3600 }
    );
    instructors = (res?.data as unknown as InstructorProfile[]) || [];
  } catch {
    instructors = [];
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Veteran Practitioners</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Learn from Engineering Leaders
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our faculty members have designed and shipped high-scale distributed systems across premier technology enterprises.
          </p>
        </div>
      </section>

      {/* Instructors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {instructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <Card
                key={instructor.id}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Photo & Role Header */}
                  <div className="flex items-center gap-4">
                    {instructor.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={instructor.photo_url}
                        alt={instructor.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                        {instructor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {instructor.name}
                      </h3>
                      {instructor.designation && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {instructor.designation}
                        </p>
                      )}
                      {instructor.experience_years !== null && instructor.experience_years !== undefined && (
                        <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                          <Briefcase className="w-3 h-3" />
                          <span>{instructor.experience_years}+ Years Experience</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {instructor.bio && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {instructor.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  {instructor.social_links && (
                    <div className="flex items-center gap-2 pt-2 text-slate-400">
                      {instructor.social_links.linkedin && (
                        <a
                          href={instructor.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                          aria-label="LinkedIn Profile"
                        >
                          <LinkedinIcon className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.social_links.twitter && (
                        <a
                          href={instructor.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-sky-500 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Twitter Profile"
                        >
                          <TwitterIcon className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.social_links.github && (
                        <a
                          href={instructor.social_links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                          aria-label="GitHub Profile"
                        >
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.social_links.website && (
                        <a
                          href={instructor.social_links.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Personal Website"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* View Details Link */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {instructor.course_count ? `${instructor.course_count} Courses` : 'Lead Instructor'}
                  </span>
                  <Link href={`/instructors/${instructor.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700">
                      View Profile
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Faculty Directory Updating
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Our faculty profiles are being updated. In the meantime, explore our upcoming live cohorts.
            </p>
            <Link href="/courses">
              <Button variant="primary" size="sm">
                Explore Courses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
