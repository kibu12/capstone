export interface Course {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  skill: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_hours: number;
  order_index: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
}

export interface LearningResource {
  id?: string;
  course_id?: string;
  user_id: string;
  title: string;
  description: string;
  url: string;
  resource_type: 'documentation' | 'video' | 'paper' | 'github' | 'tutorial' | 'course';
  provider: string;
  difficulty: string;
  duration: string;
  thumbnail_url?: string;
  relevance_score: number;
  is_recommended: boolean;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface StudyMaterial {
  id?: string;
  course_id?: string;
  user_id: string;
  title: string;
  overview: string;
  content: {
    whyItMatters: string;
    coreConcepts: { name: string; detail: string }[];
    detailedExplanation: string;
    realWorldExample: string;
    codeExample?: string;
    commonMistakes: string[];
    interviewRelevance: string;
    keyTakeaways: string[];
    quickRevision: string[];
  };
  difficulty: string;
  estimated_minutes: number;
}

export interface QuizQuestion {
  id?: string;
  quiz_id?: string;
  concept_name: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: string;
}

export interface Quiz {
  id?: string;
  course_id?: string;
  user_id: string;
  title: string;
  difficulty: string;
  total_questions: number;
  passing_score: number;
  questions?: QuizQuestion[];
  quiz_questions?: QuizQuestion[];
}

export interface QuizAttempt {
  id?: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  created_at?: string;
}

export interface ConceptPerformance {
  id?: string;
  user_id: string;
  concept_name: string;
  skill_name: string;
  mastery_score: number; // 0 - 100
  status: 'Critical' | 'Weak' | 'Developing' | 'Strong' | 'Mastered';
  attempts_count: number;
}

export interface InterviewAssessment {
  id?: string;
  user_id: string;
  role: string;
  overall_readiness_score: number;
  technical_score: number;
  concept_score: number;
  problem_solving_score: number;
  readiness_level: 'Not Ready' | 'Early Preparation' | 'Developing' | 'Almost Ready' | 'Interview Ready';
  feedback: { category: string; comment: string; type: 'strength' | 'weakness' }[];
}
