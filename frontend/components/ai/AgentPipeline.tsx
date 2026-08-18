'use client';

import { useState, useEffect } from 'react';
import {
  Globe,
  Target,
  Code2,
  Trophy,
  CheckCircle2,
  Loader2,
  Sparkles,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const pipelineSteps = [
  {
    id: 0,
    name: 'Market Research & Vector Agent',
    icon: Globe,
    desc: 'Querying vector database for real-time production job criteria and senior benchmarks...',
    completedDesc: 'Indexed target role criteria & market requirements',
    badge: 'RAG Retrieval',
    log: '[RESEARCH_AGENT] Querying vector embeddings for target role benchmarks... (42 specs retrieved)',
  },
  {
    id: 1,
    name: 'Skill Gap Delta Engine',
    icon: Target,
    desc: 'Calculating competency deltas between verified background and production requirements...',
    completedDesc: 'Computed high-yield missing skill gaps & priority deltas',
    badge: 'Delta Matrix',
    log: '[DELTA_AGENT] Comparing candidate competency baseline against target benchmarks... (3 gaps isolated)',
  },
  {
    id: 2,
    name: 'Roadmap & Capstone Architect',
    icon: Code2,
    desc: 'Structuring 4-phase progression path, interactive code labs, and portfolio capstone briefs...',
    completedDesc: 'Constructed 4-phase sequential milestones & code blueprints',
    badge: 'Milestone Build',
    log: '[ROADMAP_ARCHITECT] Generating milestone phases, applied code labs, and portfolio-grade project specs...',
  },
  {
    id: 3,
    name: 'Career Advisor & Evaluator',
    icon: Trophy,
    desc: 'Synthesizing tailored recommendation, rubric grading, and AI mock interview simulations...',
    completedDesc: 'Finalized candidate career architecture & interview rubric',
    badge: 'Placement Ready',
    log: '[ADVISOR_AGENT] Finalizing personalized career recommendation, ATS scorecards, and AI interview scenarios...',
  },
];

export default function AgentPipeline({ currentStep, active }: { currentStep: number; active: boolean }) {
  if (!active) return null;

  const currentPercent = Math.min(100, Math.round(((currentStep + 1) / pipelineSteps.length) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
      {/* ─── TOP STATUS HEADER & PROGRESS BAR ─── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
              Multi-Agent Orchestrator Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full">
              Agent {Math.min(currentStep + 1, 4)} of 4 ({currentPercent}%)
            </span>
          </div>
        </div>

        {/* Dynamic Glowing Progress Track */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 rounded-full transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${currentPercent}%` }}
          />
        </div>
      </div>

      {/* ─── 4 AGENT EXECUTION CARDS (2x2 GRID) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div
              key={step.name}
              className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-lg scale-[1.02]'
                  : isDone
                  ? 'bg-emerald-50/50 border-emerald-200/80 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Node 0{idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                        {step.name}
                      </h4>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {isActive ? 'Processing...' : isDone ? 'Completed' : 'Queued'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2">
                  {isDone ? step.completedDesc : step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">{step.badge}</span>
                {isActive && (
                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing</span>
                  </span>
                )}
                {isDone && (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Success</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── LIVE TELEMETRY CONSOLE FEED ─── */}
      <div className="p-5 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Live Orchestrator Telemetry Feed
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Autonomous RAG Stream</span>
        </div>

        <div className="space-y-1.5 text-[11px] leading-relaxed overflow-hidden">
          {pipelineSteps.slice(0, currentStep + 1).map((s, index) => (
            <div key={s.id} className="flex items-start gap-2 text-slate-300">
              <span className="text-emerald-400 shrink-0">➜</span>
              <span className={index === currentStep ? 'text-blue-300 font-semibold animate-pulse' : 'text-slate-400'}>
                {s.log}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-blue-400 pt-1">
            <span className="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px]">Awaiting downstream pipeline convergence...</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>End-to-End Private Encryption • Row-Level Security Enforced</span>
      </div>
    </div>
  );
}
