'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getProjects, updateProjectStatus } from '@/lib/supabase/queries';
import { ProjectRecommendation } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Portfolio Opportunities</h1>
        <p className="text-slate-500 mt-1">Acquire real-world capabilities with practical builds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const isDone = proj.status === 'Completed';
          const isStarted = proj.status === 'In Progress';

          return (
            <Card key={proj.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant={proj.difficulty === 'Advanced' ? 'danger' : 'primary'}>
                    {proj.difficulty}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Est. Time: {proj.estimated_time}
                  </span>
                </div>
                <CardTitle className="text-base">{proj.title}</CardTitle>
                <CardDescription>Value score: {proj.portfolio_value}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(proj.skills) && proj.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleToggleStatus(proj.id!, proj.status)}
                  variant={isDone ? 'primary' : 'outline'}
                  className="w-full text-xs"
                >
                  {proj.status === 'Not Started' && 'Start Project'}
                  {proj.status === 'In Progress' && 'Mark Completed'}
                  {proj.status === 'Completed' && 'Restart Project'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
