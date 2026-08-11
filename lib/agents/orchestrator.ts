import { runResearchAgent } from './research-agent';
import { runSkillGapAgent } from './skill-gap-agent';
import { runRoadmapAgent } from './roadmap-agent';
import { runAdvisorAgent } from './advisor-agent';
import { CareerAgentState } from '@/types/agents';
import { CareerAssessment, UserProfile } from '@/types/career';

export async function runCareerAnalysis(
  userId: string,
  profile: UserProfile,
  assessment: CareerAssessment
): Promise<CareerAgentState> {
  let state: CareerAgentState = {
    userId,
    profile,
    assessment,
    retrievedContext: []
  };

  try {
    // 1. Research Agent
    state = await runResearchAgent(state);

    // 2. Skill Gap Agent
    state = await runSkillGapAgent(state);

    // 3. Roadmap Agent
    state = await runRoadmapAgent(state);

    // 4. Advisor Agent
    state = await runAdvisorAgent(state);

  } catch (error: any) {
    state.errors = [...(state.errors || []), error.message || 'Error executing agent pipeline'];
  }

  return state;
}
