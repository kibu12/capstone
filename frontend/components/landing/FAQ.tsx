'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const honestFaqs = [
  {
    question: 'Is CareerPath really free to use?',
    answer: 'Yes! All 8 core intelligence tools—including the Automated Onboarding Diagnostic, Mandatory Profile ATS Scanner, 4-Stage Roadmap Flowchart, Skills & Learning Hub, MCQ Assessments, Capstone Project Briefs, and AI Mock Technical Interview Simulator—are 100% unlocked and free for registered candidates.',
  },
  {
    question: 'How is CareerPath different from LeetCode or random online courses?',
    answer: 'Generic platforms give you endless disconnected exercises without direction. CareerPath uses a Multi-Agent RAG engine to compare your verified background against production market criteria, isolating the exact high-yield skill gaps holding you back and generating a sequenced 4-stage progression path.',
  },
  {
    question: 'How does the mandatory ATS Resume Audit work?',
    answer: 'When you upload or paste your resume in your profile, our background engine parses 4 critical pillars: Section & Contact Formatting, Action Verb Impact, Quantified Metric Density, and Keyword Alignment against your target engineering role. You receive an instant scorecard with missing high-yield keyword recommendations.',
  },
  {
    question: 'Can I retake the assessment as I learn new skills?',
    answer: 'Yes. You can retake the career wizard assessment at any time from your profile or header menu. Your readiness score, skill matrix, and milestone recommendations will dynamically update to reflect your new capabilities.',
  },
  {
    question: 'Is my resume and career data kept confidential?',
    answer: 'Absolutely. We enforce Row-Level Security (RLS) across all database tables. Your resume text, assessment telemetry, and interview responses are strictly isolated to your authenticated account and are never shared or sold.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-slate-50 relative overflow-hidden w-full">
      <div className="w-full px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-medium font-sans mb-2.5">
            Honest &amp; Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-sans">
            Everything you need to know about how the platform accelerates your career.
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto w-full">
          {honestFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-display">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 shadow-2xs ${isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-200 font-sans bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
