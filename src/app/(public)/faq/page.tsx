'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FAQ_ITEMS, FAQ_CATEGORIES } from '@/data/faqs';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Search,
  ChevronDown,
  MessageCircle,
  Sparkles,
  ArrowRight,
  FilterX,
} from 'lucide-react';

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['adm-1', 'cur-1']);

  const toggleFaq = (id: string) => {
    setOpenFaqIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = (itemsToOpen: string[]) => {
    setOpenFaqIds(itemsToOpen);
  };

  const handleCollapseAll = () => {
    setOpenFaqIds([]);
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter(faq => {
      const matchesCategory =
        selectedCategory === 'All' || faq.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const rawPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const cleanPhone = (rawPhone || '').replace(/\D/g, '');
  const waNumber =
    cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? cleanPhone
      : cleanPhone;

  // Schema.org FAQPage Structured Data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
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

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Help & FAQs' },
              ]}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-950 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Got Questions? We Have Transparent Answers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about curriculum, admissions, live cohort sessions, payment models, and direct instructor mentorship.
          </p>

          {/* Interactive Search Bar */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by topic, e.g., 'certificate', 'refund', 'prerequisites'..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Questions ({FAQ_ITEMS.length})
          </button>
          {FAQ_CATEGORIES.map(category => {
            const count = FAQ_ITEMS.filter(item => item.category === category).length;
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Results Controls Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredFaqs.length}</strong> questions
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleExpandAll(filteredFaqs.map(f => f.id))}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map(item => {
              const isOpen = openFaqIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
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
                        isOpen ? 'rotate-180 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <FilterX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white">No questions matched your search</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try searching for different keywords or clear your active category filter.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Unanswered Questions Support Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold">Have a question not listed here?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Our academic counseling desk is available to assist you with customized cohort planning, batch timings, and curriculum details.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Hello Softmaxs Solution Admissions Team, I have a question regarding courses and cohort schedules.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="success" size="sm" className="font-semibold gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </Button>
              </a>
            )}

            <Link href="/contact">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 font-semibold gap-1.5">
                <span>Admissions Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
