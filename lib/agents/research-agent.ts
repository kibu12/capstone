import { CareerAgentState, ResearchResult } from '@/types/agents';
import { retrieveCareerContext } from '@/lib/rag/retriever';

export async function runResearchAgent(state: CareerAgentState): Promise<CareerAgentState> {
  const { target_role, interests, experience_level, skills } = state.assessment;

  // Retrieve RAG sources
  const query = `${target_role} ${interests.join(' ')}`;
  const sources = retrieveCareerContext(query);

  // Parse required skills from context or default
  let requiredSkills: { name: string; requiredLevel: number; category: string }[] = [];
  let emergingSkills: string[] = [];
  let importantTechnologies: string[] = [];
  let careerContext = '';

  const matchedDoc = sources[0];

  if (matchedDoc) {
    careerContext = matchedDoc.content;
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
