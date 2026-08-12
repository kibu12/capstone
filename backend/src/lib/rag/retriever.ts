import { careerDocuments, RAGDocument } from './documents';
import { RetrievedDocument } from '../../types/agents';

// Fallback search that ranks documents based on term frequency
export function retrieveCareerContext(query: string): RetrievedDocument[] {
  if (!query) return [];

  const normalizedQuery = query.toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

  const scoredDocs = careerDocuments.map(doc => {
    let score = 0;
    const docContent = (doc.title + ' ' + doc.content).toLowerCase();

    // Check query matches
    queryWords.forEach(word => {
      if (docContent.includes(word)) {
        score += 1;
        // Boost for exact word matches
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = docContent.match(regex);
        if (matches) {
          score += matches.length * 1.5;
        }
      }
    });

    // Special match case for target roles
    const matchedRole = doc.metadata.role.toLowerCase();
    if (normalizedQuery.includes(matchedRole) || matchedRole.includes(normalizedQuery)) {
      score += 15;
    }

    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      metadata: {
        category: doc.metadata.category,
        role: doc.metadata.role,
        salaryRange: doc.metadata.salaryRange,
        demandLevel: doc.metadata.demandLevel,
        growthRate: doc.metadata.growthRate
      },
      score
    };
  });

  // Filter out irrelevant matching scores and sort descending
  return scoredDocs
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
