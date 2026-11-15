import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { InstructorProfile } from '@/types/course';
import { ApiResponse } from '@/types/api';
import { getSiteUrl } from '@/lib/site-url';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  GitPullRequest,
  Users2,
  Layers,
  Compass,
  Cpu,
  ShieldCheck,
  MessageSquare,
  BookOpen,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/about`;

  return {
    title: 'About Our Pedagogy & Mission | Course Platform',
    description:
      'Discover Softmaxs Solution LLP’s practical engineering education approach: live interactive cohorts, hands-on production code, and veteran faculty mentorship.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'About Course Platform | Softmaxs Solution LLP',
      description:
        'Practical engineering education engineered for production: live cohort training, comprehensive code reviews, and structured curriculum.',
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function AboutPage() {
  const siteUrl = getSiteUrl();

  let instructors: InstructorProfile[] = [];
  try {
    const res = await serverFetch<ApiResponse<InstructorProfile[]>>(
      API_ENDPOINTS.instructors.list,
      { revalidate: 3600 }
    );
    const raw = res?.data;
    instructors = Array.isArray(raw) ? raw : [];
  } catch {
    instructors = [];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Course Platform – Softmaxs Solution LLP',
    description:
      'Softmaxs Solution LLP delivers live online, practical engineering education focused on hands-on project mastery and veteran mentorship.',
    url: `${siteUrl}/about`,
    publisher: {
      '@type': 'Organization',
      name: 'Softmaxs Solution LLP',
      url: siteUrl,
    },
    mainEntity: {
      '@type': 'EducationalOrganization',
      name: 'Course Platform',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Softmaxs Solution LLP',
      },
      description:
        'An education platform engineered for modern software engineers, providing live cohorts, practical coding, and structured learning tracks.',
    },
  };

  const corePillars = [
    {
      icon: Code2,
      title: 'Production-Grade Projects',
      description:
        'We replace basic tutorial tasks with real architectural problems. Learners design, implement, and deploy production systems addressing scale, latency, and fault tolerance.',
    },
    {
      icon: Users2,
      title: 'Live Interactive Cohorts',
      description:
        'Live sessions with active peer engagement and immediate question resolution. Our small-batch format ensures every learner receives individual attention.',
    },
    {
      icon: GitPullRequest,
      title: 'Thorough Code Reviews',
      description:
        'Learning happens in pull requests. Every major capstone undergoes detailed architectural and stylistic code reviews aligned with real software development standards.',
    },
    {
      icon: Terminal,
      title: 'Modern Tooling & Environments',
      description:
        'Work with modern development ecosystems, including Docker, distributed data pipelines, cloud-native deployments, and modern continuous integration workflows.',
    },
  ];

  const lifecycleStages = [
    {
      step: '01',
      title: 'Structured Onboarding & Track Alignment',
      description:
        'Understand your foundational skills and choose a focused learning track aligned with modern industry engineering requirements.',
    },
    {
      step: '02',
      title: 'Live Interactive Lectures',
      description:
        'Attend scheduled live sessions focused on architecture, design patterns, core system mechanics, and real-time debugging.',
    },
    {
      step: '03',
      title: 'Practical Labs & Code Reviews',
      description:
        'Build production-grade applications with git-based workflows. Receive comprehensive instructor feedback on performance and clean architecture.',
    },
    {
      step: '04',
      title: 'Verifiable Certification & Mentorship',
      description:
        'Complete end-of-course capstones, demonstrate production competence, and earn a verifiable cryptographic certificate backed by Softmaxs Solution LLP.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Softmaxs Solution LLP</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Practical Engineering Education Built for Real-World Systems
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              We bridge the divide between theoretical computer science and enterprise-grade software delivery through live cohorts, hands-on production code, and veteran mentorship.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/courses">
                <Button size="lg" variant="primary" className="gap-2 shadow-md shadow-blue-500/10">
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Programs</span>
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Speak with Admissions</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Company Introduction & Mission */}
      <section className="py-16 md:py-20 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Compass className="w-4 h-4" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Empowering Developers with Applied Technical Mastery
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Founded under Softmaxs Solution LLP, Course Platform was conceived with a straightforward purpose: to train software developers through genuine production rigor. Too often, conventional curricula leave students with shallow code snippets that fail to survive modern production constraints.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Our mission is to establish a rigorous learning ecosystem where aspiring and practicing developers acquire deep mental models, write idiomatic code, and graduate with the confidence to contribute to complex technical codebases from day one.
              </p>
              <div className="pt-2">
                <Link href="/instructors">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    <span>Meet the engineering mentors leading this mission</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Architectural Focus</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deep immersion into system architecture, state management, security primitives, and data consistency.
                </p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Production Testing</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Unit testing, integration testing, and defensive programming embedded into every course module.
                </p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Modular Tracks</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Step-by-step progressive pathways from fundamental concepts to specialized enterprise competencies.
                </p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Verifiable Output</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tamper-evident completion certificates validating genuine capstone project submission and evaluation.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Learning Philosophy */}
      <section className="py-16 md:py-20 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Our Core Pedagogical Philosophy
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Four fundamental commitments that define every course, batch, and interactive workshop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {corePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex flex-col justify-between space-y-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* The 4-Stage Learning Experience Lifecycle */}
      <section className="py-16 md:py-20 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <span>Lifecycle Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              The Learning Journey: From Enrollment to Mastery
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              A structured lifecycle designed to build sustained engineering capability and practical confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifecycleStages.map((stage) => (
              <div
                key={stage.step}
                className="relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-3xl font-black text-blue-600/30 dark:text-blue-400/20">
                    {stage.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Highlight Section */}
      <section className="py-16 md:py-20 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Practitioners Who Teach What They Ship
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
                Our faculty members bring hands-on engineering experience from production systems directly into the classroom.
              </p>
            </div>
            <Link href="/instructors">
              <Button variant="outline" className="gap-2">
                <span>View Faculty Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {instructors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instructors.slice(0, 3).map((instructor) => (
                <Card
                  key={instructor.id}
                  className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-4"
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {instructor.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {instructor.designation || 'Engineering Mentor'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {instructor.bio || 'Experienced engineering leader dedicated to practical software education.'}
                    </p>
                  </div>
                  <Link
                    href={`/instructors/${instructor.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    <span>Read profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Vetted Engineering Faculty
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                All Course Platform cohorts are taught directly by experienced software architects and engineers. Explore our verified faculty registry to view biographies, areas of specialization, and active courses.
              </p>
              <div>
                <Link href="/instructors">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <span>Explore Instructor Profiles</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Admissions Call to Action */}
      <section className="pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-14 shadow-xl">
            <div className="max-w-2xl space-y-6">
              <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                Ready to Level Up?
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Start Your Engineering Journey with Softmaxs Solution LLP
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Explore our upcoming cohort schedules, view detailed course syllabi, or speak directly with our admissions desk to find the right learning track.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/courses">
                  <Button size="lg" variant="primary" className="gap-2">
                    <span>Explore All Courses</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <span>Contact Admissions Desk</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
