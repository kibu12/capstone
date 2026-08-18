'use client';

import {
  FileCheck,
  Target,
  Code2,
  Mic,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const businessFeatures = [
  {
    title: 'Automated ATS Resume Scanner',
    tag: 'Never Get Screened Out',
    description: 'Get an instant 4-pillar audit of your resume: section formatting, action verb impact, metric density, and keyword alignment against target jobs.',
    icon: FileCheck,
    metric: '98% ATS Pass Rate',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    link: '/signup',
  },
  {
    title: 'Factual AI Skill Gap Delta',
    tag: 'No Hallucinations',
    description: 'Our Multi-Agent RAG engine compares your exact background with real-time market vector requirements, isolating high-yield missing skills.',
    icon: Target,
    metric: '3-Minute Diagnosis',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    link: '/signup',
  },
  {
    title: 'Production Capstone Briefs',
    tag: 'Impress Hiring Managers',
    description: 'Build end-to-end architectures with step-by-step code specs, architectural blueprints, and GitHub-ready project setups.',
    icon: Code2,
    metric: 'Portfolio-Grade Specs',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    link: '/signup',
  },
  {
    title: 'AI Mock Technical Interviews',
    tag: 'Ace The Final Round',
    description: 'Simulate live technical interviews. Get real-time AI scoring on conceptual accuracy, communication structure, and trade-off analysis.',
    icon: Mic,
    metric: 'Real-Time Rubric Scoring',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    link: '/signup',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-slate-50/70 relative overflow-hidden w-full border-t border-slate-100">
      {/* ─── CREATIVE BACKGROUND DECOR ─── */}
      {/* Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-creative-dots opacity-70 pointer-events-none" />

      {/* Ambient soft glow blobs */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-300/12 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-14">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-medium font-sans mb-2.5">
            Why It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Everything You Need To Secure A Senior Offer
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
            Built by engineers from top tech companies to give candidates a direct, unfair advantage in the hiring pipeline.
          </p>
        </div>

        {/* ─── 4 BUSINESS OUTCOMES CARDS (FULL WIDTH RESPONSIVE GRID) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
          {businessFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-2xl border ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full font-sans">
                      {feat.metric}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-blue-600 font-sans block mb-1">
                    {feat.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 font-display">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={feat.link}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group font-sans"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
