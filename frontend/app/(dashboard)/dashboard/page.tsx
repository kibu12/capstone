'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getCareerRecommendation, getSkillGaps, getRoadmap, getProjects, getInterviewAssessment, getCourses } from '@/lib/supabase/queries';
import { formatSalaryInRupees } from '@/lib/utils/format';
import { CareerRecommendation, SkillGap, RoadmapPhase, ProjectRecommendation } from '@/types/career';
import { InterviewAssessment, Course } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Award, 
  BookOpen, 
  GraduationCap, 
  HelpCircle, 
  FolderHeart, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Flame, 
  User, 
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [interviewAssessment, setInterviewAssessment] = useState<InterviewAssessment | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const reloadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Explorer');

    const [rec, skills, phases, projs, interview, courseList] = await Promise.all([
      getCareerRecommendation(user.id),
      getSkillGaps(user.id),
      getRoadmap(user.id),
      getProjects(user.id),
      getInterviewAssessment(user.id),
      getCourses(user.id)
    ]);

    let savedCourses: Course[] = [];
    try {
      const raw = localStorage.getItem('user_courses_data');
      if (raw) savedCourses = JSON.parse(raw);
    } catch (e) {}

    let savedSkills: SkillGap[] = [];
    try {
      const raw = localStorage.getItem('user_skills_data');
      if (raw) savedSkills = JSON.parse(raw);
    } catch (e) {}

    setRecommendation(rec);
    setSkillGaps(savedSkills.length > 0 ? savedSkills : skills);
    setRoadmap(phases);
    setProjects(projs);
    setInterviewAssessment(interview);
    setCourses(savedCourses.length > 0 ? savedCourses : courseList);
    setLoading(false);
  };

  useEffect(() => {
    reloadData();

    const handleUpdate = () => reloadData();
    window.addEventListener('course_status_changed', handleUpdate);
    window.addEventListener('skill_status_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('course_status_changed', handleUpdate);
      window.removeEventListener('skill_status_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-32 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200/70 rounded-2xl" />
          <div className="h-32 bg-slate-200/70 rounded-2xl" />
          <div className="h-32 bg-slate-200/70 rounded-2xl" />
          <div className="h-32 bg-slate-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <Card className="p-10 text-center border-dashed border-2 border-slate-200/90 max-w-2xl mx-auto my-12 shadow-sm">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Career Profile Not Generated</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Run the diagnostic assessment wizard to map out your target role checkpoints, personalized roadmap, and technical skill gaps.
          </p>
          <div className="pt-2">
            <Link href="/onboarding">
              <Button size="lg" variant="primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Launch Assessment Wizard
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const completedSkills = skillGaps.filter(s => s.status === 'Completed').length;
  const totalSkillsCount = skillGaps.length || 8;

  const completedPhases = roadmap.filter(p => p.status === 'Completed').length;
  const totalPhasesCount = roadmap.length || 4;

  const completedCourses = courses.filter(c => c.status === 'Completed' || c.progress >= 100).length;
  const totalCoursesCount = courses.length || 2;

  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const highPriorityGaps = skillGaps.filter(s => s.priority === 'High');

  // Dynamic Overall Weighted Progress (Skills 40%, Courses 30%, Roadmap 30%)
  const skillRatio = totalSkillsCount > 0 ? completedSkills / totalSkillsCount : 0;
  const courseRatio = totalCoursesCount > 0 ? completedCourses / totalCoursesCount : 0;
  const phaseRatio = totalPhasesCount > 0 ? completedPhases / totalPhasesCount : 0;
  const overallCompletionRatio = (skillRatio * 0.40) + (courseRatio * 0.30) + (phaseRatio * 0.30);

  // Dynamic Match Score (Scales from base score e.g. 53% up to 98%)
  const baseScore = recommendation.career_score || 53;
  const dynamicMatchScore = Math.min(
    98,
    Math.round(baseScore + (98 - baseScore) * overallCompletionRatio)
  );

  // Dynamic Growth Percentage (Scales from base e.g. +28% up to +78%)
  const baseGrowth = 28;
  const dynamicGrowthRate = Math.min(
    78,
    Math.round(baseGrowth + (78 - baseGrowth) * overallCompletionRatio)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/60 p-6 sm:p-8 text-slate-900 shadow-sm border border-slate-200/90">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-48 h-48 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold font-sans">
                <Sparkles className="w-3 h-3 text-blue-600 mr-0.5" /> Target Role Locked
              </span>
              <span className="text-[11px] text-slate-500 font-sans">• Vector Match {dynamicMatchScore}.4%</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-display">
              Welcome back, <span className="text-blue-600">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed font-sans">
              Target role is set to <strong className="text-slate-900 font-semibold">{recommendation.recommended_role}</strong>. Your AI agents have processed your skill matrix and roadmap checkpoints.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/onboarding?retake=true">
              <Button variant="outline" size="sm" className="text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-2xl shadow-2xs">
                Re-take Diagnostic
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button variant="primary" size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md">
                <span>View Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:border-indigo-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Career Match Score</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{dynamicMatchScore}%</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {dynamicMatchScore >= 80 ? 'Mastery Match' : 'Optimal Match'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {recommendation.recommended_role}
          </span>
        </Card>

        <Card className="p-4 hover:border-purple-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Skill Competency</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{completedSkills}/{totalSkillsCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">skills verified</span>
          </div>
          <Progress value={totalSkillsCount ? (completedSkills / totalSkillsCount) * 100 : 0} variant="indigo" className="h-1.5 mt-2" />
        </Card>

        <Card className="p-4 hover:border-amber-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Roadmap Progress</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{completedPhases}/{totalPhasesCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">milestones complete</span>
          </div>
          <Progress value={totalPhasesCount ? (completedPhases / totalPhasesCount) * 100 : 0} variant="amber" className="h-1.5 mt-2" />
        </Card>

        <Card className="p-4 hover:border-emerald-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Target Salary</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base font-extrabold text-slate-900 block truncate">
              {formatSalaryInRupees(recommendation.salary_range)}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block truncate">
              Growth: +{dynamicGrowthRate}%
            </span>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Priority Skill Checklist */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/80">
            <div>
              <CardTitle>Priority Skill Matrix</CardTitle>
              <CardDescription>Target technical requirements for {recommendation.recommended_role}</CardDescription>
            </div>
            <Link href="/learning">
              <Button variant="outline" size="sm" className="text-xs">
                View Skills & Learning Hub
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {skillGaps.slice(0, 5).map((skill, index) => (
                <div key={skill.id || skill.skill_name || `skill-${index}`} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{skill.skill_name}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded font-mono">
                        {skill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Current: <strong className="text-slate-800">{skill.current_level}%</strong></span>
                      <span>Target: <strong className="text-indigo-600">{skill.required_level}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={skill.status === 'Completed' ? 'success' : 'secondary'}>
                      {skill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Quick Action Queue & Validation Status */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle>Action Queue</CardTitle>
              <CardDescription>Recommended next steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <Link href="/learning" className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all block group">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Review Technical Skills ({skillGaps.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 text-indigo-600 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Focus on core requirements in target role matrix</p>
              </Link>

              <Link href="/projects" className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-purple-50/40 hover:border-purple-200 transition-all block group">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Build Portfolio Capstones ({projects.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 text-purple-600 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Build production-ready code to demonstrate skill</p>
              </Link>

              <Link href="/quiz" className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all block group">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Test Technical Concepts</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 text-emerald-600 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Take adaptive MCQ quizzes to validate knowledge</p>
              </Link>
            </CardContent>
          </Card>

          {interviewAssessment && (
            <Card className="bg-white text-slate-900 border border-slate-200/90 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-blue-600 text-xs uppercase tracking-wider font-sans font-bold">Interview Readiness</CardTitle>
                <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-display">{interviewAssessment.overall_readiness_score}%</div>
              </CardHeader>
              <CardContent className="pt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-sans">
                  Level: {interviewAssessment.readiness_level}
                </span>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100">
                <Link href="/interview" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-2xl shadow-2xs">
                    <span>View Validation Report</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
