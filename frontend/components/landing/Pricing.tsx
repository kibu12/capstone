'use client';

import Link from 'next/link';
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck,
  GraduationCap,
  Compass,
  HelpCircle,
  FolderHeart,
  Mic,
  Award,
} from 'lucide-react';

const realFeatures = [
  {
    title: 'Automated Profile Diagnostic',
    description: 'Calculates your baseline match score (0-100%) against target engineering roles.',
    route: '/onboarding',
    icon: Award,
  },
  {
    title: 'Mandatory ATS Resume Audit',
    description: '4-pillar scan (Formatting, Impact Verbs, Metric Density, Keyword Alignment) with optimization playbook.',
    route: '/profile',
    icon: FileCheck,
  },
  {
    title: '4-Stage Sequential Roadmap',
    description: 'Structured progression flowchart from foundational milestones to senior placement readiness.',
    route: '/roadmap',
    icon: Compass,
  },
  {
    title: 'Competency Skills & Learning Hub',
    description: 'Interactive skill gap tracker with real-time status advancement, adaptive study guides, and code labs.',
    route: '/learning',
    icon: GraduationCap,
  },
  {
    title: 'MCQ Concept Assessments',
    description: 'Diagnostic multiple-choice tests with timed questions, explanations, and instant score telemetry.',
    route: '/quiz',
    icon: HelpCircle,
  },
  {
    title: 'Portfolio Capstone Projects',
    description: 'Real-world project briefs with architectural specs, difficulty tiers, and GitHub-ready challenge criteria.',
    route: '/projects',
    icon: FolderHeart,
  },
  {
    title: 'AI Mock Technical Interviews',
    description: 'Interactive scenario-based interview practice with real-time AI rubric scoring and critique.',
    route: '/interview',
    icon: Mic,
  },
  {
    title: 'Private Isolated Workspace',
    description: 'Row-Level Security (RLS) ensuring your resume, scores, and career data remain 100% confidential.',
    route: '/dashboard',
    icon: ShieldCheck,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-slate-50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>100% Free &amp; Fully Unlocked</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Every Single Feature. Completely Free.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
            No paywalls. No hidden subscriptions. No locked tiers. All 8 intelligence tools are fully built and accessible to all registered users immediately.
          </p>
        </div>

        {/* ─── ALL-INCLUSIVE FULLY UNLOCKED CARD ─── */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-3">
                All-Access Pass
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                CareerPath Complete Platform
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Full access to our Multi-Agent RAG diagnostic engine, ATS resume optimizer, 4-stage roadmaps, interactive code labs, capstones, and AI mock interviews.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-start md:items-end shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-6xl font-black font-display text-white">$0</span>
                <span className="text-xs font-semibold text-slate-400 font-mono">/ Free Forever</span>
              </div>
              <Link
                href="/signup"
                className="mt-4 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Grid of All Real Built Features */}
          <div className="p-8 sm:p-10 bg-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-6">
              Included &amp; Available In The Platform Right Now:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {realFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                        {feat.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Live &amp; Functional</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
