'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getCareerRecommendation } from '@/lib/supabase/queries';
import { formatSalaryInRupees } from '@/lib/utils/format';
import { CareerRecommendation } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Award, FileText, CheckCircle2, ShieldCheck, AlertCircle, Database, ArrowRight, Sparkles, TrendingUp, Cpu } from 'lucide-react';

export default function CareerAnalysisPage() {
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getCareerRecommendation(user.id).then(rec => {
          setRecommendation(rec);
          setLoading(false);
        });
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-24 bg-slate-200/60 rounded-2xl" />
        <div className="h-64 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <Card className="p-8 text-center text-slate-500 text-xs border-dashed border-2 max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        No analysis data available. Complete the career assessment wizard.
      </Card>
    );
  }

  const ragSources = recommendation.analysis_metadata?.rag_sources || ['ai-engineer-roadmap', 'rag-agent-architecture'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Career Match Evaluation</h1>
            <Badge variant="primary" className="text-[10px]">
              {recommendation.recommended_role}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Synthesized reasoning and RAG vector evidence computed for your candidate profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Target Salary: <strong>{formatSalaryInRupees(recommendation.salary_range)}</strong></span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rationale Card */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="border-b border-slate-100/80">
            <CardTitle>Advisor Agent Match Rationale</CardTitle>
            <CardDescription>Synthesized from experience profile and job market vector embeddings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5 text-xs">
            <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl text-slate-800 leading-relaxed font-medium">
              <span className="font-extrabold text-indigo-950 block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Executive Advisor Summary:
              </span>
              {recommendation.summary}
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-mono">
                Key Match Rationale Points
              </span>
              <div className="space-y-2.5">
                {recommendation.reasoning.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 text-slate-700 shadow-2xs hover:border-slate-300 transition-all">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar Details */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle>Strong Areas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {(recommendation.strengths || []).map((str: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{str}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" /> RAG Knowledge Index
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                Knowledge documents indexed in Supabase vector store for this calculation:
              </p>
              {ragSources.map((src: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-100/80 rounded-xl font-mono text-[11px] text-slate-700 font-semibold truncate">
                  <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{src}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
