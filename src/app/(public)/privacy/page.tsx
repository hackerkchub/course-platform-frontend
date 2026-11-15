import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site-url';
import { Card } from '@/components/ui/card';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileText,
  UserCheck,
  Eye,
  Database,
  HelpCircle,
  ExternalLink,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/privacy`;

  return {
    title: 'Privacy Policy | Course Platform',
    description:
      'Learn how Course Platform (Softmaxs Solution LLP) collects, manages, and protects your account details, learning progress, and platform data.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Privacy Policy | Course Platform — Softmaxs Solution LLP',
      description:
        'Official Privacy Policy explaining our verified authentication, data protection, course progress tracking, and session handling practices.',
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default function PrivacyPolicyPage() {
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
            <span className="text-slate-800 dark:text-slate-200 font-medium">Privacy Policy</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Effective Date: November 2026 • Published by Softmaxs Solution LLP for Course Platform (
            <span className="font-mono text-xs">{siteUrl}</span>)
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Transparency Notice */}
        <Card className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 space-y-2">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold text-sm">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Platform Commitment to Transparent Data Practices</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Softmaxs Solution LLP operates Course Platform to provide software engineering certification cohorts,
            curriculum learning modules, and instructor mentorship. This policy reflects our actual technical implementation
            and architecture regarding authentication, course progress, secure materials, and inquiry communication.
          </p>
        </Card>

        {/* Section 1: Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>1. Information We Collect</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              We collect only the information necessary to provide authentication, deliver cohort course curricula, track your
              learning progress, and facilitate counselor communication:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Google Account Authentication:</strong> When you sign in
                using Google OAuth (Google Identity Services), we receive your verified full name, verified email address, Google
                user ID (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">google_id</code>), and avatar image URL. We do not store or process passwords.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">User Profile Details:</strong> Your registered account role
                (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">user</code>,{' '}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">counsellor</code>,{' '}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">admin</code>,{' '}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">super_admin</code>), account status,
                and any contact phone number you voluntarily provide.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Course & Learning Progress:</strong> For enrolled courses,
                our systems store batch enrollments, lesson completion status, and your video playback position (in seconds) to
                enable resume playback across sessions.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Demo Class & Admissions Inquiries:</strong> When you book a demo
                class or contact admissions, we record your name, email, phone number, course of interest, preferred schedule slot, and
                counselor follow-up notes.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Eligibility Assessments:</strong> Questionnaire responses
                submitted to evaluate course prerequisite readiness and the resulting eligibility score.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Student Reviews & Feedback:</strong> Star ratings, review titles,
                and commentary submitted for completed courses, which are moderated before publication.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Platform Telemetry:</strong> Aggregated, rate-limited counts of
                course page views, course link shares, and direct inquiry clicks to measure curriculum engagement.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: How Information Is Used */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>2. How We Use Your Information</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>Your data is used solely for core educational and administrative functions:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Authenticating your session and verifying role permissions for dashboard access.</li>
              <li>Providing course curriculum access, streaming lesson materials, and synchronizing lesson progress.</li>
              <li>Scheduling live cohort batches and coordinating demo class attendance.</li>
              <li>Responding to admissions questions via email, phone, or WhatsApp desks.</li>
              <li>Moderating student reviews to maintain community trust and prevent abusive submissions.</li>
              <li>Securing platform systems against unauthorized access, brute-force attempts, and token replay attacks.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Authentication, Cookies & Storage */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <span>3. Authentication, Cookies, and Local Storage</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Course Platform utilizes secure, HTTP-only cookie architecture to protect student sessions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Access Token Cookie (<code>access_token</code>):</strong> A short-lived JSON Web Token
                (15-minute TTL) set with <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">HttpOnly; Secure; SameSite=Lax</code>.
                It cannot be accessed by client-side JavaScript, protecting against cross-site scripting (XSS) extraction.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Refresh Token Cookie (<code>refresh_token</code>):</strong> A cryptographic token (30-day TTL)
                stored in database records exclusively as a SHA-256 hash. Used to automatically renew access tokens.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Token Replay Detection:</strong> If an already-revoked refresh
                token is re-presented, our security layer flags a replay attack and immediately revokes all active sessions for that account.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Browser Local Storage:</strong> Client storage is utilized
                strictly for non-sensitive UI state and cached review references scoped specifically to the authenticated user ID.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Course Materials & Downloads */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>4. Course Materials and Download Security</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Downloadable course materials (PDF guides, code exercises, project archives) are strictly gated:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Non-preview materials require an active enrollment verified by our backend server.</li>
              <li>
                Downloads are authorized via HMAC-signed, time-limited URLs that expire after 10 minutes, preventing unauthorized link sharing.
              </li>
              <li>Direct directory traversal is rejected through server-side path normalization and boundary verification.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Third-Party Service Providers */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            <span>5. Third-Party Service Integrations</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>We integrate with verified third-party technology providers to deliver platform services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Google Identity Services (Google LLC):</strong> Facilitates
                one-click OAuth 2.0 sign-in. Google&apos;s privacy policy applies to your Google Account data.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Video Streaming Platforms:</strong> Embedded curriculum video
                players may load stream content from verified providers (e.g., YouTube or specialized video hosts) subject to their playback terms.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">WhatsApp (Meta Platforms):</strong> Optional direct admissions
                messaging opens directly via <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">wa.me</code> redirects,
                governed by WhatsApp&apos;s standard encryption and privacy terms.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 6: Security Safeguards */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span>6. Technical Data Safeguards</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>Our infrastructure incorporates defensive security standards:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Transport Layer Security (TLS/HTTPS) enforced across all frontend routes and API endpoints.</li>
              <li>Automated error sanitization that redacts internal database schemas and server stack traces.</li>
              <li>IP-based rate limiting to mitigate denial-of-service, brute-force login, and automated scrapers.</li>
              <li>Strict server-side role authorization protecting administrative and counselor management operations.</li>
            </ul>
          </div>
        </section>

        {/* Section 7: Inquiries and Contact Channels */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>7. Contact Channels & Inquiries</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              If you have questions regarding your platform account, enrolled data, or this policy, please connect with our admissions
              and academic support desk:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {supportEmail && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email Support</p>
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
              You may also reach our team through the verified online channels on our{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact & Admissions Desk page
              </Link>.
            </p>
          </div>
        </section>

        {/* Operational Disclaimer */}
        <section className="border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500 leading-relaxed">
          <p>
            <strong>Note on Company Review:</strong> This privacy policy document articulates the current operational and technical
            mechanisms in Course Platform as built by Softmaxs Solution LLP. Future statutory requirements, regional regulatory disclosures,
            or external legal reviews may prompt updates to this document.
          </p>
        </section>
      </main>
    </div>
  );
}
