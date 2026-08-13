'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getCourses, getLearningResources, getStudyMaterials, updateCourseProgress } from '@/lib/supabase/queries';
import { Course, LearningResource, StudyMaterial } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { GraduationCap, BookOpen, ExternalLink, Clock, FileText, Video } from 'lucide-react';

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
          let savedCourses: Course[] = [];
          try {
            const raw = localStorage.getItem('user_courses_data');
            if (raw) savedCourses = JSON.parse(raw);
          } catch (e) {}

          const defaultCourses: Course[] = savedCourses.length > 0 ? savedCourses : (cList.length > 0 ? cList : [
            { id: '1', user_id: user.id, title: 'AI Engineering & Vector Systems', description: 'Core principles of modern AI, embeddings, and RAG architectures.', skill: 'AI Engineering', category: 'Core Concept', difficulty: 'Advanced', estimated_hours: 12, order_index: 1, status: 'Not Started', progress: 0 },
            { id: '2', user_id: user.id, title: 'Machine Learning Pipelines & MLOps', description: 'Model training, data preprocessing, and automated continuous integration.', skill: 'Machine Learning', category: 'Engineering', difficulty: 'Intermediate', estimated_hours: 8, order_index: 2, status: 'Not Started', progress: 0 }
          ]);

          const defaultResources: LearningResource[] = rList.length > 0 ? rList : [
            { id: '1', user_id: user.id, title: 'Python Official Technical Guides', description: 'Language reference, standard library documentation, and AsyncIO patterns.', url: 'https://docs.python.org/3/', resource_type: 'documentation', provider: 'Python Org', difficulty: 'Beginner', duration: 'Self-paced', relevance_score: 0.96, is_recommended: true, status: 'Not Started' },
            { id: '2', user_id: user.id, title: 'Machine Learning Full Course by Andrew Ng', description: 'Complete video series covering Supervised, Unsupervised, and Deep Learning.', url: 'https://youtube.com', resource_type: 'video', provider: 'YouTube Education', difficulty: 'Intermediate', duration: '10 hours', relevance_score: 0.94, is_recommended: true, status: 'Not Started' },
            { id: '3', user_id: user.id, title: 'LangChain & Vector Indexing Architecture', description: 'Building production RAG applications with vector indexes.', url: 'https://python.langchain.com/', resource_type: 'documentation', provider: 'LangChain Docs', difficulty: 'Advanced', duration: '5 hours', relevance_score: 0.92, is_recommended: true, status: 'Not Started' }
          ];

          const defaultStudyMaterials: StudyMaterial[] = sList.length > 0 ? sList : [
            {
              id: '1',
              user_id: user.id,
              title: 'AI Engineering & RAG — Adaptive Study Guide',
              overview: 'Comprehensive reference covering Retrieval-Augmented Generation, vector similarity search, and prompt engineering.',
              difficulty: 'Advanced',
              estimated_minutes: 20,
              content: {
                whyItMatters: 'RAG allows LLMs to query domain knowledge in real-time without expensive model retrain cycles.',
                coreConcepts: [
                  { name: 'Vector Indexing', detail: 'Transforming text into high-dimensional embeddings for similarity search.' },
                  { name: 'Chunking Strategies', detail: 'Splitting documents into optimal context windows for prompt injection.' },
                  { name: 'Evaluation Frameworks', detail: 'Measuring retrieval accuracy, faithfulness, and answer relevance.' }
                ],
                detailedExplanation: 'Retrieval-Augmented Generation connects foundation models directly to authoritative databases. Vector search retrieves top-k documents to construct precise context prompts.',
                realWorldExample: 'Enterprise customer support bots querying PDF user manuals in real time.',
                codeExample: `// RAG Retrieval Flow Example
async function queryVectorDatabase(promptEmbedding) {
  const matches = await vectorStore.similaritySearch(promptEmbedding, 3);
  return matches.map(m => m.pageContent).join('\\n');
}`,
                commonMistakes: [
                  'Overlooking chunk boundary overlaps leading to fragmented sentences.',
                  'Not sanitizing retrieved context before passing into system prompts.'
                ],
                interviewRelevance: 'Interviewers frequently ask how to reduce hallucinations and optimize vector search speed.',
                keyTakeaways: [
                  'Embeddings convert semantic meaning into mathematical vectors.',
                  'Chunk size directly impacts retrieval relevance.'
                ],
                quickRevision: [
                  'What is cosine similarity?',
                  'Why use hybrid keyword + vector search?'
                ]
              }
            },
            {
              id: '2',
              user_id: user.id,
              title: 'Machine Learning Pipelines & MLOps — Study Guide',
              overview: 'End-to-end model training pipelines, feature engineering, and automated continuous deployment.',
              difficulty: 'Intermediate',
              estimated_minutes: 15,
              content: {
                whyItMatters: 'MLOps automates data drift detection and model retraining, ensuring high production performance.',
                coreConcepts: [
                  { name: 'Feature Stores', detail: 'Centralized repository for storing and serving consistent ML features.' },
                  { name: 'Model Registry', detail: 'Versioning and tracking model artifacts, metrics, and deployment stages.' },
                  { name: 'Data Drift Monitoring', detail: 'Detecting statistical distribution shifts in incoming production inference data.' }
                ],
                detailedExplanation: 'Machine Learning operations combine DevOps practices with ML code. Automated CI/CD triggers automated tests, model validation, and blue/green deployments.',
                realWorldExample: 'Fraud detection pipeline continuously retraining models on incoming transaction logs.',
                codeExample: `// MLOps Model Evaluation Check
function validateModelAccuracy(newModel, baselineScore = 0.85) {
  const testScore = evaluateOnHoldoutSet(newModel);
  if (testScore < baselineScore) {
    throw new Error('Model performance below baseline threshold');
  }
  return deployToStaging(newModel);
}`,
                commonMistakes: [
                  'Training models on un-versioned raw data without audit logs.',
                  'Failing to set up automated rollback when inference latency spikes.'
                ],
                interviewRelevance: 'System design interviews test how you structure reliable ML training pipelines.',
                keyTakeaways: [
                  'Version control data, features, and model weights together.',
                  'Automated model testing prevents regression in production.'
                ],
                quickRevision: [
                  'What is concept drift vs data drift?',
                  'How does a feature store ensure offline/online parity?'
                ]
              }
            }
          ];

          setCourses(defaultCourses);
          setResources(defaultResources);
          setStudyMaterials(defaultStudyMaterials);
          setActiveMaterial(defaultStudyMaterials[0]);
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
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

    setCourses(prev => {
      const updated = prev.map(c => c.id === courseId ? { ...c, status: nextStatus, progress: nextProgress } : c);
      try {
        localStorage.setItem('user_courses_data', JSON.stringify(updated));
        window.dispatchEvent(new Event('course_status_changed'));
      } catch (e) {}
      return updated;
    });

    try {
      await updateCourseProgress(courseId, nextProgress, nextStatus);
    } catch (e) {
      console.warn("Supabase update error:", e);
    }
  };

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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Learning Modules</h1>
            <Badge variant="secondary" className="text-[10px]">
              {courses.length} Modules
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized course modules, web documentation, and adaptive study guides.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>{resources.length} Docs & Videos</span>
        </div>
      </div>

      {/* Course Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Course Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course, idx) => {
            const isCompleted = course.status === 'Completed';
            const matchingMaterial = studyMaterials[idx] || studyMaterials[0];
            const isSelected = activeMaterial?.id === matchingMaterial?.id;

            return (
              <Card
                key={course.id}
                onClick={() => matchingMaterial && setActiveMaterial(matchingMaterial)}
                className={`flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-indigo-500/80 border-indigo-500 shadow-md bg-indigo-50/10' : 'hover:border-indigo-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <Badge variant={course.difficulty === 'Advanced' ? 'danger' : 'primary'}>
                      {course.difficulty}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {course.estimated_hours} Hours
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-900">{course.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-500">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 flex-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Module Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    size="sm"
                    variant={course.status === 'In Progress' ? 'primary' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCourseStatus(course.id!, course.status);
                    }}
                    className={`w-full text-xs font-semibold ${
                      isCompleted ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : ''
                    }`}
                  >
                    {course.status}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Discovered Web Resources */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discovered Technical Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {resources.map((res, idx) => (
            <a
              key={res.id || res.title || `res-${idx}`}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="p-4 border border-slate-200/80 rounded-xl bg-white hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                    {res.resource_type === 'video' ? <Video className="w-3 h-3 text-rose-500" /> : <FileText className="w-3 h-3 text-indigo-500" />}
                    {res.resource_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{res.provider}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{res.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{res.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-medium">
                <span>{Math.round(res.relevance_score * 100)}% Match</span>
                <span className="flex items-center gap-1">
                  Open Guide
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Study Materials */}
      {activeMaterial && (
        <Card>
          <CardHeader>
            <CardTitle>{activeMaterial.title}</CardTitle>
            <CardDescription>{activeMaterial.overview}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">Why It Matters:</span>
              <p className="text-slate-600 leading-relaxed">{activeMaterial.content.whyItMatters}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Core Concepts:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeMaterial.content.coreConcepts?.map((c, idx) => (
                  <div key={idx} className="p-3 border border-slate-200/80 rounded-lg bg-white">
                    <span className="text-xs font-semibold text-slate-900 block">{c.name}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeMaterial.content.codeExample && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Code Spec:</span>
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto">
                  <code>{activeMaterial.content.codeExample}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
