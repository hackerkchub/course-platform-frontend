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
  PlayCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Sparkles,
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
  const [openFaqIds, setOpenFaqIds] = useState<number[]>([]);

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

  const toggleModule = (id: number) => {
    setOpenModuleIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleOpenDemoModal = () => {
    if (!user) {
      router.push(`/login?returnUrl=/courses/${basic.slug}`);
      return;
    }
    setDemoModalOpen(true);
  };

  const toggleFaq = (id: number) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <>
      <CourseTelemetry courseId={basic.id} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-10 pb-16 lg:pb-24 border-b border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-blue-400 transition-colors">
              Courses
            </Link>
            {basic.category && (
              <>
                <span>/</span>
                <Link
                  href={`/courses?category=${basic.category.slug}`}
                  className="hover:text-blue-400 transition-colors capitalize"
                >
                  {basic.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-200 truncate max-w-xs">{basic.course_name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Hero Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs font-semibold">
                  {basic.course_level}
                </Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                  {basic.mode.replace(/_/g, ' ')}
                </Badge>
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
              </div>

              {/* Title (Single H1 for SEO) */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {basic.course_name}
              </h1>

              {/* Short Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
                {basic.short_description}
              </p>

              {/* Social Proof & Metrics */}
              <div className="flex flex-wrap items-center gap-6 text-sm pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-bold text-white">
                      {Number(socialProof?.reviews_summary?.average_rating || 5.0).toFixed(1)}
                    </span>
                  </div>
                  {socialProof?.reviews_summary?.review_count > 0 && (
                    <span className="text-slate-400">
                      ({socialProof.reviews_summary.review_count} ratings)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>
                    {course.stats?.enrollment_count ? `${course.stats.enrollment_count}+ enrolled` : 'Active cohort'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{formatDuration(basic.duration_hours)}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>{basic.total_lessons} lessons</span>
                </div>
              </div>

              {/* Instructor Capsule */}
              {instructor && (
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  {instructor.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instructor.photo_url}
                      alt={instructor.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {instructor.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-400 block">Lead Instructor</span>
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
            </div>

            {/* Desktop Hero Right (Pricing Card) */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white space-y-6 sticky top-24">
                {/* Media Preview */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                  {course.media?.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.media.thumbnail_url}
                      alt={basic.course_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-900 to-indigo-900 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Price Display */}
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
                          <Badge variant="success" className="text-xs font-bold">
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

                {/* Action CTAs */}
                <div className="space-y-3">
                  {isFree ? (
                    <FreeEnrollButton
                      courseId={basic.id}
                      courseSlug={basic.slug}
                      isAlreadyEnrolled={course.user_state?.is_enrolled}
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

                {/* Course Inclusions List */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[11px]">
                    This cohort includes:
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{formatDuration(basic.duration_hours)} intensive curriculum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{basic.total_lessons} recorded & live lessons</span>
                  </div>
                  {benefits?.certificate_enabled && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Verifiable industry certification</span>
                    </div>
                  )}
                  {benefits?.placement_assistance && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Dedicated placement assistance & resume reviews</span>
                    </div>
                  )}
                  {course.enrollment?.lifetime_access && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Full lifetime course & code repository access</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* What you'll learn */}
            {learning?.what_you_will_learn && learning.what_you_will_learn.length > 0 && (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  What You Will Learn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {learning.what_you_will_learn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Description */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Course Overview
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{basic.description}</p>
              </div>
            </div>

            {/* Curriculum Accordion */}
            {course.curriculum && course.curriculum.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Curriculum Syllabus
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {basic.total_modules} Modules • {basic.total_lessons} Lessons • {formatDuration(basic.duration_hours)} total length
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOpenModuleIds(
                        openModuleIds.length === course.curriculum.length
                          ? []
                          : course.curriculum.map((m) => m.module_id)
                      )
                    }
                    className="text-xs text-blue-600 dark:text-blue-400"
                  >
                    {openModuleIds.length === course.curriculum.length ? 'Collapse All' : 'Expand All'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {course.curriculum.map((module, mIdx) => {
                    const isOpen = openModuleIds.includes(module.module_id);
                    return (
                      <div
                        key={module.module_id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleModule(module.module_id)}
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
                                  <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-sm sm:max-w-md">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {lesson.is_preview && (
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0.5">
                                      Preview
                                    </Badge>
                                  )}
                                  <span className="text-xs text-slate-400">
                                    {Math.round(lesson.duration_seconds / 60)}m
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Batches */}
            {batches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Upcoming Cohort Schedules
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {batches.map((batch) => (
                    <div
                      key={batch.batch_id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {batch.batch_name}
                        </span>
                        <Badge variant="primary" className="text-xs">
                          {batch.seats_available} seats left
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Starts: {new Date(batch.start_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      </div>
                      {batch.class_timing && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{batch.class_timing} ({batch.class_days})</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Bio Card */}
            {instructor && (
              <div className="space-y-4">
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
                          {instructor.designation} • {instructor.experience_years || 5}+ Years Industry Experience
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
              </div>
            )}

            {/* Prerequisites & Requirements */}
            {learning?.prerequisites && learning.prerequisites.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Prerequisites
                </h2>
                <ul className="space-y-2 list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
                  {learning.prerequisites.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQs Accordion */}
            {socialProof?.faqs && socialProof.faqs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {socialProof.faqs.map((faq) => {
                    const isOpen = openFaqIds.includes(faq.id);
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
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
              </div>
            )}
          </div>

          {/* Right Column Sticky Space (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            {/* The sticky card is placed in Hero, remaining space left clean */}
          </div>
        </div>
      </div>

      {/* Explore Related Courses Section */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Recommendations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore Related Courses
              </h2>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>View Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {relatedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((relCourse) => (
                <CourseCard key={relCourse.id} course={relCourse} />
              ))}
            </div>
          ) : (
            <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Explore More Engineering Tracks
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Check our complete catalog to discover other live cohort programs, backend systems tracks, and specialized certifications.
              </p>
              <div>
                <Link href="/courses">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <span>Browse All Courses</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Floating Bottom Action Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="text-xs text-slate-500 block">Tuition</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {isFree ? 'FREE' : formatCurrency(currentPrice)}
            </span>
          </div>

          {isFree ? (
            <div className="w-1/2">
              <FreeEnrollButton
                courseId={basic.id}
                courseSlug={basic.slug}
                isAlreadyEnrolled={course.user_state?.is_enrolled}
              />
            </div>
          ) : isDemoAvailable ? (
            <Button
              variant="primary"
              onClick={handleOpenDemoModal}
              className="w-1/2 font-bold"
            >
              Book Demo
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => router.push(`/contact?course=${basic.slug}`)}
              className="w-1/2 font-bold"
            >
              Enquire Now
            </Button>
          )}
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
