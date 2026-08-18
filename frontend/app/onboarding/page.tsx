import { Suspense } from 'react';
import AssessmentWizard from '@/components/onboarding/AssessmentWizard';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50/80 py-10 px-4 sm:px-8 relative overflow-hidden flex flex-col justify-center">
      {/* Background Subtle Ambient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              Loading Career Assessment Studio...
            </div>
          </div>
        }>
          <AssessmentWizard />
        </Suspense>
      </div>
    </div>
  );
}
