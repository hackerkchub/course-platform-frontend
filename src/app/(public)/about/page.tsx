import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site-url';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  ArrowRight,
  Code2,
  Terminal,
  Layers,
  Cpu,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Video,
  FileText,
  Award,
  Users2,
  HelpCircle,
  TrendingUp,
  Brain,
  Building2,
  Target,
  Eye,
  Check,
  Lightbulb,
  LucideIcon,
} from 'lucide-react';

const siteUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const canonicalUrl = `${siteUrl}/about`;

  return {
    title: 'About Guidexa — Learn With Purpose. Build With Confidence.',
    description:
      'Guidexa is a learning platform developed under Softmaxs Solution LLP, focused on helping individuals build practical skills and deep technical knowledge through structured education.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'About Guidexa — Learn With Purpose. Build With Confidence.',
      description:
        'Guidexa is a learning platform focused on helping individuals develop technical knowledge, strengthen practical skills and move forward through structured learning and hands-on experience.',
      url: canonicalUrl,
      siteName: 'Guidexa',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About Guidexa — Learn With Purpose. Build With Confidence.',
      description:
        'Guidexa is a learning platform focused on helping individuals develop technical knowledge, strengthen practical skills and move forward through structured learning and hands-on experience.',
    },
  };
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Guidexa',
    description:
      'Guidexa is a learning platform developed under Softmaxs Solution LLP, focused on delivering structured technology education and practical learning experiences.',
    url: `${siteUrl}/about`,
    publisher: {
      '@type': 'Organization',
      name: 'Softmaxs Solution LLP',
      url: 'https://softmaxs.com',
    },
    mainEntity: {
      '@type': 'EducationalOrganization',
      name: 'Guidexa',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Softmaxs Solution LLP',
      },
      description:
        'A modern learning platform focused on helping individuals build practical skills and deep technical knowledge through structured education.',
    },
  };

  const learningPhilosophy: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
  }> = [
    {
      icon: Layers,
      title: 'Learn with Structure',
      description:
        'Understand concepts through a clear, organized and incremental learning journey without confusing leaps or missed fundamentals.',
    },
    {
      icon: Terminal,
      title: 'Practice Regularly',
      description:
        'Strengthen understanding through deliberate exercises, coding labs and hands-on problem-solving activities.',
    },
    {
      icon: Code2,
      title: 'Build Real Projects',
      description:
        'Apply technical knowledge by developing meaningful, portfolio-ready applications designed for real-world scenarios.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Continuously',
      description:
        'Improve through regular feedback, comprehensive evaluation milestones and consistent, measurable skill growth.',
    },
  ];

  const learningSteps = [
    {
      step: '01',
      title: 'Understand',
      label: 'Core Fundamentals',
      description:
        'Learn foundational principles, syntax mechanics, and architectural concepts through structured, in-depth curriculum modules.',
    },
    {
      step: '02',
      title: 'Practice',
      label: 'Applied Exercises',
      description:
        'Reinforce theoretical concepts through interactive coding challenges, targeted labs, and guided implementation exercises.',
    },
    {
      step: '03',
      title: 'Build',
      label: 'Practical Projects',
      description:
        'Construct production-oriented software projects that test real-world trade-offs, architecture, and code quality.',
    },
    {
      step: '04',
      title: 'Improve',
      label: 'Continuous Evaluation',
      description:
        'Evaluate your progress through milestone assessments, detailed feedback, and structured skill refinement.',
    },
  ];

  const focusAreas = [
    {
      icon: Code2,
      title: 'Programming Fundamentals',
      description:
        'Build core algorithmic intuition, syntax mastery, and problem-solving clarity essential for modern software engineering.',
      link: '/courses?level=beginner',
    },
    {
      icon: Cpu,
      title: 'Data Structures & Algorithms',
      description:
        'Master computational efficiency, memory trade-offs, recursive problem-solving, and clean, performant data structures.',
      link: '/courses?category=computer-science',
    },
    {
      icon: Layers,
      title: 'Full Stack Web Development',
      description:
        'Develop end-to-end web applications with modern frontend frameworks, scalable API backends, and robust database layers.',
      link: '/courses?category=web-development',
    },
    {
      icon: Brain,
      title: 'Generative AI & Modern Tools',
      description:
        'Understand applied AI engineering, large language model integration, vector retrieval, and prompt architecture.',
      link: '/courses?category=data-science-ai',
    },
    {
      icon: Terminal,
      title: 'Software Development Practices',
      description:
        'Cultivate professional engineering habits including version control, automated testing, continuous integration, and clean code.',
      link: '/courses?category=backend-systems',
    },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: 'Students & College Learners',
      description:
        'Undergraduates and early learners seeking structured, industry-aligned technical foundations to complement academic studies.',
    },
    {
      icon: Compass,
      title: 'Programming Beginners',
      description:
        'Individuals writing their first lines of code who want an organized, supportive roadmap without overwhelming jargon.',
    },
    {
      icon: Building2,
      title: 'Working Professionals',
      description:
        'Practicing software developers looking to upskill, transition to modern frameworks, or master scalable architecture.',
    },
    {
      icon: Lightbulb,
      title: 'Domain Explorers',
      description:
        'Technology enthusiasts and career switchers exploring new domains like Generative AI, cloud infrastructure, or full-stack engineering.',
    },
  ];

  const ecosystemFeatures = [
    {
      icon: BookOpen,
      title: 'Structured Curriculum',
      description: 'Sequenced modules that guide you from fundamental principles to advanced implementations.',
    },
    {
      icon: Video,
      title: 'Video & Reading Lessons',
      description: 'Clear recorded explanations paired with thorough, readable documentation and references.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Automated milestone monitors that record your completion journey across every module.',
    },
    {
      icon: CheckCircle2,
      title: 'Assessments & Quizzes',
      description: 'Evaluative quizzes and tests that verify concept retention and identify areas for reinforcement.',
    },
    {
      icon: FileText,
      title: 'Assignment Evaluations',
      description: 'Practical project submissions evaluated against defined criteria and rubric standards.',
    },
    {
      icon: HelpCircle,
      title: 'Doubt & Discussion Forum',
      description: 'Interactive forum where learners raise questions, discuss concepts, and collaborate.',
    },
    {
      icon: Users2,
      title: 'Live Interactive Sessions',
      description: 'Scheduled live cohort sessions led by mentors for real-time guidance and debugging.',
    },
    {
      icon: Award,
      title: 'Verifiable Certificates',
      description: 'Official completion credentials with unique verification codes to demonstrate verified learning.',
    },
  ];

  const commitments = [
    {
      title: 'Clear Learning Pathways',
      description: 'We prioritize transparent curricula with clear prerequisites, transparent scope, and predictable milestones.',
    },
    {
      title: 'Practical Knowledge',
      description: 'We focus on techniques, frameworks, and patterns directly utilized by real-world technology teams.',
    },
    {
      title: 'Structured Content',
      description: 'We avoid fragmented tutorials by delivering logically organized lessons that build progressively.',
    },
    {
      title: 'Continuous Improvement',
      description: 'We encourage consistent iteration, active problem solving, and reflective learning habits.',
    },
    {
      title: 'Accessible Learning',
      description: 'We believe rigorous technical education should be clear, welcoming, and open to dedicated learners.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-800">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>About Guidexa</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Learn With Purpose. Build With Confidence.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Guidexa is a learning platform focused on helping individuals develop technical knowledge, strengthen practical skills and move forward through structured learning and hands-on experience.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/courses">
                <Button size="lg" variant="primary" className="gap-2 font-bold shadow-lg shadow-blue-500/25 px-6">
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Our Courses</span>
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2 font-semibold text-slate-200 border-slate-700 hover:bg-slate-800 px-6">
                  <span>Contact Us</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR STORY — WHY GUIDEXA EXISTS */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Our Motivation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Why Guidexa Exists
            </h2>

            <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed text-left sm:text-center">
              <p>
                Technology is continuously evolving, and learning requires more than simply watching tutorials or reading documentation.
              </p>
              <p>
                Too often, technical education is either overly abstract or fragmented into disjointed snippets that leave learners uncertain about how systems truly function together.
              </p>
              <p>
                Guidexa aims to make technical education more structured, practical and accessible by connecting conceptual learning with exercises, projects and continuous improvement. We focus on bridging the space between understanding a concept and developing the practical capability to apply it with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 & 6. OUR MISSION & VISION */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
                    What Drives Us
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Our Mission
                  </h3>
                </div>
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                  To make technical learning more structured, practical and accessible, helping learners build the knowledge and confidence needed to solve real-world problems.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    Where We Are Going
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Our Vision
                  </h3>
                </div>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  To create a learning ecosystem where individuals can continuously develop their skills, explore emerging technologies and turn knowledge into practical capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OUR LEARNING PHILOSOPHY */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Convictions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              We Believe Learning Should Lead to Building.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Four fundamental commitments that guide how every program and lesson is developed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPhilosophy.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
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

      {/* 8. OUR LEARNING APPROACH (4-Step Timeline) */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Step-by-Step Methodology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              From Learning to Practical Skills
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              A progressive 4-step framework engineered to turn theoretical understanding into reliable execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningSteps.map((item, idx) => (
              <div
                key={item.step}
                className="relative p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-blue-600/30 dark:text-blue-400/20">
                      {item.step}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                      Stage {idx + 1}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-2">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. WHAT WE FOCUS ON */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5" />
              <span>Technology Domains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              What We Focus On
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Core technical disciplines chosen for their enduring importance, practical relevance, and industry demand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card
                  key={area.title}
                  className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {area.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Link
                      href={area.link}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Explore related programs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. WHO GUIDEXA IS FOR */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold">
              <Users2 className="w-3.5 h-3.5" />
              <span>Tailored Learning Paths</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Learning Opportunities for Different Goals
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Clear learning pathways structured to meet you where you are and advance your specific objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((aud) => {
              const Icon = aud.icon;
              return (
                <div
                  key={aud.title}
                  className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {aud.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {aud.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. PLATFORM LEARNING ECOSYSTEM */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              The Guidexa Learning Ecosystem
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              An integrated learning suite designed to keep you focused, organized, and supported throughout your course.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. GUIDEXA AND SOFTMAXS SOLUTION LLP */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Background</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Guidexa & Softmaxs Solution LLP
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Guidexa is a learning platform developed under Softmaxs Solution LLP, focused on delivering structured technology education and practical learning experiences.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                As an enterprise organization dedicated to software engineering and digital capabilities, Softmaxs Solution LLP created Guidexa to address the critical need for hands-on, verifiable technical training. The platform operates under standard quality guidelines, delivering trustworthy curricula and transparent learning experiences.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800">
              <Link href="/contact">
                <Button variant="primary" size="sm" className="font-semibold gap-1.5">
                  <span>Contact Our Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold">
                  <span>Browse Available Courses</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 13. OUR COMMITMENT TO LEARNERS */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Our Principles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Better Way to Keep Learning
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Our pledge to every learner who invests their time and energy on Guidexa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {commitments.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. FINAL CALL TO ACTION */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-14 shadow-xl text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                Begin Today
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Your Next Learning Journey Starts Here.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                Explore technology programs, strengthen your skills and take the next step in your learning journey with Guidexa.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/courses">
                <Button size="lg" variant="primary" className="gap-2 font-bold shadow-lg shadow-blue-500/25 px-6">
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Courses</span>
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-semibold px-6"
                >
                  <span>Get in Touch</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
