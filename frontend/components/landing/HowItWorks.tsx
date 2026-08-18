'use client';

import { useState } from 'react';
import {
  FileText,
  Target,
  Code2,
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const workflowSteps = [
  {
    id: 1,
    number: '01',
    stageName: 'Diagnostic Stage',
    title: 'Profile & ATS Resume Audit',
    shortDesc: 'Automated 4-pillar scan parses your resume formatting, action impact, metric density, and keyword alignment.',
    icon: FileText,
    badge: 'Step 1',
    interactivePreview: {
      type: 'ats',
      score: 88,
      pillars: [
        { name: 'Contact & Links Validation', score: '100%', status: 'Passed' },
        { name: 'Action Verb Impact Density', score: '85%', status: 'High' },
        { name: 'Quantified Metric Ratio', score: '90%', status: 'Optimal' },
        { name: 'Target Role Keyword Match', score: '78%', status: 'Actionable' },
      ],
      missingKeywords: ['Redis Cache', 'LangChain', 'Vector Search', 'pgvector'],
    },
  },
  {
    id: 2,
    number: '02',
    stageName: 'Vector Delta Stage',
    title: 'Pinpoint Factual Skill Gaps',
    shortDesc: 'Multi-Agent RAG queries curated production job criteria, isolating the exact competencies required for your target role.',
    icon: Target,
    badge: 'Step 2',
    interactivePreview: {
      type: 'gaps',
      targetRole: 'Senior AI Engineer',
      baselineScore: 54,
      targetScore: 92,
      identifiedGaps: [
        { skill: 'RAG & Vector Retrieval', priority: 'High Yield', gap: '35% Delta' },
        { skill: 'Distributed Model Serving', priority: 'High Yield', gap: '25% Delta' },
        { skill: 'CI/CD Pipeline Automation', priority: 'Standard', gap: '15% Delta' },
      ],
    },
  },
  {
    id: 3,
    number: '03',
    stageName: 'Applied Build Stage',
    title: 'Execute Sequenced Milestones',
    shortDesc: 'Follow interactive study blueprints, syntax-highlighted code labs, official documentation, and production capstone briefs.',
    icon: Code2,
    badge: 'Step 3',
    interactivePreview: {
      type: 'code',
      activeModule: 'RAG Pipeline Architecture',
      codeSnippet: `// 1. Vector Search + Hybrid Re-ranking
const searchResults = await vectorStore.similaritySearch(query, { k: 10 });
const rerankedContext = await crossEncoder.rerank(searchResults, query);

// 2. Grounded LLM Response with Source IDs
const response = await aiEngine.generate({
  prompt: buildConstrainedPrompt(rerankedContext, query),
  citeSources: true,
});`,
      deliverable: 'Production Portfolio Capstone: GitHub Repo + Live API',
    },
  },
  {
    id: 4,
    number: '04',
    stageName: 'Placement Stage',
    title: 'Validate With AI Mock Interviews',
    shortDesc: 'Practice live system design and coding scenarios with our AI interviewer. Receive instant rubric feedback and offer readiness verification.',
    icon: Trophy,
    badge: 'Step 4',
    interactivePreview: {
      type: 'interview',
      verdict: 'Senior Level Readiness Verified',
      overallScore: 94,
      rubric: [
        { label: 'Technical Depth & Accuracy', grade: '96 / 100' },
        { label: 'System Design Trade-offs', grade: '92 / 100' },
        { label: 'Communication Clarity', grade: '94 / 100' },
      ],
    },
  },
];

export default function HowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = workflowSteps[activeStepIndex];

  const handleNext = () => {
    if (activeStepIndex < workflowSteps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white relative overflow-hidden w-full">
      <div className="w-full px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-14">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-medium font-sans mb-2.5">
            Sequential Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Dynamic 4-Stage Career Workflow
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
            Follow the connected pipeline from baseline diagnostic audit to verified technical placement.
          </p>
        </div>

        {/* ─── DYNAMIC WORKFLOW FLOWCHART PIPELINE ─── */}
        <div className="w-full max-w-7xl mx-auto">
          {/* Connected Flowchart Progress Stepper */}
          <div className="relative mb-8">
            {/* Flow line connector behind cards */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = activeStepIndex === idx;
                const isCompleted = activeStepIndex > idx;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-lg scale-[1.02]'
                        : isCompleted
                        ? 'bg-blue-50/40 border-blue-200/80 hover:bg-white text-slate-700'
                        : 'bg-slate-50/80 border-slate-200/90 hover:border-slate-300 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Node Header with Number and Arrow */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isCompleted ? '✓' : step.number}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 font-sans">
                            {step.stageName}
                          </span>
                        </div>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold leading-snug font-display text-slate-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {step.shortDesc}
                      </p>
                    </div>

                    {/* Step Flow indicator */}
                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                      <span className={isSelected ? 'text-blue-600' : 'text-slate-400'}>
                        {isSelected ? 'Active Pipeline Node' : `View ${step.badge}`}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-blue-600' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── DYNAMIC WORKFLOW INTERACTIVE SIMULATION CANVAS ─── */}
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Stage Overview & Action */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold font-sans">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentStep.badge} Workflow // {currentStep.stageName}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                  {currentStep.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  {currentStep.shortDesc}
                </p>

                {/* Workflow Navigation Controls */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={activeStepIndex === 0}
                    className="p-2.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                    title="Previous Workflow Stage"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={activeStepIndex === workflowSteps.length - 1}
                    className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href="/signup"
                    className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans"
                  >
                    <span>Launch Platform</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Live Interactive Simulation Widget for Active Stage */}
              <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                {/* ── STAGE 1 PREVIEW: LIVE ATS SCANNER ── */}
                {currentStep.interactivePreview.type === 'ats' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 font-sans">
                          SIMULATED ATS RESUME TELEMETRY
                        </span>
                        <div className="text-xl font-bold text-slate-900 font-display mt-0.5">
                          Candidate Resume Match: {currentStep.interactivePreview.score}%
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-sans">
                        ATS Ready
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentStep.interactivePreview.pillars?.map((p) => (
                        <div key={p.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{p.name}</span>
                          <span className="font-bold text-blue-600">{p.score}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 font-sans">
                        Missing Keyword Recommendations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentStep.interactivePreview.missingKeywords?.map((kw) => (
                          <span key={kw} className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-sans font-medium">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STAGE 2 PREVIEW: SKILL GAP DELTA ── */}
                {currentStep.interactivePreview.type === 'gaps' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 font-sans">
                          RAG COMPETENCY DELTA ENGINE
                        </span>
                        <div className="text-xl font-bold text-slate-900 font-display mt-0.5">
                          Target Role: {currentStep.interactivePreview.targetRole}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 font-sans">
                        Delta Calculated
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {currentStep.interactivePreview.identifiedGaps?.map((g) => (
                        <div key={g.skill} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-slate-800">{g.skill}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              {g.priority}
                            </span>
                            <span className="font-bold text-slate-600">{g.gap}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── STAGE 3 PREVIEW: CODE BLUEPRINT ── */}
                {currentStep.interactivePreview.type === 'code' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400 font-sans">
                        APPLIED CODE LAB // {currentStep.interactivePreview.activeModule}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/70 font-sans">
                        TypeScript / Python
                      </span>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                      <code>{currentStep.interactivePreview.codeSnippet}</code>
                    </pre>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{currentStep.interactivePreview.deliverable}</span>
                    </div>
                  </div>
                )}

                {/* ── STAGE 4 PREVIEW: AI MOCK INTERVIEW VERIFICATION ── */}
                {currentStep.interactivePreview.type === 'interview' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 font-sans">
                          AI TECHNICAL EVALUATOR SCORECARD
                        </span>
                        <div className="text-xl font-bold text-slate-900 font-display mt-0.5">
                          Readiness Score: {currentStep.interactivePreview.overallScore} / 100
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-sans">
                        {currentStep.interactivePreview.verdict}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {currentStep.interactivePreview.rubric?.map((r) => (
                        <div key={r.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{r.label}</span>
                          <span className="font-bold text-emerald-600">{r.grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
