import React from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, Phone, ShieldCheck } from 'lucide-react';

export function Footer() {
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();

  return (
    <footer className="w-full border-t border-slate-200/80 bg-slate-50/60 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Course<span className="text-blue-600">Platform</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Industry-aligned certification programs and live cohorts engineered to master modern software development.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Curriculum & Instructors</span>
            </div>
          </div>

          {/* Featured Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Programs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/courses?category=full-stack-web-development" className="hover:text-blue-600 transition-colors">
                  Full Stack Web Development
                </Link>
              </li>
              <li>
                <Link href="/courses?category=backend-engineering" className="hover:text-blue-600 transition-colors">
                  Backend & Distributed Systems
                </Link>
              </li>
              <li>
                <Link href="/courses?category=cloud-devops" className="hover:text-blue-600 transition-colors">
                  Cloud Architecture & DevOps
                </Link>
              </li>
              <li>
                <Link href="/courses?category=data-science-ai" className="hover:text-blue-600 transition-colors">
                  Data Science & Machine Learning
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/courses" className="hover:text-blue-600 transition-colors">
                  Browse All Courses
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="hover:text-blue-600 transition-colors">
                  Faculty Directory
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About Our Pedagogy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-600 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition-colors">
                  Admissions Helpline
                </Link>
              </li>
            </ul>
          </div>

          {/* Admissions & Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Admissions Desk
            </h4>
            <ul className="space-y-3 text-sm">
              {contactPhone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {contactPhone}
                  </a>
                </li>
              )}
              {supportEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${supportEmail}`}
                    className="hover:text-blue-600 transition-colors truncate"
                  >
                    {supportEmail}
                  </a>
                </li>
              )}
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Online Help & Inquiries</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CoursePlatform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
