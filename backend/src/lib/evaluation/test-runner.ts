/**
 * Evaluation Test Runner
 * 
 * Automated tests for:
 * - MCQ position distribution, length bias, leakage, quality validation
 * - Career prediction accuracy against golden dataset
 * - RAG retrieval quality
 * - Skill scoring consistency
 * - Schema validation
 * - Agent pipeline error recovery
 */

import { generateCourseQuiz } from '../quiz/quiz-engine';
import { validateQuizSet, DEFAULT_VALIDATOR_CONFIG } from '../quiz/mcq-validator';
import { verifyPositionDistribution, shuffleQuizSet } from '../quiz/mcq-shuffler';
import { retrieveCareerContext, retrieveByRole, retrieveBySkill } from '../rag/retriever';
import { getCareerRequirements, calculateSkillCoverage, getSkillStatus, SkillNode } from '../agents/skill-graph';
import { predictCareerReadiness, DEFAULT_PREDICTION_WEIGHTS } from '../agents/career-prediction-engine';
import { buildSkillProfile } from '../agents/user-profile-agent';
import {
  goldenCareerRequirements,
  goldenSkillProfiles,
  goldenMCQs,
  validateMCQDistribution,
  validateMCQLengthBias,
  validateNoDuplicateOptions,
  GoldenDatasetResult,
} from './golden-dataset';

export interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: GoldenDatasetResult[];
  executionTimeMs: number;
}

// ─── MCQ Tests ────────────────────────────────────────────────────────────────

function runMCQTests(): TestSuiteResult {
  const start = Date.now();
  const results: GoldenDatasetResult[] = [];

  // Test 1: Generate multiple quizzes and check position distribution
  for (let i = 0; i < 5; i++) {
    const quiz = generateCourseQuiz('AI Engineering', `Test Quiz ${i + 1}`, 20);
    results.push(validateMCQDistribution(quiz.quiz_questions || []));
  }

  // Test 2: Length bias across all generated questions
  const bigQuiz = generateCourseQuiz('AI Engineering', 'Bias Test', 24);
  results.push(validateMCQLengthBias(bigQuiz.quiz_questions || []));

  // Test 3: No duplicate options
  results.push(validateNoDuplicateOptions(bigQuiz.quiz_questions || []));

  // Test 4: Quality validation passes threshold
  const validationReport = validateQuizSet(bigQuiz.quiz_questions || [], DEFAULT_VALIDATOR_CONFIG);
  results.push({
    testName: 'MCQ Quality Validation - Average Score',
    passed: validationReport.averageQualityScore >= 0.70,
    expected: 'Average quality ≥ 0.70',
    actual: `Average quality: ${validationReport.averageQualityScore}`,
  });

  // Test 5: All questions have valid correct answer
  const invalidAnswers = (bigQuiz.quiz_questions || []).filter(
    q => !['A', 'B', 'C', 'D'].includes(q.correct_answer)
  );
  results.push({
    testName: 'MCQ Valid Correct Answers',
    passed: invalidAnswers.length === 0,
    expected: 'All questions have A/B/C/D as correct answer',
    actual: `${invalidAnswers.length} invalid correct answers`,
  });

  // Test 6: Golden MCQs pass validation
  const goldenValidation = validateQuizSet(goldenMCQs, DEFAULT_VALIDATOR_CONFIG);
  results.push({
    testName: 'Golden MCQs Quality Validation',
    passed: goldenValidation.averageQualityScore >= 0.70,
    expected: 'Golden MCQs quality ≥ 0.70',
    actual: `Quality: ${goldenValidation.averageQualityScore}`,
  });

  // Test 7: Position distribution of shuffled golden MCQs
  const shuffledGolden = shuffleQuizSet([...goldenMCQs]);
  const goldenDist = verifyPositionDistribution(shuffledGolden);
  results.push({
    testName: 'Golden MCQs Shuffled Distribution',
    passed: goldenDist.isBalanced,
    expected: 'Balanced distribution after shuffle',
    actual: `A=${goldenDist.distribution.A} B=${goldenDist.distribution.B} C=${goldenDist.distribution.C} D=${goldenDist.distribution.D}`,
  });

  const passed = results.filter(r => r.passed).length;
  return {
    suiteName: 'MCQ Quality & Bias Tests',
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    results,
    executionTimeMs: Date.now() - start,
  };
}

// ─── RAG Tests ────────────────────────────────────────────────────────────────

function runRAGTests(): TestSuiteResult {
  const start = Date.now();
  const results: GoldenDatasetResult[] = [];

  // Test 1: RAG retrieves relevant documents for each career role
  for (const golden of goldenCareerRequirements) {
    const docs = retrieveByRole(golden.role, 3);
    const hasRelevant = docs.some(
      d => d.metadata.role.toLowerCase().includes(golden.role.toLowerCase()) ||
        golden.role.toLowerCase().includes(d.metadata.role.toLowerCase())
    );
    results.push({
      testName: `RAG Retrieval for ${golden.role}`,
      passed: hasRelevant && docs.length > 0,
      expected: `At least 1 relevant document for ${golden.role}`,
      actual: `${docs.length} documents, relevant: ${hasRelevant}`,
    });
  }

  // Test 2: RAG skill retrieval returns results
  const skillDocs = retrieveBySkill('Python', 2);
  results.push({
    testName: 'RAG Skill Retrieval - Python',
    passed: skillDocs.length > 0,
    expected: 'At least 1 document mentioning Python',
    actual: `${skillDocs.length} documents`,
  });

  // Test 3: Empty query returns no results
  const emptyResults = retrieveCareerContext('');
  results.push({
    testName: 'RAG Empty Query Handling',
    passed: emptyResults.length === 0,
    expected: '0 results for empty query',
    actual: `${emptyResults.length} results`,
  });

  // Test 4: All documents have required metadata
  const allDocs = retrieveCareerContext('career', { topK: 20, minScore: 0 });
  const missingMetadata = allDocs.filter(d => !d.metadata.role || !d.metadata.category);
  results.push({
    testName: 'RAG Document Metadata Completeness',
    passed: missingMetadata.length === 0,
    expected: 'All documents have role and category metadata',
    actual: `${missingMetadata.length} documents with missing metadata`,
  });

  const passed = results.filter(r => r.passed).length;
  return {
    suiteName: 'RAG Retrieval Tests',
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    results,
    executionTimeMs: Date.now() - start,
  };
}

// ─── Career Prediction Tests ──────────────────────────────────────────────────

function runCareerPredictionTests(): TestSuiteResult {
  const start = Date.now();
  const results: GoldenDatasetResult[] = [];

  for (const golden of goldenSkillProfiles) {
    const profile = buildSkillProfile(
      'test-user',
      golden.targetRole,
      null,
      {
        skillGaps: golden.skills.map(s => ({
          skillName: s,
          currentLevel: golden.experienceLevel === 'Mid-Level Professional' ? 75 :
            golden.experienceLevel === 'Junior Professional' ? 60 : 40,
          requiredLevel: 80,
          priority: 'High' as const,
          category: 'Technical',
        })),
      }
    );

    const prediction = predictCareerReadiness(
      profile,
      golden.targetRole,
      {
        totalAssessments: 1,
        totalQuestionsAnswered: 15,
        averageAssessmentScore: golden.experienceLevel === 'Mid-Level Professional' ? 75 : 50,
        projectsCompleted: 0,
        totalProjectsRecommended: 2,
        interviewReadinessScore: 0,
        coursesCompleted: 0,
        totalCourses: 5,
      }
    );

    results.push({
      testName: `Career Prediction - ${golden.scenario}`,
      passed: prediction.careerMatch >= golden.expectedMinScore && prediction.careerMatch <= golden.expectedMaxScore,
      expected: `Score ${golden.expectedMinScore}-${golden.expectedMaxScore}%`,
      actual: `Score: ${prediction.careerMatch}%, Confidence: ${prediction.confidenceLevel}`,
      details: `Strong: ${prediction.strongAreas.join(', ')}, Weak: ${prediction.weakAreas.join(', ')}`,
    });
  }

  // Test: Confidence is 'insufficient' with minimal evidence
  const minimalProfile = buildSkillProfile('test-user', 'AI Engineer', null, {});
  const minimalPrediction = predictCareerReadiness(
    minimalProfile,
    'AI Engineer',
    { totalAssessments: 0, totalQuestionsAnswered: 0, averageAssessmentScore: 0, projectsCompleted: 0, totalProjectsRecommended: 0, interviewReadinessScore: 0, coursesCompleted: 0, totalCourses: 0 }
  );
  results.push({
    testName: 'Career Prediction - Insufficient Evidence Detection',
    passed: minimalPrediction.confidenceLevel === 'insufficient',
    expected: 'Confidence level: insufficient',
    actual: `Confidence level: ${minimalPrediction.confidenceLevel}`,
  });

  const passed = results.filter(r => r.passed).length;
  return {
    suiteName: 'Career Prediction Tests',
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    results,
    executionTimeMs: Date.now() - start,
  };
}

// ─── Skill Graph Tests ────────────────────────────────────────────────────────

function runSkillGraphTests(): TestSuiteResult {
  const start = Date.now();
  const results: GoldenDatasetResult[] = [];

  // Test: All golden careers exist in knowledge graph
  for (const golden of goldenCareerRequirements) {
    const career = getCareerRequirements(golden.role);
    results.push({
      testName: `Skill Graph - ${golden.role} exists`,
      passed: career !== null,
      expected: `Career path found for ${golden.role}`,
      actual: career ? `Found with ${career.requiredSkills.length} skills` : 'NOT FOUND',
    });

    if (career) {
      // Test: Core skills are present
      const careerSkillNames = career.requiredSkills.map(s => s.name.toLowerCase());
      const missingCore = golden.coreSkills.filter(
        s => !careerSkillNames.includes(s.toLowerCase())
      );
      results.push({
        testName: `Skill Graph - ${golden.role} core skills`,
        passed: missingCore.length === 0,
        expected: `All core skills present: ${golden.coreSkills.join(', ')}`,
        actual: missingCore.length === 0 ? 'All present' : `Missing: ${missingCore.join(', ')}`,
      });

      // Test: Minimum skill count
      results.push({
        testName: `Skill Graph - ${golden.role} skill count`,
        passed: career.requiredSkills.length >= golden.minSkillCount,
        expected: `≥ ${golden.minSkillCount} skills`,
        actual: `${career.requiredSkills.length} skills`,
      });
    }
  }

  // Test: Skill status classification
  const testCases = [
    { proficiency: 0.80, evidence: 5, expected: 'strong' },
    { proficiency: 0.55, evidence: 5, expected: 'developing' },
    { proficiency: 0.30, evidence: 5, expected: 'weak' },
    { proficiency: 0.90, evidence: 1, expected: 'unknown' },
  ];
  for (const tc of testCases) {
    const status = getSkillStatus(tc.proficiency, tc.evidence);
    results.push({
      testName: `Skill Status - proficiency=${tc.proficiency}, evidence=${tc.evidence}`,
      passed: status === tc.expected,
      expected: tc.expected,
      actual: status,
    });
  }

  const passed = results.filter(r => r.passed).length;
  return {
    suiteName: 'Skill Graph Tests',
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    results,
    executionTimeMs: Date.now() - start,
  };
}

// ─── Full Test Suite ──────────────────────────────────────────────────────────

export interface FullTestReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  passRate: number;
  suites: TestSuiteResult[];
  executionTimeMs: number;
}

export function runFullTestSuite(): FullTestReport {
  const start = Date.now();

  const suites = [
    runMCQTests(),
    runRAGTests(),
    runCareerPredictionTests(),
    runSkillGraphTests(),
  ];

  const totalTests = suites.reduce((s, suite) => s + suite.totalTests, 0);
  const totalPassed = suites.reduce((s, suite) => s + suite.passed, 0);
  const totalFailed = suites.reduce((s, suite) => s + suite.failed, 0);

  return {
    timestamp: new Date().toISOString(),
    totalTests,
    totalPassed,
    totalFailed,
    passRate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0,
    suites,
    executionTimeMs: Date.now() - start,
  };
}

if (require.main === module) {
  console.log('='.repeat(60));
  console.log('🧪 Running Career PathFinder Golden Evaluation Test Suite');
  console.log('='.repeat(60));
  const report = runFullTestSuite();
  console.log(`\nResults: ${report.totalPassed}/${report.totalTests} Passed (${report.passRate}%) in ${report.executionTimeMs}ms\n`);
  report.suites.forEach(s => {
    console.log(`  • ${s.suiteName}: ${s.passed}/${s.totalTests} passed`);
  });
  console.log('='.repeat(60));
}

