'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
} from 'lucide-react';

const supportedStacks = [
  'AI / ML Engineer',
  'Python 3.12 & PyTorch',
  'Full Stack Architect',
  'Next.js 15 & TypeScript',
  'Cloud Systems Lead',
  'Docker & Kubernetes',
  'Data Platform Engineer',
  'PostgreSQL & Vector DBs',
  'Backend Microservices',
  'FastAPI & System Design',
  'LLM Application Developer',
  'LangChain & RAG Systems',
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-16 sm:pt-16 sm:pb-24 w-full">
      {/* ─── CREATIVE BACKGROUND SYSTEM ─── */}
      {/* 1. Subtle Animated Gradient Mesh Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-blue-400/12 via-indigo-300/10 to-purple-400/12 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-[450px] h-[450px] bg-blue-300/10 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[450px] h-[450px] bg-purple-300/10 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      {/* 2. Creative Blueprint Grid Layer */}
      <div className="absolute inset-0 bg-creative-grid opacity-60 pointer-events-none" />

      {/* 3. Decorative Ambient Floating Circles */}
      <div className="absolute top-12 left-1/4 w-72 h-72 rounded-full border border-blue-200/30 pointer-events-none animate-float-slow" />
      <div className="absolute top-24 right-1/4 w-96 h-96 rounded-full border border-indigo-200/25 pointer-events-none animate-float-reverse" />

      <div className="w-full px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Map Your Career Trajectory.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-sans">
            Get an automated 4-pillar ATS resume diagnosis, pinpoint exact skill gaps against production market criteria, and follow structured milestone roadmaps with applied code blueprints.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="relative group overflow-hidden px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <span>Start Free Career Diagnosis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
            </Link>

            <a
              href="#how-it-works"
              className="px-7 py-4 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
            >
              Explore How It Works
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free diagnostic on sign-up
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free &amp; Open Access
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant vector analysis
            </span>
          </div>
        </div>

        {/* ─── FACTUAL PLATFORM CAPABILITY STATS BAR ─── */}
        <div className="mt-14 w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/90 shadow-sm">
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">4 AI</div>
            <div className="text-xs font-medium text-slate-500 mt-1 font-sans">Autonomous Agents</div>
          </div>
          <div className="text-center p-3 border-l border-slate-200/80">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">4-Pillar</div>
            <div className="text-xs font-medium text-slate-500 mt-1 font-sans">ATS Resume Diagnostic</div>
          </div>
          <div className="text-center p-3 border-l-0 md:border-l border-slate-200/80">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">4-Stage</div>
            <div className="text-xs font-medium text-slate-500 mt-1 font-sans">Roadmap Flowchart</div>
          </div>
          <div className="text-center p-3 border-l border-slate-200/80">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">100%</div>
            <div className="text-xs font-medium text-slate-500 mt-1 font-sans">Private Data Isolation</div>
          </div>
        </div>

        {/* ─── SUPPORTED TRACKS & TECH STACKS TICKER ─── */}
        <div className="mt-14 text-center w-full">
          <p className="text-xs font-semibold text-slate-500 font-sans mb-6">
            Supported career tracks &amp; production technologies
          </p>

          <div className="overflow-hidden py-2 relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee space-x-6 sm:space-x-8">
              {[...supportedStacks, ...supportedStacks].map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 bg-white/95 backdrop-blur-xs border border-slate-200/80 px-4 py-2 rounded-full shadow-2xs transition-colors shrink-0 inline-flex items-center gap-2 cursor-default"
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
