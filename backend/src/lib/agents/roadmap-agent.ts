import { CareerAgentState, RoadmapResult } from '../../types/agents';
import { ProjectRecommendation } from '../../types/career';
import { LLMClient } from '../ai/llm-client';

export async function runRoadmapAgent(state: CareerAgentState): Promise<CareerAgentState> {
  const { research, skillGaps } = state;
  if (!research || !skillGaps) {
    throw new Error('Research & Skill Gap analysis are required for Roadmap Agent');
  }

  const criticalGaps = skillGaps.filter(g => g.priority === 'High' || g.priority === 'Medium');
  const foundationSkills = skillGaps.filter(g => g.priority === 'Low').map(g => g.skillName);

  // 1. Try Fine-Tuned / Cloud LLM Model first
  try {
    const prioritySkillNames = criticalGaps.map(g => g.skillName);
    const llmRoadmap = await LLMClient.generateRoadmap(research.role, prioritySkillNames);

    if (llmRoadmap && Array.isArray(llmRoadmap.phases) && llmRoadmap.phases.length > 0) {
      const projects: Omit<ProjectRecommendation, 'user_id'>[] = [
        {
          title: `Personalized ${research.role} Portal`,
          description: `Create a custom software solution integrating ${llmRoadmap.phases[0]?.skills?.join(', ') || 'core competencies'}.`,
          difficulty: 'Intermediate',
          skills: llmRoadmap.phases[0]?.skills || [],
          status: 'Not Started',
          estimated_time: '15-20 hours',
          portfolio_value: 'High'
        },
        {
          title: `Production-ready ${research.role} Pipeline`,
          description: `Build a production-grade system addressing advanced skills: ${llmRoadmap.phases[1]?.skills?.join(', ') || 'advanced patterns'}.`,
          difficulty: 'Advanced',
          skills: llmRoadmap.phases[1]?.skills || [],
          status: 'Not Started',
          estimated_time: '30 hours',
          portfolio_value: 'Outstanding'
        }
      ];

      return {
        ...state,
        roadmap: llmRoadmap,
        projects
      };
    }
  } catch (err) {
    // Graceful fallback
  }

  // 2. Deterministic Roadmap fallback
  const phases: RoadmapResult['phases'] = [
    {
      phaseNumber: 1,
      title: 'Foundation Alignment',
      description: 'Strengthen prerequisite skills and establish tool baselines.',
      duration: '2-3 weeks',
      skills: foundationSkills.length > 0 ? foundationSkills.slice(0, 3) : ['Git', 'Command Line'],
      resources: [
        { name: 'Official Documentation & Guides', type: 'Documentation', url: 'https://docs.github.com' }
      ]
    },
    {
      phaseNumber: 2,
      title: 'Core Development & Gaps',
      description: 'Acquire high priority techniques and target key workflow processes.',
      duration: '4-6 weeks',
      skills: criticalGaps.map(g => g.skillName).slice(0, 3),
      resources: [
        { name: 'Interactive Skill Training Courses', type: 'Video Course', url: 'https://youtube.com' }
      ]
    },
    {
      phaseNumber: 3,
      title: 'Practical System Construction',
      description: 'Build real-world workflows, integrating backend architecture and testing protocols.',
      duration: '4 weeks',
      skills: criticalGaps.map(g => g.skillName).slice(3, 6),
      resources: [
        { name: 'Community Workshops & Hands-on Labs', type: 'Hands-on Lab', url: 'https://github.com' }
      ]
    },
    {
      phaseNumber: 4,
      title: 'Career Launch & Portfolio Prep',
      description: 'Polishing portfolio assets, resume alignment, and technical mock interviews.',
      duration: '2 weeks',
      skills: ['Portfolio Design', 'Technical Communication', 'Interview Preparation'],
      resources: [
        { name: 'Career Prep Sandbox', type: 'Guide', url: 'https://nextjs.org' }
      ]
    }
  ];

  // Synthesize Project recommendations based on gaps
  const projects: Omit<ProjectRecommendation, 'user_id'>[] = [
    {
      title: `Personalized ${research.role} Portal`,
      description: `Create a custom software solution integrating ${phases[1].skills.join(', ')}.`,
      difficulty: 'Intermediate',
      skills: phases[1].skills,
      status: 'Not Started',
      estimated_time: '15-20 hours',
      portfolio_value: 'High'
    },
    {
      title: `Production-ready ${research.role} Pipeline`,
      description: `Build an automation tool addressing critical gaps: ${phases[2].skills.join(', ')}.`,
      difficulty: 'Advanced',
      skills: phases[2].skills,
      status: 'Not Started',
      estimated_time: '30 hours',
      portfolio_value: 'Outstanding'
    }
  ];

  return {
    ...state,
    roadmap: { phases },
    projects
  };
}
