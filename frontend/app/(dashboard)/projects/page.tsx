'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getProjects, updateProjectStatus } from '@/lib/supabase/queries';
import { ProjectRecommendation } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { 
  FolderGit2, 
  Clock, 
  Code2, 
  Layers, 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Filter,
  ExternalLink
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Not Started' | 'In Progress' | 'Completed'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getProjects(user.id).then(res => {
          setProjects(res);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleToggleStatus = async (projectId: string, currentStatus: string) => {
    let nextStatus: ProjectRecommendation['status'] = 'Not Started';

    if (currentStatus === 'Not Started') {
      nextStatus = 'In Progress';
    } else if (currentStatus === 'In Progress') {
      nextStatus = 'Completed';
    } else {
      nextStatus = 'Not Started';
    }

    try {
      await updateProjectStatus(projectId, nextStatus);
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, status: nextStatus } : p)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesStatus && matchesDifficulty;
  });

  const totalProjects = projects.length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200/60 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-200/60 rounded-xl" />
          <div className="h-48 bg-slate-200/60 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Portfolio Capstones</h1>
            <Badge variant="secondary" className="text-[10px]">
              {completedCount}/{totalProjects} Built
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Production-grade software builds to validate core competencies on your resume and GitHub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40 text-right">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>Completion</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Status:
          </span>
          {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2">Difficulty:</span>
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                difficultyFilter === diff
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Repository Style Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((proj) => {
            const isDone = proj.status === 'Completed';
            const isStarted = proj.status === 'In Progress';
            const isExpanded = expandedProjectId === proj.id;

            return (
              <Card 
                key={proj.id} 
                className={`flex flex-col justify-between transition-all ${
                  isDone 
                    ? 'border-emerald-200 bg-emerald-50/10' 
                    : isStarted 
                    ? 'border-indigo-200 bg-indigo-50/10' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          proj.difficulty === 'Advanced' 
                            ? 'danger' 
                            : proj.difficulty === 'Intermediate' 
                            ? 'warning' 
                            : 'primary'
                        }
                      >
                        {proj.difficulty}
                      </Badge>
                      <Badge variant={isDone ? 'success' : isStarted ? 'warning' : 'secondary'}>
                        {proj.status}
                      </Badge>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {proj.estimated_time}
                    </span>
                  </div>

                  <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    {proj.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Impact Rating: <strong className="text-slate-800">{proj.portfolio_value}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 flex-1 pt-0">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.isArray(proj.skills) && proj.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded border border-slate-200/60">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Architecture Drawer */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedProjectId(isExpanded ? null : proj.id!)}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center justify-between w-full"
                    >
                      <span className="flex items-center gap-1 font-mono">
                        <Terminal className="w-3 h-3 text-slate-400" />
                        {isExpanded ? 'Hide Architecture Spec' : 'View Architecture Spec'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono space-y-1.5">
                        <div className="text-indigo-400 font-bold">Recommended Architecture:</div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          <li>Modular codebase targeting {proj.skills.join(', ')}.</li>
                          <li>Deploy with REST/API controllers and containerized builds.</li>
                          <li>Attach clean README documentation for portfolio reviews.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleToggleStatus(proj.id!, proj.status)}
                    variant={isStarted ? 'primary' : 'outline'}
                    className={`w-full text-xs font-semibold ${
                      isDone ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : ''
                    }`}
                  >
                    {proj.status === 'Not Started' && 'Start Build'}
                    {proj.status === 'In Progress' && 'Mark as Completed'}
                    {proj.status === 'Completed' && 'Re-open Project'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500 text-xs">
          No projects matching current filter selection.
        </Card>
      )}
    </div>
  );
}
