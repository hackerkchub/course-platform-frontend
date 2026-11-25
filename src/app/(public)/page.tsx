import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Code,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Search,
  HelpCircle,
  Terminal,
  Cpu,
  Layers,
  Database,
  Laptop,
  GraduationCap,
  Lightbulb,
  Rocket,
  Compass,
  FileCode2,
  FolderGit2,
  Boxes,
  Workflow,
  Target,
  BrainCircuit,
  Bot,
  Zap,
} from 'lucide-react';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CourseCard as CourseCardType, Category } from '@/types/course';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { CourseCard } from '@/components/courses/course-card';
import { FaqAccordion } from '@/components/home/faq-accordion';
import { getSiteUrl } from '@/lib/site-url';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();

  return {
    title: 'Guidexa — Build Skills That Build Your Future | Modern Technology Education',
    description:
      'Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow with Guidexa.',
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: 'Guidexa — Build Skills That Build Your Future',
      description:
        'Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow with Guidexa.',
      url: siteUrl,
      type: 'website',
      siteName: 'Guidexa',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Guidexa — Build Skills That Build Your Future',
      description:
        'Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow with Guidexa.',
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

  // Recommended Programs (Content highlights specified in Section 5)
  const recommendedPrograms = [
    {
      id: 'prog-python-dsa',
      title: 'Python & Data Structures and Algorithms',
      description:
        'Develop programming logic, understand data structures, solve coding problems and improve your algorithmic thinking.',
      topics: [
        'Python',
        'Arrays',
        'Strings',
        'Searching',
        'Sorting',
        'Trees',
        'Graphs',
        'Recursion',
        'Dynamic Programming',
      ],
      icon: Terminal,
      badge: 'Logic & Problem Solving',
      category: 'Data Structures & Algorithms',
      slug: 'python-data-structures-algorithms',
      level: 'Beginner to Intermediate',
    },
    {
      id: 'prog-fullstack-mern',
      title: 'Full Stack Web Development — MERN',
      description:
        'Learn to build complete web applications from responsive frontend interfaces to backend APIs and databases.',
      topics: [
        'HTML',
        'CSS',
        'JavaScript',
        'React',
        'Node.js',
        'Express.js',
        'MySQL',
        'APIs',
        'Projects',
      ],
      icon: Layers,
      badge: 'Full Stack Mastery',
      category: 'Web Development',
      slug: 'full-stack-web-development-mern',
      level: 'All Levels',
    },
    {
      id: 'prog-generative-ai',
      title: 'Generative AI & LLM Applications',
      description:
        'Explore modern AI technologies and learn to build AI-powered applications using practical tools, models and APIs.',
      topics: [
        'AI Fundamentals',
        'Prompt Engineering',
        'LLMs',
        'AI APIs',
        'Vector Embeddings',
        'AI Applications',
      ],
      icon: BrainCircuit,
      badge: 'Next-Gen Tech',
      category: 'Artificial Intelligence',
      slug: 'generative-ai-applications',
      level: 'Intermediate',
    },
  ];

  // Section 4: Trust & Value Proposition Cards
  const valueCards = [
    {
      icon: Code,
      title: 'Learn by Doing',
      description:
        'Practice concepts through coding exercises, hands-on activities and guided learning.',
      accent: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300',
    },
    {
      icon: Boxes,
      title: 'Build Real Projects',
      description:
        'Turn your knowledge into practical projects that demonstrate your skills.',
      accent: 'from-emerald-600 to-teal-600',
      bgLight: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300',
    },
    {
      icon: Lightbulb,
      title: 'Understand Concepts',
      description:
        'Learn the logic behind technology instead of memorizing code.',
      accent: 'from-indigo-600 to-violet-600',
      bgLight: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300',
    },
    {
      icon: Rocket,
      title: 'Grow Your Career',
      description:
        'Build technical confidence and prepare yourself for future career opportunities.',
      accent: 'from-sky-600 to-blue-600',
      bgLight: 'bg-sky-50 text-sky-600 dark:bg-sky-950/80 dark:text-sky-300',
    },
  ];

  // Section 6: Step-by-Step Learning Experience
  const learningSteps = [
    {
      step: '01',
      title: 'Learn the Fundamentals',
      description: 'Understand concepts with structured lessons and clear explanations.',
      icon: BookOpenIcon,
    },
    {
      step: '02',
      title: 'Practice Your Skills',
      description: 'Apply concepts through exercises, coding challenges and guided practice.',
      icon: Terminal,
    },
    {
      step: '03',
      title: 'Build Projects',
      description: 'Create applications and solve practical problems using what you learn.',
      icon: FolderGit2,
    },
    {
      step: '04',
      title: 'Test Your Knowledge',
      description: 'Evaluate your understanding through assignments, quizzes and assessments.',
      icon: CheckCircle2,
    },
    {
      step: '05',
      title: 'Become a Builder',
      description: 'Develop the confidence to design, develop and solve problems independently.',
      icon: Compass,
    },
  ];

  // Section 7: Project-Based Learning Highlights
  const projectHighlights = [
    {
      title: 'Coding Challenges',
      description: 'Algorithmic problem-solving and logic drills to sharpen syntax and debugging skills.',
      icon: Code,
      tag: 'Foundation',
    },
    {
      title: 'Mini Projects',
      description: 'Component-level applications designed to solidify specific framework and API patterns.',
      icon: FileCode2,
      tag: 'Practice',
    },
    {
      title: 'Web Applications',
      description: 'End-to-end, dynamic client interfaces with clean routing and accessible component design.',
      icon: Laptop,
      tag: 'Frontend',
    },
    {
      title: 'API Integration',
      description: 'RESTful and streaming data exchange connecting clients with resilient backend services.',
      icon: Workflow,
      tag: 'Integration',
    },
    {
      title: 'Database-Driven Applications',
      description: 'Relational database schema modeling, ACID transactions, querying, and data persistence.',
      icon: Database,
      tag: 'Data',
    },
    {
      title: 'AI-Powered Applications',
      description: 'Integrating modern language models, prompt workflows, and AI endpoints into usable software.',
      icon: Bot,
      tag: 'Modern AI',
    },
    {
      title: 'Capstone Projects',
      description: 'Comprehensive, portfolio-ready systems solving real software engineering requirements.',
      icon: Rocket,
      tag: 'Portfolio',
    },
  ];

  // Section 8: Who Can Join Personas
  const targetPersonas = [
    {
      title: 'College Students',
      subtitle: 'Academic to Industry Bridge',
      description: 'Looking to develop practical technology skills beyond theoretical textbook curriculums.',
      icon: GraduationCap,
      badge: 'Students',
    },
    {
      title: 'Beginners & Career Changers',
      subtitle: 'Clear Starting Point',
      description: 'Starting their programming journey from scratch with structured, step-by-step guidance.',
      icon: Sparkles,
      badge: 'Beginners',
    },
    {
      title: 'Aspiring Software Developers',
      subtitle: 'Career Preparation',
      description: 'Preparing for software engineering interviews, coding tests, and technical roles.',
      icon: Target,
      badge: 'Career Focus',
    },
    {
      title: 'Working Developers',
      subtitle: 'Skill Expansion',
      description: 'Improving their technical knowledge, adopting modern stacks, and mastering systems design.',
      icon: Cpu,
      badge: 'Professionals',
    },
    {
      title: 'Independent Builders',
      subtitle: 'Hands-on Makers',
      description: 'Interested in building functional projects, shipping web products, and gaining practical experience.',
      icon: Zap,
      badge: 'Builders',
    },
  ];

  // Section 9: Career & Skill Development Pillars
  const careerPillars = [
    {
      title: 'Strong Programming Fundamentals',
      description:
        'Master core language mechanics, memory patterns, data structures, and algorithmic logic that stay relevant regardless of framework trends.',
      icon: Terminal,
    },
    {
      title: 'Problem-Solving Skills',
      description:
        'Learn how to break ambiguous technical requirements into manageable modules, reason about edge cases, and debug systematically.',
      icon: Lightbulb,
    },
    {
      title: 'Practical Development Experience',
      description:
        'Gain realistic experience writing clean code, structuring files, handling asynchronous execution, and managing application state.',
      icon: FileCode2,
    },
    {
      title: 'Project Portfolio',
      description:
        'Build and document substantive, working projects that demonstrate your ability to execute complete software solutions.',
      icon: FolderGit2,
    },
    {
      title: 'Technical Interview Preparation',
      description:
        'Develop the fluency and analytical confidence to discuss code architecture, data flow, complexity, and design tradeoffs.',
      icon: Target,
    },
    {
      title: 'Continuous Learning Mindset',
      description:
        'Cultivate the ability to explore documentation, learn new libraries independently, and adapt to evolving technology stacks.',
      icon: Compass,
    },
  ];

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Guidexa',
        description:
          'Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow with Guidexa.',
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
        name: 'Guidexa',
        url: siteUrl,
        description:
          'Guidexa is a learning platform focused on helping students and aspiring professionals develop practical technology skills through structured learning, hands-on practice and project-based education.',
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

      {/* ================================================================= */}
      {/* SECTION 3: HERO SECTION                                          */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0B1120] text-white border-b border-slate-800">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-24 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-24 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Top Highlights Banner */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-blue-300 text-xs sm:text-sm font-semibold shadow-inner">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Empowering the Next Generation of Builders</span>
              </div>

              {/* Primary Heading */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Build Skills That{' '}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  Build Your Future.
                </span>
              </h1>

              {/* Supporting Content */}
              <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow.
              </p>

              {/* Supporting Highlights (Pill Badges) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/70 border border-blue-800/70 text-blue-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  Practical Learning
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800/70 text-indigo-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Industry-Relevant Skills
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/70 text-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Project-Based Approach
                </span>
              </div>

              {/* Instant Search Bar */}
              <form action="/search" method="GET" className="max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search by skill or topic (e.g. Python, React, APIs, Cloud)..."
                    className="w-full h-12 sm:h-14 pl-12 pr-28 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/courses" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                  >
                    <span>Explore Courses</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/courses" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto gap-2 border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base px-6 py-6 rounded-xl transition-all"
                  >
                    <span>Start Your Learning Journey</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Footer Signals */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Structured Curricula
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Verifiable Certificates
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Real Project Labs
                </span>
              </div>
            </div>

            {/* Right Visual Column (5 cols) — High-Tech IDE / Terminal Visual Element */}
            <div className="lg:col-span-5 w-full">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                {/* Window Top Controls */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                      guidexa-learning-path.ts
                    </span>
                  </div>
                </div>

                {/* Code Window */}
                <pre className="font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto p-2">
                  <code>
                    <span className="text-purple-400">interface</span>{' '}
                    <span className="text-sky-300">GuidexaLearner</span> {'{\n'}
                    {'  '}skills: <span className="text-amber-300">&apos;in-demand&apos;</span>;{'\n'}
                    {'  '}approach: <span className="text-amber-300">&apos;project-based&apos;</span>;{'\n'}
                    {'  '}understanding: <span className="text-amber-300">&apos;conceptual&apos;</span>;{'\n'}
                    {'  '}portfolio: <span className="text-blue-400">RealWorldProject</span>[];{'\n'}
                    {'}\n\n'}
                    <span className="text-purple-400">async function</span>{' '}
                    <span className="text-emerald-400">buildFuture</span>(
                    <span className="text-orange-300">learner</span>:{' '}
                    <span className="text-sky-300">GuidexaLearner</span>
                    ) {'{\n'}
                    {'  '}<span className="text-slate-500">{`// 1. Master Fundamentals`}</span>{'\n'}
                    {'  '}<span className="text-purple-400">await</span> learner.learnCoreConcepts();{'\n\n'}
                    {'  '}<span className="text-slate-500">{`// 2. Build Working Projects`}</span>{'\n'}
                    {'  '}<span className="text-purple-400">await</span> learner.buildPracticalApplications();{'\n\n'}
                    {'  '}<span className="text-purple-400">return</span> {'{\n'}
                    {'    '}confidence: <span className="text-cyan-300">true</span>,{'\n'}
                    {'    '}readyToBuild: <span className="text-cyan-300">true</span>,{'\n'}
                    {'  '}{'};\n'}
                    {'}'}
                  </code>
                </pre>

                {/* Floating Metric Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Learn By Doing</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Exercises & mini-projects</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Real Projects</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Production-ready code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 4: TRUST & VALUE PROPOSITION                             */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 px-3 py-1 font-semibold text-xs">
              Value Proposition
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              More Than Courses. A Path to Real Skills.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              At Guidexa, learning goes beyond watching videos and completing lessons. We focus on helping learners understand concepts, apply knowledge through practical work, solve real problems and build the confidence to create independently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group relative p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700/80 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${card.bgLight}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 5: EXPLORE OUR PROGRAMS                                   */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 px-3 py-1 font-semibold text-xs">
                Featured Programs
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Learn Skills That Matter.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Explore learning programs designed to help you build technical knowledge, practical skills and confidence.
              </p>
              {categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-500">Popular Tracks:</span>
                  {categories.slice(0, 5).map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      href={`/courses?category=${cat.slug}`}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/courses">
              <Button variant="outline" className="font-semibold gap-2 border-slate-300 dark:border-slate-700">
                <span>Explore All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Dynamic Courses (If Available) */}
          {featuredCourses.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.slice(0, 6).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          ) : (
            /* Recommended Featured Programs (Section 5 Content Specifications) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedPrograms.map((prog) => {
                const Icon = prog.icon;
                return (
                  <Card
                    key={prog.id}
                    className="flex flex-col justify-between border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 p-6 space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="accent" className="text-xs">
                          {prog.badge}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {prog.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {prog.description}
                      </p>

                      {/* Topics Chips */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Key Topics
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {prog.topics.map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{prog.level}</span>
                      <Link href="/courses">
                        <Button size="sm" variant="primary" className="rounded-xl px-4 font-semibold">
                          View Program
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Explore All CTA Bar */}
          <div className="text-center pt-4">
            <Link href="/courses">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 shadow-md">
                <span>Explore All Programs & Batches</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 6: LEARNING EXPERIENCE SECTION                            */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 px-3 py-1 font-semibold text-xs">
              Step-by-Step Methodology
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Better Way to Learn Technology.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              We believe effective learning happens when concepts are understood, practiced and applied.
            </p>
          </div>

          {/* Sequential 5-Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {learningSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                        {step.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {idx < 4 && (
                    <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700 pointer-events-none">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 7: PROJECT-BASED LEARNING SECTION                         */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold">
              <Boxes className="w-3.5 h-3.5 text-blue-400" />
              <span>Hands-on Engineering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Don&apos;t Just Learn It. Build It.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              The best way to understand technology is to use it. Apply what you learn through practical exercises, mini-projects and complete applications.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {projectHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Final Highlight Card: Capstone Callout */}
            <div className="p-5 sm:p-6 rounded-2xl border border-blue-800 bg-gradient-to-br from-blue-950 to-indigo-950 text-white flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Real Competence
                </span>
                <h3 className="text-lg font-bold">Practical Portfolio</h3>
                <p className="text-xs text-blue-200/90 leading-relaxed">
                  Every project you complete demonstrates your code quality, architecture choices, and independent problem-solving skills.
                </p>
              </div>

              <Link href="/courses">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 font-semibold text-white">
                  Start Building Your Skills
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 8: WHO CAN JOIN SECTION                                   */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 px-3 py-1 font-semibold text-xs">
              Audience & Growth
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Start Where You Are. Grow Where You Want to Be.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Guidexa programs are designed to support learners with different backgrounds, experience levels, and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetPersonas.map((persona) => {
              const Icon = persona.icon;
              return (
                <div
                  key={persona.title}
                  className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="default" className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {persona.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {persona.title}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {persona.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {persona.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Consultation Card */}
            <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <Badge variant="accent" className="text-xs">
                  Not Sure Where to Start?
                </Badge>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Explore Learning Tracks
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Browse our course prerequisites or speak with an academic counselor to find the curriculum that best matches your current technical background.
                </p>
              </div>

              <Link href="/courses">
                <Button size="sm" variant="primary" className="w-full font-semibold">
                  Browse All Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 9: CAREER & SKILL DEVELOPMENT SECTION                     */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 px-3 py-1 font-semibold text-xs">
              Professional Preparedness
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Prepare Yourself for the Opportunities Ahead.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Technical skills, problem-solving ability and practical experience are valuable parts of building a career in technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 10: ABOUT GUIDEXA SECTION                                 */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 px-3 py-1 font-semibold text-xs">
                About Guidexa
              </Badge>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Empowering Learners Through Technology.
              </h2>

              <div className="space-y-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Guidexa is a learning platform focused on helping students and aspiring professionals develop practical technology skills through structured learning, hands-on practice and project-based education.
                </p>
                <p>
                  Our goal is to make learning more meaningful by connecting technical concepts with real-world applications, encouraging learners to explore, experiment, create and continuously improve.
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  We believe every learner has the potential to build something meaningful with the right knowledge, guidance and practice.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/about">
                  <Button variant="outline" className="font-semibold gap-2 border-slate-300 dark:border-slate-700">
                    <span>Learn More About Our Mission</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="primary" className="font-semibold">
                    Explore Our Courses
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 w-full">
              <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      Guid<span className="text-blue-600">exa</span> Principles
                    </h3>
                    <p className="text-xs text-slate-500">Core Educational Tenets</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Concept Clarity Over Syntax Memorization
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Focusing on understanding how algorithms, systems, and APIs operate under the hood.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Learning by Creating
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Replacing passive video watching with active, hands-on building and debugging.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Independent Problem Solving
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Equipping students with the self-reliance to read documentation, debug issues, and ship software.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 11: FAQ ACCORDION SECTION                                */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Transparent Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Find answers to common questions about courses, hands-on projects, materials, progress tracking, and certificates.
            </p>
          </div>

          {/* Interactive Client FAQ Accordion */}
          <FaqAccordion />

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

      {/* ================================================================= */}
      {/* SECTION 12: FINAL CTA SECTION                                    */}
      {/* ================================================================= */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Take the Next Step</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Your Future Won&apos;t Build Itself.
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Start learning. Keep practicing. Build real skills. Take the next step toward your future in technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/courses" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-6 rounded-xl shadow-xl shadow-blue-600/30 text-base"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/courses" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-xl text-base"
              >
                Start Your Learning Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple Helper Icon component for Section 6 Step 1
function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
