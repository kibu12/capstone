import { LearningResource } from '@/types/learning';

// Curated high quality resources for learning fallback search
const curatedResourcesDatabase: Omit<LearningResource, 'user_id'>[] = [
  {
    title: 'Python Official Documentation & Tutorials',
    description: 'Comprehensive language reference and standard library guides directly from Python.org.',
    url: 'https://docs.python.org/3/',
    resource_type: 'documentation',
    provider: 'Python Software Foundation',
    difficulty: 'Beginner',
    duration: 'Self-paced',
    relevance_score: 0.98,
    is_recommended: true,
    status: 'Not Started'
  },
  {
    title: 'Machine Learning Specialization by Andrew Ng',
    description: 'Foundational course covering Supervised, Unsupervised, and Neural Network basics.',
    url: 'https://www.youtube.com/results?search_query=machine+learning+andrew+ng+full+course',
    resource_type: 'video',
    provider: 'DeepLearning.AI / YouTube',
    difficulty: 'Intermediate',
    duration: '12 hours',
    relevance_score: 0.95,
    is_recommended: true,
    status: 'Not Started'
  },
  {
    title: 'FastAPI Web Development & API Architecture',
    description: 'High-performance Python web framework for building modern microservices.',
    url: 'https://fastapi.tiangolo.com/',
    resource_type: 'documentation',
    provider: 'FastAPI Official',
    difficulty: 'Intermediate',
    duration: '4 hours',
    relevance_score: 0.91,
    is_recommended: true,
    status: 'Not Started'
  },
  {
    title: 'LangChain & Vector Database Deep Dive',
    description: 'Building production RAG applications with vector indexes and embedding retrieval.',
    url: 'https://python.langchain.com/docs/get_started/introduction',
    resource_type: 'documentation',
    provider: 'LangChain Docs',
    difficulty: 'Advanced',
    duration: '6 hours',
    relevance_score: 0.96,
    is_recommended: true,
    status: 'Not Started'
  },
  {
    title: 'PyTorch Deep Learning Fundamentals',
    description: 'Hands-on neural network construction, backpropagation, and tensor calculations.',
    url: 'https://pytorch.org/tutorials/',
    resource_type: 'tutorial',
    provider: 'PyTorch Team',
    difficulty: 'Advanced',
    duration: '8 hours',
    relevance_score: 0.94,
    is_recommended: true,
    status: 'Not Started'
  },
  {
    title: 'Docker & Containerization for Data Systems',
    description: 'Package microservices, deployment images, and environment dependencies.',
    url: 'https://docs.docker.com/get-started/',
    resource_type: 'documentation',
    provider: 'Docker Docs',
    difficulty: 'Intermediate',
    duration: '3 hours',
    relevance_score: 0.88,
    is_recommended: true,
    status: 'Not Started'
  },
  {
    title: 'SQL & Database Architecture Guide',
    description: 'Relational data design, indexing strategies, complex joins, and query optimization.',
    url: 'https://www.postgresqltutorial.com/',
    resource_type: 'tutorial',
    provider: 'PostgreSQL Tutorial',
    difficulty: 'Beginner',
    duration: '5 hours',
    relevance_score: 0.92,
    is_recommended: true,
    status: 'Not Started'
  }
];

export async function discoverLearningResources(
  skill: string,
  courseTitle: string,
  difficulty: string
): Promise<Omit<LearningResource, 'user_id'>[]> {
  const normalizedSkill = skill.toLowerCase();

  // Rank and filter resources matching the target skill
  const matched = curatedResourcesDatabase.filter(r => {
    const text = (r.title + ' ' + r.description).toLowerCase();
    return text.includes(normalizedSkill) || normalizedSkill.includes(r.provider.toLowerCase());
  });

  if (matched.length > 0) {
    return matched;
  }

  // Fallback dynamic resources if exact term match wasn't in sample database
  return [
    {
      title: `${skill} Complete Masterclass & Best Practices`,
      description: `Official documentation and community guide for mastering ${skill} in ${courseTitle}.`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' full course tutorial')}`,
      resource_type: 'video',
      provider: 'YouTube Education',
      difficulty: difficulty as any,
      duration: '4-6 hours',
      relevance_score: 0.89,
      is_recommended: true,
      status: 'Not Started'
    },
    {
      title: `${skill} Technical Documentation & Guides`,
      description: `Interactive learning labs and reference tutorials for ${skill}.`,
      url: `https://github.com/topics/${encodeURIComponent(skill.toLowerCase().replace(/\s+/g, '-'))}`,
      resource_type: 'github',
      provider: 'GitHub Open Source',
      difficulty: difficulty as any,
      duration: 'Self-paced',
      relevance_score: 0.85,
      is_recommended: true,
      status: 'Not Started'
    }
  ];
}
