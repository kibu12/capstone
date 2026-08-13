/**
 * RAG Retriever — Hybrid Retrieval with Metadata Filtering & Reranking
 * 
 * Upgraded from simple keyword-matching to hybrid retrieval:
 * 1. Keyword search with TF-IDF-like scoring
 * 2. Metadata filtering (skill, career, difficulty, experience)
 * 3. Relevance reranking
 * 4. Source citation support
 * 
 * Retrieves fewer but more relevant chunks.
 */

import { careerDocuments, RAGDocument } from './documents';
import { RetrievedDocument } from '../../types/agents';

// ─── Retrieval Configuration ──────────────────────────────────────────────────

interface RetrievalOptions {
  /** Maximum number of documents to return. Default: 3 */
  topK?: number;
  /** Filter by specific skills */
  filterSkills?: string[];
  /** Filter by career role */
  filterRole?: string;
  /** Filter by experience level */
  filterExperience?: 'entry' | 'mid' | 'senior' | 'all';
  /** Filter by content type */
  filterContentType?: string;
  /** Minimum relevance score threshold. Default: 0.1 */
  minScore?: number;
}

// ─── Scoring Functions ────────────────────────────────────────────────────────

/**
 * Calculate keyword relevance score between query and document.
 * Uses TF-IDF-inspired weighting with word boundary matching.
 */
function calculateKeywordScore(query: string, doc: RAGDocument): number {
  const normalizedQuery = query.toLowerCase();
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => w.replace(/[^a-z0-9]/g, ''));

  if (queryWords.length === 0) return 0;

  const docContent = (doc.title + ' ' + doc.content).toLowerCase();
  let score = 0;
  let matchedWords = 0;

  for (const word of queryWords) {
    if (docContent.includes(word)) {
      matchedWords++;
      // Exact word boundary matches get higher score
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = docContent.match(regex);
      if (matches) {
        score += matches.length * 1.5;
      } else {
        score += 0.5; // Partial match
      }
    }
  }

  // Normalize by query length to get 0-1 range, then scale
  const coverage = matchedWords / queryWords.length;
  return score * coverage;
}

/**
 * Calculate metadata relevance score.
 * Boosts documents that match metadata filters.
 */
function calculateMetadataScore(query: string, doc: RAGDocument, options: RetrievalOptions): number {
  let score = 0;
  const normalizedQuery = query.toLowerCase();

  // Role matching (high weight)
  const docRole = doc.metadata.role.toLowerCase();
  if (normalizedQuery.includes(docRole) || docRole.includes(normalizedQuery)) {
    score += 15;
  }

  // Skill matching
  if (options.filterSkills && options.filterSkills.length > 0) {
    const docSkills = doc.metadata.skills.map(s => s.toLowerCase());
    for (const filterSkill of options.filterSkills) {
      if (docSkills.some(ds => ds.includes(filterSkill.toLowerCase()) || filterSkill.toLowerCase().includes(ds))) {
        score += 3;
      }
    }
  }

  // Keyword matching against metadata keywords
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  for (const word of queryWords) {
    if (doc.metadata.keywords.some(k => k.includes(word) || word.includes(k))) {
      score += 2;
    }
    // Also check skills array
    if (doc.metadata.skills.some(s => s.toLowerCase().includes(word))) {
      score += 1.5;
    }
    // Check topics
    if (doc.metadata.topics.some(t => t.toLowerCase().includes(word))) {
      score += 1;
    }
  }

  // Experience level filter
  if (options.filterExperience && options.filterExperience !== 'all') {
    if (doc.metadata.experienceLevel === options.filterExperience || doc.metadata.experienceLevel === 'all') {
      score += 2;
    }
  }

  // Content type filter
  if (options.filterContentType) {
    if (doc.metadata.contentType === options.filterContentType) {
      score += 2;
    }
  }

  return score;
}

/**
 * Rerank results using a combined scoring strategy.
 * Final score = keyword_score * 0.4 + metadata_score * 0.6
 */
function rerank(
  results: { doc: RAGDocument; keywordScore: number; metadataScore: number }[]
): { doc: RAGDocument; finalScore: number; keywordScore: number; metadataScore: number }[] {
  // Normalize scores to 0-1 range
  const maxKeyword = Math.max(...results.map(r => r.keywordScore), 1);
  const maxMetadata = Math.max(...results.map(r => r.metadataScore), 1);

  return results.map(r => ({
    ...r,
    finalScore: 
      (r.keywordScore / maxKeyword) * 0.4 +
      (r.metadataScore / maxMetadata) * 0.6,
  })).sort((a, b) => b.finalScore - a.finalScore);
}

// ─── Main Retrieval Function ──────────────────────────────────────────────────

/**
 * Retrieve relevant career documents using hybrid search.
 * 
 * Pipeline:
 * 1. Calculate keyword relevance for all documents
 * 2. Calculate metadata relevance
 * 3. Apply metadata filters
 * 4. Rerank using combined scoring
 * 5. Return top-K with citation metadata
 */
export function retrieveCareerContext(
  query: string,
  options: RetrievalOptions = {}
): RetrievedDocument[] {
  if (!query) return [];

  const {
    topK = 3,
    filterRole,
    filterSkills,
    filterExperience,
    filterContentType,
    minScore = 0.1,
  } = options;

  // Pre-filter by role if specified
  let candidates = [...careerDocuments];
  if (filterRole) {
    const roleMatch = candidates.filter(
      d => d.metadata.role.toLowerCase().includes(filterRole.toLowerCase()) ||
           filterRole.toLowerCase().includes(d.metadata.role.toLowerCase())
    );
    // If we have role matches, prioritize them but don't exclude others
    if (roleMatch.length > 0) {
      candidates = [...roleMatch, ...candidates.filter(d => !roleMatch.includes(d))];
    }
  }

  // Score all candidates
  const scored = candidates.map(doc => ({
    doc,
    keywordScore: calculateKeywordScore(query, doc),
    metadataScore: calculateMetadataScore(query, doc, options),
  }));

  // Rerank
  const reranked = rerank(scored);

  // Filter by minimum score
  const filtered = reranked.filter(r => r.finalScore >= minScore);

  // Return top-K as RetrievedDocument
  return filtered.slice(0, topK).map(r => ({
    id: r.doc.id,
    title: r.doc.title,
    content: r.doc.content,
    metadata: {
      category: r.doc.metadata.category,
      role: r.doc.metadata.role,
      salaryRange: r.doc.metadata.salaryRange,
      demandLevel: r.doc.metadata.demandLevel,
      growthRate: r.doc.metadata.growthRate,
    },
    score: Math.round(r.finalScore * 100) / 100,
    retrievalMetadata: {
      keywordScore: Math.round(r.keywordScore * 100) / 100,
      metadataScore: Math.round(r.metadataScore * 100) / 100,
      finalScore: Math.round(r.finalScore * 100) / 100,
      source: r.doc.metadata.source,
      contentType: r.doc.metadata.contentType,
      skills: r.doc.metadata.skills,
      topics: r.doc.metadata.topics,
    },
  }));
}

/**
 * Retrieve documents filtered specifically by skill.
 * Used by MCQ generator and study material generator.
 */
export function retrieveBySkill(skill: string, topK = 2): RetrievedDocument[] {
  return retrieveCareerContext(skill, {
    topK,
    filterSkills: [skill],
  });
}

/**
 * Retrieve documents for a specific career role.
 * Used by career analysis pipeline.
 */
export function retrieveByRole(role: string, topK = 2): RetrievedDocument[] {
  return retrieveCareerContext(role, {
    topK,
    filterRole: role,
  });
}
