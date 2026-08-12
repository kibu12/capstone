import Link from 'next/link';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';

export default function MarketingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Mini header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              CP
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight uppercase">
              Career Pathfinder
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <span className="inline-flex items-center justify-center font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 transition-all shadow-sm">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-850">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Career Pathfinder Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
