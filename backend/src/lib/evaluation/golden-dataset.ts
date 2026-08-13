/**
 * Golden Dataset — Manually Verified Evaluation Test Cases
 * 
 * Contains verified examples for:
 * - Career requirements
 * - MCQ questions with correct answers
 * - Difficulty classifications
 * - Skill assessments
 * - Career profiles
 * 
 * Used as a regression test baseline.
 * Every major agent change must run against this dataset.
 */

import { QuizQuestion } from '../../types/learning';

// ─── Golden MCQ Questions ─────────────────────────────────────────────────────
// Manually verified for: correctness, distractor plausibility, difficulty accuracy

export const goldenMCQs: (QuizQuestion & { expectedDifficulty: string; topic: string })[] = [
  {
    concept_name: 'Version Control',
    question: 'What is the primary purpose of Git branching in collaborative development?',
    option_a: 'To compress source code file sizes',
    option_b: 'To isolate feature development without affecting the main codebase',
    option_c: 'To automatically deploy code to production servers',
    option_d: 'To encrypt repository contents for security compliance',
    correct_answer: 'B',
    explanation: 'Git branches allow developers to work on features in isolation, preventing incomplete changes from destabilizing the main branch.',
    difficulty: 'Easy',
    expectedDifficulty: 'Easy',
    topic: 'Engineering',
  },
  {
    concept_name: 'Machine Learning',
    question: 'What is the key difference between supervised and unsupervised learning?',
    option_a: 'Supervised learning requires labeled training data; unsupervised does not',
    option_b: 'Unsupervised learning requires GPUs; supervised does not',
    option_c: 'Supervised learning only works with image data types',
    option_d: 'Unsupervised learning always produces higher accuracy than supervised',
    correct_answer: 'A',
    explanation: 'Supervised learning uses labeled data (input-output pairs) for training, while unsupervised learning discovers patterns in unlabeled data.',
    difficulty: 'Easy',
    expectedDifficulty: 'Easy',
    topic: 'Machine Learning',
  },
  {
    concept_name: 'RAG Architecture',
    question: 'In a RAG system, what is the purpose of the retrieval step before generation?',
    option_a: 'To reduce the model parameter count for inference',
    option_b: 'To provide relevant context documents that ground the LLM output in factual content',
    option_c: 'To compress the user query into fewer tokens',
    option_d: 'To select which language model variant to use for response generation',
    correct_answer: 'B',
    explanation: 'RAG retrieves relevant documents to inject into the LLM prompt, grounding the generated response in factual, domain-specific content.',
    difficulty: 'Medium',
    expectedDifficulty: 'Medium',
    topic: 'RAG',
  },
  {
    concept_name: 'System Design',
    question: 'A microservice experiences cascading failures when a downstream dependency becomes unresponsive. Which pattern addresses this?',
    option_a: 'Increasing the thread pool size to handle more requests',
    option_b: 'Implementing the circuit breaker pattern to fail fast',
    option_c: 'Adding more database indexes to the downstream service',
    option_d: 'Switching from REST to GraphQL for API communication',
    correct_answer: 'B',
    explanation: 'The circuit breaker pattern detects when a dependency is failing and short-circuits requests to prevent cascading failures across the system.',
    difficulty: 'Hard',
    expectedDifficulty: 'Hard',
    topic: 'Architecture',
  },
];

// ─── Golden Career Requirements ───────────────────────────────────────────────

export const goldenCareerRequirements: {
  role: string;
  coreSkills: string[];
  minSkillCount: number;
  expectedDemand: string;
}[] = [
  {
    role: 'AI Engineer',
    coreSkills: ['Python', 'Machine Learning', 'Deep Learning', 'LLMs'],
    minSkillCount: 6,
    expectedDemand: 'Very High',
  },
  {
    role: 'Full Stack Developer',
    coreSkills: ['JavaScript', 'React', 'Node.js', 'SQL'],
    minSkillCount: 6,
    expectedDemand: 'Very High',
  },
  {
    role: 'Data Scientist',
    coreSkills: ['Python', 'Statistics', 'SQL', 'Machine Learning'],
    minSkillCount: 5,
    expectedDemand: 'High',
  },
];

// ─── Golden Skill Profiles ────────────────────────────────────────────────────

export const goldenSkillProfiles: {
  scenario: string;
  skills: string[];
  experienceLevel: string;
  targetRole: string;
  expectedMinScore: number;
  expectedMaxScore: number;
}[] = [
  {
    scenario: 'Strong AI candidate',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'SQL', 'APIs', 'Docker'],
    experienceLevel: 'Mid-Level Professional',
    targetRole: 'AI Engineer',
    expectedMinScore: 55,
    expectedMaxScore: 85,
  },
  {
    scenario: 'Career switcher — no relevant skills',
    skills: ['Marketing', 'Excel'],
    experienceLevel: 'Entry Level',
    targetRole: 'AI Engineer',
    expectedMinScore: 25,
    expectedMaxScore: 50,
  },
  {
    scenario: 'Junior full-stack developer',
    skills: ['JavaScript', 'HTML', 'CSS', 'React', 'Git'],
    experienceLevel: 'Junior Professional',
    targetRole: 'Full Stack Developer',
    expectedMinScore: 40,
    expectedMaxScore: 75,
  },
];

// ─── Validation Functions ─────────────────────────────────────────────────────

export interface GoldenDatasetResult {
  testName: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

/**
 * Validate MCQ answer distribution across a set of questions.
 */
export function validateMCQDistribution(questions: QuizQuestion[]): GoldenDatasetResult {
  const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of questions) {
    dist[q.correct_answer] = (dist[q.correct_answer] || 0) + 1;
  }

  const total = questions.length;
  const ideal = total / 4;
  const maxDeviation = Math.max(
    ...Object.values(dist).map(count => Math.abs(count - ideal) / ideal)
  );

  const passed = total >= 4 ? maxDeviation <= 0.5 : true;

  return {
    testName: 'MCQ Answer Position Distribution',
    passed,
    expected: `Each position ≈${Math.round(ideal)} (±50% deviation)`,
    actual: `A=${dist.A} B=${dist.B} C=${dist.C} D=${dist.D}`,
    details: `Max deviation: ${(maxDeviation * 100).toFixed(0)}%`,
  };
}

/**
 * Validate MCQ answer-length bias.
 */
export function validateMCQLengthBias(questions: QuizQuestion[]): GoldenDatasetResult {
  let biasedCount = 0;

  for (const q of questions) {
    const options = [q.option_a, q.option_b, q.option_c, q.option_d];
    const correctIdx = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer);
    const correctLen = options[correctIdx].length;
    const distractorLens = options.filter((_, i) => i !== correctIdx).map(o => o.length);
    const avgDistractorLen = distractorLens.reduce((a, b) => a + b, 0) / distractorLens.length;

    if (avgDistractorLen > 0 && correctLen / avgDistractorLen > 1.5) {
      biasedCount++;
    }
  }

  const biasRate = questions.length > 0 ? biasedCount / questions.length : 0;

  return {
    testName: 'MCQ Answer Length Bias',
    passed: biasRate <= 0.15,
    expected: 'Bias rate ≤ 15%',
    actual: `${(biasRate * 100).toFixed(0)}% (${biasedCount}/${questions.length} biased)`,
  };
}

/**
 * Validate that no duplicate options exist in any question.
 */
export function validateNoDuplicateOptions(questions: QuizQuestion[]): GoldenDatasetResult {
  let duplicateCount = 0;

  for (const q of questions) {
    const options = [
      q.option_a.toLowerCase().trim(),
      q.option_b.toLowerCase().trim(),
      q.option_c.toLowerCase().trim(),
      q.option_d.toLowerCase().trim(),
    ];
    if (new Set(options).size < 4) duplicateCount++;
  }

  return {
    testName: 'MCQ No Duplicate Options',
    passed: duplicateCount === 0,
    expected: '0 questions with duplicate options',
    actual: `${duplicateCount} questions with duplicates`,
  };
}
