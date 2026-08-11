import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-32">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-6">
            Agentic AI & RAG Powered
          </span>

          <h1 className="mx-auto max-w-4xl font-display text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
            Your Career. <span className="relative whitespace-nowrap text-indigo-600">Mapped by AI.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-600">
            Discover the skills you need, the roles you are suited for, and the fastest path to becoming career-ready with RAG-retrieved intelligence.
          </p>

          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" className="px-8 font-semibold">Build My Career Path</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="px-8 font-semibold">Explore How It Works</Button>
            </a>
          </div>
        </div>

        {/* Dashboard Preview / Mockup */}
        <div className="mt-16 sm:mt-20 relative rounded-2xl bg-white/50 p-2 ring-1 ring-slate-900/10 backdrop-blur-sm max-w-5xl mx-auto shadow-xl">
          <div className="rounded-xl border border-slate-100 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-4 py-3">
              <div className="flex space-x-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs font-medium text-slate-400">career-pathfinder.io/dashboard</div>
              <div className="w-12" />
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Readiness Score Mockup */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Career Readiness</div>
                <div className="relative flex items-center justify-center w-24 h-24 mb-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="40" stroke="#4f46e5" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset="75" />
                  </svg>
                  <span className="absolute text-xl font-bold text-slate-800">72%</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Target Role: AI Engineer</span>
              </div>

              {/* Skill gaps mock */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 col-span-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Priority Skill Gaps</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Machine Learning</span>
                      <span className="text-rose-600">Critical Gap</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[45%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Deep Learning</span>
                      <span className="text-rose-600">Critical Gap</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[30%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Python Core</span>
                      <span className="text-emerald-600">Strong</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[90%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
