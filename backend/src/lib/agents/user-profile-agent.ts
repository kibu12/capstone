/**
 * User Profile Agent
 * 
 * Maintains structured skill vectors for each user.
 * Integrates assessment history, quiz results, and project completion
 * to build an evidence-based skill profile.
 * 
 * Key principle: Never judge a skill based on a single data point.
 * Require sufficient evidence before classifying skill status.
 */

import { SkillNode, UserSkillProfile, getSkillStatus, updateSkillNode, calculateTrend } from './skill-graph';
import { CareerAgentState, SkillGapResult } from '../../types/agents';

const MIN_EVIDENCE_FOR_ASSESSMENT = 3;

/**
 * Build or update a user's skill profile from all available evidence.
 */
export function buildSkillProfile(
  userId: string,
  targetCareer: string,
  existingProfile: UserSkillProfile | null,
  assessmentData: {
    skillGaps?: SkillGapResult[];
    quizResults?: { skill: string; conceptName: string; score: number; timestamp: string }[];
    projectCompletions?: { skill: string; completedAt: string }[];
    conceptPerformances?: { conceptName: string; skillName: string; masteryScore: number; attemptsCount: number }[];
  }
): UserSkillProfile {
  const now = new Date().toISOString();
  const skillMap = new Map<string, SkillNode>();

  // 1. Load existing skill nodes
  if (existingProfile) {
    for (const skill of existingProfile.skills) {
      skillMap.set(skill.skill.toLowerCase(), { ...skill });
    }
  }

  // 2. Integrate skill gap data (from career analysis)
  if (assessmentData.skillGaps) {
    for (const gap of assessmentData.skillGaps) {
      const key = gap.skillName.toLowerCase();
      const existing = skillMap.get(key) || null;
      const normalizedLevel = gap.currentLevel / 100; // Convert 0-100 to 0-1

      const updated = updateSkillNode(existing, normalizedLevel, now);
      updated.skill = gap.skillName;
      skillMap.set(key, updated);
    }
  }

  // 3. Integrate quiz results
  if (assessmentData.quizResults) {
    // Group by skill
    const skillScores = new Map<string, number[]>();
    for (const result of assessmentData.quizResults) {
      const key = result.skill.toLowerCase();
      if (!skillScores.has(key)) skillScores.set(key, []);
      skillScores.get(key)!.push(result.score);
    }

    for (const [key, scores] of skillScores) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const existing = skillMap.get(key) || null;
      const updated = updateSkillNode(existing, avgScore, now);
      updated.skill = existing?.skill || assessmentData.quizResults.find(
        r => r.skill.toLowerCase() === key
      )?.skill || key;
      updated.trend = calculateTrend(scores);
      skillMap.set(key, updated);
    }
  }

  // 4. Integrate concept performance data
  if (assessmentData.conceptPerformances) {
    const skillScoreMap = new Map<string, { total: number; count: number }>();
    for (const cp of assessmentData.conceptPerformances) {
      const key = cp.skillName.toLowerCase();
      if (!skillScoreMap.has(key)) skillScoreMap.set(key, { total: 0, count: 0 });
      const entry = skillScoreMap.get(key)!;
      entry.total += cp.masteryScore / 100;
      entry.count += 1;
    }

    for (const [key, scores] of skillScoreMap) {
      const avgScore = scores.total / scores.count;
      const existing = skillMap.get(key) || null;
      const updated = updateSkillNode(existing, avgScore, now);
      updated.skill = existing?.skill || key;
      updated.evidenceCount = Math.max(updated.evidenceCount, scores.count);
      skillMap.set(key, updated);
    }
  }

  // 5. Integrate project completions (boost proficiency for completed projects)
  if (assessmentData.projectCompletions) {
    for (const project of assessmentData.projectCompletions) {
      const key = project.skill.toLowerCase();
      const existing = skillMap.get(key);
      if (existing) {
        existing.proficiency = Math.min(1, existing.proficiency + 0.05); // Small boost
        existing.evidenceCount += 1;
        existing.status = getSkillStatus(existing.proficiency, existing.evidenceCount);
      }
    }
  }

  // 6. Calculate overall readiness
  const skills = Array.from(skillMap.values());
  const readySkills = skills.filter(s => s.status === 'strong' || (s.status === 'developing' && s.proficiency >= 0.60));
  const overallReadiness = skills.length > 0
    ? readySkills.length / skills.length
    : 0;

  return {
    userId,
    skills,
    targetCareer,
    overallReadiness: Math.round(overallReadiness * 100) / 100,
    lastUpdated: now,
  };
}

/**
 * Get skill assessment summary for display purposes.
 */
export function getSkillSummary(profile: UserSkillProfile): {
  strong: string[];
  developing: string[];
  weak: string[];
  unknown: string[];
  totalEvidence: number;
  sufficientEvidence: boolean;
} {
  const strong = profile.skills.filter(s => s.status === 'strong').map(s => s.skill);
  const developing = profile.skills.filter(s => s.status === 'developing').map(s => s.skill);
  const weak = profile.skills.filter(s => s.status === 'weak').map(s => s.skill);
  const unknown = profile.skills.filter(s => s.status === 'unknown').map(s => s.skill);
  const totalEvidence = profile.skills.reduce((sum, s) => sum + s.evidenceCount, 0);
  const sufficientEvidence = profile.skills.filter(
    s => s.evidenceCount >= MIN_EVIDENCE_FOR_ASSESSMENT
  ).length >= profile.skills.length * 0.5;

  return { strong, developing, weak, unknown, totalEvidence, sufficientEvidence };
}

/**
 * Run the User Profile Agent as part of the agent pipeline.
 * Enriches the agent state with a structured skill profile.
 */
export async function runUserProfileAgent(state: CareerAgentState): Promise<CareerAgentState> {
  const { userId, assessment, skillGaps } = state;

  const profile = buildSkillProfile(
    userId,
    assessment.target_role,
    null, // No existing profile in first run
    {
      skillGaps: skillGaps || [],
      quizResults: [],
      projectCompletions: [],
      conceptPerformances: [],
    }
  );

  return {
    ...state,
    userSkillProfile: profile,
  };
}
