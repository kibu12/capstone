'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getRoadmap, updateRoadmapProgress } from '@/lib/supabase/queries';
import { RoadmapPhase } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RoadmapPage() {
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getRoadmap(user.id).then(res => {
          setPhases(res);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleTogglePhase = async (phaseId: string, currentStatus: string) => {
    let nextStatus: RoadmapPhase['status'] = 'Not Started';
    let nextProgress = 0;

    if (currentStatus === 'Not Started') {
      nextStatus = 'In Progress';
      nextProgress = 50;
    } else if (currentStatus === 'In Progress') {
      nextStatus = 'Completed';
      nextProgress = 100;
    } else {
      nextStatus = 'Not Started';
      nextProgress = 0;
    }

    try {
      await updateRoadmapProgress(phaseId, nextProgress, nextStatus);
      setPhases(prev => 
        prev.map(p => p.id === phaseId ? { ...p, status: nextStatus, progress: nextProgress } : p)
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Learning Roadmap</h1>
        <p className="text-slate-500 mt-1">Checkpoints and targets organized sequentially by Phase.</p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8">
        {phases.map((phase) => {
          const isDone = phase.status === 'Completed';
          const isStarted = phase.status === 'In Progress';

          return (
            <div key={phase.id} className="relative">
              {/* timeline bubble */}
              <span className={`absolute -left-[41px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ring-4 ring-white ${
                isDone ? 'bg-indigo-600 text-white' : isStarted ? 'bg-indigo-50 text-indigo-600 ring-indigo-200' : 'bg-slate-100 text-slate-400'
              }`}>
                0{phase.phase}
              </span>

              <Card className={`${isStarted ? 'border-indigo-250 ring-1 ring-indigo-50' : ''}`}>
                <CardHeader className="flex flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                    <CardDescription>{phase.duration}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant={isDone ? 'primary' : 'outline'}
                    onClick={() => handleTogglePhase(phase.id!, phase.status)}
                    className="text-xs font-semibold px-4 min-w-[100px]"
                  >
                    {phase.status}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">{phase.description}</p>
                  
                  {/* Skill checklist tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(phase.skills) && phase.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-150 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Resource cards */}
                  {Array.isArray(phase.resources) && phase.resources.length > 0 && (
                    <div className="pt-2 border-t border-slate-50 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Resource</span>
                      {phase.resources.map((res: any, idx: number) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs text-slate-700"
                        >
                          <span className="font-semibold">{res.name}</span>
                          <span className="text-[10px] text-indigo-600 font-semibold uppercase">{res.type} &rarr;</span>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
