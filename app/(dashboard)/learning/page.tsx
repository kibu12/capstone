'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getCourses, getLearningResources, getStudyMaterials, updateCourseProgress } from '@/lib/supabase/queries';
import { Course, LearningResource, StudyMaterial } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        Promise.all([
          getCourses(user.id),
          getLearningResources(user.id),
          getStudyMaterials(user.id)
        ]).then(([cList, rList, sList]) => {
          setCourses(cList);
          setResources(rList);
          setStudyMaterials(sList);
          if (sList.length > 0) setActiveMaterial(sList[0]);
          setLoading(false);
        });
      }
    });
  }, []);

  const toggleCourseStatus = async (courseId: string, currentStatus: string) => {
    let nextStatus: Course['status'] = 'Not Started';
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
      await updateCourseProgress(courseId, nextProgress, nextStatus);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: nextStatus, progress: nextProgress } : c));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Learning Intelligence</h1>
        <p className="text-slate-500 mt-1">Course modules, discovered YouTube/web resources, and adaptive study guides.</p>
      </div>

      {/* Generated Courses List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Your Personalized Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <Card key={course.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-center mb-1">
                  <Badge variant={course.difficulty === 'Advanced' ? 'danger' : 'primary'}>
                    {course.difficulty}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">Est. {course.estimated_hours} Hours</span>
                </div>
                <CardTitle className="text-base">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-slate-600 font-semibold">
                  <span>Module Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
                <Button
                  size="sm"
                  variant={course.status === 'Completed' ? 'primary' : 'outline'}
                  onClick={() => toggleCourseStatus(course.id!, course.status)}
                  className="w-full text-xs font-semibold"
                >
                  {course.status}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Discovered Learning Resources */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Discovered Web & YouTube Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {resources.map(res => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="p-4 border border-slate-150 rounded-xl bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {res.resource_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{res.provider}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{res.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{res.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-indigo-600 font-semibold">
                <span>Score: {Math.round(res.relevance_score * 100)}% Match</span>
                <span>Open &rarr;</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Adaptive Study Materials */}
      {activeMaterial && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">AI Adaptive Study Guide</h2>
          <Card>
            <CardHeader>
              <CardTitle>{activeMaterial.title}</CardTitle>
              <CardDescription>{activeMaterial.overview}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Why It Matters</h4>
                <p className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs">{activeMaterial.content.whyItMatters}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Core Concepts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeMaterial.content.coreConcepts?.map((c, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                      <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[11px] text-slate-500 mt-1 block">{c.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {activeMaterial.content.codeExample && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Code Example</h4>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs overflow-x-auto font-mono">
                    <code>{activeMaterial.content.codeExample}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
