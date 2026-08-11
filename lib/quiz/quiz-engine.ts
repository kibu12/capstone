import { Quiz, QuizQuestion } from '@/types/learning';

export function generateCourseQuiz(
  skill: string,
  courseTitle: string
): Omit<Quiz, 'user_id'> {
  const sampleQuestions: QuizQuestion[] = [
    {
      concept_name: `${skill} Fundamentals`,
      question: `What is the primary role of ${skill} in production software design?`,
      option_a: `To encrypt user browser cookies`,
      option_b: `To structure business logic and manage reliable execution workflows`,
      option_c: `To replace standard HTML markup`,
      option_d: `To store static CSS stylesheets`,
      correct_answer: 'B',
      explanation: `${skill} is primarily responsible for structuring application logic and managing operational workflows cleanly.`,
      difficulty: 'Easy'
    },
    {
      concept_name: `Architecture & Tradeoffs`,
      question: `When deploying ${skill} at scale, which bottleneck requires immediate attention?`,
      option_a: `Excessive network latency and unoptimized data payload sizes`,
      option_b: `Color contrast ratio in CSS themes`,
      option_c: `File extension naming conventions`,
      option_d: `Formatting comments in source code`,
      correct_answer: 'A',
      explanation: `Network latency and unoptimized payload sizes are primary performance bottlenecks in scale architecture.`,
      difficulty: 'Medium'
    },
    {
      concept_name: `Error Handling & Resiliency`,
      question: `Which pattern best prevents silent failures in a ${skill} pipeline?`,
      option_a: `Wrapping execution in empty try-catch blocks`,
      option_b: `Implementing explicit error logging, retry backoffs, and fallback state mechanisms`,
      option_c: `Ignoring exception status codes`,
      option_d: `Hardcoding static fallback constants without logging`,
      correct_answer: 'B',
      explanation: `Explicit logging combined with retry strategies and fallback boundaries prevents silent system failures.`,
      difficulty: 'Medium'
    },
    {
      concept_name: `Security & Validation`,
      question: `How should untrusted user inputs be handled prior to processing in ${skill}?`,
      option_a: `Passed directly into internal database queries`,
      option_b: `Validated against schema rules and sanitized before execution`,
      option_c: `Stored without type checking`,
      option_d: `Evaluated using raw JavaScript eval() calls`,
      correct_answer: 'B',
      explanation: `Inputs must always be strictly schema-validated and sanitized to prevent injection attacks and runtime crashes.`,
      difficulty: 'Hard'
    },
    {
      concept_name: `Optimization`,
      question: `What is the benefit of caching frequent query results in ${skill} applications?`,
      option_a: `Reduces computational overhead and speeds up response latency`,
      option_b: `Increases disk memory usage unnecessarily`,
      option_c: `Forces client browsers to reload every second`,
      option_d: `Deletes database table schemas`,
      correct_answer: 'A',
      explanation: `Caching avoids redundant computation and data fetching, directly reducing response latency.`,
      difficulty: 'Hard'
    }
  ];

  return {
    title: `${skill} Mastery & Concepts Assessment`,
    difficulty: 'Intermediate',
    total_questions: sampleQuestions.length,
    passing_score: 70,
    questions: sampleQuestions
  };
}
