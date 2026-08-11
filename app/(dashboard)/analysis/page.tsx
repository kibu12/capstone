'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getCareerRecommendation } from '@/lib/supabase/queries';
import { CareerRecommendation } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  if (!recommendation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-800">No Analysis Available</h2>
      </div>
    );
  }

  const ragSources = recommendation.analysis_metadata?.rag_sources || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Why this career?</h1>
        <p className="text-slate-500 mt-1">Explaining your match results & target parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Match Rationale</CardTitle>
            <CardDescription>Logical reasoning provided by Advisor Agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl">
              {recommendation.summary}
            </p>
            <div className="space-y-3 pt-2">
              {recommendation.reasoning.map((item, idx) => (
                <div key={idx} className="flex gap-2 text-xs text-slate-600">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Priority gaps summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Strengths</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {recommendation.strengths.map((skill, idx) => (
                <Badge key={idx} variant="success">{skill}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Gaps</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {recommendation.priority_skills.map((skill, idx) => (
                <Badge key={idx} variant="danger">{skill}</Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RAG Sources Showcases */}
      {ragSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Sources Used</CardTitle>
            <CardDescription>Verified documents retrieved from RAG Career Intelligence store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ragSources.map((sourceId: string) => (
                <div key={sourceId} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">
                    {sourceId.replace(/-/g, ' ')} Guide
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">Status: Retrieved successfully</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
