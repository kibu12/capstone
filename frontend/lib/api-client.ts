const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function runCareerAnalysis(userId: string, profile: any, assessment: any) {
  const response = await fetch(`${BACKEND_URL}/api/career-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, profile, assessment }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(errorData.error || 'Career analysis failed');
  }

  return response.json();
}

export async function runLearningAgents(param1: any, targetCareer?: string, skillGaps?: any[]) {
  const payload = typeof param1 === 'object' && param1 !== null
    ? { analysisState: param1 }
    : { userId: param1, targetCareer, skillGaps };

  const response = await fetch(`${BACKEND_URL}/api/learning/run-agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Learning agents failed' }));
    throw new Error(errorData.error || 'Learning agents execution failed');
  }

  return response.json();
}

export async function generateCourseQuiz(courseTitle: string, concepts: string[]) {
  const response = await fetch(`${BACKEND_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseTitle, concepts }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Quiz generation failed' }));
    throw new Error(errorData.error || 'Quiz generation failed');
  }

  return response.json();
}

export async function calculateInterviewReadiness(career: string, quizAttempts: any[]) {
  const response = await fetch(`${BACKEND_URL}/api/interview/readiness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ career, quizAttempts }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Interview calculation failed' }));
    throw new Error(errorData.error || 'Interview calculation failed');
  }

  return response.json();
}
