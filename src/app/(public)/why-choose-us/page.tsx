import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site-url';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Code2,
  FolderGit2,
  Target,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Compass,
  BookOpen,
  Laptop,
  Check,
  Video,
  FileText,
  HelpCircle,
  Users2,
  Calendar,
  Award,
  Terminal,
  Database,
  Brain,
  ShieldCheck,
  CheckSquare,
  GraduationCap,
  Briefcase,
  UserCheck,
  Search,
  Lock,
  LucideIcon,
} from 'lucide-react';

const siteUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const canonicalUrl = `${siteUrl}/why-choose-us`;

  return {
    title: 'Why Choose Guidexa — Structured Learning & Practical Tech Skills',
    description:
      'Discover why learners choose Guidexa: structured curricula, real-world project assignments, measurable learning progress, instructor support, and honest tech education.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Why Choose Guidexa — Structured Learning & Practical Tech Skills',
      description:
        'Discover why learners choose Guidexa: structured curricula, hands-on project assignments, continuous progress tracking, and honest tech education.',
      url: canonicalUrl,
      siteName: 'Guidexa',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Why Choose Guidexa — Structured Learning & Practical Tech Skills',
      description:
        'Discover why learners choose Guidexa: structured curricula, hands-on project assignments, continuous progress tracking, and honest tech education.',
    },
  };
}

export default function WhyChooseUsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Why Choose Guidexa',
    description:
      'Learn about Guidexa educational philosophy, structured curricula, practical project evaluations, and transparent student-first learning ecosystem.',
    url: `${siteUrl}/why-choose-us`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Guidexa',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Softmaxs Solution LLP',
      url: 'https://softmaxs.com',
    },
  };

  // 1. Core Differentiators
  const differentiators: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    badge: string;
  }> = [
    {
      icon: Layers,
      title: 'Structured Learning',
      badge: 'Pedagogy',
      description:
        'A carefully planned curriculum that guides learners from basic principles to advanced implementation without confusing leaps or fragmented tutorials.',
    },
    {
      icon: Code2,
      title: 'Practical Application',
      badge: 'Hands-on',
      description:
        'Concepts are reinforced through runnable code demonstrations, interactive exercises, and guided architectural walkthroughs.',
    },
    {
      icon: FolderGit2,
      title: 'Project-Based Learning',
      badge: 'Real Systems',
      description:
        'Learners build real-world software applications that reflect industry engineering standards, design patterns, and deployment workflows.',
    },
    {
      icon: Target,
      title: 'Skill-Focused Programs',
      badge: 'Curriculum',
      description:
        'Courses are specifically designed around competencies needed in modern software development rather than theoretical memorization.',
    },
    {
      icon: TrendingUp,
      title: 'Learning Progress',
      badge: 'Telemetry',
      description:
        'Clear visibility into lesson completions, quiz evaluations, project milestones, and overall mastery across the curriculum.',
    },
    {
      icon: RotateCcw,
      title: 'Continuous Improvement',
      badge: 'Feedback',
      description:
        'Constructive instructor evaluations, structured doubt resolution forums, and live learning sessions ensure steady, confident growth.',
    },
  ];

  // 2. Learner Journey (5 Steps)
  const journeySteps: Array<{
    step: string;
    title: string;
    description: string;
    icon: LucideIcon;
    highlight: string;
  }> = [
    {
      step: '01',
      title: 'Explore',
      description:
        'Browse comprehensive syllabi, inspect prerequisites, and choose a curriculum aligned with your goals.',
      icon: Compass,
      highlight: 'Transparent Syllabi',
    },
    {
      step: '02',
      title: 'Learn',
      description:
        'Absorb core concepts through high-definition video walkthroughs and companion reading references.',
      icon: BookOpen,
      highlight: 'Video & Reading Notes',
    },
    {
      step: '03',
      title: 'Practice',
      description:
        'Reinforce understanding immediately with module self-checks, quizzes, and targeted code exercises.',
      icon: Laptop,
      highlight: 'Knowledge Checks',
    },
    {
      step: '04',
      title: 'Build',
      description:
        'Develop end-to-end projects that replicate actual software engineering constraints and production patterns.',
      icon: FolderGit2,
      highlight: 'Production Projects',
    },
    {
      step: '05',
      title: 'Improve',
      description:
        'Receive instructor feedback, clarify doubts on discussion boards, and verify your achieved mastery.',
      icon: Award,
      highlight: 'Evaluated Credentials',
    },
  ];

  // 3. Practical Learning Experience
  const learningExperience: Array<{
    title: string;
    description: string;
    points: string[];
    icon: LucideIcon;
  }> = [
    {
      title: 'Video & Reading Modules',
      description:
        'Every topic is presented with clear visual instruction and downloadable reading notes for balanced learning.',
      points: [
        'High-clarity video walkthroughs with step-by-step code writing',
        'In-depth reading notes and code snippets for quick reference',
        'Self-paced navigation with automated resume-state tracking',
      ],
      icon: Video,
    },
    {
      title: 'Structured Curriculum',
      description:
        'Carefully calibrated difficulty curves designed so beginners and intermediate engineers can advance systematically.',
      points: [
        'Modular learning units organized by progressive difficulty',
        'Clear estimated learning hours and prerequisite milestones',
        'Defined outcome metrics for each course chapter',
      ],
      icon: Layers,
    },
    {
      title: 'Quizzes & Self-Checks',
      description:
        'Frequent knowledge assessments to validate concept retention before moving into complex implementation.',
      points: [
        'Immediate feedback on multiple-choice and conceptual checks',
        'Detailed answer explanations highlighting core logic',
        'Unlimited review attempts for self-assessment',
      ],
      icon: CheckSquare,
    },
    {
      title: 'Project Assignments & Evaluations',
      description:
        'Real-world assignments where code is submitted, reviewed, and graded against clear rubrics.',
      points: [
        'Realistic engineering project briefs with technical constraints',
        'Detailed instructor reviews with actionable code feedback',
        'Resubmission workflows to address reviewer recommendations',
      ],
      icon: FolderGit2,
    },
    {
      title: 'Doubt Management & Discussions',
      description:
        'Direct channels to discuss tricky concepts, debug code hurdles, and collaborate with instructors.',
      points: [
        'Lesson-level discussion threads for contextual troubleshooting',
        'Instructor-verified answers marked clearly for reference',
        'Searchable question archive across course cohorts',
      ],
      icon: HelpCircle,
    },
    {
      title: 'Live Mentorship Sessions',
      description:
        'Interactive live classes and workshop sessions designed for interactive Q&A and deeper explorations.',
      points: [
        'Scheduled live sessions led by experienced practitioners',
        'Real-time architectural discussions and live code debugging',
        'Session replays and notes archived for review',
      ],
      icon: Users2,
    },
  ];

  // 4. Technology Learning Domains
  const learningDomains: Array<{
    title: string;
    description: string;
    categoryParam: string;
    icon: LucideIcon;
    topics: string[];
  }> = [
    {
      title: 'Computer Science & Algorithms',
      description:
        'Build rock-solid problem-solving foundations through data structures, algorithmic complexity, and system fundamentals.',
      categoryParam: 'computer-science',
      icon: Terminal,
      topics: ['Arrays, Trees & Graphs', 'Dynamic Programming', 'Complexity Analysis', 'Memory & Pointers'],
    },
    {
      title: 'Full Stack Web Development',
      description:
        'Engineer modern web applications from responsive interfaces to robust API backends and persistent databases.',
      categoryParam: 'web-development',
      icon: Code2,
      topics: ['React & Next.js', 'Node.js & Express', 'REST & GraphQL APIs', 'Relational Schemas'],
    },
    {
      title: 'Cloud & Backend Engineering',
      description:
        'Architect scalable services, implement secure authentication, and leverage distributed microservices.',
      categoryParam: 'backend-systems',
      icon: Database,
      topics: ['Microservice Patterns', 'Docker & Containerization', 'Redis Caching', 'PostgreSQL & MySQL'],
    },
    {
      title: 'Data Science & Applied AI',
      description:
        'Harness the power of data pipelines, statistical modeling, and generative AI application integrations.',
      categoryParam: 'data-science-ai',
      icon: Brain,
      topics: ['Data Wrangling & Analysis', 'Machine Learning Models', 'LLM Integration', 'Prompt Engineering'],
    },
  ];

  // 5. Learner Profiles
  const learnerProfiles: Array<{
    title: string;
    subtitle: string;
    description: string;
    benefit: string;
    icon: LucideIcon;
  }> = [
    {
      title: 'College Students & Graduates',
      subtitle: 'Bridging the Campus-to-Industry Divide',
      description:
        'Designed for students who want to build real software projects, gain practical programming confidence, and prepare for technical interviews with strong fundamental knowledge.',
      benefit: 'Build a tangible portfolio of deployed applications.',
      icon: GraduationCap,
    },
    {
      title: 'Beginners & Career Switchers',
      subtitle: 'Structured Step-by-Step Foundations',
      description:
        'Ideal for individuals transitioning into technology who need structured guidance, clear terminology, and an organized pathway that avoids information overload.',
      benefit: 'Learn without skipping critical foundational steps.',
      icon: UserCheck,
    },
    {
      title: 'Working Software Engineers',
      subtitle: 'Targeted Skill Upskilling',
      description:
        'Built for professional developers looking to expand into full-stack architecture, backend distributed systems, or generative AI without wasting time on fluff.',
      benefit: 'Master modern engineering patterns efficiently.',
      icon: Briefcase,
    },
    {
      title: 'Technology Enthusiasts & Builders',
      subtitle: 'Practical Execution & Product Creation',
      description:
        'For builders who want to bring ideas to life by learning how to architect, write, test, and deploy resilient digital products from start to finish.',
      benefit: 'Gain independence in building real software systems.',
      icon: Sparkles,
    },
  ];

  // 6. Platform Capabilities (8 items)
  const platformFeatures: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      title: 'HD Video Streaming',
      description: 'Buffer-free video delivery with playback speed controls, quality options, and resume capability.',
      icon: Video,
    },
    {
      title: 'Comprehensive Reading Notes',
      description: 'Structured technical documentation and syntax summaries accompanying every major video lesson.',
      icon: FileText,
    },
    {
      title: 'Modular Quizzes',
      description: 'Interactive concept checks to evaluate and confirm understanding before progressing.',
      icon: CheckSquare,
    },
    {
      title: 'Instructor-Evaluated Projects',
      description: 'Submissions reviewed directly by instructors with detailed line-by-line feedback.',
      icon: FolderGit2,
    },
    {
      title: 'Cohort Doubt Discussions',
      description: 'Contextual discussion forums tied directly to individual lessons and assignments.',
      icon: HelpCircle,
    },
    {
      title: 'Live Mentorship Classes',
      description: 'Interactive sessions, code reviews, and topic deep-dives scheduled with instructors.',
      icon: Calendar,
    },
    {
      title: 'Progress Telemetry',
      description: 'Accurate tracking of lesson completions, milestone progress, and skill development.',
      icon: TrendingUp,
    },
    {
      title: 'Verifiable Certificates',
      description: 'Tamper-resistant digital certificates with unique verification IDs awarded upon course completion.',
      icon: Award,
    },
  ];

  // 7. Transparent Learning Pillars
  const transparencyPillars: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      title: 'Full Curriculum Transparency',
      description:
        'Explore the full syllabus, lesson breakdown, and expected learning outcomes before making any enrollment commitment.',
      icon: Search,
    },
    {
      title: 'Upfront & Honest Pricing',
      description:
        'Clear, straightforward course pricing without hidden fees, automatic renewals, or deceptive marketing tactics.',
      icon: Lock,
    },
    {
      title: 'Explicit Prerequisites',
      description:
        'Every course states required baseline skills honestly so you choose programs you are ready to succeed in.',
      icon: CheckCircle2,
    },
    {
      title: 'Merit-Based Credentials',
      description:
        'Certificates reflect genuine completion of required coursework and evaluated projects—not mere attendance.',
      icon: Award,
    },
    {
      title: 'Realistic Learning Outcomes',
      description:
        'We believe in honest skill development through disciplined practice, avoiding unrealistic shortcuts or exaggerated promises.',
      icon: Target,
    },
    {
      title: 'Dedicated Academic Support',
      description:
        'Continuous instructor availability through structured forums and scheduled live sessions throughout your course.',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* =========================================================
            SECTION 1: HERO
        ========================================================= */}
        <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Why Choose Guidexa</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
              More Than Learning.{' '}
              <span className="text-blue-600 dark:text-blue-400">
                A Path Towards Practical Skills.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Guidexa offers structured technology education built around clarity, real code execution,
              rigorous project evaluations, and measurable learning progression. Learn concepts thoroughly
              and build the confidence to create real software.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/courses">
                <Button size="lg" className="rounded-xl px-7 text-base shadow-sm font-semibold">
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#approach">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-7 text-base border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <span>Discover Our Approach</span>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-14 pt-10 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Structured Pedagogy</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    No random videos or incomplete tutorials.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Project Evaluations</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluated code submissions with detailed rubrics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Verified Mastery</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Certificates awarded on completed milestones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: CORE DIFFERENTIATORS (6 CARDS)
        ========================================================= */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                What Sets Us Apart
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Designed for Deep Understanding, Not Just Passive Watching
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                Most online platforms focus solely on delivering video hours. Guidexa focuses on whether
                you can actually design, implement, and debug working software systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {differentiators.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={idx}
                    className="p-8 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: LEARNER JOURNEY (5-STEP TIMELINE)
        ========================================================= */}
        <section id="approach" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                The Pedagogy
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                The 5-Step Guidexa Learning Framework
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                A predictable, proven progression that transforms raw concepts into practical engineering capabilities.
              </p>
            </div>

            {/* Desktop Horizontal / Mobile Vertical Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {journeySteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                        STEP {step.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                      {step.description}
                    </p>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{step.highlight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 4: PRACTICAL LEARNING EXPERIENCE (6 BLOCKS)
        ========================================================= */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                Hands-on Delivery
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                How You Actually Learn on Guidexa
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                A multi-dimensional learning environment combining focused instruction, detailed documentation,
                hands-on assignments, and dedicated instructor support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {learningExperience.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={idx}
                    className="p-8 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {item.description}
                      </p>
                    </div>

                    <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {item.points.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: TECHNOLOGY LEARNING DOMAINS
        ========================================================= */}
        <section className="py-20 md:py-28 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                  Technology Curricula
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Master Disciplines That Matter
                </h2>
                <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                  Each curriculum is designed around modern production practices, tested architectural paradigms,
                  and authentic industry toolchains.
                </p>
              </div>

              <Link href="/courses">
                <Button variant="outline" className="rounded-xl self-start md:self-auto font-semibold">
                  <span>Browse Full Catalog</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {learningDomains.map((domain, idx) => {
                const Icon = domain.icon;
                return (
                  <Card
                    key={idx}
                    className="p-8 border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {domain.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {domain.description}
                      </p>

                      <div className="mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                          Key Focus Areas:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {domain.topics.map((topic, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-xs px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800">
                      <Link
                        href={`/courses?category=${domain.categoryParam}`}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                      >
                        <span>Explore {domain.title} Courses</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 6: LEARNER PROFILES
        ========================================================= */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                Audience Fit
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Who Is Guidexa Built For?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                Whether you are stepping into coding for the first time or leveling up your existing engineering
                toolkit, Guidexa provides the structured path to succeed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {learnerProfiles.map((profile, idx) => {
                const Icon = profile.icon;
                return (
                  <Card
                    key={idx}
                    className="p-8 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {profile.title}
                          </h3>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {profile.subtitle}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {profile.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{profile.benefit}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 7: PLATFORM CAPABILITIES (8 ITEMS)
        ========================================================= */}
        <section className="py-20 md:py-28 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                Platform Ecosystem
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Everything You Need to Succeed in One Place
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                From self-paced video streaming and rich documentation to evaluated assignments and cohort discussions,
                every tool is built to support your learning progress.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 8: TRANSPARENT LEARNING PILLARS (6 ITEMS)
        ========================================================= */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                Honest Education
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Our Commitment to Transparent Education
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                We believe trust is earned through clarity, verified requirements, upfront communication,
                and zero gimmicks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {transparencyPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <Card
                    key={idx}
                    className="p-8 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 9: FINAL CONVERSION CTA
        ========================================================= */}
        <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
              Start Your Learning Journey
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Find the Right Learning Path for Your Goals.
            </h2>

            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Explore our structured technology courses, inspect the syllabi, build real projects,
              and master practical skills with confidence.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl px-8 text-base font-bold shadow-md"
                >
                  <span>Browse All Courses</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/instructors">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/40 text-white hover:bg-white/10 rounded-xl px-8 text-base font-semibold"
                >
                  <span>View Faculty & Instructors</span>
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-xs text-blue-200">
              Guidexa is operated under Softmaxs Solution LLP • Built for Serious Learners
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
