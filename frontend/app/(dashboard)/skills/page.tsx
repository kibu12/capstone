'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Loader2, BookOpen } from 'lucide-react';

export default function SkillsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/learning?tab=skills');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="p-8 text-center max-w-sm mx-auto shadow-xs border-indigo-100">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-900 mb-1">Redirecting to Skills & Learning Hub...</h2>
        <p className="text-xs text-slate-500 mb-4">
          Skill Matrix and Adaptive Learning Modules have been unified into a single learning center.
        </p>
        <div className="flex justify-center">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        </div>
      </Card>
    </div>
  );
}
