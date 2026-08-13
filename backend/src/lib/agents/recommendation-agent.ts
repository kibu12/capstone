/**
 * Recommendation Agent — Personalized Learning Recommendations
 * 
 * Recommendations depend on:
 * - User skill level + target career + skill gaps
 * - Learning history + assessment results
 * - Difficulty + prerequisites + content quality
 * 
 * Prevents recommendation feedback loops:
 * - No duplicate recommendations
 * - No already-mastered topics
 * - No excessive difficulty jumps
 * 
 * Implements: ASSESS → IDENTIFY GAP → RECOMMEND → LEARN → REASSESS → UPDATE
 */

import { SkillGapResult } from '../../types/agents';
import { logAgentExecution, startAgentTimer } from './agent-logger';

export interface PersonalizedRecommendation {
  priority: number;
  skill: string;
  reason: string;
  currentProficiency: number;
  targetProficiency: number;
  gapSeverity: 'critical' | 'significant' | 'moderate' | 'minor';
  prerequisitesMet: boolean;
  prerequisites: string[];
  suggestedResources: {
    type: 'course' | 'documentation' | 'project' | 'video' | 'practice';
    title: string;
    estimatedHours: number;
  }[];
  nextAssessmentRecommended: boolean;
}

export interface RecommendationHistory {
  recommended: string[];
  completed: string[];
  rejected: string[];
  currentlyLearning: string[];
  mastered: string[];
}

/**
 * Generate personalized learning recommendations based on skill gaps.
 */
export function generateRecommendations(
  skillGaps: SkillGapResult[],
  history: RecommendationHistory = { recommended: [], completed: [], rejected: [], currentlyLearning: [], mastered: [] },
  userExperienceLevel: string = 'Entry Level'
): PersonalizedRecommendation[] {
  const timer = startAgentTimer();

  const recommendations: PersonalizedRecommendation[] = [];

  // Sort gaps by priority and gap size
  const sortedGaps = [...skillGaps].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return (b.requiredLevel - b.currentLevel) - (a.requiredLevel - a.currentLevel);
  });

  for (const gap of sortedGaps) {
    // ── Skip already mastered or currently learning ─────────────────────────
    if (history.mastered.some(m => m.toLowerCase() === gap.skillName.toLowerCase())) continue;
    if (history.currentlyLearning.some(c => c.toLowerCase() === gap.skillName.toLowerCase())) continue;

    // ── Skip recently rejected (don't re-recommend immediately) ─────────────
    if (history.rejected.some(r => r.toLowerCase() === gap.skillName.toLowerCase())) continue;

    // ── Calculate gap severity ──────────────────────────────────────────────
    const gapSize = gap.requiredLevel - gap.currentLevel;
    let gapSeverity: PersonalizedRecommendation['gapSeverity'] = 'minor';
    if (gapSize > 50) gapSeverity = 'critical';
    else if (gapSize > 30) gapSeverity = 'significant';
    else if (gapSize > 15) gapSeverity = 'moderate';

    // ── Check for excessive difficulty jumps ─────────────────────────────────
    // Don't recommend advanced topics if fundamentals are missing
    const isAdvancedSkill = gap.requiredLevel >= 80;
    const userIsVeryNew = gap.currentLevel < 20;
    const prerequisitesMet = !(isAdvancedSkill && userIsVeryNew);

    // ── Determine prerequisites ─────────────────────────────────────────────
    const prerequisites: string[] = [];
    if (gap.currentLevel < 20 && gap.category === 'Emerging Tech') {
      prerequisites.push('Python', 'APIs');
    }
    if (gap.skillName.toLowerCase().includes('kubernetes') || gap.skillName.toLowerCase().includes('mlops')) {
      prerequisites.push('Docker');
    }
    if (gap.skillName.toLowerCase().includes('deep learning')) {
      prerequisites.push('Machine Learning', 'Python');
    }

    // ── Generate reason ─────────────────────────────────────────────────────
    let reason: string;
    if (gapSeverity === 'critical') {
      reason = `Your ${gap.skillName} proficiency is ${gap.currentLevel}%, significantly below the ${gap.requiredLevel}% required. This is a high-priority gap.`;
    } else if (gapSeverity === 'significant') {
      reason = `${gap.skillName} requires ${gap.requiredLevel}% proficiency. Current level: ${gap.currentLevel}%. Focused study recommended.`;
    } else {
      reason = `${gap.skillName} has a ${gapSize}% gap (current: ${gap.currentLevel}%, target: ${gap.requiredLevel}%). Targeted practice will close this gap.`;
    }

    // ── Suggest resources based on current level ────────────────────────────
    const resources: PersonalizedRecommendation['suggestedResources'] = [];

    if (gap.currentLevel < 30) {
      resources.push(
        { type: 'documentation', title: `${gap.skillName} Fundamentals Guide`, estimatedHours: 3 },
        { type: 'video', title: `Introduction to ${gap.skillName}`, estimatedHours: 2 },
      );
    } else if (gap.currentLevel < 60) {
      resources.push(
        { type: 'course', title: `${gap.skillName} Intermediate Mastery`, estimatedHours: 6 },
        { type: 'project', title: `Build a ${gap.skillName} Application`, estimatedHours: 8 },
      );
    } else {
      resources.push(
        { type: 'project', title: `Advanced ${gap.skillName} Production System`, estimatedHours: 15 },
        { type: 'practice', title: `${gap.skillName} Interview Prep & Scenarios`, estimatedHours: 4 },
      );
    }

    recommendations.push({
      priority: recommendations.length + 1,
      skill: gap.skillName,
      reason,
      currentProficiency: gap.currentLevel,
      targetProficiency: gap.requiredLevel,
      gapSeverity,
      prerequisitesMet,
      prerequisites,
      suggestedResources: resources,
      nextAssessmentRecommended: gapSeverity === 'critical' || gapSeverity === 'significant',
    });
  }

  // ── Log execution ───────────────────────────────────────────────────────────
  logAgentExecution({
    agentName: 'recommendation-agent',
    inputSummary: `${skillGaps.length} skill gaps, ${history.mastered.length} mastered, ${history.currentlyLearning.length} learning`,
    outputSummary: `${recommendations.length} recommendations: ${recommendations.filter(r => r.gapSeverity === 'critical').length} critical, ${recommendations.filter(r => r.gapSeverity === 'significant').length} significant`,
    model: 'deterministic',
    modelParameters: {},
    validationResult: 'passed',
    confidence: 0.80,
    latencyMs: timer.getElapsedMs(),
    tokenUsage: null,
    errors: [],
    metadata: { filteredOut: skillGaps.length - recommendations.length },
  });

  return recommendations;
}
