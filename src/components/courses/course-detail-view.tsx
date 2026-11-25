'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { CourseDetailPayload, CourseCard as CourseCardType } from '@/types/course';
import { CourseCard } from '@/components/courses/course-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDuration } from '@/lib/utils';
import {
  Star,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  Video,
  Award,
  Users,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Sparkles,
  FileText,
  Code2,
  ShieldCheck,
  Globe,
  Terminal,
  UserCheck,
  Check,
  Layers,
  GraduationCap,
  Briefcase,
  Lightbulb,
} from 'lucide-react';
import { DemoBookingModal } from '@/components/courses/demo-booking-modal';
import { EligibilityCheckModal } from '@/components/courses/eligibility-check-modal';
import { FreeEnrollButton } from '@/components/courses/free-enroll-button';
import { ShareButton, WhatsAppEnquiryButton } from '@/components/courses/social-actions';
import { CourseTelemetry } from '@/components/courses/course-telemetry';

interface CourseDetailViewProps {
  course: CourseDetailPayload;
  relatedCourses?: CourseCardType[];
}

export function CourseDetailView({ course, relatedCourses = [] }: CourseDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [openModuleIds, setOpenModuleIds] = useState<number[]>(
    course.curriculum?.[0]?.module_id ? [course.curriculum[0].module_id] : []
  );
  const [openFaqIds, setOpenFaqIds] = useState<number[]>([1]);

  const basic = course.basic;
  const pricing = course.pricing;
  const instructor = course.instructor;
  const socialProof = course.social_proof;
  const learning = course.learning;
  const batches = course.batches || [];
  const benefits = course.benefits;

  const isFree = Boolean(pricing.is_free) || pricing.price === 0;
  const offerPrice = pricing.offer_price;
  const hasOffer = offerPrice !== null && offerPrice !== undefined && offerPrice < pricing.price && !isFree;
  const currentPrice = hasOffer ? offerPrice : pricing.price;
  const isDemoAvailable = Boolean(course.demo?.demo_enabled && course.demo?.demo_request_enabled);
  const isEnrolled = Boolean(course.user_state?.is_enrolled);

  // Combined verified technologies and tools
  const verifiedSkills = Array.from(
    new Set([
      ...(learning?.tools_covered || []),
      ...(basic.tags || []),
    ])
  ).filter(Boolean);

  const toggleModule = (id: number) => {
    setOpenModuleIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleAllModules = () => {
    if (!course.curriculum) return;
    if (openModuleIds.length === course.curriculum.length) {
      setOpenModuleIds([]);
    } else {
      setOpenModuleIds(course.curriculum.map((m) => m.module_id));
    }
  };

  const toggleFaq = (id: number) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleOpenDemoModal = () => {
    if (!user) {
      router.push(`/login?returnUrl=/courses/${basic.slug}`);
      return;
    }
    setDemoModalOpen(true);
  };

  const handleHeroPrimaryAction = () => {
    if (isEnrolled) {
      router.push('/student/dashboard');
      return;
    }
    if (isFree) {
      // Handled by FreeEnrollButton or scroll
      const pricingEl = document.getElementById('enrollment-card');
      if (pricingEl) {
        pricingEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(`/login?returnUrl=/courses/${basic.slug}`);
      }
      return;
    }
    if (isDemoAvailable) {
      handleOpenDemoModal();
      return;
    }
    router.push(`/contact?course=${basic.slug}`);
  };

  const handleScrollToCurriculum = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('curriculum');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compile course FAQs combining verified course metadata
  const verifiedFaqs = [
    ...(socialProof?.faqs || []),
  ];

  if (verifiedFaqs.length === 0) {
    if (basic.course_level) {
      verifiedFaqs.push({
        id: 1,
        question: 'Who should enroll in this course?',
        answer: `This course is designed for ${basic.course_level.replace(/_/g, ' ')} learners. All required concepts are introduced with structured, practical exercises and guided mentorship.`,
      });
    }
    if (learning?.prerequisites && learning.prerequisites.length > 0) {
      verifiedFaqs.push({
        id: 2,
        question: 'What are the prerequisites for this course?',
        answer: `Prerequisites: ${learning.prerequisites.join(', ')}. All necessary setup guides and initial tool installations are covered in the opening module.`,
      });
    } else {
      verifiedFaqs.push({
        id: 2,
        question: 'Are there any prerequisites required?',
        answer: 'No prior advanced prerequisites are required. Foundational concepts and development environments are established from step one.',
      });
    }
    if (benefits?.certificate_enabled) {
      verifiedFaqs.push({
        id: 3,
        question: 'Will I receive an official certificate upon completion?',
        answer: 'Yes. Upon completing 100% of the lessons and successfully submitting the required assessments and course projects, you will receive an official, verifiable Guidexa digital certificate.',
      });
    }
    if (pricing.refund_days > 0) {
      verifiedFaqs.push({
        id: 4,
        question: 'What is the refund policy?',
        answer: `This course is protected by a ${pricing.refund_days}-day refund policy. If the cohort does not align with your learning goals, you can request a refund within this period.`,
      });
    }
  }

  return (
    <>
      <CourseTelemetry courseId={basic.id} />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-8 pb-16 lg:pb-24 border-b border-slate-800">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/courses" className="hover:text-blue-400 transition-colors">
              Courses
            </Link>
            {basic.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <Link
                  href={`/courses?category=${basic.category.slug}`}
                  className="hover:text-blue-400 transition-colors capitalize"
                >
                  {basic.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 truncate max-w-xs">{basic.course_name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Hero Left Column Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs font-semibold bg-slate-800 text-blue-300 border border-blue-500/30">
                  {basic.course_level.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs capitalize">
                  {basic.mode.replace(/_/g, ' ')}
                </Badge>
                {basic.category && (
                  <Link href={`/courses?category=${basic.category.slug}`}>
                    <Badge variant="outline" className="border-slate-700 text-slate-300 hover:text-blue-400 text-xs">
                      {basic.category.name}
                    </Badge>
                  </Link>
                )}
                {basic.badges?.is_trending && (
                  <Badge variant="warning" className="gap-1 bg-amber-500 text-white font-semibold text-xs border-0">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    Trending
                  </Badge>
                )}
                {basic.badges?.is_featured && (
                  <Badge variant="accent" className="gap-1 bg-indigo-600 text-white font-semibold text-xs border-0">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    Featured
                  </Badge>
                )}
                {basic.badges?.is_new && (
                  <Badge variant="success" className="bg-emerald-600 text-white font-semibold text-xs border-0">
                    New
                  </Badge>
                )}
              </div>

              {/* Title (Single H1 for SEO) */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {basic.course_name}
              </h1>

              {/* Short Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
                {basic.short_description}
              </p>

              {/* Metrics & Social Proof Capsule */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs sm:text-sm pt-2 text-slate-300">
                {socialProof?.reviews_summary && socialProof.reviews_summary.review_count > 0 && (
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-white">
                      {Number(socialProof.reviews_summary.average_rating || 5.0).toFixed(1)}
                    </span>
                    <span className="text-slate-400 font-normal">
                      ({socialProof.reviews_summary.review_count} ratings)
                    </span>
                  </div>
                )}

                {course.stats?.enrollment_count ? (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>{course.stats.enrollment_count}+ Students Enrolled</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{basic.duration_hours} Hours Curriculum</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>{basic.total_lessons} Lessons</span>
                </div>

                {basic.language && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>{basic.language}</span>
                  </div>
                )}
              </div>

              {/* Lead Instructor Capsule */}
              {instructor && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  {instructor.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instructor.photo_url}
                      alt={instructor.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/40"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {instructor.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Lead Instructor</span>
                    <Link
                      href={`/instructors/${instructor.id}`}
                      className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {instructor.name}
                    </Link>
                    {instructor.designation && (
                      <span className="text-xs text-slate-400 ml-2">• {instructor.designation}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Hero Action CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                {isEnrolled ? (
                  <Link href="/student/dashboard">
                    <Button variant="success" size="lg" className="font-bold gap-2 text-base shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : isFree ? (
                  <div className="w-full sm:w-auto">
                    <FreeEnrollButton
                      courseId={basic.id}
                      courseSlug={basic.slug}
                      isAlreadyEnrolled={isEnrolled}
                    />
                  </div>
                ) : isDemoAvailable ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleOpenDemoModal}
                    className="font-bold gap-2 text-base shadow-lg shadow-blue-500/25"
                  >
                    <Video className="w-5 h-5" />
                    Book Free Demo Class
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleHeroPrimaryAction}
                    className="font-bold gap-2 text-base shadow-lg shadow-blue-500/25"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Enroll Now
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleScrollToCurriculum}
                  className="font-semibold text-slate-200 border-slate-700 hover:bg-slate-800 gap-2 text-base"
                >
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Explore Curriculum
                </Button>
              </div>
            </div>

            {/* Desktop Hero Right Column (Sticky Enrollment Card) */}
            <div className="hidden lg:block lg:col-span-1" id="enrollment-card">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white space-y-6 sticky top-24">
                {/* Media Thumbnail */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center group">
                  {course.media?.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.media.thumbnail_url}
                      alt={basic.course_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-900 to-indigo-900 flex items-center justify-center">
                      <GraduationCap className="w-14 h-14 text-white/80" />
                    </div>
                  )}
                  {course.media?.demo_video_url && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Pricing Display */}
                <div className="space-y-1">
                  {isFree ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                      <span className="text-xs font-semibold text-slate-500">100% Free Access</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(currentPrice)}
                      </span>
                      {hasOffer && (
                        <>
                          <span className="text-base text-slate-400 line-through">
                            {formatCurrency(pricing.price)}
                          </span>
                          <Badge variant="success" className="text-xs font-bold bg-emerald-600 text-white">
                            {pricing.discount_percentage}% OFF
                          </Badge>
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {pricing.tax_inclusive ? 'Inclusive of all taxes' : '+ Applicable GST'}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-3">
                  {isEnrolled ? (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => router.push('/student/dashboard')}
                      className="w-full font-bold gap-2 text-base"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Go to Dashboard
                    </Button>
                  ) : isFree ? (
                    <FreeEnrollButton
                      courseId={basic.id}
                      courseSlug={basic.slug}
                      isAlreadyEnrolled={isEnrolled}
                    />
                  ) : isDemoAvailable ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleOpenDemoModal}
                      className="w-full font-bold shadow-lg shadow-blue-500/25 gap-2 text-base"
                    >
                      <Video className="w-5 h-5" />
                      Book Free Demo Class
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => router.push(`/contact?course=${basic.slug}`)}
                      className="w-full font-bold shadow-lg shadow-blue-500/25 gap-2 text-base"
                    >
                      <HelpCircle className="w-5 h-5" />
                      Enquire About Course
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEligibilityModalOpen(true)}
                      className="text-xs font-semibold"
                    >
                      Check Eligibility
                    </Button>
                    <ShareButton
                      courseId={basic.id}
                      courseTitle={basic.course_name}
                      className="w-full"
                    />
                  </div>

                  <WhatsAppEnquiryButton
                    courseId={basic.id}
                    courseTitle={basic.course_name}
                    whatsapp={course.whatsapp}
                  />
                </div>

                {/* Program Inclusions Checklist */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[11px]">
                    This cohort includes:
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{basic.duration_hours} hours structured curriculum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{basic.total_lessons} lessons & guided modules</span>
                  </div>
                  {benefits?.certificate_enabled && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Verifiable Guidexa digital certificate</span>
                    </div>
                  )}
                  {benefits?.placement_assistance && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Career assistance & portfolio review</span>
                    </div>
                  )}
                  {course.enrollment?.lifetime_access && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Lifetime access to course materials</span>
                    </div>
                  )}
                  {benefits?.project_count && benefits.project_count > 0 && (
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{benefits.project_count} production-grade portfolio projects</span>
                    </div>
                  )}
                  {pricing.refund_days > 0 && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{pricing.refund_days}-day satisfaction guarantee</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN BODY DETAILS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column Content (2 cols) */}
          <div className="lg:col-span-2 space-y-12">
            {/* 2. WHAT YOU'LL LEARN */}
            {learning?.what_you_will_learn && learning.what_you_will_learn.length > 0 && (
              <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Target Competencies</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  What You&apos;ll Learn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {learning.what_you_will_learn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. SKILLS & TECHNOLOGIES */}
            {verifiedSkills.length > 0 && (
              <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Modern Tooling</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Skills & Technologies You&apos;ll Master
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Practical tools, modern frameworks, and engineering standards integrated throughout this curriculum.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {verifiedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 4. COURSE OVERVIEW / DESCRIPTION */}
            <section className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5" />
                <span>Program Details</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Course Overview
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{basic.description}</p>
              </div>
            </section>

            {/* 5. COURSE STRUCTURE & PARAMETERS */}
            <section className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>Format Specifications</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Course Structure & Delivery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Duration</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{basic.duration_hours} Hours</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Curriculum</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{basic.total_modules} Modules</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Lessons</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{basic.total_lessons} Lessons</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Delivery Mode</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white capitalize">{basic.mode.replace(/_/g, ' ')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Language</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{basic.language || 'English'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Skill Level</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white capitalize">{basic.course_level.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </section>

            {/* 6. TARGET AUDIENCE — "IS THIS COURSE RIGHT FOR YOU?" */}
            <section className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Eligibility & Fit</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Is This Course Right for You?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Students & Early Learners</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Build rock-solid engineering intuition with step-by-step guidance and structured foundations.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Working Developers</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Upskill with modern frameworks, distributed backend patterns, and production engineering practices.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Career Switchers</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Bridge your technical gaps with portfolio-ready codebases and guided mentorship.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. COURSE CURRICULUM ACCORDION */}
            <section id="curriculum" className="space-y-4 pt-4 scroll-mt-24">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Syllabus Breakdown</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {basic.total_modules} Modules • {basic.total_lessons} Lessons • {basic.duration_hours} Hours total length
                  </p>
                </div>
                {course.curriculum && course.curriculum.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllModules}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    {openModuleIds.length === course.curriculum.length ? 'Collapse All' : 'Expand All'}
                  </Button>
                )}
              </div>

              {course.curriculum && course.curriculum.length > 0 ? (
                <div className="space-y-3">
                  {course.curriculum.map((module, mIdx) => {
                    const isOpen = openModuleIds.includes(module.module_id);
                    return (
                      <div
                        key={module.module_id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => toggleModule(module.module_id)}
                          aria-expanded={isOpen}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                              {mIdx + 1}
                            </span>
                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {module.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span>{module.lessons?.length || 0} lessons</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {isOpen && module.lessons && module.lessons.length > 0 && (
                          <div className="px-5 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.lesson_id}
                                className="flex items-center justify-between py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300"
                              >
                                <div className="flex items-center gap-2.5">
                                  {lesson.lesson_type === 'article' ? (
                                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : lesson.lesson_type === 'quiz' ? (
                                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate max-w-sm sm:max-w-md">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {lesson.is_preview && (
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0">
                                      Preview
                                    </Badge>
                                  )}
                                  {lesson.duration_seconds > 0 && (
                                    <span className="text-xs text-slate-400">
                                      {Math.round(lesson.duration_seconds / 60)}m
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  Curriculum details are being finalized for upcoming cohorts.
                </div>
              )}
            </section>

            {/* 8. PREREQUISITES */}
            <section className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Readiness</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What You Should Know Before Starting
              </h2>
              {learning?.prerequisites && learning.prerequisites.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {learning.prerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No advanced prerequisites required. Basic computer literacy and enthusiasm to write code are all you need to begin.
                </p>
              )}
            </section>

            {/* 9. UPCOMING COHORT SCHEDULES */}
            {batches.length > 0 && (
              <section className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Cohort Timings</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Upcoming Cohort Schedules
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {batches.map((batch) => (
                    <div
                      key={batch.batch_id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {batch.batch_name}
                        </span>
                        <Badge variant="primary" className="text-xs bg-blue-600 text-white font-semibold">
                          {batch.seats_available} seats left
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Starts: {new Date(batch.start_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      </div>
                      {batch.class_timing && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{batch.class_timing} ({batch.class_days})</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 10. CERTIFICATION SECTION */}
            {benefits?.certificate_enabled && (
              <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                    <Award className="w-3.5 h-3.5" />
                    <span>Verified Credential</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Earn Your Certificate
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    Demonstrate your competence with an official, tamper-proof Guidexa digital certificate recognized across modern technology organizations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">100% Completion</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Complete all curriculum lessons, interactive exercises, and lecture checkpoints.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">Project Evaluation</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Submit and successfully pass practical project evaluations evaluated by mentors.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">Online Verification</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Includes unique verification code and shareable URL for LinkedIn & resumes.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* 11. MEET YOUR INSTRUCTOR */}
            {instructor && (
              <section className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Expert Faculty</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Meet Your Instructor
                </h2>
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
                  {instructor.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instructor.photo_url}
                      alt={instructor.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/20 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shrink-0">
                      {instructor.name.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div>
                      <Link
                        href={`/instructors/${instructor.id}`}
                        className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors"
                      >
                        {instructor.name}
                      </Link>
                      {instructor.designation && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {instructor.designation} {instructor.experience_years ? `• ${instructor.experience_years}+ Years Experience` : ''}
                        </p>
                      )}
                    </div>
                    {instructor.bio && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {instructor.bio}
                      </p>
                    )}
                    <Link
                      href={`/instructors/${instructor.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2"
                    >
                      <span>View full profile & courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* 12. FREQUENTLY ASKED QUESTIONS */}
            {verifiedFaqs.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {verifiedFaqs.map((faq) => {
                    const isOpen = openFaqIds.includes(faq.id);
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(faq.id)}
                          aria-expanded={isOpen}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-slate-900 dark:text-white"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Column Spacer (Desktop) */}
          <div className="hidden lg:block lg:col-span-1" />
        </div>
      </div>

      {/* 13. EXPLORE RELATED COURSES */}
      {relatedCourses.length > 0 && (
        <section className="py-16 bg-slate-50/50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Recommendations</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Explore Related Programs
                </h2>
              </div>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
                  <span>View Full Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((relCourse) => (
                <CourseCard key={relCourse.id} course={relCourse} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 14. FINAL CONVERSION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Take the next step towards developing practical skills and building your knowledge with Guidexa.
            </p>
          </div>
          <div className="pt-2 relative z-10">
            {isEnrolled ? (
              <Link href="/student/dashboard">
                <Button variant="success" size="lg" className="font-bold gap-2 text-base px-8">
                  <CheckCircle2 className="w-5 h-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : isFree ? (
              <div className="inline-block">
                <FreeEnrollButton
                  courseId={basic.id}
                  courseSlug={basic.slug}
                  isAlreadyEnrolled={isEnrolled}
                  className="px-8"
                />
              </div>
            ) : isDemoAvailable ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleOpenDemoModal}
                className="font-bold gap-2 text-base px-8 shadow-lg shadow-blue-500/25"
              >
                <Video className="w-5 h-5" />
                Book Free Demo Class
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleHeroPrimaryAction}
                className="font-bold gap-2 text-base px-8 shadow-lg shadow-blue-500/25"
              >
                <ArrowRight className="w-5 h-5" />
                Enroll in This Course
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 15. MOBILE FLOATING ENROLLMENT BAR (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="text-xs text-slate-500 block">Tuition</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {isFree ? 'FREE' : formatCurrency(currentPrice)}
            </span>
          </div>

          <div className="w-1/2">
            {isEnrolled ? (
              <Button
                variant="success"
                onClick={() => router.push('/student/dashboard')}
                className="w-full font-bold"
              >
                Go to Dashboard
              </Button>
            ) : isFree ? (
              <FreeEnrollButton
                courseId={basic.id}
                courseSlug={basic.slug}
                isAlreadyEnrolled={isEnrolled}
              />
            ) : isDemoAvailable ? (
              <Button
                variant="primary"
                onClick={handleOpenDemoModal}
                className="w-full font-bold shadow-md shadow-blue-500/20"
              >
                Book Demo
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => router.push(`/contact?course=${basic.slug}`)}
                className="w-full font-bold shadow-md shadow-blue-500/20"
              >
                Enroll Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DemoBookingModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        courseId={basic.id}
        courseSlug={basic.slug}
        courseTitle={basic.course_name}
      />

      <EligibilityCheckModal
        isOpen={eligibilityModalOpen}
        onClose={() => setEligibilityModalOpen(false)}
        courseId={basic.id}
        courseTitle={basic.course_name}
        minQualification={course.eligibility?.minimum_qualification}
        experienceRequired={course.eligibility?.experience_required}
      />
    </>
  );
}

export default CourseDetailView;
