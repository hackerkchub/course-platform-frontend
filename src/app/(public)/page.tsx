import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Code,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Video,
  Award,
  Layers,
  Database,
  Cloud,
  CheckCircle2,
  Search,
  HelpCircle,
  ChevronDown,
  Terminal,
  Cpu,
  GitPullRequest,
} from 'lucide-react';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CourseCard as CourseCardType, Category } from '@/types/course';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { CourseCard } from '@/components/courses/course-card';
import { FAQ_ITEMS } from '@/data/faqs';
import { getSiteUrl } from '@/lib/site-url';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();

  return {
    title: 'Master Modern Engineering with Live Cohorts | Course Platform',
    description:
      'Accelerate your engineering career with rigorous curricula, hands-on production code, and direct mentorship from veteran practitioners at Softmaxs Solution LLP.',
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: 'Course Platform – Softmaxs Solution LLP',
      description:
        'Live engineering cohorts, hands-on project labs, and faculty mentorship engineered for real-world software competence.',
      url: siteUrl,
      type: 'website',
    },
  };
}

export default async function HomePage() {
  const siteUrl = getSiteUrl();
  let featuredCourses: CourseCardType[] = [];
  let categories: Category[] = [];

  try {
    const [coursesRes, catRes] = await Promise.all([
      serverFetch<PaginatedResponse<CourseCardType>>(
        `${API_ENDPOINTS.courses.list}?limit=6&sort=popular`,
        { revalidate: 60 }
      ),
      serverFetch<ApiResponse<Category[]>>(
        API_ENDPOINTS.categories.list,
        { revalidate: 3600 }
      ),
    ]);

    const raw = coursesRes?.data;
    featuredCourses = Array.isArray(raw)
      ? raw
      : ((raw as unknown as { data?: CourseCardType[] })?.data || []);
    categories = (catRes?.data as unknown as Category[]) || [];
  } catch {
    featuredCourses = [];
    categories = [];
  }

  const defaultCategories = [
    {
      name: 'Full Stack Web Development',
      title: 'Full Stack Web Development',
      slug: 'full-stack-web-development',
      description: 'Master React, Next.js, Node.js, TypeScript, and modern database engineering.',
      icon: Code,
      badge: 'Most Popular',
      courseCount: '12 Courses',
    },
    {
      name: 'Backend & Systems Engineering',
      title: 'Backend & Systems Engineering',
      slug: 'backend-engineering',
      description: 'Design distributed architectures, microservices, queuing, and resilient APIs.',
      icon: Database,
      badge: 'High Demand',
      courseCount: '8 Courses',
    },
    {
      name: 'Cloud Architecture & DevOps',
      title: 'Cloud Architecture & DevOps',
      slug: 'cloud-devops',
      description: 'Automate CI/CD pipelines, Docker, Kubernetes, AWS infrastructure, and telemetry.',
      icon: Cloud,
      badge: 'Advanced',
      courseCount: '6 Courses',
    },
  ];

  const highlights = [
    {
      icon: Video,
      title: 'Interactive Live Cohorts',
      description: 'Live interactive classes with real-time screen sharing, Q&A, and peer collaboration.',
    },
    {
      icon: Users,
      title: '1-on-1 Faculty Mentorship',
      description: 'Weekly scheduled code reviews and architectural guidance directly from senior engineers.',
    },
    {
      icon: Layers,
      title: 'Production Capstone Projects',
      description: 'Build portfolio-grade software applications solving real business challenges.',
    },
    {
      icon: Award,
      title: 'Verified Industry Credential',
      description: 'Earn a cryptographically verifiable certification recognized across premier tech employers.',
    },
  ];

  const learningPillars = [
    {
      icon: Users,
      title: 'Small Cohort Dynamic',
      description: 'Capped class sizes to ensure active discussions, personal code reviews, and direct mentor access.',
    },
    {
      icon: Terminal,
      title: 'Practical Hands-on Labs',
      description: 'Over 70% of curriculum time is invested in writing code, debugging test suites, and deploying systems.',
    },
    {
      icon: GitPullRequest,
      title: 'Code Reviews with Feedback',
      description: 'Workflows modeled on real software teams: Git branches, pull requests, and automated test checks.',
    },
    {
      icon: Cpu,
      title: 'Production Architectures',
      description: 'Learn system design, caching patterns, relational schemas, and asynchronous job processing.',
    },
  ];

  // Pick 4 curated FAQs for the homepage preview
  const previewFaqIds = ['adm-1', 'cur-1', 'live-1', 'cert-1', 'demo-1'];
  const previewFaqs = FAQ_ITEMS.filter((item) => previewFaqIds.includes(item.id)).slice(0, 5);

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Course Platform',
        description: 'Master Modern Engineering with Live Cohorts and Veteran Faculty Mentorship',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Softmaxs Solution LLP',
        url: siteUrl,
        description:
          'Provider of applied technical engineering education, live cohort learning, and verified credentials.',
      },
    ],
  };

  return (
    <div className="flex flex-col w-full">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-blue-50/50 via-white to-slate-50/50 dark:from-blue-950/20 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-800 text-xs sm:text-sm font-semibold dark:bg-blue-950/80 dark:border-blue-800 dark:text-blue-300 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Next Cohort Registration Now Open</span>
              <span className="hidden sm:inline text-blue-400">•</span>
              <span className="hidden sm:inline font-normal">Limited Seats</span>
            </div>

            {/* Main Heading (SEO Single H1) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Master Modern Engineering with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Live Cohort Batches
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Accelerate your engineering career with rigorous curricula, hands-on production code, and direct mentorship from veteran practitioners.
            </p>

            {/* Instant Search Bar */}
            <form action="/search" method="GET" className="max-w-xl mx-auto pt-2">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  placeholder="What do you want to learn? (e.g., Next.js, Node.js, Cloud)..."
                  className="w-full h-12 sm:h-14 pl-12 pr-28 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Button type="submit" size="sm" className="absolute right-2 font-semibold">
                  Search
                </Button>
              </div>
            </form>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/courses" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-500/20">
                  <span>Browse All Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/instructors" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Meet Our Faculty
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Transparent Curriculum
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Free Demo Sessions
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verifiable Certificates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* New Section 1: Impact and Learning Highlights */}
      <section className="py-10 bg-white dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">Live & Interactive</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Scheduled Real-Time Sessions</p>
            </div>
            <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Practical</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Production Capstone Projects</p>
            </div>
            <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">Direct Mentorship</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Veteran Faculty Guidance</p>
            </div>
            <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">Verifiable</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Cryptographic Certificates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                  Featured Programs
                </h2>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Trending Live Cohorts
                </p>
              </div>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <span>View All ({featuredCourses.length}+)</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights Grid */}
      <section className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
              Why Learn With Us
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Engineered for Real-World Competence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:shadow-lg hover:border-blue-200/80 transition-all dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                    {h.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {h.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Section 2: What You Can Expect / Our Learning Approach */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Transparent Standards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              What You Can Expect in Every Cohort
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Clear commitments on our curriculum quality, live batch experience, and student mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                Curated Learning Tracks
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Explore Programs by Specialization
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>View All Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(categories.length > 0 ? categories : defaultCategories).slice(0, 3).map((cat, idx) => {
              const defaultInfo = defaultCategories[idx] || defaultCategories[0];
              const Icon = defaultInfo.icon;
              const title = cat.name;
              const description = cat.description || defaultInfo.description;
              const slug = cat.slug;

              return (
                <Card key={slug} className="hover:shadow-lg transition-all border-slate-200/80 dark:border-slate-800 flex flex-col justify-between bg-white dark:bg-slate-900">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="accent">Active Cohorts</Badge>
                    </div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Explore Tracks</span>
                      <Link
                        href={`/courses?category=${slug}`}
                        className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Explore <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Section 3: FAQ Preview Accordion */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Clear answers regarding cohort structure, admissions, and certifications.
            </p>
          </div>

          <div className="space-y-4">
            {previewFaqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-5 transition-all open:border-blue-300 dark:open:border-blue-700 open:bg-white dark:open:bg-slate-900"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-slate-900 dark:text-white text-base">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link href="/faq">
              <Button variant="outline" size="md" className="gap-2">
                <span>View All Frequently Asked Questions</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Admissions CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Engineering Career?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Book a complimentary 1-on-1 demo session with our lead instructor or review curriculum details with an academic advisor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 shadow-xl">
                Explore All Courses
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold px-8">
                Request Callback
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
