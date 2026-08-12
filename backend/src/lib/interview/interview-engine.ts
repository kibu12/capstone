import { InterviewAssessment } from '../../types/learning';

export function calculateInterviewReadiness(
  role: string,
  conceptMasteryScore: number,
  quizAccuracy: number,
  skillCoverage: number,
  projectCompletion: number
): Omit<InterviewAssessment, 'user_id'> {
  // Weighted interview readiness equation:
  // 35% Concept Mastery + 25% Quiz Accuracy + 20% Skill Coverage + 20% Project Completion
  const rawScore = 
    (conceptMasteryScore * 0.35) +
    (quizAccuracy * 0.25) +
    (skillCoverage * 0.20) +
    (projectCompletion * 0.20);

  const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let readinessLevel: InterviewAssessment['readiness_level'] = 'Not Ready';
  if (overallScore >= 90) readinessLevel = 'Interview Ready';
  else if (overallScore >= 75) readinessLevel = 'Almost Ready';
  else if (overallScore >= 60) readinessLevel = 'Developing';
  else if (overallScore >= 35) readinessLevel = 'Early Preparation';
  else readinessLevel = 'Not Ready';

  const feedback: InterviewAssessment['feedback'] = [
    {
      category: 'Concept Mastery',
      comment: conceptMasteryScore >= 75 ? `Strong conceptual understanding across ${role} fundamentals.` : `Review weak concept tags to boost core theory.`,
      type: conceptMasteryScore >= 75 ? 'strength' : 'weakness'
    },
    {
      category: 'Quiz Performance',
      comment: quizAccuracy >= 70 ? `High accuracy on scenario-based multiple choice assessments.` : `Take targeted concept revision quizzes to improve scenario speed.`,
      type: quizAccuracy >= 70 ? 'strength' : 'weakness'
    },
    {
      category: 'Portfolio Builds',
      comment: projectCompletion >= 50 ? `Solid portfolio proof-of-work demonstration.` : `Complete additional recommended projects to demonstrate hands-on experience.`,
      type: projectCompletion >= 50 ? 'strength' : 'weakness'
    }
  ];

  return {
    role,
    overall_readiness_score: overallScore,
    technical_score: Math.round(quizAccuracy),
    concept_score: Math.round(conceptMasteryScore),
    problem_solving_score: Math.round((quizAccuracy + conceptMasteryScore) / 2),
    readiness_level: readinessLevel,
    feedback
  };
}
