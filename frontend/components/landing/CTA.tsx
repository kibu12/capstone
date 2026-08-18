'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-slate-50 border-t border-slate-200/80 w-full">
      {/* Decorative Subtle Ambient Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 relative z-10 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-medium font-sans mb-3">
          Accelerate Your Career Today
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-display max-w-4xl mx-auto leading-tight">
          Ready To Stop Guessing And Land Your Senior Tech Offer?
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          Accelerate your career trajectory with automated resume diagnostics, factual skill gap benchmarks, and structured milestone roadmaps.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="relative group overflow-hidden px-9 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <span>Start Free Career Diagnosis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Free For All Candidates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Instant ATS Resume Audit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Credit Card Required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
