'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  getCourses,
  getLearningResources,
  getStudyMaterials,
  updateCourseProgress,
  getSkillGaps,
  updateSkillStatus,
} from '@/lib/supabase/queries';
import { Course, LearningResource, StudyMaterial } from '@/types/learning';
import { SkillGap } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  GraduationCap,
  BookOpen,
  ExternalLink,
  Clock,
  FileText,
  Video,
  Search,
  CheckCircle2,
  Zap,
  Target,
  Code2,
  Lightbulb,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
  Award,
  BookMarked,
  ArrowUpRight,
} from 'lucide-react';

export default function LearningAndSkillsHubPage() {
  const [activeTab, setActiveTab] = useState<'skills' | 'guides' | 'modules'>('skills');

  // Skill Matrix State
  const [skills, setSkills] = useState<SkillGap[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Not Started' | 'Learning' | 'Practiced' | 'Completed'>('All');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Learning Modules & Materials State
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL search params for tab navigation
    try {
      const params = new URLSearchParams(window.location.search);
      const requestedTab = params.get('tab');
      if (requestedTab === 'skills' || requestedTab === 'guides' || requestedTab === 'modules') {
        setActiveTab(requestedTab);
      }
    } catch (e) {}

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        Promise.all([
          getSkillGaps(user.id),
          getCourses(user.id),
          getLearningResources(user.id),
          getStudyMaterials(user.id),
        ])
          .then(([skillsList, cList, rList, sList]) => {
            // Check localStorage cached skills
            let savedSkills: SkillGap[] = [];
            try {
              const raw = localStorage.getItem('user_skills_data');
              if (raw) savedSkills = JSON.parse(raw);
            } catch (e) {}

            // Check localStorage cached courses
            let savedCourses: Course[] = [];
            try {
              const raw = localStorage.getItem('user_courses_data');
              if (raw) savedCourses = JSON.parse(raw);
            } catch (e) {}

            const defaultCourses: Course[] =
              savedCourses.length > 0
                ? savedCourses
                : cList.length > 0
                ? cList
                : [
                    {
                      id: '1',
                      user_id: user.id,
                      title: 'AI Engineering & Vector Systems',
                      description: 'Core principles of modern AI, embeddings, and RAG architectures.',
                      skill: 'AI Engineering',
                      category: 'Core Concept',
                      difficulty: 'Advanced',
                      estimated_hours: 12,
                      order_index: 1,
                      status: 'Not Started',
                      progress: 0,
                    },
                    {
                      id: '2',
                      user_id: user.id,
                      title: 'Machine Learning Pipelines & MLOps',
                      description: 'Model training, data preprocessing, and automated continuous integration.',
                      skill: 'Machine Learning',
                      category: 'Engineering',
                      difficulty: 'Intermediate',
                      estimated_hours: 8,
                      order_index: 2,
                      status: 'Not Started',
                      progress: 0,
                    },
                  ];

            const defaultResources: LearningResource[] =
              rList.length > 0
                ? rList
                : [
                    {
                      id: '1',
                      user_id: user.id,
                      title: 'Python Official Technical Guides',
                      description: 'Language reference, standard library documentation, and AsyncIO patterns.',
                      url: 'https://docs.python.org/3/',
                      resource_type: 'documentation',
                      provider: 'Python Org',
                      difficulty: 'Beginner',
                      duration: 'Self-paced',
                      relevance_score: 0.96,
                      is_recommended: true,
                      status: 'Not Started',
                    },
                    {
                      id: '2',
                      user_id: user.id,
                      title: 'Machine Learning Full Course by Andrew Ng',
                      description: 'Complete video series covering Supervised, Unsupervised, and Deep Learning.',
                      url: 'https://youtube.com',
                      resource_type: 'video',
                      provider: 'YouTube Education',
                      difficulty: 'Intermediate',
                      duration: '10 hours',
                      relevance_score: 0.94,
                      is_recommended: true,
                      status: 'Not Started',
                    },
                    {
                      id: '3',
                      user_id: user.id,
                      title: 'LangChain & Vector Indexing Architecture',
                      description: 'Building production RAG applications with vector indexes.',
                      url: 'https://python.langchain.com/',
                      resource_type: 'documentation',
                      provider: 'LangChain Docs',
                      difficulty: 'Advanced',
                      duration: '5 hours',
                      relevance_score: 0.92,
                      is_recommended: true,
                      status: 'Not Started',
                    },
                  ];

            const defaultStudyMaterials: StudyMaterial[] =
              sList.length > 0
                ? sList
                : [
                    {
                      id: '1',
                      user_id: user.id,
                      title: 'AI Engineering & RAG — Adaptive Study Guide',
                      overview:
                        'Comprehensive reference covering Retrieval-Augmented Generation, vector similarity search, and prompt engineering.',
                      difficulty: 'Advanced',
                      estimated_minutes: 20,
                      content: {
                        whyItMatters:
                          'RAG allows LLMs to query domain knowledge in real-time without expensive model retrain cycles.',
                        coreConcepts: [
                          {
                            name: 'Vector Indexing',
                            detail: 'Transforming text into high-dimensional embeddings for similarity search.',
                          },
                          {
                            name: 'Chunking Strategies',
                            detail: 'Splitting documents into optimal context windows for prompt injection.',
                          },
                          {
                            name: 'Evaluation Frameworks',
                            detail: 'Measuring retrieval accuracy, faithfulness, and answer relevance.',
                          },
                        ],
                        detailedExplanation:
                          'Retrieval-Augmented Generation connects foundation models directly to authoritative databases. Vector search retrieves top-k documents to construct precise context prompts.',
                        realWorldExample:
                          'Enterprise customer support bots querying PDF user manuals in real time.',
                        codeExample: `// RAG Retrieval Flow Example\nasync function queryVectorDatabase(promptEmbedding) {\n  const matches = await vectorStore.similaritySearch(promptEmbedding, 3);\n  return matches.map(m => m.pageContent).join('\\n');\n}`,
                        commonMistakes: [
                          'Overlooking chunk boundary overlaps leading to fragmented sentences.',
                          'Not sanitizing retrieved context before passing into system prompts.',
                        ],
                        interviewRelevance:
                          'Interviewers frequently ask how to reduce hallucinations and optimize vector search speed.',
                        keyTakeaways: [
                          'Embeddings convert semantic meaning into mathematical vectors.',
                          'Chunk size directly impacts retrieval relevance.',
                        ],
                        quickRevision: [
                          'What is cosine similarity?',
                          'Why use hybrid keyword + vector search?',
                        ],
                      },
                    },
                    {
                      id: '2',
                      user_id: user.id,
                      title: 'Machine Learning Pipelines & MLOps — Study Guide',
                      overview:
                        'End-to-end model training pipelines, feature engineering, and automated continuous deployment.',
                      difficulty: 'Intermediate',
                      estimated_minutes: 15,
                      content: {
                        whyItMatters:
                          'MLOps automates data drift detection and model retraining, ensuring high production performance.',
                        coreConcepts: [
                          {
                            name: 'Feature Stores',
                            detail: 'Centralized repository for storing and serving consistent ML features.',
                          },
                          {
                            name: 'Model Registry',
                            detail: 'Versioning and tracking model artifacts, metrics, and deployment stages.',
                          },
                          {
                            name: 'Data Drift Monitoring',
                            detail: 'Detecting statistical distribution shifts in incoming production inference data.',
                          },
                        ],
                        detailedExplanation:
                          'Machine Learning operations combine DevOps practices with ML code. Automated CI/CD triggers automated tests, model validation, and blue/green deployments.',
                        realWorldExample:
                          'Fraud detection pipeline continuously retraining models on incoming transaction logs.',
                        codeExample: `// MLOps Model Evaluation Check\nfunction validateModelAccuracy(newModel, baselineScore = 0.85) {\n  const testScore = evaluateOnHoldoutSet(newModel);\n  if (testScore < baselineScore) {\n    throw new Error('Model performance below baseline threshold');\n  }\n  return deployToStaging(newModel);\n}`,
                        commonMistakes: [
                          'Training models on un-versioned raw data without audit logs.',
                          'Failing to set up automated rollback when inference latency spikes.',
                        ],
                        interviewRelevance:
                          'System design interviews test how you structure reliable ML training pipelines.',
                        keyTakeaways: [
                          'Version control data, features, and model weights together.',
                          'Automated model testing prevents regression in production.',
                        ],
                        quickRevision: [
                          'What is concept drift vs data drift?',
                          'How does a feature store ensure offline/online parity?',
                        ],
                      },
                    },
                    {
                      id: '3',
                      user_id: user.id,
                      title: 'Python for Production & Async Architecture',
                      overview:
                        'Advanced Python patterns, typing systems, asyncio concurrency, and performant data structures.',
                      difficulty: 'Beginner',
                      estimated_minutes: 15,
                      content: {
                        whyItMatters:
                          'Python powers the modern AI/ML backend ecosystem. AsyncIO unlocks high-throughput LLM streaming and parallel API calling.',
                        coreConcepts: [
                          {
                            name: 'AsyncIO Event Loop',
                            detail: 'Non-blocking I/O handling multiple concurrent network calls efficiently.',
                          },
                          {
                            name: 'Type Hinting & Pydantic',
                            detail: 'Runtime validation and static schema enforcement for reliable AI pipelines.',
                          },
                          {
                            name: 'Generators & Streaming',
                            detail: 'Memory-efficient chunked streaming of LLM token responses.',
                          },
                        ],
                        detailedExplanation:
                          'Writing production Python requires understanding concurrency, memory profiling, and robust error boundaries when calling external LLM providers.',
                        realWorldExample:
                          'Streaming real-time OpenAI responses to thousands of concurrent websocket clients.',
                        codeExample: `import asyncio\n\nasync def fetch_vector_embeddings(chunks: list[str]):\n    tasks = [embed_client.get_embedding(c) for c in chunks]\n    return await asyncio.gather(*tasks)`,
                        commonMistakes: [
                          'Blocking the asyncio event loop with CPU-heavy tasks instead of thread pools.',
                          'Not using typed dataclasses or Pydantic models for LLM output schemas.',
                        ],
                        interviewRelevance:
                          'Core coding assessments test GIL understanding, generators, and async programming.',
                        keyTakeaways: [
                          'Use asyncio.gather for parallel I/O bound LLM requests.',
                          'Enforce schemas with Pydantic for structured AI outputs.',
                        ],
                        quickRevision: [
                          'What is the Global Interpreter Lock (GIL)?',
                          'Difference between asyncio and multithreading?',
                        ],
                      },
                    },
                  ];

            setSkills(savedSkills.length > 0 ? savedSkills : skillsList);
            setCourses(defaultCourses);
            setResources(defaultResources);
            setStudyMaterials(defaultStudyMaterials);
            setActiveMaterial(defaultStudyMaterials[0]);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  // Update Skill Status in Matrix
  const handleUpdateSkillStatus = async (skillId: string, currentStatus: string) => {
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

    setSkills((prev) => {
      const updated = prev.map((s) =>
        s.id === skillId ? { ...s, status: nextStatus, current_level: nextLevel } : s
      );
      try {
        localStorage.setItem('user_skills_data', JSON.stringify(updated));
        window.dispatchEvent(new Event('skill_status_changed'));
      } catch (e) {}
      return updated;
    });

    try {
      await updateSkillStatus(skillId, nextStatus, nextLevel);
    } catch (err) {
      console.warn('Skill status update error:', err);
    }
  };

  // Toggle Course Progress
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

    setCourses((prev) => {
      const updated = prev.map((c) =>
        c.id === courseId ? { ...c, status: nextStatus, progress: nextProgress } : c
      );
      try {
        localStorage.setItem('user_courses_data', JSON.stringify(updated));
        window.dispatchEvent(new Event('course_status_changed'));
      } catch (e) {}
      return updated;
    });

    try {
      await updateCourseProgress(courseId, nextProgress, nextStatus);
    } catch (e) {
      console.warn('Supabase course update error:', e);
    }
  };

  // Switch to study guide matching a skill
  const openStudyGuideForSkill = (skillName: string) => {
    const matched = studyMaterials.find(
      (m) =>
        m.title.toLowerCase().includes(skillName.toLowerCase()) ||
        skillName.toLowerCase().includes(m.title.toLowerCase())
    );
    if (matched) {
      setActiveMaterial(matched);
    } else if (studyMaterials.length > 0) {
      setActiveMaterial(studyMaterials[0]);
    }
    setActiveTab('guides');
  };

  const filteredSkills = skills.filter((s) => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesSearch =
      s.skill_name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(skillSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalSkills = skills.length;
  const completedSkills = skills.filter((s) => s.status === 'Completed').length;
  const skillReadiness = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  const completedCourses = courses.filter((c) => c.status === 'Completed').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 max-w-7xl mx-auto">
        <div className="h-28 bg-slate-200/70 rounded-2xl" />
        <div className="h-12 bg-slate-200/70 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-200/70 rounded-2xl" />
          <div className="h-64 bg-slate-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* ─── TOP UNIFIED HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Competency Skills &amp; Learning Hub
            </h1>
            <Badge variant="primary" className="text-xs px-2.5 py-0.5">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Unified Intelligence
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Integrated technical skill matrix, adaptive code labs, and curated learning modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Skill Mastery Rate Gauge */}
          <div className="w-48 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1 font-mono">
              <span>Skills Mastered</span>
              <span className="text-indigo-600">
                {completedSkills}/{totalSkills} ({skillReadiness}%)
              </span>
            </div>
            <Progress value={skillReadiness} className="h-2 bg-slate-200" />
          </div>

          {/* Modules Count */}
          <div className="px-3.5 py-2.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs font-bold text-indigo-900 flex items-center gap-2 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Modules: <strong>{completedCourses}/{courses.length} Completed</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ─── TAB SWITCHER ─── */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'skills'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Target className="w-4 h-4" />
          Skill Competency Matrix
          <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-indigo-100 text-indigo-800">
            {skills.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('guides')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'guides'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          Adaptive Study Guides &amp; Code Labs
          <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-purple-100 text-purple-800">
            {studyMaterials.length} Guides
          </span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'modules'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Course Modules &amp; Web Resources
          <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-emerald-100 text-emerald-800">
            {courses.length + resources.length}
          </span>
        </button>
      </div>

      {/* ─── TAB 1: SKILL COMPETENCY MATRIX ─── */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Search & Filter Controls Card */}
          <Card className="p-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  placeholder="Search technical skills or category..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider shrink-0 mr-1">
                  Status:
                </span>
                {(['All', 'Not Started', 'Learning', 'Practiced', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill, idx) => {
              const isCompleted = skill.status === 'Completed';
              const isLearning = skill.status === 'Learning';
              const isPracticed = skill.status === 'Practiced';

              return (
                <Card
                  key={skill.id || skill.skill_name || `skill-${idx}`}
                  className={`flex flex-col justify-between transition-all duration-200 shadow-xs hover:border-slate-300 ${
                    isCompleted
                      ? 'border-emerald-200/90 bg-emerald-50/20'
                      : isLearning || isPracticed
                      ? 'border-indigo-200/90 bg-indigo-50/20'
                      : 'bg-white'
                  }`}
                >
                  <CardHeader className="pb-3 border-b border-slate-100/90">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {skill.category}
                      </span>
                      <Badge
                        variant={isCompleted ? 'success' : isLearning || isPracticed ? 'primary' : 'secondary'}
                        className="text-[9px]"
                      >
                        {skill.status}
                      </Badge>
                    </div>

                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                      <span>{skill.skill_name}</span>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3.5 p-4 text-xs">
                    {/* Proficiency Metric */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Current Mastery</span>
                        <span>
                          <strong className="text-slate-900">{skill.current_level}%</strong> /{' '}
                          <span className="text-indigo-600 font-bold">{skill.required_level}% Target</span>
                        </span>
                      </div>
                      <Progress
                        value={skill.current_level}
                        className="h-2 bg-slate-100"
                      />
                    </div>

                    {/* Action Row: Advance Status + Launch Study Guide */}
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isCompleted ? 'outline' : isLearning || isPracticed ? 'primary' : 'secondary'}
                        onClick={() => handleUpdateSkillStatus(skill.id!, skill.status)}
                        className={`flex-1 text-xs font-bold ${
                          isCompleted ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50' : ''
                        }`}
                      >
                        {skill.status}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStudyGuideForSkill(skill.skill_name)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200 shrink-0"
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        Study Guide
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredSkills.length === 0 && (
            <Card className="p-8 text-center text-slate-500 text-xs border-dashed border-2">
              <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              No skills match the selected filter criteria.
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB 2: ADAPTIVE STUDY GUIDES & CODE LABS ─── */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Guide Selector List */}
          <div className="lg:col-span-1 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
              Available Study Modules ({studyMaterials.length})
            </span>
            <div className="space-y-2">
              {studyMaterials.map((mat) => {
                const isSelected = activeMaterial?.id === mat.id;

                return (
                  <div
                    key={mat.id}
                    onClick={() => setActiveMaterial(mat)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-400/30'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant={mat.difficulty === 'Advanced' ? 'danger' : 'primary'}
                        className="text-[9px]"
                      >
                        {mat.difficulty}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mat.estimated_minutes}m
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">
                      {mat.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Interactive Study Guide */}
          <div className="lg:col-span-3">
            {activeMaterial ? (
              <Card className="shadow-xs overflow-hidden">
                <CardHeader className="border-b border-slate-100/90 pb-4 bg-gradient-to-r from-indigo-50/50 via-white to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary" className="text-[10px]">
                          {activeMaterial.difficulty}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {activeMaterial.estimated_minutes} min deep-dive
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        {activeMaterial.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-1 text-slate-600">
                    {activeMaterial.overview}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 p-6 text-xs text-slate-700">
                  {/* Why It Matters */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 border border-indigo-100 rounded-2xl space-y-1">
                    <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      Why This Concept Matters in Production:
                    </span>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {activeMaterial.content.whyItMatters}
                    </p>
                  </div>

                  {/* Core Concepts Grid */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3 font-mono">
                      Core Technical Foundations
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeMaterial.content.coreConcepts?.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 border border-slate-200/90 rounded-xl bg-white shadow-2xs space-y-1"
                        >
                          <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                          <span className="text-[11px] text-slate-500 block leading-relaxed">
                            {c.detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Theory Explanation */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Detailed Architectural Explanation
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                      {activeMaterial.content.detailedExplanation}
                    </p>
                  </div>

                  {/* Code Lab Specification */}
                  {activeMaterial.content.codeExample && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Implementation &amp; Code Blueprint
                      </span>
                      <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                        <code>{activeMaterial.content.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* Interview FAQs & Common Mistakes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Common Pitfalls */}
                    {activeMaterial.content.commonMistakes && (
                      <div className="p-4 bg-rose-50/40 border border-rose-200/80 rounded-2xl space-y-2">
                        <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                          ⚠️ Common Anti-Patterns &amp; Mistakes
                        </span>
                        <ul className="space-y-1 text-[11px] text-rose-800">
                          {activeMaterial.content.commonMistakes.map((m, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span>•</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interview Relevance */}
                    {activeMaterial.content.interviewRelevance && (
                      <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-2xl space-y-2">
                        <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                          🎯 Technical Interview Significance
                        </span>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          {activeMaterial.content.interviewRelevance}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Revision Questions */}
                  {activeMaterial.content.quickRevision && (
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Quick Self-Revision Flash Questions
                      </span>
                      <div className="space-y-1.5">
                        {activeMaterial.content.quickRevision.map((q, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-2"
                          >
                            <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center text-slate-500 text-xs">
                Select a study guide module from the list to begin reading.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: COURSE MODULES & DISCOVERED RESOURCES ─── */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Target Course Modules Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
              Structured Role Curriculum Modules ({courses.length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const isCompleted = course.status === 'Completed';

                return (
                  <Card
                    key={course.id}
                    className="flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
                  >
                    <CardHeader className="pb-3 border-b border-slate-100/90">
                      <div className="flex justify-between items-center mb-1.5">
                        <Badge variant={course.difficulty === 'Advanced' ? 'danger' : 'primary'}>
                          {course.difficulty}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {course.estimated_hours} Hours
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-900">{course.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {course.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 p-4 flex-1 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Module Completion</span>
                          <span className="font-bold text-indigo-600">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2 bg-slate-100" />
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 border-t border-slate-100/90 flex gap-2">
                      <Button
                        size="sm"
                        variant={course.status === 'In Progress' ? 'primary' : 'outline'}
                        onClick={() => toggleCourseStatus(course.id!, course.status)}
                        className={`w-full text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            : ''
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

          {/* Discovered Web Resources & Documentation */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
              Curated Web Documentation &amp; Video Courses ({resources.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {resources.map((res, idx) => (
                <a
                  key={res.id || res.title || `res-${idx}`}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 border border-slate-200/80 rounded-2xl bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                        {res.resource_type === 'video' ? (
                          <Video className="w-3 h-3 text-rose-500" />
                        ) : (
                          <FileText className="w-3 h-3 text-indigo-500" />
                        )}
                        {res.resource_type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{res.provider}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {res.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-bold">
                    <span>{Math.round(res.relevance_score * 100)}% Match</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open Resource
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
