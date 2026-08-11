export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  target_role?: string;
  experience_level?: string;
  career_goal?: string;
}

export interface CareerAssessment {
  id?: string;
  user_id: string;
  interests: string[];
  skills: string[];
  preferred_industries: string[];
  experience_level: string;
  target_role: string;
  career_goal: string;
  assessment_score: number;
}

export interface CareerRecommendation {
  id?: string;
  user_id: string;
  recommended_role: string;
  career_score: number;
  summary: string;
  reasoning: string[];
  strengths: string[];
  priority_skills: string[];
  salary_range: string;
  demand_level: string;
  growth_rate: string;
  analysis_metadata?: any;
}

export interface SkillGap {
  id?: string;
  user_id: string;
  skill_name: string;
  current_level: number;
  required_level: number;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  status: 'Not Started' | 'Learning' | 'Practiced' | 'Completed';
}

export interface RoadmapPhase {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  duration: string;
  phase: number;
  skills: string[];
  resources: { name: string; type: string; url: string }[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
}

export interface ProjectRecommendation {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  estimated_time: string;
  portfolio_value: string;
}
