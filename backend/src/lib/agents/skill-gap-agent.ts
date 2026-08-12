import { CareerAgentState, SkillGapResult } from '../../types/agents';

export async function runSkillGapAgent(state: CareerAgentState): Promise<CareerAgentState> {
  const { research, assessment } = state;
  if (!research) {
    throw new Error('Research results required for Skill Gap Agent');
  }

  const currentSkills = assessment.skills;
  const targetRole = assessment.target_role;

  const gaps: SkillGapResult[] = research.requiredSkills.map(reqSkill => {
    // Map current user skill level
    const userHasSkill = currentSkills.some(
      s => s.toLowerCase() === reqSkill.name.toLowerCase()
    );

    let currentLevel = 0;
    if (userHasSkill) {
      currentLevel = assessment.experience_level === 'Mid-Level Professional' ? 80 : 65;
    } else {
      currentLevel = 15;
    }

    const gap = reqSkill.requiredLevel - currentLevel;
    let priority: 'High' | 'Medium' | 'Low' = 'Low';
    if (gap > 40) priority = 'High';
    else if (gap > 15) priority = 'Medium';

    return {
      skillName: reqSkill.name,
      currentLevel,
      requiredLevel: reqSkill.requiredLevel,
      priority,
      category: reqSkill.category
    };
  });

  return {
    ...state,
    skillGaps: gaps
  };
}
