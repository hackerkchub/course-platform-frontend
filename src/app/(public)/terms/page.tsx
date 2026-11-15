import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site-url';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Scale,
  UserCheck,
  BookOpen,
  GraduationCap,
  ShieldAlert,
  HelpCircle,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/terms`;

  return {
    title: 'Terms of Service | Course Platform',
    description:
      'Review the terms, student code of conduct, and acceptable use guidelines governing Course Platform cohorts, operated by Softmaxs Solution LLP.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Terms of Service | Course Platform — Softmaxs Solution LLP',
      description:
        'Official Terms of Service outlining account obligations, learning access, intellectual property, and community guidelines.',
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default function TermsOfServicePage() {
  const siteUrl = getSiteUrl();
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">Terms of Service</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
            <Scale className="w-3.5 h-3.5" />
            <span>Platform Agreement & Student Guidelines</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Effective Date: November 2026 • Published by Softmaxs Solution LLP for Course Platform (
            <span className="font-mono text-xs">{siteUrl}</span>)
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Purpose Overview */}
        <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <span>1. Platform Purpose & Agreement to Terms</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Course Platform is an educational software development platform created and operated by Softmaxs Solution LLP.
            We provide structured engineering curricula, live cohort training, hands-on lab projects, and faculty mentorship.
            By signing in with Google, browsing our courses, submitting inquiries, or enrolling in cohort batches, you agree to
            comply with these Terms of Service.
          </p>
        </Card>

        {/* Section 2: Account Registration */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>2. Account Registration and Responsibility</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Access to student portals, enrolled curriculum lessons, demo bookings, and reviews requires an active account:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Google Authentication:</strong> You register and authenticate
                using your personal Google Account. You are responsible for safeguarding your Google credentials and all activity under
                your platform session.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Account Accuracy:</strong> You agree to provide accurate and
                truthful details when submitting inquiries, booking demo classes, or updating your student profile.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Single Identity:</strong> Accounts may not be shared, rented,
                or transferred to third parties. If you suspect unauthorized access to your account, you must immediately log out using
                the platform logout function to revoke all active session tokens.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: User Conduct */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>3. Student Code of Conduct & Acceptable Use</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>To preserve a professional, constructive learning environment, all users must adhere to ethical conduct:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Respectful Communication:</strong> Treat fellow learners,
                faculty instructors, and admissions counselors with professionalism in cohort interactions, reviews, and messaging channels.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">No Automated Scraping or Attacks:</strong> You may not perform
                automated data scraping, vulnerability probing, denial-of-service attempts, or bypass rate-limiting middleware.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">No Replay or Token Abuse:</strong> Attempting to tamper with,
                replay, or manipulate cryptographic JWT tokens or HMAC signed material links will result in immediate session revocation.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Honest Evaluation:</strong> When completing eligibility
                questionnaires or course reviews, submit authentic reflections of your background and learning experience.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Course Enrollment & Curriculum Access */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>4. Course Enrollment and Curriculum Access</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>Enrollment and participation in platform courses operate under these operational parameters:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Free & Open Enrollments:</strong> Courses marked as free or open
                can be enrolled directly via self-service through your student account.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Batch Allocation:</strong> Live cohort courses are organized
                in specific scheduled batches. Batch timings, seat limits, and faculty assignments are scheduled to maximize mentorship quality.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Admissions-Assisted Programs:</strong> Specialized cohort
                programs with restricted seating or prerequisite criteria are coordinated directly through our admissions counseling team.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Curriculum Evolution:</strong> Softmaxs Solution LLP periodically
                updates course modules, lessons, and project requirements to stay aligned with current software industry tooling and standards.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Intellectual Property */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>5. Intellectual Property & Material Usage</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>All platform curricula, lecture materials, and platform code are proprietary assets:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Proprietary Content:</strong> Syllabi, video lessons, slide decks,
                exercises, and downloadable guides are owned by Softmaxs Solution LLP and contributing instructors.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Limited Personal License:</strong> Enrolled students receive a
                non-exclusive, personal, non-transferable license to view and complete exercises for individual educational purposes.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">No Redistribution:</strong> You may not record, redistribute,
                resell, publicize, or publicly broadcast course videos or downloadable materials without prior written consent.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 6: Assessments, Reviews & Eligibility */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>6. Assessments, Eligibility & Reviews</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Eligibility Assessments:</strong> Prerequisite tests and
                evaluations are advisory tools designed to confirm technical readiness. They do not constitute a university entrance exam
                or government accreditation.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">No Job Guarantees:</strong> Softmaxs Solution LLP prepares
                students with rigorous software engineering curricula and practical skills. However, the platform does not promise,
                warrant, or guarantee employment, placement offers, or specific compensation outcomes.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Review Moderation:</strong> To ensure authenticity and protect
                the community, all submitted course reviews are moderated by platform administrators prior to public display. We reserve the
                right to decline reviews containing defamatory, spam, or abusive language.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 7: Availability & Suspension */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>7. Platform Availability & Account Termination</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Platform Availability:</strong> While we endeavor to provide
                continuous service, Course Platform is delivered on an as-available basis. Maintenance windows, updates, or unforeseen
                network disruptions may occasionally affect service availability.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Account Suspension:</strong> Softmaxs Solution LLP reserves the
                right to suspend or deactivate student access if an account violates these Terms, exhibits suspicious or fraudulent activity,
                or breaches the code of conduct.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 8: Inquiries & Contact */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>8. Questions & Support Contacts</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              For questions concerning these Terms of Service, cohort admissions, or platform operations, please contact our academic team:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {supportEmail && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email Inquiries</p>
                    <a href={`mailto:${supportEmail}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:underline">
                      {supportEmail}
                    </a>
                  </div>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Admissions Helpline</p>
                    <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:underline">
                      {contactPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 pt-2">
              You can also reach our team via our{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact & Admissions Desk page
              </Link>.
            </p>
          </div>
        </section>

        {/* Operational Disclaimer */}
        <section className="border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500 leading-relaxed">
          <p>
            <strong>Note on Company Review:</strong> These Terms of Service reflect the operational architecture and policies of Course Platform
            as implemented by Softmaxs Solution LLP. Formal legal terms, commercial payment agreements, and jurisdiction clauses should be
            reviewed and ratified by authorized company legal representatives prior to public commercial scaling.
          </p>
        </section>
      </main>
    </div>
  );
}
