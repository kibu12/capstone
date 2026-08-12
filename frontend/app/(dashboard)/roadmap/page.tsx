'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getRoadmap, updateRoadmapProgress } from '@/lib/supabase/queries';
import { RoadmapPhase } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Clock, ExternalLink, Compass } from 'lucide-react';

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

  const totalPhases = phases.length;
  const completedPhases = phases.filter(p => p.status === 'Completed').length;
  const overallProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200/60 rounded-xl" />
        <div className="h-64 bg-slate-200/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Sequential Roadmap</h1>
            <Badge variant="secondary" className="text-[10px]">
              {completedPhases}/{totalPhases} Phases
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential phase checkpoints generated to build domain mastery step by step.
          </p>
        </div>

        <div className="w-44 text-right">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span>Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative border-l border-slate-200/80 ml-4 pl-6 space-y-6">
        {phases.map((phase) => {
          const isDone = phase.status === 'Completed';
          const isStarted = phase.status === 'In Progress';

          return (
            <div key={phase.id} className="relative">
              {/* Timeline bubble */}
              <span className={`absolute -left-[37px] top-3.5 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ring-4 ring-white ${
                isDone 
                  ? 'bg-emerald-600 text-white' 
                  : isStarted 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                0{phase.phase}
              </span>

              <Card className={`transition-all ${
                isDone 
                  ? 'border-emerald-200/80 bg-emerald-50/10' 
                  : isStarted 
                  ? 'border-indigo-200/80 bg-indigo-50/10' 
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={isDone ? 'success' : isStarted ? 'primary' : 'secondary'}>
                        Phase 0{phase.phase} • {phase.status}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {phase.duration}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-900">{phase.title}</CardTitle>
                  </div>

                  <Button
                    size="sm"
                    variant={isStarted ? 'primary' : 'outline'}
                    onClick={() => handleTogglePhase(phase.id!, phase.status)}
                    className={`text-xs font-semibold px-3 min-w-[110px] ${
                      isDone ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : ''
                    }`}
                  >
                    {phase.status}
                  </Button>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    {phase.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.isArray(phase.skills) && phase.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded border border-slate-200/60">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {Array.isArray(phase.resources) && phase.resources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Guides:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {phase.resources.map((res: any, idx: number) => (
                          <a
                            key={idx}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200/60 text-xs text-slate-700"
                          >
                            <span className="font-medium truncate">{res.name}</span>
                            <span className="text-[10px] text-indigo-600 font-bold uppercase shrink-0 flex items-center gap-1">
                              {res.type}
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </a>
                        ))}
                      </div>
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
