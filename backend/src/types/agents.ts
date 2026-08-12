import { UserProfile, CareerAssessment, CareerRecommendation, SkillGap, RoadmapPhase, ProjectRecommendation } from './career';

export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    category: string;
    role: string;
    salaryRange?: string;
    demandLevel?: string;
    growthRate?: string;
  };
  score?: number;
}

export interface ResearchResult {
  role: string;
  requiredSkills: { name: string; requiredLevel: number; category: string }[];
  emergingSkills: string[];
  importantTechnologies: string[];
  careerContext: string;
}

export interface SkillGapResult {
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface RoadmapResult {
  phases: {
    phaseNumber: number;
    title: string;
    description: string;
    duration: string;
    skills: string[];
    resources: { name: string; type: string; url: string }[];
  }[];
}

export interface CareerAgentState {
  userId: string;
  profile: UserProfile;
  assessment: CareerAssessment;
  retrievedContext: RetrievedDocument[];
  research?: ResearchResult;
  skillGaps?: SkillGapResult[];
  roadmap?: RoadmapResult;
  recommendation?: CareerRecommendation;
  projects?: Omit<ProjectRecommendation, 'user_id'>[];
  errors?: string[];
}
