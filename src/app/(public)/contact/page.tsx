'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/utils';
import { getSiteUrl } from '@/lib/site-url';
import {
  BookOpen,
  Video,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  HelpCircle,
  Compass,
  Layers,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';

const rawSiteUrl = getSiteUrl();
const siteUrl = rawSiteUrl && !rawSiteUrl.includes('localhost') ? rawSiteUrl : 'https://guidexa.in';

const INQUIRY_CATEGORIES = [
  'General Inquiry',
  'Course Information',
  'Admissions',
  'Enrollment Support',
  'Technical Support',
  'Other',
] as const;

type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(191, 'Email cannot exceed 191 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone cannot exceed 20 characters')
    .regex(/^[0-9+\s\-()]+$/, 'Invalid phone number format (only digits, +, -, and spaces allowed)'),
  category: z.enum(INQUIRY_CATEGORIES, {
    message: 'Please select an inquiry category',
  }),
  courseOfInterest: z.string().trim().max(150).optional(),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

function ContactFormInner() {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get('course') || '';

  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    referenceId?: number;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      category: courseParam ? 'Course Information' : 'General Inquiry',
      courseOfInterest: courseParam,
      subject: courseParam ? `Inquiry regarding ${courseParam}` : '',
    },
  });

  useEffect(() => {
    if (courseParam) {
      setValue('category', 'Course Information');
      setValue('courseOfInterest', courseParam);
      setValue('subject', `Inquiry regarding ${courseParam}`);
    }
  }, [courseParam, setValue]);

  // Environment variables
  const rawPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();

  // Clean phone digits for WhatsApp URL
  const cleanDigits = (rawPhone || '').replace(/\D/g, '');
  const waNumber =
    cleanDigits.length === 10
      ? `91${cleanDigits}`
      : cleanDigits.startsWith('91') && cleanDigits.length === 12
      ? cleanDigits
      : cleanDigits;

  const prefilledWaMessage = encodeURIComponent(
    'Hello Guidexa Admissions Desk, I would like more information regarding course programs, cohort batches, and curriculum details.'
  );
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${prefilledWaMessage}` : null;

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    setSubmissionResult(null);

    // Format payload respecting backend submitContactSchema contract
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone.trim(),
      subject: `[${data.category}] ${data.subject}`,
      message: data.courseOfInterest
        ? `Course of Interest: ${data.courseOfInterest}\n\n${data.message}`
        : data.message,
    };

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        reference_id?: number;
      }>(API_ENDPOINTS.contact.submit, payload);

      if (response.data?.success) {
        setSubmissionResult({
          success: true,
          message:
            response.data.message ||
            'Thank you for reaching out! Our team has received your message and will get back to you shortly.',
          referenceId: response.data.reference_id,
        });
        reset({
          name: '',
          email: '',
          phone: '',
          category: 'General Inquiry',
          courseOfInterest: '',
          subject: '',
          message: '',
        });
      } else {
        setServerError(response.data?.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(err, 'Failed to submit inquiry. Please check your details and try again.')
      );
    }
  };

  // Schema.org structured data
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Guidexa',
    description:
      'Contact Softmaxs Solution LLP for Guidexa course inquiries, admissions guidance, and technical learning support.',
    url: `${siteUrl}/contact`,
    publisher: {
      '@type': 'Organization',
      name: 'Softmaxs Solution LLP',
      url: 'https://softmaxs.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
        {/* =========================================================
            SECTION 1: HERO
        ========================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-14 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="flex justify-center">
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Contact Us' },
                ]}
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>GET IN TOUCH</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Let&apos;s Connect and Help You Move Forward.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have questions about our courses, admissions or learning programs? Our team is here to help you find the right direction.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
          {/* =========================================================
              SECTION 2: CONTACT INFORMATION CARDS
          ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Email Support */}
            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Email Support
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Send formal course inquiries, syllabus questions, or institutional communications.
                </p>
              </div>

              {supportEmail ? (
                <a href={`mailto:${supportEmail}?subject=Guidexa%20Inquiry`}>
                  <Button size="sm" variant="outline" className="w-full gap-2 font-semibold truncate">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{supportEmail}</span>
                  </Button>
                </a>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Available via the inquiry form below</span>
                </div>
              )}
            </Card>

            {/* Card 2: Phone Support */}
            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Phone Support
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Speak directly with an academic counselor regarding program tracks and schedules.
                </p>
              </div>

              {contactPhone ? (
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`}>
                  <Button size="sm" variant="outline" className="w-full gap-2 font-semibold">
                    <Phone className="w-4 h-4" />
                    <span>{contactPhone}</span>
                  </Button>
                </a>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Request a telephone callback via form</span>
                </div>
              )}
            </Card>

            {/* Card 3: WhatsApp Support */}
            {waUrl ? (
              <Card className="p-6 rounded-2xl border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    WhatsApp Support
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Chat directly with an advisor for immediate batch schedules and syllabus queries.
                  </p>
                </div>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </Button>
                </a>
              </Card>
            ) : (
              <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Online Support Desk
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Submit your question through our structured form for prompt counselor routing.
                  </p>
                </div>
                <Link href="#inquiry-form">
                  <Button size="sm" variant="outline" className="w-full gap-2 font-semibold">
                    <span>Fill Inquiry Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            )}

            {/* Card 4: Admissions Guidance */}
            <Card className="p-6 rounded-2xl border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Admissions Guidance
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Explore course syllabi, verify prerequisites, and book a free interactive demo class.
                </p>
              </div>
              <Link href="/courses">
                <Button size="sm" variant="primary" className="w-full gap-1.5 font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </div>

          {/* =========================================================
              SECTION 3: CONTACT INQUIRY FORM & SIDEBAR
          ========================================================= */}
          <div id="inquiry-form" className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Sidebar Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Admissions Process
                  </h3>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Inspect module breakdowns and prerequisite requirements on the course page.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Free courses offer instant enrollment directly from your student account.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Paid cohorts feature free demo sessions and flexible installment options.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Every inquiry is routed directly to the relevant course faculty or counselor.</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Quick Questions?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Most common questions regarding certificates, payments, and curriculum are already answered in our FAQ repository.
                </p>
                <Link href="/faq">
                  <Button size="sm" variant="outline" className="w-full gap-2 font-semibold">
                    <HelpCircle className="w-4 h-4" />
                    <span>Browse FAQs</span>
                  </Button>
                </Link>
              </Card>

              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Institutional Stewardship</p>
                <p className="leading-relaxed">
                  Guidexa is developed and operated under Softmaxs Solution LLP. We are committed to honest education and transparent communication.
                </p>
              </div>
            </div>

            {/* The Form Card */}
            <div className="lg:col-span-2">
              <Card className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="mb-6 space-y-1">
                  <Badge variant="secondary" className="mb-2 uppercase text-xs tracking-wider">
                    Inquiry Form
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Send Us a Message
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Fill out the form below. An academic counselor will review your question and respond promptly.
                  </p>
                </div>

                {/* Success Feedback Banner */}
                {submissionResult?.success && (
                  <div className="mb-6 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 text-xs sm:text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <div className="space-y-1.5 flex-1">
                      <p className="font-bold text-base">Inquiry Submitted Successfully</p>
                      <p className="leading-relaxed">{submissionResult.message}</p>
                      {submissionResult.referenceId && (
                        <p className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          Inquiry Reference ID: #{submissionResult.referenceId}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSubmissionResult(null)}
                        className="mt-2 text-xs border-emerald-300 dark:border-emerald-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>Send Another Message</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error Feedback Banner */}
                {serverError && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3 text-xs sm:text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <div className="space-y-1">
                      <p className="font-bold">Submission Failed</p>
                      <p className="leading-relaxed">{serverError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        id="contact-name"
                        {...register('name')}
                        placeholder="e.g. Rahul Sharma"
                        error={errors.name?.message}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        id="contact-email"
                        type="email"
                        {...register('email')}
                        placeholder="e.g. rahul@example.com"
                        error={errors.email?.message}
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="e.g. +91 98765 43210 or 9876543210"
                        error={errors.phone?.message}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-category" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Inquiry Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="contact-category"
                        {...register('category')}
                        className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
                      >
                        {INQUIRY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-xs text-rose-500 font-medium">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Course of Interest & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-course" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Course of Interest <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <Input
                        id="contact-course"
                        {...register('courseOfInterest')}
                        placeholder="e.g. Full Stack Web Development"
                        error={errors.courseOfInterest?.message}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-subject" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Subject <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        id="contact-subject"
                        {...register('subject')}
                        placeholder="e.g. Cohort Prerequisites & Batch Timings"
                        error={errors.subject?.message}
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Message / Question <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      {...register('message')}
                      rows={5}
                      placeholder="Please describe your background, learning goals, or questions in detail..."
                      className="w-full px-3.5 py-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    {errors.message && (
                      <p className="text-xs text-rose-500 font-medium">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto font-bold px-8 gap-2 min-h-[44px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Inquiry...</span>
                        </>
                      ) : (
                        <span>Submit Inquiry</span>
                      )}
                    </Button>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto gap-2 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 font-semibold min-h-[44px]"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>Inquire via WhatsApp</span>
                        </Button>
                      </a>
                    )}
                  </div>
                </form>
              </Card>
            </div>
          </div>

          {/* =========================================================
              SECTION 4: INQUIRY GUIDANCE (HOW CAN WE HELP YOU?)
          ========================================================= */}
          <section className="pt-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold uppercase text-xs tracking-wider">
                Support Pillars
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                How Can We Help You?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Explore our guidance pathways designed to assist you before, during, and after enrollment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Guidance 1: Choosing the Right Course */}
              <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Choosing the Right Course
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Evaluate skill levels, prerequisite roadmaps, and career targets to find the optimal starting track.
                  </p>
                </div>
                <Link href="/courses">
                  <Button size="sm" variant="ghost" className="p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-transparent font-semibold text-xs">
                    <span>Browse Course Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </Card>

              {/* Guidance 2: Understanding Course Curriculum */}
              <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Course Curriculum
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Examine lesson breakdowns, lecture hours, hands-on coding labs, and evaluated capstone projects.
                  </p>
                </div>
                <Link href="/why-choose-us#approach">
                  <Button size="sm" variant="ghost" className="p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-transparent font-semibold text-xs">
                    <span>Our 5-Step Pedagogy</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </Card>

              {/* Guidance 3: Admission & Enrollment */}
              <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Admission & Enrollment
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Free courses offer instant enrollment, while live cohorts feature demo bookings and installment options.
                  </p>
                </div>
                <Link href="/faq">
                  <Button size="sm" variant="ghost" className="p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-transparent font-semibold text-xs">
                    <span>Enrollment FAQs</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </Card>

              {/* Guidance 4: Learning Platform Support */}
              <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Platform Support
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Assistance with video streaming, lesson resume states, interactive quizzes, or certificate verification.
                  </p>
                </div>
                <Link href="/faq">
                  <Button size="sm" variant="ghost" className="p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-transparent font-semibold text-xs">
                    <span>Technical Support</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </Card>
            </div>
          </section>

          {/* =========================================================
              SECTION 5: FAQ & COURSE DISCOVERY CTA
          ========================================================= */}
          <section className="mt-14 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-3 max-w-xl">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
                  Self-Service Answers
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Have More Questions?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Explore our searchable FAQ repository for immediate answers regarding curriculum, admissions, certificates, and technical requirements.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Link href="/faq">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 shadow-md gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Browse All FAQs</span>
                  </Button>
                </Link>

                <Link href="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold px-6 gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Explore Courses</span>
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ContactFormInner />
    </Suspense>
  );
}
