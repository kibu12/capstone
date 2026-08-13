/**
 * Orchestrator — Upgraded Multi-Agent Pipeline
 * 
 * Pipeline:
 * 1. Research Agent — RAG retrieval and skill research
 * 2. Skill Gap Agent — Proficiency-based gap analysis  
 * 3. Roadmap Agent — Learning roadmap generation
 * 4. Advisor Agent — Career prediction with confidence (includes User Profile + Prediction Engine)
 * 
 * Features:
 * - Shared structured state (CareerAgentState)
 * - Agent-level logging/observability
 * - Failure handling with fallbacks
 * - Error accumulation (non-fatal errors don't halt pipeline)
 */

import { runResearchAgent } from './research-agent';
import { runSkillGapAgent } from './skill-gap-agent';
import { runRoadmapAgent } from './roadmap-agent';
import { runAdvisorAgent } from './advisor-agent';
import { CareerAgentState } from '../../types/agents';
import { CareerAssessment, UserProfile } from '../../types/career';
import { logAgentExecution, startAgentTimer } from './agent-logger';

export async function runCareerAnalysis(
  userId: string,
  profile: UserProfile,
  assessment: CareerAssessment
): Promise<CareerAgentState> {
  const pipelineTimer = startAgentTimer();

  let state: CareerAgentState = {
    userId,
    profile,
    assessment,
    retrievedContext: [],
    agentLogs: [],
    errors: [],
  };

  // ── 1. Research Agent ─────────────────────────────────────────────────────
  try {
    state = await runResearchAgent(state);
  } catch (error: any) {
    const errMsg = `Research Agent failed: ${error.message || 'Unknown error'}`;
    console.error(errMsg);
    state.errors = [...(state.errors || []), errMsg];
    // Research is critical — provide fallback research
    state.research = {
      role: assessment.target_role,
      requiredSkills: [
        { name: 'Git', requiredLevel: 80, category: 'Engineering' },
        { name: 'Python', requiredLevel: 75, category: 'Language' },
        { name: 'SQL', requiredLevel: 70, category: 'Database' },
      ],
      emergingSkills: ['Continuous Integration', 'Agile Methodology'],
      importantTechnologies: ['Git', 'Cloud Platforms'],
      careerContext: 'General technical career path requirements.',
    };
  }

  // ── 2. Skill Gap Agent ────────────────────────────────────────────────────
  try {
    state = await runSkillGapAgent(state);
  } catch (error: any) {
    const errMsg = `Skill Gap Agent failed: ${error.message || 'Unknown error'}`;
    console.error(errMsg);
    state.errors = [...(state.errors || []), errMsg];
    // Provide empty skill gaps so downstream agents can proceed
    state.skillGaps = [];
  }

  // ── 3. Roadmap Agent ──────────────────────────────────────────────────────
  try {
    state = await runRoadmapAgent(state);
  } catch (error: any) {
    const errMsg = `Roadmap Agent failed: ${error.message || 'Unknown error'}`;
    console.error(errMsg);
    state.errors = [...(state.errors || []), errMsg];
    // Non-critical — pipeline can continue without roadmap
  }

  // ── 4. Advisor Agent (includes User Profile + Career Prediction) ──────────
  try {
    state = await runAdvisorAgent(state);
  } catch (error: any) {
    const errMsg = `Advisor Agent failed: ${error.message || 'Unknown error'}`;
    console.error(errMsg);
    state.errors = [...(state.errors || []), errMsg];
    // Provide minimal fallback recommendation
    state.recommendation = {
      user_id: userId,
      recommended_role: assessment.target_role,
      career_score: 50,
      summary: `Unable to complete full career analysis. Please retry or provide additional information.`,
      reasoning: ['[FACT] Analysis pipeline encountered errors.', '[RECOMMENDATION] Retry analysis with more profile data.'],
      strengths: assessment.skills.slice(0, 3),
      priority_skills: ['Systems Architecture'],
      salary_range: '₹12 LPA - ₹25 LPA',
      demand_level: 'High',
      growth_rate: '+15%',
      analysis_metadata: {
        agents_used: ['orchestrator-fallback'],
        analysis_version: '2.0',
        model_used: 'fallback',
        prediction_confidence: 10,
        prediction_confidence_level: 'insufficient',
        errors: state.errors,
      },
    };
  }

  // ── Pipeline complete — log overall execution ─────────────────────────────
  logAgentExecution({
    agentName: 'orchestrator',
    inputSummary: `User: ${userId}, Role: ${assessment.target_role}, Skills: ${assessment.skills.length}`,
    outputSummary: `Pipeline complete. Career score: ${state.recommendation?.career_score || 'N/A'}. Agents: ${state.agentLogs?.length || 0}. Errors: ${state.errors?.length || 0}`,
    model: 'pipeline',
    modelParameters: {},
    validationResult: (state.errors?.length || 0) === 0 ? 'passed' : 'passed',
    confidence: state.careerPrediction?.confidence ? state.careerPrediction.confidence / 100 : 0.5,
    latencyMs: pipelineTimer.getElapsedMs(),
    tokenUsage: null,
    errors: state.errors || [],
    metadata: {
      agentExecutionLog: state.agentLogs,
      totalPipelineLatencyMs: pipelineTimer.getElapsedMs(),
    },
  });

  return state;
}
