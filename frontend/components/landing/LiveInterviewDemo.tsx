'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mic,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Brain,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

const interviewQuestions = [
  {
    id: 'q1',
    role: 'AI / ML Engineer',
    question: 'How do you prevent hallucinations and optimize chunk retrieval in a production RAG system?',
    sampleAnswer: 'To minimize hallucinations, we use hybrid search (dense embeddings + BM25 keyword search) with cross-encoder re-ranking. We constrain generation via strict system prompts and cite source chunk IDs. We evaluate retrieval using metrics like Context Precision and Faithfulness via RAGAS telemetry.',
    aiAnalysis: {
      score: 94,
      verdict: 'Senior Level Response',
      strengths: ['Mentioned Hybrid Dense + BM25 Search', 'Addressed Cross-Encoder Re-ranking', 'Cited RAGAS Telemetry & Faithfulness'],
      missingKeywords: ['Vector Cache (Redis)', 'Query Rewriting'],
    },
  },
  {
    id: 'q2',
    role: 'Full Stack Engineer',
    question: 'How do you design a high-concurrency real-time notification service in Next.js & Node?',
    sampleAnswer: 'We decouple notification dispatch using Redis Pub/Sub or Apache Kafka as a message broker. Web clients connect via Server-Sent Events (SSE) or WebSockets with connection pooling. State is persisted in PostgreSQL with batch writes to prevent database lock contention.',
    aiAnalysis: {
      score: 92,
      verdict: 'Production Grade Architecture',
      strengths: ['Message Broker Decoupling (Kafka/Redis)', 'SSE / WebSocket Connection Pooling', 'Batch Writing to Prevent Lock Contention'],
      missingKeywords: ['Exponential Backoff Retry', 'Idempotency Keys'],
    },
  },
  {
    id: 'q3',
    role: 'Cloud Architect',
    question: 'How do you handle zero-downtime rolling deployments across multi-region Kubernetes clusters?',
    sampleAnswer: 'We implement Canary deployments using ArgoCD and Istio service mesh. Global traffic is distributed via Anycast DNS and Cloudflare load balancers with automated health check probes. Database schema migrations run in backward-compatible phases.',
    aiAnalysis: {
      score: 96,
      verdict: 'Staff/Principal Grade Response',
      strengths: ['Canary Traffic Splitting (Istio)', 'Anycast DNS Load Balancing', 'Backward-Compatible Schema Migration Pattern'],
      missingKeywords: ['Chaos Testing (ChaosMesh)'],
    },
  },
];

export default function LiveInterviewDemo() {
  const [activeQuestion, setActiveQuestion] = useState(interviewQuestions[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulated, setSimulated] = useState(true);

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulated(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulated(true);
    }, 700);
  };

  return (
    <section className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase mb-3">
            <Mic className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display">
            Test The AI Mock Technical Interviewer
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed font-sans">
            Experience how the platform assesses candidate technical depth, architecture decisions, and keyword metric density in real time.
          </p>
        </div>

        {/* ─── LIVE INTERACTIVE INTERVIEW SIMULATOR CARD ─── */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8">
          {/* Question Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Select Question Scenario:
            </span>
            <div className="flex flex-wrap gap-2">
              {interviewQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveQuestion(q);
                    handleSimulate();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeQuestion.id === q.id
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {q.role}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Question Prompt & Candidate Answer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold mb-1.5 uppercase">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Senior Interview Question</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-relaxed">
                  "{activeQuestion.question}"
                </h4>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Candidate Verified Response:</span>
                  <span className="text-emerald-400 font-bold">Audio &amp; Text Stream</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {activeQuestion.sampleAnswer}
                </p>
              </div>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Evaluating Response...' : 'Re-Run AI Analysis'}</span>
              </button>
            </div>

            {/* Right: AI Scorecard & Diagnostic Breakdown */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              {isSimulating ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 animate-pulse">
                  <Brain className="w-8 h-8 text-blue-500 mb-2 animate-bounce" />
                  <span className="text-xs font-mono">Executing Neural Telemetry...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        AI Evaluator Score
                      </span>
                      <div className="text-2xl font-black text-white font-display flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-emerald-400">{activeQuestion.aiAnalysis.score}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {activeQuestion.aiAnalysis.verdict}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-2">
                      Validated Core Concepts:
                    </span>
                    <div className="space-y-1.5">
                      {activeQuestion.aiAnalysis.strengths.map((str) => (
                        <div key={str} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-mono font-bold uppercase text-amber-400 block mb-1.5">
                      Recommended Follow-up Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuestion.aiAnalysis.missingKeywords.map((kw) => (
                        <span key={kw} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Link
                href="/signup"
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Mock Interview Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
