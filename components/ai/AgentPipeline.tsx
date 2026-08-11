'use client';

import { useState } from 'react';

const pipelineSteps = [
  { name: 'Research Agent', desc: 'Retrieving career guidelines from RAG store...' },
  { name: 'Skill Gap Agent', desc: 'Calculating current skills against requirement limits...' },
  { name: 'Roadmap Agent', desc: 'Structuring learning phases and project checkpoints...' },
  { name: 'Advisor Agent', desc: 'Synthesizing recommendations and match reasoning...' }
];

export default function AgentPipeline({ currentStep, active }: { currentStep: number; active: boolean }) {
  if (!active) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Pipeline Status</span>
        <span className="inline-flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
        </span>
      </div>

      <div className="space-y-4">
        {pipelineSteps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={step.name} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isDone ? 'bg-indigo-600 text-white' : isActive ? 'bg-indigo-50 border border-indigo-600 text-indigo-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div className={`w-[2px] h-6 ${isDone ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                )}
              </div>
              <div className="pt-0.5">
                <h4 className={`text-xs font-semibold ${isActive ? 'text-indigo-600' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.name}
                </h4>
                {isActive && (
                  <p className="text-[11px] text-slate-500 mt-0.5 animate-pulse">
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
