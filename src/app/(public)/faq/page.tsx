'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FAQ_ITEMS, FAQ_CATEGORIES, POPULAR_TOPICS, FAQCategory } from '@/data/faqs';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Search,
  ChevronDown,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  FilterX,
  X,
  Phone,
  Mail,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Default first question in General and first in Courses open for welcoming UX
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['gen-1', 'crs-1']);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = (itemsToOpen: string[]) => {
    setOpenFaqIds(itemsToOpen);
  };

  const handleCollapseAll = () => {
    setOpenFaqIds([]);
  };

  const handlePopularTopicClick = (tag: string, category: string) => {
    setSearchQuery(tag);
    if (FAQ_CATEGORIES.includes(category as FAQCategory)) {
      setSelectedCategory(category as FAQCategory);
    } else {
      setSelectedCategory('All');
    }
  };

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return FAQ_ITEMS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'All' || faq.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!q) return true;

      const inQuestion = faq.question.toLowerCase().includes(q);
      const inAnswer = faq.answer.toLowerCase().includes(q);
      const inCategory = faq.category.toLowerCase().includes(q);
      const inTags = faq.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;

      return inQuestion || inAnswer || inCategory || inTags;
    });
  }, [selectedCategory, searchQuery]);

  const rawPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();

  const cleanPhone = (rawPhone || '').replace(/\D/g, '');
  const waNumber =
    cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? cleanPhone
      : cleanPhone;

  // Schema.org FAQPage Structured Data (only verified questions)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Schema.org FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-14 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="flex justify-center">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Help & Support' },
              ]}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>HELP & SUPPORT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Got Questions? We&apos;re Here to Help.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Find answers about Guidexa courses, learning experience, enrollment and platform features.
          </p>

          {/* Search FAQ Input */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative">
              <label htmlFor="faq-search-input" className="sr-only">
                Search frequently asked questions
              </label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="faq-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, e.g., 'certificate', 'prerequisites', 'enrollment', 'projects'..."
                className="w-full pl-11 pr-12 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm text-sm sm:text-base transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular Topics Quick Links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Popular topics:</span>
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => handlePopularTopicClick(topic.tag, topic.category)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Support CTA button in hero */}
          <div className="pt-2">
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              <span>Need personalized admissions counseling? Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ CATEGORIES & CONTENT
      ========================================================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {FAQ_CATEGORIES.map((category) => {
            const count =
              category === 'All'
                ? FAQ_ITEMS.length
                : FAQ_ITEMS.filter((item) => item.category === category).length;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Results Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredFaqs.length}</strong> questions
            {selectedCategory !== 'All' && (
              <> in &ldquo;<strong className="text-slate-900 dark:text-white">{selectedCategory}</strong>&rdquo;</>
            )}
            {searchQuery && (
              <> matching &ldquo;<strong className="text-slate-900 dark:text-white">{searchQuery}</strong>&rdquo;</>
            )}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleExpandAll(filteredFaqs.map((f) => f.id))}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Expand All
            </button>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3.5">
            {filteredFaqs.map((item) => {
              const isOpen = openFaqIds.includes(item.id);
              const answerId = `faq-answer-${item.id}`;
              const buttonId = `faq-btn-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-blue-300 dark:border-blue-700/80 bg-white dark:bg-slate-900 shadow-sm shadow-blue-500/5'
                      : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {item.question}
                      </h2>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <FilterX className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-bold text-slate-900 dark:text-white">No questions matched your search</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                We couldn&apos;t find any answers matching &ldquo;{searchQuery}&rdquo;. Try another term or reset your active filters.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="cursor-pointer"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* =========================================================
            SECTION 8: STILL NEED HELP SECTION
        ========================================================= */}
        <section className="mt-14 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dedicated Academic Desk</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Didn&apos;t Find Your Answer?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Our team can help you find the right information. Connect with our admissions desk
                for tailored cohort guidance, syllabus walkthroughs, and enrollment assistance.
              </p>

              {/* Direct Contacts Row */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
                {contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                      {contactPhone}
                    </a>
                  </div>
                )}
                {supportEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">
                      {supportEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 shadow-md gap-2">
                  <span>Contact Us</span>
                  <ArrowRight className="w-4 h-4" />
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

              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    'Hello Guidexa Admissions Desk, I have a question regarding courses and enrollment.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="success" size="lg" className="w-full font-semibold gap-2 px-6">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Desk
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
