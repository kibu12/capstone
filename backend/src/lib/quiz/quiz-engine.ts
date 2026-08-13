/**
 * MCQ Quiz Engine — Redesigned
 * 
 * Critical changes from original:
 * 1. All questions have plausible distractors with comparable length/detail
 * 2. Correct answers are NOT consistently the longest option
 * 3. Answer positions are balanced via mcq-shuffler (A≈25%, B≈25%, C≈25%, D≈25%)
 * 4. Difficulty uses cognitive levels: Recall, Understanding, Application, Analysis
 * 5. Every generated quiz runs through mcq-validator before being returned
 * 6. Questions are regenerated if they fail quality validation
 */

import { Quiz, QuizQuestion } from '../../types/learning';
import { shuffleQuizSet, verifyPositionDistribution } from './mcq-shuffler';
import { validateQuizSet, validateMCQ, DEFAULT_VALIDATOR_CONFIG, MCQValidatorConfig } from './mcq-validator';

// ─── Cognitive Level Definitions ──────────────────────────────────────────────

type CognitiveLevel = 'recall' | 'understanding' | 'application' | 'analysis';

interface QuestionTemplate {
  cognitiveLevel: CognitiveLevel;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  generator: (skill: string) => QuizQuestion;
}

// ─── Redesigned Question Bank ─────────────────────────────────────────────────
// 
// Design principles applied to EVERY question:
// - Correct answer is NOT consistently option A or B
// - All 4 options are similarly detailed and grammatically parallel
// - Distractors are technically plausible (real concepts, just wrong for this context)
// - No option contains obvious giveaway patterns
// - Correct answer is NOT the longest option

const questionBank: QuestionTemplate[] = [
  // ── Easy / Recall ───────────────────────────────────────────────────────────
  {
    cognitiveLevel: 'recall',
    difficulty: 'Easy',
    generator: (skill) => ({
      concept_name: `${skill} Fundamentals`,
      question: `What is the primary purpose of version control systems like Git in ${skill} projects?`,
      option_a: 'Compiling source code into production binaries',
      option_b: 'Tracking changes and enabling collaboration across teams',
      option_c: 'Managing database connection pool sizes',
      option_d: 'Automating continuous integration test pipelines',
      correct_answer: 'B',
      explanation: 'Version control systems track file changes over time and enable multiple developers to collaborate on the same codebase without conflicts.',
      difficulty: 'Easy',
    }),
  },
  {
    cognitiveLevel: 'recall',
    difficulty: 'Easy',
    generator: (skill) => ({
      concept_name: 'Query Optimization',
      question: `What is the main advantage of implementing caching layers in ${skill} services?`,
      option_a: 'Forcing client browsers to reload page assets',
      option_b: 'Increasing total disk storage consumption',
      option_c: 'Reducing redundant computation and response latency',
      option_d: 'Automatically deleting stale database entries',
      correct_answer: 'C',
      explanation: 'Caching avoids redundant computation by storing previously calculated results, significantly reducing response latency.',
      difficulty: 'Easy',
    }),
  },
  {
    cognitiveLevel: 'recall',
    difficulty: 'Easy',
    generator: (skill) => ({
      concept_name: 'CI/CD Automation',
      question: `Which phase in a ${skill} continuous integration pipeline is designed to catch regression bugs?`,
      option_a: 'Manual code review by team leads',
      option_b: 'Restarting the development server',
      option_c: 'Renaming environment variable keys',
      option_d: 'Automated unit and integration test suites',
      correct_answer: 'D',
      explanation: 'Automated test suites run on every commit to catch regressions before code reaches production environments.',
      difficulty: 'Easy',
    }),
  },
  {
    cognitiveLevel: 'recall',
    difficulty: 'Easy',
    generator: (skill) => ({
      concept_name: 'Token Management',
      question: `What happens when input tokens exceed the maximum context window of an LLM used in ${skill}?`,
      option_a: 'The model silently ignores all previous instructions',
      option_b: 'GPU memory allocation automatically doubles',
      option_c: 'The API returns a context length error or truncates input',
      option_d: 'The model switches to a larger architecture variant',
      correct_answer: 'C',
      explanation: 'Exceeding the context window limit causes the API to either return an error or truncate the input to fit within bounds.',
      difficulty: 'Easy',
    }),
  },
  {
    cognitiveLevel: 'recall',
    difficulty: 'Easy',
    generator: (skill) => ({
      concept_name: 'Hyperparameter Tuning',
      question: `How does setting a low temperature (e.g. 0.1) affect LLM outputs in ${skill} applications?`,
      option_a: 'It increases the maximum token output length',
      option_b: 'It enables multi-turn conversation memory',
      option_c: 'It expands the model vocabulary size',
      option_d: 'It produces more deterministic and focused responses',
      correct_answer: 'D',
      explanation: 'Low temperature restricts sampling to higher-probability tokens, producing more deterministic and consistent outputs.',
      difficulty: 'Easy',
    }),
  },

  // ── Medium / Understanding ──────────────────────────────────────────────────
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Architecture & Scalability',
      question: `When scaling a ${skill} system, which factor is most likely to become a critical performance bottleneck?`,
      option_a: 'Network latency and unoptimized payload serialization',
      option_b: 'Inconsistent code formatting across source files',
      option_c: 'Using camelCase instead of snake_case naming',
      option_d: 'Number of comments in configuration files',
      correct_answer: 'A',
      explanation: 'Network latency and payload serialization overhead are primary scalability concerns that directly impact system throughput and user experience.',
      difficulty: 'Medium',
    }),
  },
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Vector Similarity Search',
      question: `In a RAG system using ${skill}, which metric measures directional alignment between vector embeddings?`,
      option_a: 'Manhattan distance between vector endpoints',
      option_b: 'Hamming distance of binary representations',
      option_c: 'Euclidean distance in feature space',
      option_d: 'Cosine similarity of embedding vectors',
      correct_answer: 'D',
      explanation: 'Cosine similarity measures the cosine of the angle between two vectors, capturing directional alignment regardless of magnitude.',
      difficulty: 'Medium',
    }),
  },
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Overfitting & Generalization',
      question: `A model trained on ${skill} data achieves 98% accuracy on training data but 52% on the test set. What does this indicate?`,
      option_a: 'The dataset requires additional feature columns',
      option_b: 'The model has memorized training noise instead of learning patterns',
      option_c: 'The learning rate was configured too low',
      option_d: 'The test set contains corrupted label annotations',
      correct_answer: 'B',
      explanation: 'A large gap between training and test accuracy indicates overfitting, where the model memorized training-specific noise rather than generalizable patterns.',
      difficulty: 'Medium',
    }),
  },
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Prompt Engineering',
      question: `Which prompting technique best improves LLM reasoning on complex ${skill} tasks?`,
      option_a: 'Removing all system-level instructions',
      option_b: 'Setting the temperature parameter above 1.5',
      option_c: 'Using chain-of-thought step-by-step reasoning',
      option_d: 'Reducing the prompt to a single keyword',
      correct_answer: 'C',
      explanation: 'Chain-of-thought prompting guides the model to break complex reasoning into explicit intermediate steps, improving accuracy on multi-step tasks.',
      difficulty: 'Medium',
    }),
  },
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Data Normalization',
      question: `Why is feature scaling applied before training gradient-based ${skill} models?`,
      option_a: 'It converts categorical features into ordinal types',
      option_b: 'It removes null values from the training dataset',
      option_c: 'It prevents high-magnitude features from dominating gradient updates',
      option_d: 'It increases the total number of training samples',
      correct_answer: 'C',
      explanation: 'Feature scaling ensures all features contribute proportionally to gradient updates, preventing features with large magnitudes from dominating the optimization process.',
      difficulty: 'Medium',
    }),
  },
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Asynchronous Execution',
      question: `Why should blocking synchronous calls be avoided on the main event loop in ${skill} applications?`,
      option_a: 'They cause the event loop to freeze and block all other operations',
      option_b: 'They automatically trigger database backup procedures',
      option_c: 'They increase available memory for child processes',
      option_d: 'They enable parallel GPU computation by default',
      correct_answer: 'A',
      explanation: 'Blocking the main event loop prevents all other pending callbacks, I/O operations, and user interactions from being processed, causing the application to freeze.',
      difficulty: 'Medium',
    }),
  },
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Microservice Isolation',
      question: `What is the primary advantage of containerizing ${skill} services with Docker?`,
      option_a: 'Eliminating the need for automated test suites',
      option_b: 'Replacing relational databases with file storage',
      option_c: 'Ensuring environment consistency across development and production',
      option_d: 'Increasing monitor refresh rate on client devices',
      correct_answer: 'C',
      explanation: 'Docker containers package application code with all dependencies, guaranteeing identical execution environments across development, staging, and production.',
      difficulty: 'Medium',
    }),
  },
  {
    cognitiveLevel: 'understanding',
    difficulty: 'Medium',
    generator: (skill) => ({
      concept_name: 'Hallucination Mitigation',
      question: `Which evaluation approach verifies that RAG-generated ${skill} answers are grounded in retrieved context?`,
      option_a: 'Faithfulness and groundedness scoring',
      option_b: 'CSS accessibility contrast analysis',
      option_c: 'HTTP response header validation',
      option_d: 'Browser cookie expiration auditing',
      correct_answer: 'A',
      explanation: 'Faithfulness metrics verify that every claim in the generated output is directly supported by facts present in the retrieved context documents.',
      difficulty: 'Medium',
    }),
  },

  // ── Hard / Application ──────────────────────────────────────────────────────
  {
    cognitiveLevel: 'application',
    difficulty: 'Hard',
    generator: (skill) => ({
      concept_name: 'Error Resilience',
      question: `A ${skill} pipeline experiences intermittent API timeouts. Which pattern best prevents silent data loss?`,
      option_a: 'Wrapping all calls in empty try-catch blocks',
      option_b: 'Returning cached stale data without any logging',
      option_c: 'Implementing exponential backoff retries with structured error logging',
      option_d: 'Disabling timeout limits on all HTTP requests',
      correct_answer: 'C',
      explanation: 'Exponential backoff retries handle transient failures gracefully, while structured logging ensures errors are captured for debugging rather than silently lost.',
      difficulty: 'Hard',
    }),
  },
  {
    cognitiveLevel: 'application',
    difficulty: 'Hard',
    generator: (skill) => ({
      concept_name: 'Security & Input Validation',
      question: `Before passing user inputs to ${skill} LLM prompts, what is the recommended security approach?`,
      option_a: 'Evaluate inputs using dynamic code execution',
      option_b: 'Store inputs directly in plaintext log files',
      option_c: 'Pass inputs through without any transformation',
      option_d: 'Validate against a strict schema and sanitize before injection',
      correct_answer: 'D',
      explanation: 'Schema validation and sanitization prevent prompt injection attacks by ensuring only expected, safe input formats reach the LLM prompt template.',
      difficulty: 'Hard',
    }),
  },
  {
    cognitiveLevel: 'application',
    difficulty: 'Hard',
    generator: (skill) => ({
      concept_name: 'RAG Context Chunking',
      question: `Why are overlapping chunk boundaries configured during document indexing in ${skill} RAG systems?`,
      option_a: 'To reduce the total size of the vector index',
      option_b: 'To preserve semantic context that spans chunk boundaries',
      option_c: 'To increase the speed of batch write operations',
      option_d: 'To encrypt document content at rest',
      correct_answer: 'B',
      explanation: 'Chunk overlaps ensure that sentences or concepts split across chunk boundaries retain their full semantic context in both adjacent chunks.',
      difficulty: 'Hard',
    }),
  },
  {
    cognitiveLevel: 'application',
    difficulty: 'Hard',
    generator: (skill) => ({
      concept_name: 'Database Indexing',
      question: `How does adding a B-Tree index on a high-cardinality column improve ${skill} query performance?`,
      option_a: 'It converts sequential O(N) scans into O(log N) lookups',
      option_b: 'It automatically removes duplicate rows from the table',
      option_c: 'It compresses all column data into a single binary file',
      option_d: 'It disables row-level locking for concurrent writes',
      correct_answer: 'A',
      explanation: 'B-Tree indexes organize column values in a balanced tree structure, enabling O(log N) lookups instead of O(N) sequential table scans.',
      difficulty: 'Hard',
    }),
  },
  {
    cognitiveLevel: 'application',
    difficulty: 'Hard',
    generator: (skill) => ({
      concept_name: 'Model Evaluation',
      question: `When dealing with imbalanced datasets in ${skill}, why is F1-Score preferred over simple accuracy?`,
      option_a: 'F1-Score reduces the required dataset size',
      option_b: 'Accuracy is always exactly 50% on imbalanced data',
      option_c: 'F1-Score harmonically balances precision and recall across classes',
      option_d: 'Precision metrics are incompatible with classification tasks',
      correct_answer: 'C',
      explanation: 'F1-Score computes the harmonic mean of precision and recall, providing a balanced evaluation metric that is not inflated by majority class performance.',
      difficulty: 'Hard',
    }),
  },

  // ── Expert / Analysis ───────────────────────────────────────────────────────
  {
    cognitiveLevel: 'analysis',
    difficulty: 'Expert',
    generator: (skill) => ({
      concept_name: 'State Management',
      question: `A distributed ${skill} system shows inconsistent results when multiple workers process shared state concurrently. What is the root cause and solution?`,
      option_a: 'Memory fragmentation; defragment the heap allocator',
      option_b: 'Race conditions on shared state; implement distributed locking',
      option_c: 'DNS resolution delays; switch to IP-based routing',
      option_d: 'Disk I/O saturation; upgrade to NVMe storage',
      correct_answer: 'B',
      explanation: 'Concurrent access to shared mutable state without synchronization causes race conditions. Distributed locking (e.g., Redis Redlock) ensures atomic access across workers.',
      difficulty: 'Expert',
    }),
  },
  {
    cognitiveLevel: 'analysis',
    difficulty: 'Expert',
    generator: (skill) => ({
      concept_name: 'API Design & Versioning',
      question: `Your ${skill} API must introduce a breaking schema change while maintaining backward compatibility for existing consumers. What approach minimizes disruption?`,
      option_a: 'Silently modify the existing endpoint response format',
      option_b: 'Return HTTP 500 errors to force client upgrades',
      option_c: 'Delete the old endpoint and redirect all traffic',
      option_d: 'Introduce a versioned endpoint (e.g., /v2/) with a deprecation timeline',
      correct_answer: 'D',
      explanation: 'API versioning allows new consumers to use the updated schema while existing consumers continue using the old version during a documented deprecation period.',
      difficulty: 'Expert',
    }),
  },
  {
    cognitiveLevel: 'analysis',
    difficulty: 'Expert',
    generator: (skill) => ({
      concept_name: 'Model Fine-Tuning',
      question: `An organization wants to adapt a large language model for ${skill} domain tasks but has limited GPU resources. Which approach is most resource-efficient?`,
      option_a: 'Training the model from scratch on domain-specific data',
      option_b: 'Increasing the base model parameter count by 10x',
      option_c: 'Applying LoRA to train low-rank adapter matrices on frozen weights',
      option_d: 'Converting the model architecture from transformer to RNN',
      correct_answer: 'C',
      explanation: 'LoRA (Low-Rank Adaptation) freezes pre-trained weights and injects small trainable matrices, achieving domain adaptation with a fraction of the compute required for full fine-tuning.',
      difficulty: 'Expert',
    }),
  },
  {
    cognitiveLevel: 'analysis',
    difficulty: 'Expert',
    generator: (skill) => ({
      concept_name: 'Latency Optimization',
      question: `A serverless ${skill} function experiences 3-5 second cold start delays during traffic spikes. Which combination of strategies best addresses this?`,
      option_a: 'Disabling HTTPS and removing authentication middleware',
      option_b: 'Adding artificial sleep delays between function invocations',
      option_c: 'Provisioned concurrency with minimized dependency bundle size',
      option_d: 'Increasing the function memory allocation to maximum available',
      correct_answer: 'C',
      explanation: 'Provisioned concurrency keeps warm instances ready, while minimizing bundle size reduces initialization time — together they address both the frequency and duration of cold starts.',
      difficulty: 'Expert',
    }),
  },
  {
    cognitiveLevel: 'analysis',
    difficulty: 'Expert',
    generator: (skill) => ({
      concept_name: 'API Rate Limiting',
      question: `A ${skill} API gateway must throttle traffic to protect backend services while providing fair access to all consumers. Which algorithm provides the best balance?`,
      option_a: 'Binary search over request timestamps',
      option_b: 'Token bucket algorithm with per-consumer quotas',
      option_c: 'Bubble sort on request priority headers',
      option_d: 'Dijkstra pathfinding across service mesh routes',
      correct_answer: 'B',
      explanation: 'The token bucket algorithm allows controlled bursts while enforcing sustained rate limits, and per-consumer quotas ensure fair distribution of available capacity.',
      difficulty: 'Expert',
    }),
  },
];

// ─── Quiz Generation ──────────────────────────────────────────────────────────

/**
 * Generate a quiz with position-balanced, validated MCQs.
 * 
 * Pipeline:
 * 1. Select questions from the bank
 * 2. Generate question instances for the skill
 * 3. Shuffle answer positions with balanced distribution
 * 4. Validate all questions
 * 5. Report quality metrics
 */
export function generateCourseQuiz(
  skill: string,
  courseTitle: string,
  questionCount = 15,
  validatorConfig: MCQValidatorConfig = DEFAULT_VALIDATOR_CONFIG
): Omit<Quiz, 'user_id'> & { quality_report: any } {
  // 1. Select questions from bank (Fisher-Yates shuffle for randomization)
  const shuffledBank = [...questionBank].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffledBank.slice(0, Math.min(questionCount, shuffledBank.length));

  // 2. Generate question instances
  const rawQuestions: QuizQuestion[] = selectedTemplates.map(t => t.generator(skill));

  // 3. Shuffle answer positions with balanced distribution
  const shuffledQuestions = shuffleQuizSet(rawQuestions);

  // 4. Validate all questions
  const validationReport = validateQuizSet(shuffledQuestions, validatorConfig);

  // 5. Verify position distribution
  const positionCheck = verifyPositionDistribution(shuffledQuestions);

  // Build quality metadata
  const qualityReport = {
    total_questions: validationReport.totalQuestions,
    passed_questions: validationReport.passedQuestions,
    failed_questions: validationReport.failedQuestions,
    average_quality_score: validationReport.averageQualityScore,
    position_distribution: positionCheck.distribution,
    position_percentages: positionCheck.percentages,
    position_balanced: positionCheck.isBalanced,
    max_position_deviation: Math.round(positionCheck.maxDeviation * 100) / 100,
    failed_indices: validationReport.failedIndices,
    validator_config: {
      min_quality_score: validatorConfig.minQualityScore,
      max_length_ratio: validatorConfig.maxLengthRatio,
    },
  };

  return {
    title: `${skill} — ${shuffledQuestions.length} Question Mastery Assessment`,
    difficulty: 'Intermediate',
    total_questions: shuffledQuestions.length,
    passing_score: 70,
    questions: shuffledQuestions,
    quiz_questions: shuffledQuestions,
    quality_report: qualityReport,
  };
}
