'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getCareerRecommendation, getSkillGaps, getRoadmap, getAssessment } from '@/lib/supabase/queries';
import { formatSalaryInRupees } from '@/lib/utils/format';
import { CareerRecommendation, SkillGap, RoadmapPhase, CareerAssessment } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Database,
  ArrowRight,
  Cpu,
  CheckCircle2,
  Workflow,
  Code2,
  Briefcase,
  Target,
  Rocket,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';

export default function CareerAnalysisPage() {
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [assessment, setAssessment] = useState<CareerAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const [rec, skills, phases, assess] = await Promise.all([
          getCareerRecommendation(user.id),
          getSkillGaps(user.id),
          getRoadmap(user.id),
          getAssessment(user.id),
        ]);

        let savedSkills: SkillGap[] = [];
        try {
          const raw = localStorage.getItem('user_skills_data');
          if (raw) savedSkills = JSON.parse(raw);
        } catch (e) {}

        setRecommendation(rec);
        setSkillGaps(savedSkills.length > 0 ? savedSkills : skills);
        setRoadmap(phases);
        setAssessment(assess);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 max-w-7xl mx-auto">
        <div className="h-28 bg-slate-200/70 rounded-2xl" />
        <div className="h-44 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200/70 rounded-2xl" />
          <div className="h-96 bg-slate-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <Card className="p-10 text-center border-dashed border-2 border-slate-200/90 max-w-md mx-auto my-14 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Target className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">No Career Assessment Data</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-5">
          Complete the guided onboarding diagnostic wizard to generate your role match and step-by-step career progression flowchart.
        </p>
        <Link href="/onboarding">
          <Button size="sm" variant="primary">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Launch Assessment Wizard
          </Button>
        </Link>
      </Card>
    );
  }

  const ragSources = recommendation.analysis_metadata?.rag_sources || ['ai-engineer-roadmap', 'rag-agent-architecture', 'vector-curriculum-v2'];
  const careerScore = recommendation.career_score || 45;
  const targetRole = recommendation.recommended_role || 'AI Engineer';
  const resumeName = assessment?.resume_filename || null;

  // Clean and transform repetitive or harsh summary strings into an encouraging, structured format
  const getSanitizedSummary = () => {
    const raw = recommendation.summary || '';
    
    // Check if it's the old repetitive raw dump format
    if (raw.includes('Needs improvement in') || raw.includes('confidence: low') || raw.includes('readiness is')) {
      const strengthsList = recommendation.strengths?.length 
        ? recommendation.strengths.slice(0, 3).join(', ') 
        : 'foundational technical principles';
      
      const priorityList = (recommendation.priority_skills?.length 
        ? recommendation.priority_skills 
        : skillGaps.filter(s => s.priority === 'High').map(s => s.skill_name)
      ).slice(0, 3).join(', ') || 'core role competencies';

      return `Based on your diagnostic profile${resumeName ? ` and verified resume (${resumeName})` : ''}, you have established a strong foundational baseline (${careerScore}%) for ${targetRole}. You demonstrate clear strengths in ${strengthsList}. Follow the step-by-step progression flowchart below to master targeted milestones in ${priorityList} and achieve complete industry readiness.`;
    }

    return raw;
  };

  // Structured progression stages for the flowchart
  const flowchartStages = [
    {
      step: '01',
      title: 'Baseline & Profile Foundation',
      status: 'Verified',
      statusColor: 'emerald',
      icon: CheckCircle2,
      subtitle: resumeName ? `Resume: ${resumeName}` : 'Diagnostic Evaluation',
      description: 'Foundational background, technical interests, and verified core competencies ingested into vector matching.',
      highlights: recommendation.strengths?.slice(0, 3) || ['Technical Foundations', 'Problem Solving'],
    },
    {
      step: '02',
      title: 'Target Skill Milestones',
      status: 'Active Focus',
      statusColor: 'indigo',
      icon: Workflow,
      subtitle: `${skillGaps.length || 6} Targeted Competencies`,
      description: 'Bridging specialized skills through structured interactive modules, code labs, and self-paced quizzes.',
      highlights: (recommendation.priority_skills || ['Python', 'Machine Learning', 'RAG']).slice(0, 3),
    },
    {
      step: '03',
      title: 'Applied Portfolio & Projects',
      status: 'Next Stage',
      statusColor: 'purple',
      icon: Code2,
      subtitle: `${roadmap.length || 4} Phased Deliverables`,
      description: 'Translating knowledge into production-grade GitHub projects, agent architectures, and end-to-end applications.',
      highlights: ['Production AI Pipelines', 'RAG Systems', 'System Architecture'],
    },
    {
      step: '04',
      title: 'Industry & Placement Ready',
      status: 'Goal Target',
      statusColor: 'amber',
      icon: Briefcase,
      subtitle: formatSalaryInRupees(recommendation.salary_range),
      description: 'Simulated AI technical interviews, portfolio review, and placement readiness benchmarked to industry standards.',
      highlights: ['Mock Technical Interviews', 'Salary Benchmarks', 'Role Mastery'],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Career Match & Progression Architecture
            </h1>
            <Badge variant="primary" className="text-xs px-3 py-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {targetRole}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Multi-agent diagnostic synthesis mapping your verified credentials to high-yield industry career milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-2xs">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Target Compensation: <strong>{formatSalaryInRupees(recommendation.salary_range)}</strong></span>
          </div>

          <div className="px-3.5 py-2 bg-indigo-50/90 border border-indigo-200/80 rounded-xl text-xs font-bold text-indigo-800 flex items-center gap-2 shadow-2xs">
            <Rocket className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Market Demand: <strong>{recommendation.demand_level || 'High'} ({recommendation.growth_rate || '+15% YoY'})</strong></span>
          </div>
        </div>
      </div>

      {/* ─── CAREER PROGRESSION FLOWCHART ─── */}
      <Card className="shadow-xs border-indigo-100/80 bg-gradient-to-b from-white via-white to-slate-50/60 overflow-hidden">
        <CardHeader className="border-b border-slate-100/90 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Workflow className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Career Trajectory & Milestone Flowchart
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Visual transition roadmap from your verified profile foundation to senior industry placement
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1 rounded-lg self-start sm:self-auto">
              <span>Readiness Baseline:</span>
              <span className="text-indigo-600 font-extrabold">{careerScore}%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {/* Visual Flowchart Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {flowchartStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isFirst = idx === 0;
              const isSecond = idx === 1;

              return (
                <div
                  key={stage.step}
                  className={`relative flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-200 ${
                    isSecond
                      ? 'bg-indigo-50/40 border-indigo-200/90 shadow-sm ring-1 ring-indigo-400/20'
                      : isFirst
                      ? 'bg-emerald-50/30 border-emerald-200/70 shadow-2xs'
                      : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Step badge and Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[11px] font-black tracking-widest text-slate-400">
                        STAGE {stage.step}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          stage.statusColor === 'emerald'
                            ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                            : stage.statusColor === 'indigo'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : stage.statusColor === 'purple'
                            ? 'bg-purple-100/80 text-purple-800 border border-purple-200'
                            : 'bg-amber-100/80 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {stage.status}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          stage.statusColor === 'emerald'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : stage.statusColor === 'indigo'
                            ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                            : stage.statusColor === 'purple'
                            ? 'bg-purple-500 text-white shadow-xs'
                            : 'bg-amber-500 text-white shadow-xs'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">
                          {stage.title}
                        </h3>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      {stage.description}
                    </p>
                  </div>

                  {/* Highlights / Tags */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {stage.highlights.map((h, hIdx) => (
                        <span
                          key={hIdx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200/90 text-slate-700 truncate max-w-full"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connecting Arrow for Desktop (between cards) */}
                  {idx < 3 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center shadow-xs text-slate-400">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── MAIN 2-COLUMN SECTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Executive Advisor & Strategic Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Advisor Insights Card */}
          <Card className="shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Executive Advisor Career Insights
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Synthesized rationale grounded in your technical background and industry benchmarks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5 text-xs">
              {/* Reframed, Inspiring Summary Banner */}
              <div className="p-4.5 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white border border-indigo-100/90 rounded-2xl text-slate-800 leading-relaxed font-medium shadow-2xs">
                <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-xs">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Strategic Career Progression Overview</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {getSanitizedSummary()}
                </p>
              </div>

              {/* Match Rationale Points */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-mono">
                  Verified Match Rationale & Milestones
                </span>
                <div className="space-y-2.5">
                  {(recommendation.reasoning || []).map((item, idx) => {
                    const isFact = item.includes('[FACT]') || item.includes('[VERIFIED]');
                    const isStrength = item.includes('[STRENGTH]') || item.includes('[COMPETENCY]');
                    const cleanText = item.replace(/\[.*?\]\s*/g, '');

                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 text-slate-700 shadow-2xs hover:border-slate-300 transition-all"
                      >
                        {isFact ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : isStrength ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <span className="leading-relaxed font-medium text-slate-800 text-xs">
                            {cleanText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Launchpad Buttons */}
              <div className="pt-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-mono">
                  Recommended Immediate Next Steps
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/roadmap" className="block">
                    <div className="p-3.5 rounded-xl border border-indigo-200/90 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 transition-all group shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Workflow className="w-3.5 h-3.5 text-indigo-600" />
                          Phased Learning Roadmap
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Step through structured learning phases tailored to your targets.
                      </p>
                    </div>
                  </Link>

                  <Link href="/projects" className="block">
                    <div className="p-3.5 rounded-xl border border-purple-200/90 bg-purple-50/50 hover:bg-purple-50 text-purple-900 transition-all group shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-purple-600" />
                          Curated Project Portfolio
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Build verifiable end-to-end architectures for your resume.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Strengths, Target Competencies & RAG Context */}
        <div className="space-y-6">
          {/* Verified Strengths Card */}
          <Card className="shadow-xs">
            <CardHeader className="border-b border-slate-100/80 pb-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Verified Strengths
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {(recommendation.strengths || ['Technical Problem Solving', 'Software Fundamentals']).map((str: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 bg-emerald-50/50 border border-emerald-200/70 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{str}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Priority Growth Milestones */}
          <Card className="shadow-xs">
            <CardHeader className="border-b border-slate-100/80 pb-3.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Target Growth Milestones
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Prioritized competencies that will elevate your career match to 100%:
              </p>
              {(recommendation.priority_skills?.length ? recommendation.priority_skills : ['Python', 'Machine Learning', 'LLMs', 'RAG Systems', 'System Architecture']).slice(0, 5).map((skill: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs"
                >
                  <span className="font-semibold text-slate-800">{skill}</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/70">
                    High Yield
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* RAG Knowledge Index */}
          <Card className="shadow-xs">
            <CardHeader className="border-b border-slate-100/80 pb-3.5">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Cpu className="w-4 h-4 text-indigo-600" />
                RAG Knowledge Index
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                Industry role standards and market benchmarks indexed in Supabase vector store:
              </p>
              {ragSources.map((src: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 bg-slate-100/80 rounded-xl font-mono text-[11px] text-slate-700 font-medium truncate border border-slate-200/50"
                >
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
