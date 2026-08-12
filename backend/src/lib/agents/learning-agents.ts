import { CareerAgentState } from '../../types/agents';
import { discoverLearningResources } from '../resources/resource-discovery';
import { generateAdaptiveStudyMaterial } from '../learning/study-material-generator';
import { generateCourseQuiz } from '../quiz/quiz-engine';
import { calculateInterviewReadiness } from '../interview/interview-engine';

export async function runLearningAgents(
  state: CareerAgentState,
  saveToDbCallback?: (data: any) => Promise<void>
) {
  const { skillGaps, assessment, userId } = state;
  if (!skillGaps) return;

  // 1. Learning Agent — Course Generation per Skill Gap
  const courses = skillGaps.map((gap, index) => ({
    title: `${gap.skillName} Mastery & Architecture`,
    description: `Targeted learning module for acquiring high proficiency in ${gap.skillName}.`,
    skill: gap.skillName,
    category: gap.category,
    difficulty: gap.priority === 'High' ? 'Advanced' : 'Intermediate',
    estimated_hours: gap.priority === 'High' ? 12 : 6,
    order_index: index + 1,
    status: 'Not Started',
    progress: 0
  }));

  // 2. Resource Agent — Resource Discovery (YouTube + Technical Web Docs)
  const allResources: any[] = [];
  for (const course of courses.slice(0, 3)) {
    const found = await discoverLearningResources(course.skill, course.title, course.difficulty);
    allResources.push(...found);
  }

  // 3. Study Agent — Adaptive Study Guides
  const studyMaterials: any[] = courses.slice(0, 2).map(c => 
    generateAdaptiveStudyMaterial(c.skill, c.title, assessment.experience_level)
  );

  // 4. Quiz Agent — MCQ Quiz & Scenario Questions
  const quizzesWithQuestions: any[] = courses.slice(0, 2).map(c => {
    const quizData = generateCourseQuiz(c.skill, c.title);
    return quizData;
  });

  // 5. Interview Agent — Initial Readiness Assessment (Starts at 0% for new learners)
  const interviewAssessment = calculateInterviewReadiness(
    assessment.target_role,
    0, // Initial concept score starts at 0%
    0, // Initial quiz accuracy starts at 0%
    Math.round((skillGaps.filter(s => s.currentLevel >= 65).length / Math.max(1, skillGaps.length)) * 100),
    0  // Initial projects completed starts at 0%
  );

  return {
    courses,
    learningResources: allResources,
    studyMaterials,
    quizzesWithQuestions,
    interviewAssessment
  };
}
