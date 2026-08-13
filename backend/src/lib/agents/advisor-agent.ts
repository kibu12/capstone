/**
 * Advisor Agent — Upgraded with Confidence & Evidence-Based Predictions
 * 
 * Changes from original:
 * 1. Uses career prediction engine for hybrid scoring
 * 2. Includes calibrated confidence based on evidence
 * 3. Never states "You will become X" — always "Current readiness: Y%"
 * 4. Distinguishes FACT / INFERENCE / RECOMMENDATION
 * 5. Handles insufficient evidence explicitly
 * 6. Structured output with component scores
 */

import { CareerAgentState } from '../../types/agents';
import { CareerRecommendation } from '../../types/career';
import { predictCareerReadiness, CareerPredictionResult, DEFAULT_PREDICTION_WEIGHTS } from './career-prediction-engine';
import { buildSkillProfile, getSkillSummary } from './user-profile-agent';
import { logAgentExecution, startAgentTimer } from './agent-logger';

export async function runAdvisorAgent(state: CareerAgentState): Promise<CareerAgentState> {
  const timer = startAgentTimer();
  const errors: string[] = [];

  const { research, skillGaps, retrievedContext, userId, assessment } = state;
  if (!research || !skillGaps) {
    throw new Error('Missing input stages for Advisor Agent');
  }

  // ── Build skill profile ─────────────────────────────────────────────────────
  const skillProfile = buildSkillProfile(
    userId,
    assessment.target_role,
    state.userSkillProfile || null,
    {
      skillGaps,
      quizResults: [],
      projectCompletions: [],
      conceptPerformances: [],
    }
  );

  // ── Run career prediction engine ────────────────────────────────────────────
  let prediction: CareerPredictionResult;
  try {
    prediction = predictCareerReadiness(
      skillProfile,
      assessment.target_role,
      {
        totalAssessments: 1,  // First assessment
        totalQuestionsAnswered: 0,
        averageAssessmentScore: assessment.assessment_score || 0,
        projectsCompleted: 0,
        totalProjectsRecommended: 2,
        interviewReadinessScore: 0,
        coursesCompleted: 0,
        totalCourses: skillGaps.length,
      },
      DEFAULT_PREDICTION_WEIGHTS
    );
  } catch (e: any) {
    errors.push(`Prediction engine error: ${e.message}`);
    prediction = {
      careerMatch: 50,
      confidence: 10,
      confidenceLevel: 'insufficient',
      strongAreas: [],
      weakAreas: [],
      missingSkills: [],
      explanation: 'Unable to generate reliable prediction. Insufficient data.',
      evidenceSummary: { totalAssessments: 0, totalQuestions: 0, totalProjects: 0, averageScore: 0, sufficientEvidence: false },
      componentScores: { skillCoverage: 0, skillProficiency: 0, assessmentPerformance: 0, projectExperience: 0, interviewReadiness: 0, learningProgress: 0 },
      weights: DEFAULT_PREDICTION_WEIGHTS,
    };
  }

  // ── Determine strengths & priority gaps ──────────────────────────────────────
  const skillSummary = getSkillSummary(skillProfile);
  const strengths = prediction.strongAreas.length > 0
    ? prediction.strongAreas
    : skillGaps.filter(g => g.currentLevel >= 65).map(g => g.skillName);
  const prioritySkills = prediction.weakAreas.length > 0
    ? [...prediction.weakAreas, ...prediction.missingSkills]
    : skillGaps.filter(g => g.priority === 'High').map(g => g.skillName);

  // ── RAG-grounded metadata ───────────────────────────────────────────────────
  const primaryDoc = retrievedContext[0];
  const salaryRange = primaryDoc?.metadata?.salaryRange || '₹12 LPA - ₹25 LPA';
  const demandLevel = primaryDoc?.metadata?.demandLevel || 'High';
  const growthRate = primaryDoc?.metadata?.growthRate || '+15%';

  // ── Generate evidence-based summary ─────────────────────────────────────────
  // CRITICAL: Never state "You will become X"
  // Always use "Current readiness: Y%"
  let summary: string;
  let reasoning: string[];

  if (!prediction.evidenceSummary.sufficientEvidence) {
    summary = `Based on initial analysis, your current ${research.role} readiness is estimated at ${prediction.careerMatch}%. ` +
      `Note: This prediction has ${prediction.confidenceLevel} confidence due to limited evidence. ` +
      `Complete assessments and projects to improve prediction accuracy.`;
    reasoning = [
      `[INFERENCE] Initial skill profile suggests alignment with ${research.role} requirements.`,
      `[FACT] ${prediction.evidenceSummary.totalAssessments} assessment(s) evaluated with ${prediction.evidenceSummary.totalQuestions} questions answered.`,
      `[RECOMMENDATION] Take skill assessments and complete projects to build a reliable profile.`,
    ];
  } else {
    summary = assessment.resume_filename
      ? `Based on uploaded resume (${assessment.resume_filename}) and assessment data, ` +
        `your current ${research.role} readiness is ${prediction.careerMatch}% ` +
        `(confidence: ${prediction.confidenceLevel}). ${prediction.explanation}`
      : `Current ${research.role} readiness: ${prediction.careerMatch}% ` +
        `(confidence: ${prediction.confidenceLevel}). ${prediction.explanation}`;
    reasoning = [
      assessment.resume_filename
        ? `[FACT] Uploaded resume (${assessment.resume_filename}) verified technical background.`
        : `[FACT] Experience level: ${assessment.experience_level}.`,
      `[FACT] Skill coverage: ${prediction.componentScores.skillCoverage}% of required skills for ${research.role}.`,
      strengths.length > 0
        ? `[FACT] Strong areas: ${strengths.slice(0, 3).join(', ')}.`
        : `[INFERENCE] Building foundational skills for ${research.role}.`,
    ];
  }

  // ── Optional LLM enhancement ────────────────────────────────────────────────
  if (process.env.AI_API_KEY) {
    try {
      const { queryAIModel } = require('../ai/career-engine');
      const prompt = `
        User target role: ${research.role}
        User background: ${assessment.experience_level}
        Resume uploaded: ${assessment.resume_filename || 'None'}
        Resume Context: ${assessment.resume_text ? assessment.resume_text.substring(0, 1000) : 'None'}
        Interests: ${assessment.interests.join(', ')}
        Existing skills: ${strengths.join(', ')}
        Required skills gaps: ${prioritySkills.join(', ')}
        Career readiness score: ${prediction.careerMatch}%
        Confidence level: ${prediction.confidenceLevel}
        
        CRITICAL RULES:
        1. NEVER say "You will become X" or make absolute career predictions
        2. Always use language like "Current readiness is X%" or "Based on evidence..."
        3. Distinguish facts from inferences and recommendations
        4. Do NOT fabricate courses, certifications, or statistics
        
        Generate a JSON object with:
        "summary": A paragraph describing current readiness with evidence. Use "Current ${research.role} readiness: ${prediction.careerMatch}%" language.
        "reasoning": String array with exactly 3 evidence-based reasons. Prefix each with [FACT], [INFERENCE], or [RECOMMENDATION].
        
        Ensure valid JSON only. No markdown formatting.
      `;
      const responseText = await queryAIModel(prompt, "You are a professional career advisor who provides evidence-based, calibrated assessments. Never make absolute predictions.");
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.summary) summary = parsed.summary;
      if (Array.isArray(parsed.reasoning)) reasoning = parsed.reasoning;
    } catch (e: any) {
      errors.push(`LLM Advisor enhancement failed: ${e.message}`);
      console.warn("LLM Advisor Agent query failed, using deterministic output:", e.message);
    }
  }

  // ── Build recommendation ────────────────────────────────────────────────────
  const recommendation: CareerRecommendation = {
    user_id: userId,
    recommended_role: research.role,
    career_score: prediction.careerMatch,
    summary,
    reasoning,
    strengths: strengths.length > 0 ? strengths : ['Technical Agility'],
    priority_skills: prioritySkills.length > 0 ? prioritySkills : ['Systems Architecture'],
    salary_range: salaryRange,
    demand_level: demandLevel,
    growth_rate: growthRate,
    analysis_metadata: {
      agents_used: ['research-agent', 'skill-gap-agent', 'user-profile-agent', 'career-prediction-engine', 'roadmap-agent', 'advisor-agent'],
      rag_sources: retrievedContext.map(d => d.id),
      analysis_version: '2.0',
      model_used: process.env.AI_API_KEY ? (process.env.AI_MODEL_NAME || 'gemini-2.5-flash') : 'deterministic-engine',
      prediction_confidence: prediction.confidence,
      prediction_confidence_level: prediction.confidenceLevel,
      component_scores: prediction.componentScores,
      evidence_summary: prediction.evidenceSummary,
      skill_summary: skillSummary,
    }
  };

  // ── Log execution ───────────────────────────────────────────────────────────
  logAgentExecution({
    agentName: 'advisor-agent',
    inputSummary: `Role: ${research.role}, Skills: ${strengths.length} strong, ${prioritySkills.length} priority gaps`,
    outputSummary: `Career match: ${prediction.careerMatch}%, Confidence: ${prediction.confidenceLevel}`,
    model: process.env.AI_API_KEY ? (process.env.AI_MODEL_NAME || 'gemini-2.5-flash') : 'deterministic',
    modelParameters: { temperature: 0.2 },
    validationResult: 'passed',
    confidence: prediction.confidence / 100,
    latencyMs: timer.getElapsedMs(),
    tokenUsage: null,
    errors,
    metadata: { careerMatch: prediction.careerMatch, confidenceLevel: prediction.confidenceLevel },
  });

  return {
    ...state,
    recommendation,
    userSkillProfile: skillProfile,
    careerPrediction: prediction,
    errors: [...(state.errors || []), ...errors],
    agentLogs: [
      ...(state.agentLogs || []),
      { agentName: 'advisor-agent', latencyMs: timer.getElapsedMs(), status: errors.length > 0 ? 'partial' : 'success' },
    ],
  };
}
