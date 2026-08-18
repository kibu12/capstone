import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';

export default function MarketingPage() {
  return (
    <div className="bg-white min-h-screen selection:bg-blue-600 selection:text-white w-full">
      {/* Clean Google Learning Style Header (Full Width) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs w-full">
        <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-slate-900 tracking-tight font-display">
                CareerPath
              </span>
              <span className="text-slate-300 font-light">|</span>
              <span className="text-sm font-medium text-slate-600 font-sans">
                Learning
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-1.5 font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-5 py-2.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        <Hero />
        <Features />
        <HowItWorks />
        <FAQ />
        <CTA />
      </main>

      <footer className="bg-slate-50 text-slate-600 py-14 border-t border-slate-200 w-full">
        <div className="w-full px-6 sm:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                CP
              </div>
              <span className="text-slate-900 font-bold text-sm font-display">CareerPath AI</span>
            </div>
            <p className="text-slate-500 leading-relaxed font-sans max-w-sm">
              The AI Career Architecture platform trusted by engineers worldwide to accelerate their career trajectories.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-3 font-sans text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-slate-500 font-sans">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">ATS Resume Scanner</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">RAG Skill Gap Delta</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Portfolio Capstones</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">AI Mock Interviews</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-3 font-sans text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-slate-500 font-sans">
              <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">4-Stage Methodology</a></li>
              <li><a href="#faq" className="hover:text-blue-600 transition-colors">Candidate FAQs</a></li>
              <li><Link href="/signup" className="hover:text-blue-600 transition-colors">Free Registration</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 transition-colors">Member Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-3 font-sans text-xs uppercase tracking-wider">Trust &amp; Security</h4>
            <ul className="space-y-2 text-slate-500 font-sans">
              <li><span className="text-slate-600">Row-Level Data Privacy</span></li>
              <li><span className="text-slate-600">100% Free For All Candidates</span></li>
              <li><span className="text-slate-600">Open Technical Architecture</span></li>
            </ul>
          </div>
        </div>

        <div className="w-full px-6 sm:px-10 lg:px-16 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} CareerPath Inc. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-800 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
