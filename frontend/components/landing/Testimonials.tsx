'use client';

import { Star, CheckCircle, Quote, Building } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Rivera',
    initials: 'AR',
    currentRole: 'Senior AI Engineer @ Stripe',
    previousRole: 'Mid-Level Python Dev ($85k)',
    salaryJump: '+$75,000 Increase',
    rating: 5,
    quote: 'The skill gap breakdown was brutally accurate. It pinpointed that I was missing vector caching and distributed model serving. Followed the 4-stage roadmap, finished the capstone, and received two senior offers within 6 weeks.',
  },
  {
    name: 'Priya Sharma',
    initials: 'PS',
    currentRole: 'Full Stack Architect @ Microsoft',
    previousRole: 'Frontend Developer ($95k)',
    salaryJump: '+$55,000 Increase',
    rating: 5,
    quote: 'The mandatory ATS resume diagnostic fixed my bullet points completely. My callback rate jumped from 5% to over 40%. The AI mock technical interviews prepared me for every single system design question Microsoft threw at me.',
  },
  {
    name: 'David Chen',
    initials: 'DC',
    currentRole: 'Cloud Solutions Lead @ AWS Partner',
    previousRole: 'Systems Admin ($80k)',
    salaryJump: '+$60,000 Increase',
    rating: 5,
    quote: 'Never seen a career platform this actionable. Instead of random courses, I had a custom sequenced roadmap with code blueprints. It saved me at least 6 months of aimless tutorial browsing.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            Real Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            From Underpaid To Senior Tech Offers
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
            Hear how engineers transformed their careers and multiplied their compensation using CareerPath.
          </p>
        </div>

        {/* ─── 3 TESTIMONIAL CARDS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/70">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {t.name}
                    </h4>
                    <span className="text-[11px] text-blue-600 font-semibold block">
                      {t.currentRole}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 bg-white p-2 rounded-xl border border-slate-200/70 mt-2">
                  <span>Prev: {t.previousRole}</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {t.salaryJump}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
