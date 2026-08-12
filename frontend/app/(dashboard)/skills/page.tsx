'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getSkillGaps, updateSkillStatus } from '@/lib/supabase/queries';
import { SkillGap } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, BookOpen, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Not Started' | 'Learning' | 'Practiced' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getSkillGaps(user.id).then(res => {
          let savedSkills: SkillGap[] = [];
          try {
            const raw = localStorage.getItem('user_skills_data');
            if (raw) savedSkills = JSON.parse(raw);
          } catch (e) {}

          setSkills(savedSkills.length > 0 ? savedSkills : res);
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

    setSkills(prev => {
      const updated = prev.map(s => s.id === skillId ? { ...s, status: nextStatus, current_level: nextLevel } : s);
      try {
        localStorage.setItem('user_skills_data', JSON.stringify(updated));
        window.dispatchEvent(new Event('skill_status_changed'));
      } catch (e) {}
      return updated;
    });

    try {
      await updateSkillStatus(skillId, nextStatus, nextLevel);
    } catch (err) {
      console.warn("Skill status update error:", err);
    }
  };

  const filteredSkills = skills.filter(s => {
    const matchesPriority = priorityFilter === 'All' || s.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesSearch = s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const totalSkills = skills.length;
  const completedSkills = skills.filter(s => s.status === 'Completed').length;
  const skillReadiness = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-24 bg-slate-200/60 rounded-2xl" />
        <div className="h-64 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Competency Skill Matrix</h1>
            <Badge variant="primary" className="text-[10px]">
              {completedSkills}/{totalSkills} Mastered
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track and advance target role technical skill gaps to completion.
          </p>
        </div>

        <div className="w-56">
          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1 font-mono">
            <span>Skill Mastery Rate</span>
            <span className="text-indigo-600">{skillReadiness}%</span>
          </div>
          <Progress value={skillReadiness} variant="gradient" className="h-2" />
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills or category..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          {/* Priority Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider shrink-0 mr-1">
              Priority:
            </span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const isCompleted = skill.status === 'Completed';

          return (
            <Card key={skill.id} className="p-5 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{skill.skill_name}</h3>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded mt-1 inline-block">
                      {skill.category}
                    </span>
                  </div>
                  <Badge variant={skill.priority === 'High' ? 'danger' : 'warning'}>
                    {skill.priority}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>Proficiency Level</span>
                    <span className="font-bold text-slate-900">{skill.current_level}% / {skill.required_level}%</span>
                  </div>
                  <Progress value={(skill.current_level / skill.required_level) * 100} variant={isCompleted ? 'emerald' : 'indigo'} className="h-1.5" />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100/80 flex items-center justify-between">
                <button
                  onClick={() => skill.id && handleUpdateStatus(skill.id, skill.status)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group"
                >
                  <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Status: <strong className="underline">{skill.status}</strong></span>
                </button>

                <Link href="/learning">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-indigo-600">
                    <BookOpen className="w-3.5 h-3.5 mr-1" /> Learn
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
