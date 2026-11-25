'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export interface HomepageFaq {
  question: string;
  answer: string;
  category?: string;
}

export const HOMEPAGE_FAQS: HomepageFaq[] = [
  {
    question: 'Do I need programming experience to join?',
    answer:
      'No prior programming experience is required for our beginner-focused programs, such as Python Fundamentals and Web Development Basics. For intermediate or advanced tracks (such as Full Stack MERN or Distributed Systems), clear prerequisites are listed on the course page so you can choose the track that fits your background.',
    category: 'Getting Started',
  },
  {
    question: 'Which course should I start with?',
    answer:
      'If you are completely new to programming, we recommend starting with Python & Problem Solving or Web Development Fundamentals. If you already understand coding basics and want to build production applications, our Full Stack Web Development (MERN) or Data Structures & Algorithms programs are ideal starting points.',
    category: 'Course Selection',
  },
  {
    question: 'Will I work on projects?',
    answer:
      'Yes. Practical, project-based learning is the cornerstone of Guidexa. You will complete hands-on coding exercises, mini-projects, full-stack web applications, API integrations, and comprehensive capstone projects designed to demonstrate your practical technical competence.',
    category: 'Hands-on Learning',
  },
  {
    question: 'Will I get course materials?',
    answer:
      'Yes. Enrolled students receive full access to comprehensive learning resources, including structured module notes, code repositories, cheatsheets, and downloadable reference materials directly within the student learning portal.',
    category: 'Resources',
  },
  {
    question: 'Can I track my learning progress?',
    answer:
      'Yes. Guidexa features an integrated student performance dashboard where you can monitor lesson completions, video watch progress, quiz evaluations, assignment submissions, and overall course milestones across all your sessions in real time.',
    category: 'Progress Tracking',
  },
  {
    question: 'Are certificates available?',
    answer:
      'Yes. Upon successfully completing all required modules, lesson assessments, and capstone projects in a program, you will receive an official Guidexa course completion certificate complete with a verifiable credential ID.',
    category: 'Certification',
  },
  {
    question: 'How can I enroll in a course?',
    answer:
      'Browse our course catalog, choose the program that aligns with your learning goals, and click "Explore". From the course page, you can review upcoming batch schedules, explore demo sessions, or enroll directly using your student account.',
    category: 'Enrollment',
  },
];

export function FaqAccordion() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-4">
      {HOMEPAGE_FAQS.map((faq, index) => {
        const isOpen = openIndices.includes(index);
        const answerId = `homepage-faq-answer-${index}`;
        const buttonId = `homepage-faq-btn-${index}`;

        return (
          <div
            key={faq.question}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'border-blue-300 dark:border-blue-700/80 bg-white dark:bg-slate-900 shadow-md shadow-blue-500/5'
                : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <button
              id={buttonId}
              type="button"
              onClick={() => toggleIndex(index)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-2xl transition-colors"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                    isOpen
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="space-y-1">
                  {faq.category && (
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {faq.category}
                    </span>
                  )}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {faq.question}
                  </h3>
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                  isOpen
                    ? 'rotate-180 bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
                    : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
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
                className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30"
              >
                <p className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  <span>{faq.answer}</span>
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
