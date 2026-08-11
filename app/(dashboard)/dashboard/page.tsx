'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getCareerRecommendation, getSkillGaps, getRoadmap, getProjects, getInterviewAssessment, getCourses } from '@/lib/supabase/queries';
import { CareerRecommendation, SkillGap, RoadmapPhase, ProjectRecommendation } from '@/types/career';
import { InterviewAssessment, Course } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [interviewAssessment, setInterviewAssessment] = useState<InterviewAssessment | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.full_name || user.email || 'Explorer');

      const rec = await getCareerRecommendation(user.id);
      const skills = await getSkillGaps(user.id);
      const phases = await getRoadmap(user.id);
      const projs = await getProjects(user.id);
      const interview = await getInterviewAssessment(user.id);
      const courseList = await getCourses(user.id);

      setRecommendation(rec);
      setSkillGaps(skills);
      setRoadmap(phases);
      setProjects(projs);
      setInterviewAssessment(interview);
      setCourses(courseList);
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 rounded-2xl col-span-2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">No Assessment Found</h2>
        <p className="text-slate-500 mt-2">Complete your profile assessment wizard first.</p>
        <Link href="/onboarding" className="mt-4 inline-block">
          <Button>Start Assessment</Button>
        </Link>
      </div>
    );
  }

  // Calculate dynamic summary stats
  const completedSkills = skillGaps.filter(s => s.status === 'Completed').length;
  const completedPhases = roadmap.filter(p => p.status === 'Completed').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Good afternoon, {userName}
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s your career intelligence overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circular Career Readiness Chart */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader className="p-0 border-none pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Career Readiness
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
                  strokeDashoffset={377 - (377 * recommendation.career_score) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-3xl font-extrabold text-slate-800">
                {recommendation.career_score}%
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-700">Target: {recommendation.recommended_role}</div>
            <div className="text-xs text-slate-400 mt-1">Growth Outlook: {recommendation.growth_rate}</div>
          </CardContent>
        </Card>

        {/* Dynamic statistics overview */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Progress Intelligence</CardTitle>
            <CardDescription>Real-time updates synced with your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Skill Intelligence</span>
                <span>{completedSkills} / {skillGaps.length} completed</span>
              </div>
              <Progress value={skillGaps.length ? (completedSkills / skillGaps.length) * 100 : 0} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Learning Roadmap</span>
                <span>{completedPhases} / {roadmap.length} phases completed</span>
              </div>
              <Progress value={roadmap.length ? (completedPhases / roadmap.length) * 100 : 0} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Portfolio Opportunities</span>
                <span>{completedProjects} / {projects.length} projects completed</span>
              </div>
              <Progress value={projects.length ? (completedProjects / projects.length) * 100 : 0} />
            </div>

            {interviewAssessment && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Interview Readiness Score</span>
                  <span className="text-[11px] text-slate-500">Weighted evaluation across concepts & quizzes</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-extrabold text-indigo-600">{interviewAssessment.overall_readiness_score}%</span>
                  <Link href="/interview">
                    <Button size="sm" variant="outline" className="text-xs">Check Details &rarr;</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Priority Skill Gaps */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Priority Skill Gaps</CardTitle>
            <CardDescription>Urgent competencies identified by RAG pipeline</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {skillGaps.slice(0, 4).map(skill => (
                <div key={skill.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{skill.skill_name}</h4>
                    <span className="text-xs text-slate-400">{skill.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={skill.priority === 'High' ? 'danger' : 'warning'}>
                      {skill.priority} Priority
                    </Badge>
                    <span className="text-xs font-bold text-slate-500">{skill.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/skills" className="w-full">
              <Button variant="outline" className="w-full text-xs">Manage All Skills</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Industry Snapshot */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Industry Snapshot</CardTitle>
            <CardDescription>Live sector data indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demand Level</span>
              <div className="text-xl font-bold text-indigo-700 mt-1">{recommendation.demand_level}</div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projected Growth</span>
              <div className="text-xl font-bold text-slate-800 mt-1">{recommendation.growth_rate}</div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Median Target Salary</span>
              <div className="text-xl font-bold text-slate-800 mt-1">{recommendation.salary_range}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/analysis" className="w-full">
              <Button className="w-full text-xs">Read Full Analysis</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
