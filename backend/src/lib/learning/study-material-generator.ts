import { StudyMaterial } from '../../types/learning';

export function generateAdaptiveStudyMaterial(
  skill: string,
  courseTitle: string,
  experienceLevel: string
): Omit<StudyMaterial, 'user_id'> {
  const isAdvancedUser = experienceLevel === 'Mid-Level Professional' || experienceLevel === 'Junior Professional';

  return {
    title: `${skill} — Essential Study & Reference Guide`,
    overview: `Detailed technical reference for mastering ${skill} in the context of ${courseTitle}. Designed for ${experienceLevel} level preparation.`,
    difficulty: isAdvancedUser ? 'Advanced' : 'Intermediate',
    estimated_minutes: 25,
    content: {
      whyItMatters: `${skill} is a critical core requirement in modern production systems. It ensures high reliability, optimized performance, and scalability.`,
      coreConcepts: [
        {
          name: `${skill} Architecture`,
          detail: `Understanding structural components, data flow lifecycle, and interface abstractions.`
        },
        {
          name: `Optimization & Best Practices`,
          detail: `Minimizing latency, preventing resource leaks, and executing robust error handling.`
        },
        {
          name: `Integration & State Sync`,
          detail: `Wiring ${skill} with backend APIs, database caches, and external service contracts.`
        }
      ],
      detailedExplanation: `Mastering ${skill} involves both theoretical foundation and practical code implementation. Systems utilizing ${skill} focus on maintaining consistent state across execution threads while preventing race conditions.`,
      realWorldExample: `In enterprise deployment, ${skill} powers automated background processing and dynamic user interactions, ensuring processing pipelines remain uninterrupted under peak traffic.`,
      codeExample: `// Example Implementation for ${skill}
async function executeWorkflow(payload) {
  try {
    const result = await processTask(payload);
    return { success: true, data: result };
  } catch (error) {
    console.error("Workflow execution failed:", error);
    throw error;
  }
}`,
      commonMistakes: [
        `Failing to validate inputs before executing ${skill} pipeline steps.`,
        `Ignoring error boundary fallbacks during API network timeouts.`,
        `Hardcoding configuration constants directly inside production logic.`
      ],
      interviewRelevance: `Interviewers frequently evaluate ${skill} through scenario questions, asking how to handle scale, security boundaries, and fault tolerance.`,
      keyTakeaways: [
        `Understand core data structures and edge case boundaries.`,
        `Implement clean separation of concerns in modular files.`,
        `Verify end-to-end telemetry and error logs.`
      ],
      quickRevision: [
        `What is the primary trade-off when configuring ${skill}?`,
        `How do you handle error retries in production?`,
        `Which metric indicates optimal throughput?`
      ]
    }
  };
}
