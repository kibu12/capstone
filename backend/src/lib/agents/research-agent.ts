import { CareerAgentState, ResearchResult } from '../../types/agents';
import { retrieveCareerContext } from '../rag/retriever';
import { LLMClient } from '../ai/llm-client';

export async function runResearchAgent(state: CareerAgentState): Promise<CareerAgentState> {
  const { target_role, interests, experience_level } = state.assessment;

  // 1. Retrieve RAG sources
  const query = `${target_role} ${(interests || []).join(' ')}`;
  const sources = retrieveCareerContext(query);
  const matchedDoc = sources[0];
  const careerContext = matchedDoc?.content || '';

  // 2. Try Fine-Tuned / Cloud LLM Model first
  try {
    const llmResearch = await LLMClient.generateResearch(
      target_role,
      experience_level || 'Entry Level',
      interests || [],
      careerContext
    );
    if (llmResearch && llmResearch.requiredSkills && llmResearch.requiredSkills.length > 0) {
      return {
        ...state,
        retrievedContext: sources,
        research: llmResearch
      };
    }
  } catch (err) {
    // Graceful fallback to deterministic parsing
  }

  // 3. Deterministic RAG parsing fallback
  let requiredSkills: { name: string; requiredLevel: number; category: string }[] = [];
  let emergingSkills: string[] = [];
  let importantTechnologies: string[] = [];

  if (matchedDoc) {
    const contentLower = matchedDoc.content.toLowerCase();

    // Map skills matching standard names
    const allSkillsList = [
      { name: 'Python', category: 'Language' },
      { name: 'JavaScript', category: 'Language' },
      { name: 'TypeScript', category: 'Language' },
      { name: 'React', category: 'Framework' },
      { name: 'Next.js', category: 'Framework' },
      { name: 'SQL', category: 'Database' },
      { name: 'Machine Learning', category: 'Core Concept' },
      { name: 'Deep Learning', category: 'Core Concept' },
      { name: 'RAG', category: 'Emerging Tech' },
      { name: 'LangChain', category: 'Emerging Tech' },
      { name: 'LangGraph', category: 'Emerging Tech' },
      { name: 'APIs', category: 'Engineering' },
      { name: 'Docker', category: 'DevOps' },
      { name: 'Kubernetes', category: 'DevOps' },
      { name: 'Figma', category: 'Design' },
      { name: 'AWS', category: 'Cloud' },
      { name: 'Git', category: 'Engineering' },
      { name: 'Tableau', category: 'Data Visual' },
      { name: 'PowerBI', category: 'Data Visual' },
      { name: 'Statistics', category: 'Math' }
    ];

    allSkillsList.forEach(item => {
      if (contentLower.includes(item.name.toLowerCase())) {
        requiredSkills.push({
          name: item.name,
          requiredLevel: contentLower.includes('core') || contentLower.includes('must') ? 85 : 75,
          category: item.category
        });
      }
    });

    if (contentLower.includes('emerging')) {
      const parts = matchedDoc.content.split(/emerging skills:/i);
      if (parts[1]) {
        const line = parts[1].split('.')[0];
        emergingSkills = line.split(',').map(s => s.trim());
      }
    }
  }

  // Fallback defaults if RAG finds no match
  if (requiredSkills.length === 0) {
    requiredSkills = [
      { name: 'Git', requiredLevel: 80, category: 'Engineering' },
      { name: 'Python', requiredLevel: 75, category: 'Language' },
      { name: 'SQL', requiredLevel: 70, category: 'Database' }
    ];
  }

  const researchResult: ResearchResult = {
    role: target_role,
    requiredSkills,
    emergingSkills: emergingSkills.length > 0 ? emergingSkills : ['Continuous Integration', 'Agile Methodology'],
    importantTechnologies: importantTechnologies.length > 0 ? importantTechnologies : ['Git', 'Vercel'],
    careerContext: careerContext || 'General technical career path requirements.'
  };

  return {
    ...state,
    retrievedContext: sources,
    research: researchResult
  };
}
