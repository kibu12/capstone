import { CareerAgentState } from '@/types/agents';
import { CareerRecommendation } from '@/types/career';

export async function runAdvisorAgent(state: CareerAgentState): Promise<CareerAgentState> {
  const { research, skillGaps, retrievedContext, userId } = state;
  if (!research || !skillGaps) {
    throw new Error('Missing input stages for Advisor Agent');
  }

  // Calculate scores
  const totalSkillsCount = skillGaps.length;
  const highLevelSkills = skillGaps.filter(g => g.currentLevel >= 65).length;
  
  // Calculate readiness score
  const scorePercent = totalSkillsCount > 0 ? Math.round((highLevelSkills / totalSkillsCount) * 100) : 50;
  // Dynamic career readiness score capping at 95 and min 35
  const careerScore = Math.max(35, Math.min(95, scorePercent + 15));
  
  // High level match rate
  const matchScore = Math.max(40, Math.min(98, scorePercent + 25));

  // Determine strengths & priority gaps
  const strengths = skillGaps.filter(g => g.currentLevel >= 65).map(g => g.skillName);
  const prioritySkills = skillGaps.filter(g => g.priority === 'High').map(g => g.skillName);

  // Match statistics from RAG context
  const primaryDoc = retrievedContext[0];
  const salaryRange = primaryDoc?.metadata?.salaryRange || '$90,000 - $140,000';
  const demandLevel = primaryDoc?.metadata?.demandLevel || 'High';
  const growthRate = primaryDoc?.metadata?.growthRate || '+15%';

  let summary = `Based on your profile, we recommend building your skills towards becoming a ${research.role}. This role matches your interests and builds on your existing knowledge.`;
  let reasoning = [
    `Your experience level matches the prerequisites of ${research.role}.`,
    `Your background in ${strengths.slice(0, 2).join(' and ') || 'analytical problem solving'} supports core competencies.`,
    `Interest in emerging industry standards validates career commitment.`
  ];

  // Optional LLM execution if API Key is configured
  if (process.env.AI_API_KEY) {
    try {
      const { queryAIModel } = require('@/lib/ai/career-engine');
      const prompt = `
        User target role: ${research.role}
        User background: ${state.assessment.experience_level}
        Interests: ${state.assessment.interests.join(', ')}
        Existing skills: ${strengths.join(', ')}
        Required skills gaps: ${prioritySkills.join(', ')}
        
        Generate a JSON object with:
        "summary": A paragraph explaining the best matching career path.
        "reasoning": String array containing 3 distinct reasons why they match this career.
        
        Ensure valid JSON only. No markdown formatting.
      `;
      const responseText = await queryAIModel(prompt, "You are a professional career advisor.");
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.summary) summary = parsed.summary;
      if (Array.isArray(parsed.reasoning)) reasoning = parsed.reasoning;
    } catch (e) {
      console.warn("LLM Advisor Agent query failed, using local templates:", e);
    }
  }

  const recommendation: CareerRecommendation = {
    user_id: userId,
    recommended_role: research.role,
    career_score: careerScore,
    summary,
    reasoning,
    strengths: strengths.length > 0 ? strengths : ['Technical Agility'],
    priority_skills: prioritySkills.length > 0 ? prioritySkills : ['Systems Architecture'],
    salary_range: salaryRange,
    demand_level: demandLevel,
    growth_rate: growthRate,
    analysis_metadata: {
      agents_used: ['research-agent', 'skill-gap-agent', 'roadmap-agent', 'advisor-agent'],
      rag_sources: retrievedContext.map(d => d.id),
      analysis_version: '1.0',
      model_used: process.env.AI_API_KEY ? (process.env.AI_MODEL_NAME || 'gemini-2.5-flash') : 'local-fallback'
    }
  };

  return {
    ...state,
    recommendation
  };
}
