'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getSkillGaps, updateSkillStatus } from '@/lib/supabase/queries';
import { SkillGap } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getSkillGaps(user.id).then(res => {
          setSkills(res);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleUpdateStatus = async (skillId: string, currentStatus: string) => {
    let nextStatus: SkillGap['status'] = 'Not Started';
    let nextLevel = 15;

    if (currentStatus === 'Not Started') {
      nextStatus = 'Learning';
      nextLevel = 50;
    } else if (currentStatus === 'Learning') {
      nextStatus = 'Practiced';
      nextLevel = 75;
    } else if (currentStatus === 'Practiced') {
      nextStatus = 'Completed';
      nextLevel = 90;
    } else {
      nextStatus = 'Not Started';
      nextLevel = 15;
    }

    try {
      await updateSkillStatus(skillId, nextStatus, nextLevel);
      setSkills(prev => 
        prev.map(s => s.id === skillId ? { ...s, status: nextStatus, current_level: nextLevel } : s)
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Skill Intelligence</h1>
        <p className="text-slate-500 mt-1">Manage, update, and track target role competencies.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core requirements checklist</CardTitle>
          <CardDescription>Click status badges to cycle progress metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {skills.map(skill => (
              <div key={skill.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-800">{skill.skill_name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded">
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Current: {skill.current_level}%</span>
                    <span>/</span>
                    <span>Required: {skill.required_level}%</span>
                  </div>
                  <Progress value={skill.current_level} max={100} className="w-48 h-1.5" />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Badge variant={skill.priority === 'High' ? 'danger' : 'warning'}>
                    {skill.priority} Priority
                  </Badge>
                  <Button
                    size="sm"
                    variant={skill.status === 'Completed' ? 'primary' : 'outline'}
                    onClick={() => handleUpdateStatus(skill.id!, skill.status)}
                    className="text-xs font-semibold px-4 min-w-[100px]"
                  >
                    {skill.status}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
