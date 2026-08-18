/**
 * Career Prediction Engine
 * 
 * Hybrid prediction system combining:
 * - Skill Coverage (30%)
 * - Skill Proficiency (25%)
 * - Assessment Performance (15%)
 * - Project Experience (10%)
 * - Interview Readiness (10%)
 * - Learning Progress (10%)
 * 
 * All weights are configurable.
 * Includes calibrated confidence based on evidence quantity and quality.
 * Never states "You will become X" — always "Current readiness: Y%"
 */

import { UserSkillProfile, SkillNode, CareerPath, getCareerRequirements, calculateSkillCoverage } from './skill-graph';

// ─── Configuration ────────────────────────────────────────────────────────────

export interface PredictionWeights {
  skillCoverage: number;       // 0.30
  skillProficiency: number;    // 0.25
  assessmentPerformance: number; // 0.15
  projectExperience: number;   // 0.10
  interviewReadiness: number;  // 0.10
  learningProgress: number;    // 0.10
}

export const DEFAULT_PREDICTION_WEIGHTS: PredictionWeights = {
  skillCoverage: 0.30,
  skillProficiency: 0.25,
  assessmentPerformance: 0.15,
  projectExperience: 0.10,
  interviewReadiness: 0.10,
  learningProgress: 0.10,
};

// ─── Prediction Result Types ──────────────────────────────────────────────────

export interface CareerPredictionResult {
  careerMatch: number;            // 0-100
  confidence: number;             // 0-100
  confidenceLevel: 'high' | 'moderate' | 'low' | 'insufficient';
  strongAreas: string[];
  weakAreas: string[];
  missingSkills: string[];
  explanation: string;
  evidenceSummary: {
    totalAssessments: number;
    totalQuestions: number;
    totalProjects: number;
    averageScore: number;
    sufficientEvidence: boolean;
  };
  componentScores: {
    skillCoverage: number;
    skillProficiency: number;
    assessmentPerformance: number;
    projectExperience: number;
    interviewReadiness: number;
    learningProgress: number;
  };
  weights: PredictionWeights;
}

// ─── Prediction Engine ────────────────────────────────────────────────────────

export function predictCareerReadiness(
  skillProfile: UserSkillProfile,
  targetRole: string,
  assessmentData: {
    totalAssessments: number;
    totalQuestionsAnswered: number;
    averageAssessmentScore: number;
    projectsCompleted: number;
    totalProjectsRecommended: number;
    interviewReadinessScore: number;
    coursesCompleted: number;
    totalCourses: number;
  },
  weights: PredictionWeights = DEFAULT_PREDICTION_WEIGHTS
): CareerPredictionResult {
  const career = getCareerRequirements(targetRole);

  // 1. Skill Coverage Score (0-1)
  let skillCoverageScore = 0;
  let matchedSkills: string[] = [];
  let missingSkills: string[] = [];
  let weakSkills: string[] = [];

  if (career) {
    const coverage = calculateSkillCoverage(skillProfile.skills, career);
    skillCoverageScore = coverage.coverage;
    matchedSkills = coverage.matchedSkills;
    missingSkills = coverage.missingSkills;
    weakSkills = coverage.weakSkills;
  } else {
    // Fallback: generic skill coverage based on profile
    const strongSkills = skillProfile.skills.filter(s => s.proficiency >= 0.65);
    skillCoverageScore = skillProfile.skills.length > 0
      ? strongSkills.length / skillProfile.skills.length
      : 0;
    matchedSkills = strongSkills.map(s => s.skill);
  }

  // 2. Skill Proficiency Score (0-1) — average proficiency across all tracked skills
  const proficiencyScores = skillProfile.skills.map(s => s.proficiency);
  const skillProficiencyScore = proficiencyScores.length > 0
    ? proficiencyScores.reduce((a, b) => a + b, 0) / proficiencyScores.length
    : 0;

  // 3. Assessment Performance Score (0-1)
  const assessmentPerformanceScore = assessmentData.averageAssessmentScore / 100;

  // 4. Project Experience Score (0-1)
  const projectExperienceScore = assessmentData.totalProjectsRecommended > 0
    ? assessmentData.projectsCompleted / assessmentData.totalProjectsRecommended
    : 0;

  // 5. Interview Readiness Score (0-1)
  const interviewReadinessScore = assessmentData.interviewReadinessScore / 100;

  // 6. Learning Progress Score (0-1)
  const learningProgressScore = assessmentData.totalCourses > 0
    ? assessmentData.coursesCompleted / assessmentData.totalCourses
    : 0;

  // Active weight normalization for unassessed components
  const hasProjectData = assessmentData.totalProjectsRecommended > 0 && assessmentData.projectsCompleted > 0;
  const hasInterviewData = assessmentData.interviewReadinessScore > 0;
  const hasCourseData = assessmentData.totalCourses > 0 && assessmentData.coursesCompleted > 0;

  let activeCoverageW = weights.skillCoverage;
  let activeProficiencyW = weights.skillProficiency;
  let activeAssessmentW = weights.assessmentPerformance;
  let activeProjectW = hasProjectData ? weights.projectExperience : 0;
  let activeInterviewW = hasInterviewData ? weights.interviewReadiness : 0;
  let activeCourseW = hasCourseData ? weights.learningProgress : 0;

  const totalActiveWeight = activeCoverageW + activeProficiencyW + activeAssessmentW + activeProjectW + activeInterviewW + activeCourseW;

  const normCoverageW = activeCoverageW / totalActiveWeight;
  const normProficiencyW = activeProficiencyW / totalActiveWeight;
  const normAssessmentW = activeAssessmentW / totalActiveWeight;
  const normProjectW = activeProjectW / totalActiveWeight;
  const normInterviewW = activeInterviewW / totalActiveWeight;
  const normCourseW = activeCourseW / totalActiveWeight;

  // Weighted career match score
  const rawMatch =
    normCoverageW * skillCoverageScore +
    normProficiencyW * skillProficiencyScore +
    normAssessmentW * assessmentPerformanceScore +
    normProjectW * projectExperienceScore +
    normInterviewW * interviewReadinessScore +
    normCourseW * learningProgressScore;

  const careerMatch = Math.min(100, Math.max(0, Math.round(rawMatch * 100)));

  // ─── Confidence Calculation ─────────────────────────────────────────────────
  const totalEvidence = skillProfile.skills.reduce((sum, s) => sum + s.evidenceCount, 0);
  const avgSkillConfidence = skillProfile.skills.length > 0
    ? skillProfile.skills.reduce((sum, s) => sum + s.confidence, 0) / skillProfile.skills.length
    : 0;

  let evidenceScore = 0;
  // Evidence count contributes to confidence
  evidenceScore += Math.min(0.35, totalEvidence * 0.03);
  // Assessment count
  evidenceScore += Math.min(0.30, assessmentData.totalAssessments * 0.15);
  // Questions answered
  evidenceScore += Math.min(0.25, assessmentData.totalQuestionsAnswered * 0.015);
  // Skill confidence average
  evidenceScore += avgSkillConfidence * 0.10;

  const confidence = Math.min(100, Math.max(0, Math.round(evidenceScore * 100)));

  // Confidence level classification
  let confidenceLevel: CareerPredictionResult['confidenceLevel'] = 'insufficient';
  const sufficientEvidence = (totalEvidence >= 5 && assessmentData.totalAssessments >= 1) || assessmentData.totalQuestionsAnswered >= 10;
  if (!sufficientEvidence) {
    confidenceLevel = 'insufficient';
  } else if (confidence >= 75) {
    confidenceLevel = 'high';
  } else if (confidence >= 50) {
    confidenceLevel = 'moderate';
  } else {
    confidenceLevel = 'low';
  }

  // ─── Explanation Generation ─────────────────────────────────────────────────

  const strongAreas = skillProfile.skills
    .filter(s => s.proficiency >= 0.65)
    .map(s => s.skill);
  const weakAreas = [
    ...skillProfile.skills.filter(s => s.proficiency < 0.65 && s.proficiency > 0).map(s => s.skill),
    ...weakSkills.filter(ws => !skillProfile.skills.some(s => s.skill === ws)),
  ];

  let explanation: string;
  const focusSkills = [...weakAreas, ...missingSkills].slice(0, 4);
  if (!sufficientEvidence) {
    explanation = `Your candidate profile establishes an initial foundation of ${careerMatch}% readiness for ${targetRole}. ` +
      `Completing structured skill milestones and practice assessments will rapidly advance your trajectory toward industry targets.`;
  } else {
    explanation = `Your candidate profile establishes an initial foundation of ${careerMatch}% readiness for ${targetRole}. ` +
      (strongAreas.length > 0 ? `Demonstrated strengths in ${strongAreas.slice(0, 3).join(', ')}. ` : '') +
      (focusSkills.length > 0 ? `Target growth milestones include ${focusSkills.join(', ')}.` : '');
  }

  return {
    careerMatch,
    confidence,
    confidenceLevel,
    strongAreas,
    weakAreas,
    missingSkills,
    explanation,
    evidenceSummary: {
      totalAssessments: assessmentData.totalAssessments,
      totalQuestions: assessmentData.totalQuestionsAnswered,
      totalProjects: assessmentData.projectsCompleted,
      averageScore: assessmentData.averageAssessmentScore,
      sufficientEvidence,
    },
    componentScores: {
      skillCoverage: Math.round(skillCoverageScore * 100),
      skillProficiency: Math.round(skillProficiencyScore * 100),
      assessmentPerformance: Math.round(assessmentPerformanceScore * 100),
      projectExperience: Math.round(projectExperienceScore * 100),
      interviewReadiness: Math.round(interviewReadinessScore * 100),
      learningProgress: Math.round(learningProgressScore * 100),
    },
    weights,
  };
}
