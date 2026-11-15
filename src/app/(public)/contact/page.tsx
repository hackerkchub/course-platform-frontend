'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Video,
  AlertCircle,
  Sparkles,
  Info,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address').max(191),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit Indian mobile number starting with 6-9'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [submissionStatus, setSubmissionStatus] = useState<{
    attempted: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

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
    'Hello! I would like more information regarding Course Platform live cohort batches, curriculum syllabi, and upcoming schedules.'
  );
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${prefilledWaMessage}` : null;

  const onSubmit = async (data: ContactFormData) => {
    if (!data.name || !data.email) return;

    // Honest guidance: generic /api/contact endpoint is not present on the backend.
    setSubmissionStatus({
      attempted: true,
      valid: true,
      message:
        'Thank you for providing your inquiry details. Our admissions desk currently processes inquiries directly via WhatsApp, Phone, and Course-Level Demo Bookings. Please reach out to us directly through the verified direct channels below for the fastest response.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admissions & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Connect With Our Admissions Desk
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get in touch with Softmaxs Solution LLP academic counselors for cohort schedules, curriculum breakdowns, and free demo classes.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Direct Communication Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Channel 1: WhatsApp Admissions Chat */}
          {waUrl ? (
            <Card className="p-6 rounded-2xl border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  WhatsApp Admissions
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Chat directly with an academic counselor for immediate batch schedules and syllabus queries.
                </p>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
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
            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Admissions Helpline
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Reach our counseling desk by telephone during regular office hours.
                </p>
              </div>
              {contactPhone && (
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`}>
                  <Button size="sm" variant="outline" className="w-full gap-2 font-semibold">
                    <Phone className="w-4 h-4" />
                    <span>Call {contactPhone}</span>
                  </Button>
                </a>
              )}
            </Card>
          )}

          {/* Channel 2: Telephone Helpline */}
          <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Call Admissions
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Speak directly with an academic advisor regarding eligibility, installments, and curriculum tracks.
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
              <span className="text-xs text-slate-500">Helpline active via WhatsApp & Email</span>
            )}
          </Card>

          {/* Channel 3: Email Support */}
          <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Email Support
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Send formal enrollment inquiries, corporate batch requests, or institutional communications.
              </p>
            </div>
            {supportEmail ? (
              <a href={`mailto:${supportEmail}?subject=Admissions%20Inquiry`}>
                <Button size="sm" variant="outline" className="w-full gap-2 font-semibold truncate">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{supportEmail}</span>
                </Button>
              </a>
            ) : (
              <span className="text-xs text-slate-500">Official email available in footer</span>
            )}
          </Card>

          {/* Channel 4: Book Demo Class Guidance */}
          <Card className="p-6 rounded-2xl border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Book a Free Demo Class
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Demo classes are booked per course with live instructor interaction. Select any course to reserve your demo session.
              </p>
            </div>
            <Link href="/courses">
              <Button size="sm" variant="primary" className="w-full gap-1.5 font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>Select a Course</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Informational Guidance Notice */}
        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 text-slate-800 dark:text-slate-200">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div className="text-xs sm:text-sm space-y-1">
            <p className="font-bold">Transparent Admissions Process</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              To ensure all student inquiries receive personalized technical attention, admissions and demo class bookings are connected to real cohort schedules. Please use the verified WhatsApp or telephone lines above, or browse any published program to book a free live demo session.
            </p>
          </div>
        </div>

        {/* Client-Side Validated Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                How Admissions Works
              </h3>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Choose your track and review syllabus requirements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Check academic eligibility directly on the course page.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Book a free interactive demo class with the lead instructor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Verify batch timings and payment installments transparently.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Explore Syllabi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Want to review modules and prerequisites before speaking with an advisor?
              </p>
              <Link href="/courses">
                <Button size="sm" variant="outline" className="w-full gap-2 font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Course Catalog</span>
                </Button>
              </Link>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Inquiry Assistance Form
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                Prepare your inquiry details. Our counselors will connect you with the appropriate technical instructor or batch coordinator.
              </p>

              {submissionStatus && (
                <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <div className="space-y-1">
                    <p className="font-bold">Next Steps for Fast Response</p>
                    <p className="leading-relaxed">{submissionStatus.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="e.g. Rahul Sharma"
                      error={errors.name?.message}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="email"
                      {...register('email')}
                      placeholder="e.g. rahul@example.com"
                      error={errors.email?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      {...register('phone')}
                      placeholder="10-digit mobile (e.g. 9876543210)"
                      error={errors.phone?.message}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      {...register('subject')}
                      placeholder="e.g. Cohort Prerequisites & Schedule"
                      error={errors.subject?.message}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Message / Question <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Describe your technical background, course questions, or learning goals..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-500">{errors.message.message}</p>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto font-bold px-8"
                  >
                    Submit Inquiry Details
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
                        className="w-full sm:w-auto gap-2 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 font-semibold"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>Or Inquire via WhatsApp</span>
                      </Button>
                    </a>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
