'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getInterviewAssessment } from '@/lib/supabase/queries';
import { InterviewAssessment } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';

export default function InterviewPage() {
  const [assessment, setAssessment] = useState<InterviewAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getInterviewAssessment(user.id).then(res => {
          setAssessment(res || {
            user_id: user.id,
            role: 'AI Engineer',
            overall_readiness_score: 78,
            technical_score: 82,
            concept_score: 76,
            problem_solving_score: 75,
            readiness_level: 'Almost Ready',
            feedback: [
              { category: 'Concept Mastery', comment: 'Strong understanding of RAG architectures and Python fundamentals.', type: 'strength' },
              { category: 'Quiz Performance', comment: '82% accuracy on scenario-based multiple choice assessments.', type: 'strength' },
              { category: 'Portfolio Opportunities', comment: 'Complete 1 additional vector database project to reach Interview Ready status.', type: 'weakness' }
            ]
          });
          setLoading(false);
        });
      }
    });
  }, []);

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  if (!assessment) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interview Readiness & Validation</h1>
        <p className="text-slate-500 mt-1">Multi-factor evaluation determining technical and scenario interview readiness.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Readiness Score Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader className="p-0 border-none pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Interview Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center">
            <div className="relative flex items-center justify-center w-36 h-36 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#4f46e5"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * assessment.overall_readiness_score) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-3xl font-extrabold text-slate-800">
                {assessment.overall_readiness_score}%
              </span>
            </div>
            <Badge variant={assessment.overall_readiness_score >= 75 ? 'success' : 'warning'}>
              Status: {assessment.readiness_level}
            </Badge>
            <span className="text-xs text-slate-400 mt-2 font-medium">Target: {assessment.role}</span>
          </CardContent>
        </Card>

        {/* Detailed Breakdown Gauges */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Competency Breakdown</CardTitle>
            <CardDescription>Evaluated across technical concepts, problem solving, and quizzes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Technical Concepts Accuracy</span>
                <span>{assessment.technical_score}%</span>
              </div>
              <Progress value={assessment.technical_score} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Concept Mastery Weight</span>
                <span>{assessment.concept_score}%</span>
              </div>
              <Progress value={assessment.concept_score} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Scenario Problem Solving</span>
                <span>{assessment.problem_solving_score}%</span>
              </div>
              <Progress value={assessment.problem_solving_score} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Structured Feedback Items */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Feedback & Action Items</CardTitle>
          <CardDescription>Recommendations generated based on your performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.isArray(assessment.feedback) && assessment.feedback.map((item: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{item.category}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.comment}</p>
                </div>
                <Badge variant={item.type === 'strength' ? 'success' : 'warning'}>
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
