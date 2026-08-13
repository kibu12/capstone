/**
 * MCQ Answer-Position Shuffler
 * 
 * Ensures answer positions are balanced across a quiz set.
 * Uses Fisher-Yates shuffle per question with global distribution constraints
 * so that A/B/C/D each appear as the correct answer ≈25% of the time.
 */

import { QuizQuestion } from '../../types/learning';

const POSITION_LABELS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

/**
 * Cryptographically-inspired Fisher-Yates shuffle for arrays.
 * Uses Math.random but applies a full Fisher-Yates traversal.
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a balanced distribution of correct-answer positions for N questions.
 * 
 * For N questions, each position (A/B/C/D) gets floor(N/4) slots,
 * with the remainder distributed randomly across positions.
 * 
 * Example: 20 questions → A=5, B=5, C=5, D=5
 * Example: 15 questions → 3 positions get 4, 1 position gets 3
 * Example: 10 questions → 2 positions get 3, 2 positions get 2
 */
export function generateBalancedPositions(questionCount: number): ('A' | 'B' | 'C' | 'D')[] {
  const baseCount = Math.floor(questionCount / 4);
  const remainder = questionCount % 4;

  // Build the position pool
  const positions: ('A' | 'B' | 'C' | 'D')[] = [];

  // Each position gets at least baseCount assignments
  for (const label of POSITION_LABELS) {
    for (let i = 0; i < baseCount; i++) {
      positions.push(label);
    }
  }

  // Distribute remainder randomly
  const shuffledLabels = fisherYatesShuffle([...POSITION_LABELS]);
  for (let i = 0; i < remainder; i++) {
    positions.push(shuffledLabels[i]);
  }

  // Shuffle the entire position array so the order is unpredictable
  return fisherYatesShuffle(positions);
}

/**
 * Takes a question with a known correct answer and shuffles the option positions
 * so that the correct answer lands at the specified target position.
 * 
 * All four options are shuffled, then the correct one is swapped into the target slot.
 */
export function shuffleQuestionOptions(
  question: QuizQuestion,
  targetPosition: 'A' | 'B' | 'C' | 'D'
): QuizQuestion {
  // Collect all options with their original keys
  const options = [
    { key: 'A' as const, text: question.option_a },
    { key: 'B' as const, text: question.option_b },
    { key: 'C' as const, text: question.option_c },
    { key: 'D' as const, text: question.option_d },
  ];

  const originalCorrectKey = question.correct_answer;

  // Fisher-Yates shuffle all options
  const shuffled = fisherYatesShuffle(options);

  // Find where the correct answer ended up after shuffle
  const correctIndex = shuffled.findIndex(o => o.key === originalCorrectKey);
  // Find the index of the target position
  const targetIndex = POSITION_LABELS.indexOf(targetPosition);

  // Swap the correct answer into the target position
  if (correctIndex !== targetIndex) {
    [shuffled[correctIndex], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[correctIndex]];
  }

  return {
    ...question,
    option_a: shuffled[0].text,
    option_b: shuffled[1].text,
    option_c: shuffled[2].text,
    option_d: shuffled[3].text,
    correct_answer: targetPosition,
  };
}

/**
 * Shuffles an entire quiz set so that:
 * 1. Each question's options are randomly reordered
 * 2. The correct answer positions across the set are balanced (≈25% each)
 * 3. The question order itself is shuffled
 */
export function shuffleQuizSet(questions: QuizQuestion[]): QuizQuestion[] {
  const count = questions.length;
  const targetPositions = generateBalancedPositions(count);

  // Shuffle question order first
  const shuffledQuestions = fisherYatesShuffle(questions);

  // Apply position balancing to each question
  return shuffledQuestions.map((q, index) => 
    shuffleQuestionOptions(q, targetPositions[index])
  );
}

/**
 * Verify that a quiz set has acceptable answer-position distribution.
 * Returns the distribution and whether it passes the balance check.
 * 
 * For sets of 8+ questions, no position should exceed 40% or fall below 10%.
 * For smaller sets, the check is more lenient.
 */
export function verifyPositionDistribution(questions: QuizQuestion[]): {
  distribution: Record<string, number>;
  percentages: Record<string, number>;
  isBalanced: boolean;
  maxDeviation: number;
} {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of questions) {
    counts[q.correct_answer] = (counts[q.correct_answer] || 0) + 1;
  }

  const total = questions.length;
  const expected = total / 4;
  const percentages: Record<string, number> = {};
  let maxDeviation = 0;

  for (const key of POSITION_LABELS) {
    percentages[key] = total > 0 ? Math.round((counts[key] / total) * 100) : 0;
    const deviation = Math.abs(counts[key] - expected) / Math.max(expected, 1);
    maxDeviation = Math.max(maxDeviation, deviation);
  }

  // For sets >= 8, max deviation from ideal (25%) should be within 40%
  // For smaller sets, be more lenient (60%)
  const threshold = total >= 8 ? 0.4 : 0.6;
  const isBalanced = maxDeviation <= threshold;

  return { distribution: counts, percentages, isBalanced, maxDeviation };
}
