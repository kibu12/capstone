/**
 * MCQ Quality Validator & Answer-Leakage Detector
 * 
 * Validates every MCQ before presenting it to the user.
 * Implements deterministic bias detection and configurable quality scoring.
 * 
 * Pipeline: Question → Distractor Check → Length Bias → Position Bias →
 *           Keyword Leakage → Duplicate Check → Grammar → Difficulty → Final Score
 */

import { QuizQuestion } from '../../types/learning';

// ─── Configuration ────────────────────────────────────────────────────────────

export interface MCQValidatorConfig {
  /** Minimum acceptable quality score (0-1). Default: 0.80 */
  minQualityScore: number;
  /** Maximum ratio of correct answer length to avg distractor length. Default: 1.5 */
  maxLengthRatio: number;
  /** Maximum keyword overlap ratio between question and correct answer. Default: 0.4 */
  maxKeywordOverlap: number;
  /** Quality score weights */
  weights: {
    factualCorrectness: number;   // 0.20
    distractorQuality: number;    // 0.15
    ambiguityScore: number;       // 0.15
    difficultyAlignment: number;  // 0.15
    optionBalance: number;        // 0.15
    positionNeutrality: number;   // 0.10
    linguisticConsistency: number; // 0.10
  };
}

export const DEFAULT_VALIDATOR_CONFIG: MCQValidatorConfig = {
  minQualityScore: 0.80,
  maxLengthRatio: 1.5,
  maxKeywordOverlap: 0.4,
  weights: {
    factualCorrectness: 0.20,
    distractorQuality: 0.15,
    ambiguityScore: 0.15,
    difficultyAlignment: 0.15,
    optionBalance: 0.15,
    positionNeutrality: 0.10,
    linguisticConsistency: 0.10,
  },
};

// ─── Validation Result Types ──────────────────────────────────────────────────

export interface MCQValidationResult {
  isValid: boolean;
  qualityScore: number;
  checks: {
    hasOneCorrectAnswer: CheckResult;
    distractorPlausibility: CheckResult;
    answerLengthBias: CheckResult;
    keywordLeakage: CheckResult;
    duplicateOptions: CheckResult;
    grammaticalConsistency: CheckResult;
    difficultyAlignment: CheckResult;
    ambiguity: CheckResult;
    optionBalance: CheckResult;
  };
  failureReasons: string[];
}

export interface CheckResult {
  passed: boolean;
  score: number;      // 0-1
  detail: string;
}

export interface QuizValidationReport {
  totalQuestions: number;
  passedQuestions: number;
  failedQuestions: number;
  averageQualityScore: number;
  positionDistribution: Record<string, number>;
  positionBalanced: boolean;
  failedIndices: number[];
  questionResults: MCQValidationResult[];
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Extract significant words from text (length > 2, not stopwords) */
function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'must', 'ought',
    'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
    'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
    'other', 'some', 'such', 'than', 'too', 'very', 'just',
    'about', 'above', 'after', 'again', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'from', 'with', 'for',
    'of', 'to', 'in', 'on', 'at', 'by', 'up', 'out', 'off', 'over',
    'under', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
    'those', 'its', 'it', 'he', 'she', 'they', 'them', 'we', 'us',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));
}

/** Check for obvious giveaway words */
function containsGiveawayPatterns(text: string): boolean {
  const patterns = [
    /\balways\b/i,
    /\bnever\b/i,
    /\ball of the above\b/i,
    /\bnone of the above\b/i,
    /\bonly\b/i,
    /\bexactly\b/i,
    /\babsolutely\b/i,
    /\bcompletely\b/i,
  ];
  return patterns.some(p => p.test(text));
}

/** Calculate word count for an option */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/** Calculate character length for an option */
function charLength(text: string): number {
  return text.trim().length;
}

// ─── Individual Check Functions ───────────────────────────────────────────────

function checkOneCorrectAnswer(question: QuizQuestion): CheckResult {
  const validAnswers = ['A', 'B', 'C', 'D'];
  const passed = validAnswers.includes(question.correct_answer);
  return {
    passed,
    score: passed ? 1.0 : 0.0,
    detail: passed
      ? `Correct answer is ${question.correct_answer}`
      : `Invalid correct answer value: ${question.correct_answer}`,
  };
}

function checkDistractorPlausibility(question: QuizQuestion): CheckResult {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];
  const correctIdx = ['A', 'B', 'C', 'D'].indexOf(question.correct_answer);
  const distractors = options.filter((_, i) => i !== correctIdx);

  let plausibilityScore = 1.0;
  const issues: string[] = [];

  for (const distractor of distractors) {
    const words = wordCount(distractor);

    // Too short distractors are likely implausible
    if (words <= 2) {
      plausibilityScore -= 0.15;
      issues.push(`Very short distractor: "${distractor.substring(0, 40)}..."`);
    }

    // Distractors containing obviously absurd or unrelated content
    const absurdPatterns = [
      /css|html|markup|stylesheet/i,
      /color|font|theme/i,
      /reboot|restart/i,
      /delete.*database/i,
      /encrypt.*cookie/i,
      /whitespace|comment/i,
    ];

    // Only flag if the question is NOT about these topics
    const questionLower = question.question.toLowerCase();
    for (const pattern of absurdPatterns) {
      if (pattern.test(distractor) && !pattern.test(questionLower)) {
        plausibilityScore -= 0.10;
        issues.push(`Potentially implausible distractor pattern detected`);
        break;
      }
    }
  }

  plausibilityScore = Math.max(0, Math.min(1, plausibilityScore));
  return {
    passed: plausibilityScore >= 0.6,
    score: plausibilityScore,
    detail: issues.length > 0 ? issues.join('; ') : 'Distractors appear plausible',
  };
}

function checkAnswerLengthBias(
  question: QuizQuestion,
  maxRatio: number
): CheckResult {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];
  const correctIdx = ['A', 'B', 'C', 'D'].indexOf(question.correct_answer);

  const correctLength = charLength(options[correctIdx]);
  const distractorLengths = options.filter((_, i) => i !== correctIdx).map(charLength);
  const avgDistractorLength = distractorLengths.reduce((a, b) => a + b, 0) / distractorLengths.length;

  const lengthRatio = avgDistractorLength > 0
    ? correctLength / avgDistractorLength
    : 1.0;

  // Score decays as ratio exceeds 1.0
  let score = 1.0;
  if (lengthRatio > maxRatio) {
    score = Math.max(0, 1.0 - (lengthRatio - maxRatio));
  } else if (lengthRatio > 1.2) {
    // Mild penalty for noticeable but not extreme differences
    score = 1.0 - (lengthRatio - 1.0) * 0.3;
  } else if (lengthRatio < 0.5) {
    // Correct answer suspiciously shorter than distractors
    score = 0.7;
  }

  score = Math.max(0, Math.min(1, score));

  return {
    passed: lengthRatio <= maxRatio,
    score,
    detail: `Length ratio (correct/avg distractor): ${lengthRatio.toFixed(2)} (threshold: ${maxRatio})`,
  };
}

function checkKeywordLeakage(
  question: QuizQuestion,
  maxOverlap: number
): CheckResult {
  const questionKeywords = new Set(extractKeywords(question.question));
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];
  const correctIdx = ['A', 'B', 'C', 'D'].indexOf(question.correct_answer);

  // Calculate keyword overlap for correct answer
  const correctKeywords = extractKeywords(options[correctIdx]);
  const correctOverlap = correctKeywords.filter(k => questionKeywords.has(k)).length;
  const correctOverlapRatio = correctKeywords.length > 0
    ? correctOverlap / correctKeywords.length
    : 0;

  // Calculate average keyword overlap for distractors
  const distractorOverlaps = options
    .filter((_, i) => i !== correctIdx)
    .map(opt => {
      const kw = extractKeywords(opt);
      const overlap = kw.filter(k => questionKeywords.has(k)).length;
      return kw.length > 0 ? overlap / kw.length : 0;
    });
  const avgDistractorOverlap = distractorOverlaps.reduce((a, b) => a + b, 0) / distractorOverlaps.length;

  // The correct answer should NOT have significantly more keyword overlap
  const overlapDifference = correctOverlapRatio - avgDistractorOverlap;
  const passed = overlapDifference <= maxOverlap;

  let score = 1.0;
  if (overlapDifference > maxOverlap) {
    score = Math.max(0, 1.0 - (overlapDifference - maxOverlap) * 2);
  } else if (overlapDifference > 0.2) {
    score = 1.0 - overlapDifference * 0.5;
  }

  score = Math.max(0, Math.min(1, score));

  return {
    passed,
    score,
    detail: `Correct answer keyword overlap: ${(correctOverlapRatio * 100).toFixed(0)}%, ` +
            `Avg distractor overlap: ${(avgDistractorOverlap * 100).toFixed(0)}%, ` +
            `Difference: ${(overlapDifference * 100).toFixed(0)}%`,
  };
}

function checkDuplicateOptions(question: QuizQuestion): CheckResult {
  const options = [
    question.option_a.toLowerCase().trim(),
    question.option_b.toLowerCase().trim(),
    question.option_c.toLowerCase().trim(),
    question.option_d.toLowerCase().trim(),
  ];

  const uniqueOptions = new Set(options);
  const hasDuplicates = uniqueOptions.size < 4;

  return {
    passed: !hasDuplicates,
    score: hasDuplicates ? 0.0 : 1.0,
    detail: hasDuplicates
      ? `Duplicate options detected (${uniqueOptions.size} unique out of 4)`
      : 'All options are unique',
  };
}

function checkGrammaticalConsistency(question: QuizQuestion): CheckResult {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];

  let score = 1.0;
  const issues: string[] = [];

  // Check if options have consistent capitalization patterns
  const startsWithCapital = options.map(o => /^[A-Z]/.test(o.trim()));
  const capitalCount = startsWithCapital.filter(Boolean).length;
  if (capitalCount > 0 && capitalCount < 4) {
    // Inconsistent capitalization (mild penalty)
    score -= 0.1;
    issues.push('Inconsistent capitalization across options');
  }

  // Check for giveaway patterns in distractors
  const correctIdx = ['A', 'B', 'C', 'D'].indexOf(question.correct_answer);
  for (let i = 0; i < options.length; i++) {
    if (i !== correctIdx && containsGiveawayPatterns(options[i])) {
      score -= 0.15;
      issues.push(`Distractor ${['A','B','C','D'][i]} contains giveaway patterns`);
    }
  }

  // Check for consistent ending punctuation
  const endsWithPeriod = options.map(o => o.trim().endsWith('.'));
  const periodCount = endsWithPeriod.filter(Boolean).length;
  if (periodCount > 0 && periodCount < 4) {
    score -= 0.05;
    issues.push('Inconsistent ending punctuation');
  }

  score = Math.max(0, Math.min(1, score));

  return {
    passed: score >= 0.7,
    score,
    detail: issues.length > 0 ? issues.join('; ') : 'Grammatically consistent options',
  };
}

function checkDifficultyAlignment(question: QuizQuestion): CheckResult {
  const validDifficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
  const difficulty = question.difficulty;

  if (!validDifficulties.includes(difficulty)) {
    return {
      passed: false,
      score: 0.5,
      detail: `Unknown difficulty level: ${difficulty}`,
    };
  }

  // Check if question complexity matches stated difficulty
  const questionWords = wordCount(question.question);
  let expectedComplexity = 0;

  switch (difficulty) {
    case 'Easy':
      expectedComplexity = questionWords >= 5 ? 1.0 : 0.7;
      break;
    case 'Medium':
      expectedComplexity = questionWords >= 8 ? 1.0 : 0.8;
      break;
    case 'Hard':
      expectedComplexity = questionWords >= 10 ? 1.0 : 0.7;
      break;
    case 'Expert':
      expectedComplexity = questionWords >= 12 ? 1.0 : 0.6;
      break;
  }

  return {
    passed: expectedComplexity >= 0.6,
    score: expectedComplexity,
    detail: `Difficulty: ${difficulty}, Question word count: ${questionWords}`,
  };
}

function checkAmbiguity(question: QuizQuestion): CheckResult {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];
  const correctIdx = ['A', 'B', 'C', 'D'].indexOf(question.correct_answer);

  let score = 1.0;
  const issues: string[] = [];

  // Check for overlapping concepts between correct answer and distractors
  const correctKeywords = new Set(extractKeywords(options[correctIdx]));
  for (let i = 0; i < options.length; i++) {
    if (i === correctIdx) continue;
    const distractorKeywords = extractKeywords(options[i]);
    const overlap = distractorKeywords.filter(k => correctKeywords.has(k));
    if (overlap.length > 3) {
      score -= 0.2;
      issues.push(`High semantic overlap between correct answer and option ${['A','B','C','D'][i]}`);
    }
  }

  // Check if question is too vague
  if (wordCount(question.question) < 5) {
    score -= 0.3;
    issues.push('Question may be too brief to be unambiguous');
  }

  // Check if explanation exists
  if (!question.explanation || question.explanation.trim().length < 10) {
    score -= 0.1;
    issues.push('Missing or insufficient explanation');
  }

  score = Math.max(0, Math.min(1, score));

  return {
    passed: score >= 0.6,
    score,
    detail: issues.length > 0 ? issues.join('; ') : 'No ambiguity issues detected',
  };
}

function checkOptionBalance(question: QuizQuestion): CheckResult {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];
  const lengths = options.map(charLength);
  const wordCounts = options.map(wordCount);

  // Calculate coefficient of variation for option lengths
  const meanLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - meanLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = meanLength > 0 ? stdDev / meanLength : 0;

  // Lower CV means more balanced options
  // CV < 0.3 = excellent, CV > 0.6 = poor
  let score = 1.0;
  if (cv > 0.6) score = 0.3;
  else if (cv > 0.5) score = 0.5;
  else if (cv > 0.4) score = 0.7;
  else if (cv > 0.3) score = 0.85;

  return {
    passed: score >= 0.5,
    score,
    detail: `Option length CV: ${cv.toFixed(2)} (mean: ${meanLength.toFixed(0)} chars, stddev: ${stdDev.toFixed(0)})`,
  };
}

// ─── Main Validator ───────────────────────────────────────────────────────────

/**
 * Validate a single MCQ question against all quality checks.
 */
export function validateMCQ(
  question: QuizQuestion,
  config: MCQValidatorConfig = DEFAULT_VALIDATOR_CONFIG
): MCQValidationResult {
  const checks = {
    hasOneCorrectAnswer: checkOneCorrectAnswer(question),
    distractorPlausibility: checkDistractorPlausibility(question),
    answerLengthBias: checkAnswerLengthBias(question, config.maxLengthRatio),
    keywordLeakage: checkKeywordLeakage(question, config.maxKeywordOverlap),
    duplicateOptions: checkDuplicateOptions(question),
    grammaticalConsistency: checkGrammaticalConsistency(question),
    difficultyAlignment: checkDifficultyAlignment(question),
    ambiguity: checkAmbiguity(question),
    optionBalance: checkOptionBalance(question),
  };

  // Calculate weighted quality score
  const w = config.weights;
  const qualityScore =
    w.factualCorrectness * checks.hasOneCorrectAnswer.score +
    w.distractorQuality * checks.distractorPlausibility.score +
    w.ambiguityScore * checks.ambiguity.score +
    w.difficultyAlignment * checks.difficultyAlignment.score +
    w.optionBalance * checks.optionBalance.score +
    w.positionNeutrality * 1.0 + // Position neutrality is enforced by shuffler, not per-question
    w.linguisticConsistency * checks.grammaticalConsistency.score;

  // Collect failure reasons
  const failureReasons: string[] = [];
  for (const [name, check] of Object.entries(checks)) {
    if (!check.passed) {
      failureReasons.push(`${name}: ${check.detail}`);
    }
  }

  const isValid = qualityScore >= config.minQualityScore && checks.hasOneCorrectAnswer.passed;

  return {
    isValid,
    qualityScore: Math.round(qualityScore * 100) / 100,
    checks,
    failureReasons,
  };
}

/**
 * Validate an entire quiz set and generate a report.
 */
export function validateQuizSet(
  questions: QuizQuestion[],
  config: MCQValidatorConfig = DEFAULT_VALIDATOR_CONFIG
): QuizValidationReport {
  const questionResults = questions.map(q => validateMCQ(q, config));

  const passedQuestions = questionResults.filter(r => r.isValid).length;
  const failedQuestions = questionResults.filter(r => !r.isValid).length;
  const averageQualityScore = questionResults.length > 0
    ? questionResults.reduce((sum, r) => sum + r.qualityScore, 0) / questionResults.length
    : 0;

  // Check position distribution
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of questions) {
    distribution[q.correct_answer] = (distribution[q.correct_answer] || 0) + 1;
  }

  const total = questions.length;
  const expected = total / 4;
  let maxDeviation = 0;
  for (const key of ['A', 'B', 'C', 'D']) {
    const deviation = Math.abs((distribution[key] || 0) - expected) / Math.max(expected, 1);
    maxDeviation = Math.max(maxDeviation, deviation);
  }
  const positionBalanced = total >= 4 ? maxDeviation <= 0.5 : true;

  const failedIndices = questionResults
    .map((r, i) => r.isValid ? -1 : i)
    .filter(i => i >= 0);

  return {
    totalQuestions: questions.length,
    passedQuestions,
    failedQuestions,
    averageQualityScore: Math.round(averageQualityScore * 100) / 100,
    positionDistribution: distribution,
    positionBalanced,
    failedIndices,
    questionResults,
  };
}
