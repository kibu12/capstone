import { Quiz, QuizQuestion } from '../../types/learning';

const questionBank: ((skill: string) => QuizQuestion)[] = [
  (skill) => ({
    concept_name: `${skill} Fundamentals`,
    question: `What is the primary role of ${skill} in production software design?`,
    option_a: `To encrypt user browser cookies`,
    option_b: `To structure core business logic and manage reliable execution workflows`,
    option_c: `To replace HTML markup`,
    option_d: `To store static asset styles`,
    correct_answer: 'B',
    explanation: `${skill} structures application logic and manages operational workflows cleanly.`,
    difficulty: 'Easy'
  }),
  (skill) => ({
    concept_name: `Architecture & Scalability`,
    question: `When scaling a system powered by ${skill}, which issue is a critical performance bottleneck?`,
    option_a: `Excessive network latency and unoptimized payload sizes`,
    option_b: `Color contrast ratio in UI themes`,
    option_c: `File extension naming styles`,
    option_d: `Whitespace in source comments`,
    correct_answer: 'A',
    explanation: `Network latency and unoptimized payload sizes are primary scalability bottlenecks.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `Error Resilience`,
    question: `Which architectural pattern best prevents silent failures in a ${skill} pipeline?`,
    option_a: `Wrapping execution in empty try-catch blocks`,
    option_b: `Implementing explicit telemetry logging, backoff retries, and fallback boundaries`,
    option_c: `Ignoring HTTP exception codes`,
    option_d: `Returning null fallbacks without logging`,
    correct_answer: 'B',
    explanation: `Telemetry combined with backoff retries and fallback boundaries prevents silent system failures.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `Security & Input Validation`,
    question: `How should untrusted inputs be handled before passing them to ${skill} components?`,
    option_a: `Passed directly into database queries`,
    option_b: `Strictly schema-validated and sanitized prior to execution`,
    option_c: `Stored without type checking`,
    option_d: `Evaluated using raw JavaScript eval() calls`,
    correct_answer: 'B',
    explanation: `Inputs must always be strictly schema-validated and sanitized to prevent injection attacks.`,
    difficulty: 'Hard'
  }),
  (skill) => ({
    concept_name: `Query Optimization`,
    question: `What is the main benefit of implementing caching layers for ${skill} services?`,
    option_a: `Reduces computational overhead and speeds up response latency`,
    option_b: `Increases disk storage consumption unnecessarily`,
    option_c: `Forces client browsers to constantly reload`,
    option_d: `Deletes database schemas`,
    correct_answer: 'A',
    explanation: `Caching avoids redundant computational work and speeds up response times.`,
    difficulty: 'Easy'
  }),
  (skill) => ({
    concept_name: `Vector Similarity Search`,
    question: `When building RAG systems with ${skill}, which distance metric measures directional alignment between dense embeddings?`,
    option_a: `Euclidean distance`,
    option_b: `Cosine similarity`,
    option_c: `Manhattan distance`,
    option_d: `Hamming distance`,
    correct_answer: 'B',
    explanation: `Cosine similarity measures angle alignment between high-dimensional text vector embeddings.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `Overfitting & Generalization`,
    question: `A neural model evaluating ${skill} dataset yields 98% accuracy on training data but 52% on test sets. What problem exists?`,
    option_a: `Underfitting`,
    option_b: `Overfitting`,
    option_c: `Gradient explosion`,
    option_d: `Data normalization error`,
    correct_answer: 'B',
    explanation: `High training score coupled with low validation score signals that the model overfitted noise.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `RAG Context Chunking`,
    question: `Why are text chunk overlaps configured during document embedding indexing in ${skill}?`,
    option_a: `To compress vector index size`,
    option_b: `To preserve semantic context across chunk boundary cuts`,
    option_c: `To encrypt private key strings`,
    option_d: `To double database write speed`,
    correct_answer: 'B',
    explanation: `Overlap windows prevent sentence truncation at chunk cuts from losing context.`,
    difficulty: 'Hard'
  }),
  (skill) => ({
    concept_name: `Asynchronous Execution`,
    question: `Why should blocking synchronous calls be avoided on main thread loops in ${skill}?`,
    option_a: `They cause thread deadlock and UI event loop freeze`,
    option_b: `They speed up execution memory`,
    option_c: `They automate CSS updates`,
    option_d: `They trigger automatic database backups`,
    correct_answer: 'A',
    explanation: `Blocking synchronous calls on main thread loops freezes event dispatchers and causes deadlocks.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `State Management`,
    question: `What is the risk of directly mutating global shared state arrays in ${skill}?`,
    option_a: `Race conditions and unpredictable side effects across concurrent execution paths`,
    option_b: `Instant compile error`,
    option_c: `Automatic code reformatting`,
    option_d: `Reduced file size`,
    correct_answer: 'A',
    explanation: `Direct global state mutation produces unhandled race conditions across parallel threads.`,
    difficulty: 'Hard'
  }),
  (skill) => ({
    concept_name: `API Design & Versioning`,
    question: `When releasing a breaking modification to a ${skill} endpoint API, what is the industry best practice?`,
    option_a: `Overwrite existing route parameters without notice`,
    option_b: `Deprecate gracefully and introduce explicit route versioning (e.g. /v2/)`,
    option_c: `Delete older endpoint definitions completely`,
    option_d: `Return 500 error status codes to legacy clients`,
    correct_answer: 'B',
    explanation: `API versioning ensures backward compatibility for existing production consumers.`,
    difficulty: 'Easy'
  }),
  (skill) => ({
    concept_name: `Data Normalization`,
    question: `Why is feature scaling applied to numerical inputs before feeding them to ${skill} ML algorithms?`,
    option_a: `To prevent high-magnitude features from dominating model parameter updates`,
    option_b: `To convert text into HTML tags`,
    option_c: `To encrypt database connection strings`,
    option_d: `To reduce hard drive usage`,
    correct_answer: 'A',
    explanation: `Feature scaling balances numerical ranges so gradient updates remain stable.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `Microservice Isolation`,
    question: `What is the principal advantage of containerizing ${skill} services with Docker?`,
    option_a: `Consistent environment dependencies and reliable reproducibility across environments`,
    option_b: `Eliminates the need for source code testing`,
    option_c: `Replaces SQL databases`,
    option_d: `Speeds up monitor refresh rate`,
    correct_answer: 'A',
    explanation: `Docker containers isolate system dependencies and guarantee deployment environment consistency.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `Database Indexing`,
    question: `How does adding a B-Tree index on a high-cardinality foreign key column benefit ${skill} queries?`,
    option_a: `Transforms O(N) sequential table scans into O(log N) fast lookups`,
    option_b: `Slows down query speed`,
    option_c: `Deletes duplicate rows automatically`,
    option_d: `Reduces total RAM memory`,
    correct_answer: 'A',
    explanation: `Indexes reduce lookup complexity from full table scans O(N) to logarithmic O(log N).`,
    difficulty: 'Hard'
  }),
  (skill) => ({
    concept_name: `CI/CD Automation`,
    question: `Which phase in a ${skill} continuous integration pipeline catches regression bugs prior to deployment?`,
    option_a: `Automated unit and integration test suites`,
    option_b: `Manual code re-typing`,
    option_c: `Changing environment variable names`,
    option_d: `Restarting local servers`,
    correct_answer: 'A',
    explanation: `Automated test suites catch regressions automatically before code reaches production.`,
    difficulty: 'Easy'
  }),
  (skill) => ({
    concept_name: `Prompt Engineering`,
    question: `Which technique improves LLM reasoning accuracy when handling multi-step ${skill} tasks?`,
    option_a: `Chain-of-Thought prompting`,
    option_b: `Truncating system messages`,
    option_c: `Increasing temperature to 2.0`,
    option_d: `Removing context instructions`,
    correct_answer: 'A',
    explanation: `Chain-of-Thought prompting breaks complex logic into step-by-step reasoning paths.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `Model Evaluation`,
    question: `When dealing with imbalanced datasets in ${skill}, why is F1-Score preferred over simple Accuracy?`,
    option_a: `F1-Score balances Precision and Recall, avoiding misleading accuracy on dominant classes`,
    option_b: `Accuracy is always 100% false`,
    option_c: `F1-Score reduces dataset size`,
    option_d: `Precision is irrelevant in machine learning`,
    correct_answer: 'A',
    explanation: `F1-Score evaluates harmonic mean of precision and recall on imbalanced datasets.`,
    difficulty: 'Hard'
  }),
  (skill) => ({
    concept_name: `Latency Optimization`,
    question: `Which strategy minimizes cold start latency for serverless ${skill} cloud functions?`,
    option_a: `Provisioned concurrency and optimizing bundle imports`,
    option_b: `Increasing payload size`,
    option_c: `Disabling HTTPS caching`,
    option_d: `Adding sleep delays`,
    correct_answer: 'A',
    explanation: `Provisioned concurrency keeps function execution instances warm and ready.`,
    difficulty: 'Medium'
  }),
  (skill) => ({
    concept_name: `Token Management`,
    question: `What occurs when prompt payload tokens exceed the maximum context window of a ${skill} LLM model?`,
    option_a: `The model returns a context length error or truncates input tokens`,
    option_b: `The model automatically expands its parameter size`,
    option_c: `The server reboots`,
    option_d: `Memory usage drops to 0`,
    correct_answer: 'A',
    explanation: `Exceeding context length limits triggers truncation or API context length errors.`,
    difficulty: 'Easy'
  }),
  (skill) => ({
    concept_name: `Distributed Locking`,
    question: `In a multi-instance ${skill} cluster, how do you prevent two background workers from processing the same job?`,
    option_a: `Use distributed locking mechanisms (e.g., Redis Redlock or Postgres row locks)`,
    option_b: `Rely on server clock sync only`,
    option_c: `Increase worker count`,
    option_d: `Disable database transactions`,
    correct_answer: 'A',
    explanation: `Distributed locks guarantee atomic single-worker execution across clustered instances.`,
    difficulty: 'Hard'
  })
];

export function generateCourseQuiz(
  skill: string,
  courseTitle: string,
  questionCount = 15
): Omit<Quiz, 'user_id'> {
  // Shuffle array using Fisher-Yates algorithm for randomized question sets on retest
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length)).map(fn => fn(skill));

  return {
    title: `${skill} — 15 Question Mastery Assessment`,
    difficulty: 'Intermediate',
    total_questions: selectedQuestions.length,
    passing_score: 70,
    questions: selectedQuestions,
    quiz_questions: selectedQuestions
  };
}
