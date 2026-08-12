'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getInterviewAssessment, getLatestQuizAttempt } from '@/lib/supabase/queries';
import { InterviewAssessment } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { CheckCircle2, Award, Brain, ArrowRight } from 'lucide-react';

export default function InterviewPage() {
  const [assessment, setAssessment] = useState<InterviewAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        Promise.all([
          getInterviewAssessment(user.id),
          getLatestQuizAttempt(user.id)
        ]).then(([res, latestQuiz]) => {
          let technicalScore = 0;
          if (latestQuiz && typeof latestQuiz.score === 'number') {
            technicalScore = latestQuiz.score;
          } else {
            const localScore = localStorage.getItem('last_quiz_score');
            if (localScore !== null) {
              technicalScore = parseInt(localScore, 10);
            }
          }

          const conceptScore = technicalScore > 0 ? Math.min(100, technicalScore + 10) : 0;
          const problemSolvingScore = technicalScore > 0 ? Math.round((technicalScore + conceptScore) / 2) : 0;
          const overallScore = Math.round((technicalScore * 0.35) + (conceptScore * 0.35) + (problemSolvingScore * 0.30));

          let readinessLevel: InterviewAssessment['readiness_level'] = 'Not Ready';
          if (overallScore >= 90) readinessLevel = 'Interview Ready';
          else if (overallScore >= 75) readinessLevel = 'Almost Ready';
          else if (overallScore >= 50) readinessLevel = 'Developing';
          else if (overallScore >= 25) readinessLevel = 'Early Preparation';
          else readinessLevel = 'Not Ready';

          const baseAssessment: InterviewAssessment = res || {
            user_id: user.id,
            role: 'AI Engineer',
            overall_readiness_score: overallScore,
            technical_score: technicalScore,
            concept_score: conceptScore,
            problem_solving_score: problemSolvingScore,
            readiness_level: readinessLevel,
            feedback: []
          };

          if (res) {
            baseAssessment.overall_readiness_score = overallScore > 0 ? overallScore : res.overall_readiness_score;
            baseAssessment.technical_score = technicalScore > 0 ? technicalScore : res.technical_score;
            baseAssessment.concept_score = conceptScore > 0 ? conceptScore : res.concept_score;
            baseAssessment.problem_solving_score = problemSolvingScore > 0 ? problemSolvingScore : res.problem_solving_score;
            baseAssessment.readiness_level = readinessLevel;
          }

          const dynamicFeedback: InterviewAssessment['feedback'] = [
            { category: 'Concept Mastery', comment: conceptScore > 0 ? `Conceptual accuracy based on completed quizzes.` : `Complete course modules and study guides to build conceptual understanding.`, type: conceptScore >= 60 ? 'strength' : 'weakness' },
            { category: 'Quiz Performance', comment: `${technicalScore}% accuracy on scenario-based multiple choice assessments.`, type: technicalScore >= 60 ? 'strength' : 'weakness' },
            { category: 'Portfolio Opportunities', comment: 'Complete recommended core projects to demonstrate production experience.', type: 'weakness' }
          ];

          setAssessment({ ...baseAssessment, feedback: dynamicFeedback });
          setLoading(false);
        });
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200/60 rounded-xl" />
        <div className="h-64 bg-slate-200/60 rounded-xl" />
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Interview Readiness</h1>
            <Badge variant="primary" className="text-[10px]">
              {assessment.readiness_level}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-factor evaluation determining technical readiness for <strong className="text-slate-800">{assessment.role}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/quiz">
            <Button variant="outline" size="sm" className="text-xs">Take Quiz</Button>
          </Link>
          <Link href="/projects">
            <Button size="sm" className="text-xs flex items-center gap-1.5">
              Build Capstone
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Gauges & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <span className="text-xs font-semibold text-slate-500">Overall Readiness</span>
          <div className="text-4xl font-extrabold text-slate-900 mt-2 mb-1">{assessment.overall_readiness_score}%</div>
          <Badge variant={assessment.overall_readiness_score >= 75 ? 'success' : 'warning'}>
            {assessment.readiness_level}
          </Badge>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Competency Breakdown</CardTitle>
            <CardDescription>Evaluated across technical concepts, problem solving, and quizzes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Technical Concepts Accuracy</span>
                <span className="text-indigo-600">{assessment.technical_score}%</span>
              </div>
              <Progress value={assessment.technical_score} className="h-1.5" />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Concept Mastery Weight</span>
                <span className="text-purple-600">{assessment.concept_score}%</span>
              </div>
              <Progress value={assessment.concept_score} className="h-1.5" />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Scenario Problem Solving</span>
                <span className="text-emerald-600">{assessment.problem_solving_score}%</span>
              </div>
              <Progress value={assessment.problem_solving_score} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Structured Feedback Items */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Feedback & Action Items</CardTitle>
          <CardDescription>Recommendations generated based on your performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Array.isArray(assessment.feedback) && assessment.feedback.map((item: any, idx: number) => (
              <div key={idx} className="p-3 border border-slate-200/80 rounded-lg bg-slate-50/50 flex items-start justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900">{item.category}</h4>
                  <p className="text-slate-600 mt-0.5">{item.comment}</p>
                </div>
                <Badge variant={item.type === 'strength' || item.type === 'strong' ? 'success' : 'warning'}>
                  {item.type === 'strength' || item.type === 'strong' ? 'Strong' : 'Weak'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
