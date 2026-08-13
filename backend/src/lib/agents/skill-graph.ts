/**
 * Skill Graph — Career → Skill → Topic → Subtopic → Concept Hierarchy
 * 
 * Provides structured knowledge representation for:
 * - MCQ generation (target specific topics/subtopics)
 * - Skill gap analysis (map requirements to career paths)
 * - Recommendation engine (identify prerequisite chains)
 * - Career prediction (calculate skill coverage)
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface Concept {
  name: string;
  description: string;
  cognitiveLevel: 'recall' | 'understanding' | 'application' | 'analysis';
}

export interface Subtopic {
  name: string;
  concepts: Concept[];
}

export interface Topic {
  name: string;
  subtopics: Subtopic[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Skill {
  name: string;
  category: string;
  topics: Topic[];
  prerequisites: string[];
}

export interface CareerPath {
  role: string;
  requiredSkills: { name: string; minProficiency: number; priority: 'core' | 'important' | 'nice-to-have' }[];
  experienceLevels: {
    entry: string[];
    mid: string[];
    senior: string[];
  };
}

export interface SkillNode {
  skill: string;
  proficiency: number;       // 0-1
  confidence: number;        // 0-1 (how confident we are in this assessment)
  evidenceCount: number;     // number of data points
  lastAssessed: string;      // ISO timestamp
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  status: 'strong' | 'developing' | 'weak' | 'unknown';
}

export interface UserSkillProfile {
  userId: string;
  skills: SkillNode[];
  targetCareer: string;
  overallReadiness: number;
  lastUpdated: string;
}

// ─── Career Skill Graph Data ──────────────────────────────────────────────────

export const careerSkillGraph: CareerPath[] = [
  {
    role: 'AI Engineer',
    requiredSkills: [
      { name: 'Python', minProficiency: 0.80, priority: 'core' },
      { name: 'Machine Learning', minProficiency: 0.75, priority: 'core' },
      { name: 'Deep Learning', minProficiency: 0.70, priority: 'core' },
      { name: 'LLMs', minProficiency: 0.75, priority: 'core' },
      { name: 'RAG', minProficiency: 0.70, priority: 'important' },
      { name: 'APIs', minProficiency: 0.70, priority: 'important' },
      { name: 'SQL', minProficiency: 0.60, priority: 'important' },
      { name: 'Docker', minProficiency: 0.55, priority: 'nice-to-have' },
      { name: 'MLOps', minProficiency: 0.50, priority: 'nice-to-have' },
      { name: 'Cloud Platforms', minProficiency: 0.50, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Python', 'SQL', 'Machine Learning'],
      mid: ['Deep Learning', 'LLMs', 'RAG', 'APIs'],
      senior: ['MLOps', 'System Design', 'Cloud Platforms'],
    },
  },
  {
    role: 'Machine Learning Engineer',
    requiredSkills: [
      { name: 'Python', minProficiency: 0.85, priority: 'core' },
      { name: 'Machine Learning', minProficiency: 0.85, priority: 'core' },
      { name: 'Statistics', minProficiency: 0.75, priority: 'core' },
      { name: 'Deep Learning', minProficiency: 0.80, priority: 'core' },
      { name: 'Data Engineering', minProficiency: 0.65, priority: 'important' },
      { name: 'MLOps', minProficiency: 0.70, priority: 'important' },
      { name: 'SQL', minProficiency: 0.65, priority: 'important' },
      { name: 'Cloud Platforms', minProficiency: 0.60, priority: 'nice-to-have' },
      { name: 'Docker', minProficiency: 0.60, priority: 'nice-to-have' },
      { name: 'Kubernetes', minProficiency: 0.50, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Python', 'Statistics', 'Machine Learning'],
      mid: ['Deep Learning', 'Data Engineering', 'MLOps'],
      senior: ['System Design', 'Distributed Training', 'Cloud Platforms'],
    },
  },
  {
    role: 'Full Stack Developer',
    requiredSkills: [
      { name: 'JavaScript', minProficiency: 0.85, priority: 'core' },
      { name: 'TypeScript', minProficiency: 0.75, priority: 'core' },
      { name: 'React', minProficiency: 0.80, priority: 'core' },
      { name: 'Node.js', minProficiency: 0.75, priority: 'core' },
      { name: 'SQL', minProficiency: 0.70, priority: 'important' },
      { name: 'Next.js', minProficiency: 0.65, priority: 'important' },
      { name: 'APIs', minProficiency: 0.75, priority: 'important' },
      { name: 'Git', minProficiency: 0.70, priority: 'important' },
      { name: 'Docker', minProficiency: 0.50, priority: 'nice-to-have' },
      { name: 'Cloud Platforms', minProficiency: 0.45, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['JavaScript', 'HTML/CSS', 'Git'],
      mid: ['TypeScript', 'React', 'Node.js', 'SQL'],
      senior: ['Next.js', 'System Design', 'Cloud Platforms'],
    },
  },
  {
    role: 'Data Scientist',
    requiredSkills: [
      { name: 'Python', minProficiency: 0.80, priority: 'core' },
      { name: 'Statistics', minProficiency: 0.85, priority: 'core' },
      { name: 'SQL', minProficiency: 0.75, priority: 'core' },
      { name: 'Machine Learning', minProficiency: 0.75, priority: 'core' },
      { name: 'Data Visualization', minProficiency: 0.70, priority: 'important' },
      { name: 'Pandas', minProficiency: 0.75, priority: 'important' },
      { name: 'Communication', minProficiency: 0.65, priority: 'important' },
      { name: 'A/B Testing', minProficiency: 0.60, priority: 'nice-to-have' },
      { name: 'Big Data', minProficiency: 0.50, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Python', 'SQL', 'Statistics'],
      mid: ['Machine Learning', 'Data Visualization', 'Pandas'],
      senior: ['Big Data', 'A/B Testing', 'Communication'],
    },
  },
  {
    role: 'Data Analyst',
    requiredSkills: [
      { name: 'SQL', minProficiency: 0.85, priority: 'core' },
      { name: 'Excel', minProficiency: 0.80, priority: 'core' },
      { name: 'Data Visualization', minProficiency: 0.80, priority: 'core' },
      { name: 'Python', minProficiency: 0.60, priority: 'important' },
      { name: 'Communication', minProficiency: 0.70, priority: 'important' },
      { name: 'Statistics', minProficiency: 0.60, priority: 'important' },
      { name: 'Dashboard Design', minProficiency: 0.65, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['SQL', 'Excel', 'Communication'],
      mid: ['Data Visualization', 'Python', 'Statistics'],
      senior: ['Dashboard Design', 'Business Strategy'],
    },
  },
  {
    role: 'Cloud Engineer',
    requiredSkills: [
      { name: 'Cloud Platforms', minProficiency: 0.85, priority: 'core' },
      { name: 'Linux', minProficiency: 0.80, priority: 'core' },
      { name: 'Docker', minProficiency: 0.80, priority: 'core' },
      { name: 'Kubernetes', minProficiency: 0.70, priority: 'core' },
      { name: 'Networking', minProficiency: 0.70, priority: 'important' },
      { name: 'Terraform', minProficiency: 0.65, priority: 'important' },
      { name: 'CI/CD', minProficiency: 0.70, priority: 'important' },
      { name: 'Python', minProficiency: 0.55, priority: 'nice-to-have' },
      { name: 'Security', minProficiency: 0.60, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Linux', 'Networking', 'Cloud Platforms'],
      mid: ['Docker', 'Kubernetes', 'CI/CD'],
      senior: ['Terraform', 'Security', 'Multi-cloud'],
    },
  },
  {
    role: 'Cybersecurity Engineer',
    requiredSkills: [
      { name: 'Network Security', minProficiency: 0.85, priority: 'core' },
      { name: 'Linux', minProficiency: 0.80, priority: 'core' },
      { name: 'Cryptography', minProficiency: 0.70, priority: 'core' },
      { name: 'Penetration Testing', minProficiency: 0.70, priority: 'core' },
      { name: 'Python', minProficiency: 0.65, priority: 'important' },
      { name: 'SIEM', minProficiency: 0.60, priority: 'important' },
      { name: 'Cloud Security', minProficiency: 0.60, priority: 'nice-to-have' },
      { name: 'DevSecOps', minProficiency: 0.50, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Linux', 'Network Security', 'Cryptography'],
      mid: ['Penetration Testing', 'SIEM', 'Python'],
      senior: ['Cloud Security', 'DevSecOps', 'Zero Trust'],
    },
  },
  {
    role: 'Product Manager',
    requiredSkills: [
      { name: 'Product Strategy', minProficiency: 0.85, priority: 'core' },
      { name: 'Agile', minProficiency: 0.80, priority: 'core' },
      { name: 'User Research', minProficiency: 0.75, priority: 'core' },
      { name: 'SQL', minProficiency: 0.55, priority: 'important' },
      { name: 'Communication', minProficiency: 0.80, priority: 'important' },
      { name: 'Data Analysis', minProficiency: 0.60, priority: 'important' },
      { name: 'Wireframing', minProficiency: 0.55, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Agile', 'Communication', 'User Research'],
      mid: ['Product Strategy', 'SQL', 'Data Analysis'],
      senior: ['Roadmap Strategy', 'Growth', 'Leadership'],
    },
  },
  {
    role: 'UI/UX Designer',
    requiredSkills: [
      { name: 'Figma', minProficiency: 0.85, priority: 'core' },
      { name: 'Design Systems', minProficiency: 0.80, priority: 'core' },
      { name: 'User Research', minProficiency: 0.75, priority: 'core' },
      { name: 'Prototyping', minProficiency: 0.75, priority: 'important' },
      { name: 'Typography', minProficiency: 0.65, priority: 'important' },
      { name: 'Accessibility', minProficiency: 0.60, priority: 'important' },
      { name: 'Responsive Design', minProficiency: 0.65, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Figma', 'Typography', 'Color Theory'],
      mid: ['Design Systems', 'Prototyping', 'User Research'],
      senior: ['Accessibility', 'Responsive Design', 'Design Leadership'],
    },
  },
  {
    role: 'DevOps Engineer',
    requiredSkills: [
      { name: 'CI/CD', minProficiency: 0.85, priority: 'core' },
      { name: 'Docker', minProficiency: 0.85, priority: 'core' },
      { name: 'Kubernetes', minProficiency: 0.75, priority: 'core' },
      { name: 'Linux', minProficiency: 0.80, priority: 'core' },
      { name: 'Git', minProficiency: 0.80, priority: 'important' },
      { name: 'Cloud Platforms', minProficiency: 0.70, priority: 'important' },
      { name: 'Monitoring', minProficiency: 0.65, priority: 'important' },
      { name: 'Python', minProficiency: 0.55, priority: 'nice-to-have' },
      { name: 'Terraform', minProficiency: 0.60, priority: 'nice-to-have' },
    ],
    experienceLevels: {
      entry: ['Git', 'Linux', 'CI/CD'],
      mid: ['Docker', 'Kubernetes', 'Cloud Platforms'],
      senior: ['Terraform', 'Monitoring', 'System Architecture'],
    },
  },
];

// ─── Graph Query Functions ────────────────────────────────────────────────────

/**
 * Get career path requirements for a given role.
 * Uses fuzzy matching to handle variations in role naming.
 */
export function getCareerRequirements(role: string): CareerPath | null {
  const normalizedRole = role.toLowerCase().trim();
  return careerSkillGraph.find(
    c => c.role.toLowerCase() === normalizedRole ||
         c.role.toLowerCase().includes(normalizedRole) ||
         normalizedRole.includes(c.role.toLowerCase())
  ) || null;
}

/**
 * Calculate skill coverage for a user against a target career.
 * Returns a 0-1 score weighted by skill priority.
 */
export function calculateSkillCoverage(
  userSkills: SkillNode[],
  career: CareerPath
): { coverage: number; matchedSkills: string[]; missingSkills: string[]; weakSkills: string[] } {
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const weakSkills: string[] = [];

  let totalWeight = 0;
  let coveredWeight = 0;

  for (const required of career.requiredSkills) {
    const weight = required.priority === 'core' ? 3 : required.priority === 'important' ? 2 : 1;
    totalWeight += weight;

    const userSkill = userSkills.find(
      s => s.skill.toLowerCase() === required.name.toLowerCase()
    );

    if (!userSkill) {
      missingSkills.push(required.name);
    } else if (userSkill.proficiency >= required.minProficiency) {
      matchedSkills.push(required.name);
      coveredWeight += weight;
    } else if (userSkill.proficiency > 0) {
      weakSkills.push(required.name);
      // Partial credit for weak skills
      const ratio = userSkill.proficiency / required.minProficiency;
      coveredWeight += weight * ratio;
    } else {
      missingSkills.push(required.name);
    }
  }

  const coverage = totalWeight > 0 ? coveredWeight / totalWeight : 0;
  return { coverage, matchedSkills, missingSkills, weakSkills };
}

/**
 * Determine the proficiency status category for a skill score.
 */
export function getSkillStatus(proficiency: number, evidenceCount: number): SkillNode['status'] {
  if (evidenceCount < 3) return 'unknown';
  if (proficiency >= 0.75) return 'strong';
  if (proficiency >= 0.50) return 'developing';
  return 'weak';
}

/**
 * Calculate trend from a series of assessment scores.
 */
export function calculateTrend(
  recentScores: number[]
): 'improving' | 'stable' | 'declining' | 'unknown' {
  if (recentScores.length < 2) return 'unknown';

  const halfLen = Math.floor(recentScores.length / 2);
  const firstHalf = recentScores.slice(0, halfLen);
  const secondHalf = recentScores.slice(halfLen);

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = avgSecond - avgFirst;
  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'declining';
  return 'stable';
}

/**
 * Create or update a skill node with new assessment evidence.
 */
export function updateSkillNode(
  existing: SkillNode | null,
  newScore: number,
  timestamp: string
): SkillNode {
  if (!existing) {
    return {
      skill: '',
      proficiency: newScore,
      confidence: 0.3,  // Low confidence on first assessment
      evidenceCount: 1,
      lastAssessed: timestamp,
      trend: 'unknown',
      status: getSkillStatus(newScore, 1),
    };
  }

  // Exponential moving average for proficiency
  const alpha = 0.3;  // Weight for new observation
  const newProficiency = alpha * newScore + (1 - alpha) * existing.proficiency;
  const newEvidenceCount = existing.evidenceCount + 1;

  // Confidence increases with evidence count (diminishing returns)
  const newConfidence = Math.min(0.95, 1 - (1 / (1 + newEvidenceCount * 0.3)));

  return {
    ...existing,
    proficiency: Math.round(newProficiency * 100) / 100,
    confidence: Math.round(newConfidence * 100) / 100,
    evidenceCount: newEvidenceCount,
    lastAssessed: timestamp,
    status: getSkillStatus(newProficiency, newEvidenceCount),
    // Trend requires historical data — caller should compute from stored scores
    trend: existing.trend,
  };
}

/**
 * Get all skills required for a career, ordered by priority.
 */
export function getRequiredSkillsOrdered(role: string): { name: string; minProficiency: number; priority: string }[] {
  const career = getCareerRequirements(role);
  if (!career) return [];

  const priorityOrder = { core: 0, important: 1, 'nice-to-have': 2 };
  return [...career.requiredSkills].sort(
    (a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
  );
}

/**
 * Find prerequisite skills that the user is missing.
 */
export function findMissingPrerequisites(
  userSkills: SkillNode[],
  targetSkill: string
): string[] {
  // Find the skill in any career's required skills
  for (const career of careerSkillGraph) {
    const skill = career.requiredSkills.find(
      s => s.name.toLowerCase() === targetSkill.toLowerCase()
    );
    if (skill) {
      // Check experience levels — earlier levels are prerequisites
      const allLevels = [
        ...career.experienceLevels.entry,
        ...career.experienceLevels.mid,
        ...career.experienceLevels.senior,
      ];
      const targetIndex = allLevels.findIndex(
        s => s.toLowerCase() === targetSkill.toLowerCase()
      );

      if (targetIndex > 0) {
        const prerequisites = allLevels.slice(0, targetIndex);
        return prerequisites.filter(
          prereq => !userSkills.some(
            us => us.skill.toLowerCase() === prereq.toLowerCase() && us.proficiency >= 0.5
          )
        );
      }
    }
  }
  return [];
}
