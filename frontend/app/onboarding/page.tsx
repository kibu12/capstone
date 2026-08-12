import { Suspense } from 'react';
import AssessmentWizard from '@/components/onboarding/AssessmentWizard';

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
          Loading Assessment Wizard...
        </div>
      }>
        <AssessmentWizard />
      </Suspense>
    </div>
  );
}
