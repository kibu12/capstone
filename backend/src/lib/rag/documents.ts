/**
 * RAG Documents — Enriched with Structured Metadata
 * 
 * Each document now includes:
 * - Skills list with difficulty levels
 * - Content type classification
 * - Experience level mapping
 * - Topics and subtopics
 * - Source attribution
 */

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    category: string;
    role: string;
    salaryRange?: string;
    demandLevel?: string;
    growthRate?: string;
    // ─── Enriched metadata fields ──────────────────────────
    skills: string[];
    topics: string[];
    experienceLevel: 'entry' | 'mid' | 'senior' | 'all';
    contentType: 'career-guide' | 'skill-reference' | 'project-guide' | 'interview-prep';
    source: string;
    lastUpdated: string;
    keywords: string[];
  };
}

export const careerDocuments: RAGDocument[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer Career Guide",
    content: `
      AI Engineers build, integrate, and deploy intelligent software systems using foundation models.
      Core skills: Python, Machine Learning, Deep Learning, APIs, SQL, databases, cloud platforms.
      Emerging skills: LLMs, Retrieval-Augmented Generation (RAG), AI agents, vector databases, evaluation framework, MLOps, LangChain, LangGraph.
      Recommended projects: Enterprise RAG Assistant, Multi-Agent Research System, AI Customer Support Platform.
      Industry Outlook: Very High demand (+28% growth). Average salary range: ₹18 LPA - ₹35 LPA.
      
      Key competencies include understanding transformer architectures, prompt engineering,
      embedding models, vector similarity search, and building production-grade AI pipelines.
      AI Engineers must be proficient in Python for model integration, understand REST API design
      for serving models, and have working knowledge of cloud deployment on AWS, GCP, or Azure.
      
      Career progression typically follows: Junior AI Developer → AI Engineer → Senior AI Engineer → AI Architect.
      Entry-level positions require strong Python and basic ML knowledge.
      Mid-level positions require experience with LLMs, RAG systems, and production deployment.
      Senior positions require system design skills, MLOps expertise, and team leadership.
    `,
    metadata: {
      category: "career",
      role: "AI Engineer",
      salaryRange: "₹18 LPA - ₹35 LPA",
      demandLevel: "Very High",
      growthRate: "+28%",
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'LLMs', 'RAG', 'APIs', 'SQL', 'Docker', 'MLOps', 'Cloud Platforms'],
      topics: ['Transformers', 'Prompt Engineering', 'Embeddings', 'Vector Search', 'AI Agents', 'Model Deployment'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['ai', 'engineer', 'llm', 'rag', 'machine learning', 'deep learning', 'python', 'mlops', 'transformers', 'agents'],
    }
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer Guide",
    content: `
      Machine Learning Engineers design, train, and optimize predictive model systems.
      Core skills: Python, R, Statistics, Scikit-learn, PyTorch, TensorFlow, Pandas, NumPy, Data Engineering.
      Emerging skills: Distributed training, MLOps (MLflow, Kubeflow), feature stores, model quantization, edge AI.
      Recommended projects: Real-time fraud detection pipeline, Image segmentation classifier, Autonomous vehicle sensor model.
      Industry Outlook: High demand (+22% growth). Average salary range: ₹20 LPA - ₹40 LPA.
      
      ML Engineers focus on the full model lifecycle: data preprocessing, feature engineering,
      model selection, hyperparameter tuning, training, evaluation, and deployment.
      Strong statistical foundations are essential for understanding model behavior and diagnostics.
      
      Career progression: Data Analyst → ML Engineer → Senior ML Engineer → ML Architect / Head of ML.
      Entry-level requires Python, statistics, and basic ML algorithms.
      Mid-level requires deep learning frameworks, distributed training, and MLOps.
      Senior-level requires system architecture, model optimization, and research capabilities.
    `,
    metadata: {
      category: "career",
      role: "Machine Learning Engineer",
      salaryRange: "₹20 LPA - ₹40 LPA",
      demandLevel: "High",
      growthRate: "+22%",
      skills: ['Python', 'R', 'Statistics', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Data Engineering', 'MLOps'],
      topics: ['Model Training', 'Feature Engineering', 'Hyperparameter Tuning', 'Distributed Training', 'Model Evaluation'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['machine learning', 'engineer', 'pytorch', 'tensorflow', 'statistics', 'model', 'training', 'mlops'],
    }
  },
  {
    id: "full-stack-developer",
    title: "Full Stack Developer Career Roadmap",
    content: `
      Full Stack Developers engineer complete client-server architectures from user interface to database structures.
      Core skills: JavaScript, TypeScript, React, Next.js, HTML, CSS, Node.js, Express, Postgres, MongoDB, REST APIs.
      Emerging skills: Serverless architectures, Tailwind CSS, GraphQL, Edge rendering, WebSockets, Supabase integration.
      Recommended projects: Real-time collaboration platform, E-commerce dashboard with checkout, Task manager SaaS application.
      Industry Outlook: Very High demand (+15% growth). Average salary range: ₹12 LPA - ₹25 LPA.
      
      Full Stack Developers must balance frontend user experience with backend reliability.
      Frontend expertise includes component architecture, state management, and responsive design.
      Backend expertise includes API design, database optimization, authentication, and caching.
      
      Career progression: Frontend Developer → Full Stack Developer → Senior Full Stack → Tech Lead / Architect.
      Entry-level requires JavaScript, HTML/CSS, and Git fundamentals.
      Mid-level requires React/Next.js, Node.js, database design, and API architecture.
      Senior-level requires system design, performance optimization, and cloud deployment.
    `,
    metadata: {
      category: "career",
      role: "Full Stack Developer",
      salaryRange: "₹12 LPA - ₹25 LPA",
      demandLevel: "Very High",
      growthRate: "+15%",
      skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'SQL', 'APIs', 'Git', 'Docker'],
      topics: ['Component Architecture', 'State Management', 'API Design', 'Database Design', 'Authentication'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['full stack', 'developer', 'javascript', 'react', 'node', 'typescript', 'nextjs', 'frontend', 'backend'],
    }
  },
  {
    id: "data-scientist",
    title: "Data Scientist Guide",
    content: `
      Data Scientists analyze complex datasets to uncover hidden patterns and drive business strategy.
      Core skills: SQL, Python, Statistics, A/B Testing, Pandas, Tableau, PowerBI, Machine Learning, Data Visualization.
      Emerging skills: Big Data tools (Spark, Hadoop), Snowflake, predictive forecasting, automated analysis pipelines.
      Recommended projects: Customer churn forecasting model, Marketing attribution analysis, Dynamic pricing engine dashboard.
      Industry Outlook: High demand (+20% growth). Average salary range: ₹15 LPA - ₹28 LPA.
      
      Data Scientists combine domain expertise with statistical rigor to extract insights from data.
      Strong communication skills are essential for presenting findings to non-technical stakeholders.
      
      Career progression: Data Analyst → Data Scientist → Senior Data Scientist → Principal / Head of Data Science.
      Entry-level requires Python, SQL, and statistics foundations.
      Mid-level requires ML algorithms, data visualization, and experiment design.
      Senior-level requires leadership, business strategy, and advanced modeling.
    `,
    metadata: {
      category: "career",
      role: "Data Scientist",
      salaryRange: "₹15 LPA - ₹28 LPA",
      demandLevel: "High",
      growthRate: "+20%",
      skills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization', 'Pandas', 'Communication'],
      topics: ['Statistical Analysis', 'A/B Testing', 'Predictive Modeling', 'Data Cleaning', 'Business Intelligence'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['data', 'scientist', 'statistics', 'python', 'machine learning', 'visualization', 'analytics'],
    }
  },
  {
    id: "data-analyst",
    title: "Data Analyst Career Guide",
    content: `
      Data Analysts inspect, clean, and model data to support operational decision making.
      Core skills: SQL, Excel, Tableau, PowerBI, Python, communication, data cleaning, dashboard creation.
      Emerging skills: Automated reporting, DBT (data build tool), cloud data warehouses.
      Recommended projects: Interactive business sales dashboard, Web traffic performance audit, Product metrics reporting deck.
      Industry Outlook: Medium demand (+11% growth). Average salary range: ₹8 LPA - ₹16 LPA.
      
      Data Analysts are the bridge between raw data and actionable business insights.
      Proficiency in SQL is the single most important technical skill for this role.
      
      Career progression: Junior Analyst → Data Analyst → Senior Analyst → Analytics Manager.
      Entry-level requires SQL, Excel, and basic data manipulation.
      Mid-level requires visualization tools, Python scripting, and statistical thinking.
      Senior-level requires business domain expertise and team leadership.
    `,
    metadata: {
      category: "career",
      role: "Data Analyst",
      salaryRange: "₹8 LPA - ₹16 LPA",
      demandLevel: "Medium",
      growthRate: "+11%",
      skills: ['SQL', 'Excel', 'Data Visualization', 'Python', 'Communication', 'Statistics'],
      topics: ['Data Cleaning', 'Dashboard Design', 'Reporting', 'SQL Queries', 'Business Metrics'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['data', 'analyst', 'sql', 'excel', 'tableau', 'powerbi', 'dashboard', 'reporting'],
    }
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer Technical Guide",
    content: `
      Cloud Engineers deploy, configure, and maintain highly available cloud systems and networks.
      Core skills: AWS, Azure, GCP, Linux, Networking, Terraform, Docker, Kubernetes, CI/CD, Scripting (Bash/Python).
      Emerging skills: Serverless infrastructure, Cloud Security (IAM), GitOps, Multi-cloud orchestration.
      Recommended projects: High-availability AWS multi-tier architecture, Kubernetes microservice deployment, Infrastructure-as-code automation.
      Industry Outlook: High demand (+18% growth). Average salary range: ₹16 LPA - ₹30 LPA.
      
      Cloud Engineers must understand networking fundamentals, security best practices,
      and infrastructure automation. Certification in AWS, Azure, or GCP is highly valued.
      
      Career progression: Jr. Cloud Engineer → Cloud Engineer → Sr. Cloud Engineer → Cloud Architect.
      Entry-level requires Linux, networking, and basic cloud services.
      Mid-level requires Docker, Kubernetes, CI/CD pipelines, and IaC tools.
      Senior-level requires multi-cloud architecture, security compliance, and cost optimization.
    `,
    metadata: {
      category: "career",
      role: "Cloud Engineer",
      salaryRange: "₹16 LPA - ₹30 LPA",
      demandLevel: "High",
      growthRate: "+18%",
      skills: ['Cloud Platforms', 'Linux', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Networking', 'Python'],
      topics: ['Cloud Architecture', 'Infrastructure as Code', 'Container Orchestration', 'Security', 'Networking'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['cloud', 'engineer', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'devops'],
    }
  },
  {
    id: "cybersecurity-engineer",
    title: "Cybersecurity Engineer Guide",
    content: `
      Cybersecurity Engineers protect digital networks, servers, and sensitive data from cyber threats.
      Core skills: Network security, cryptography, firewalls, penetration testing, Python, Linux, IAM, SIEM tools.
      Emerging skills: Zero Trust architecture, AI threat detection, DevSecOps, cloud platform security audits.
      Recommended projects: Vulnerability scanner, Zero-trust network setup, Intrusion detection & warning system.
      Industry Outlook: Critical demand (+31% growth). Average salary range: ₹18 LPA - ₹32 LPA.
      
      Cybersecurity is one of the fastest-growing fields with a significant talent shortage.
      Certifications like CISSP, CEH, and CompTIA Security+ are highly valued.
      
      Career progression: Security Analyst → Security Engineer → Sr. Security Engineer → CISO.
      Entry-level requires Linux, networking, and security fundamentals.
      Mid-level requires penetration testing, SIEM tools, and incident response.
      Senior-level requires architecture design, compliance, and team leadership.
    `,
    metadata: {
      category: "career",
      role: "Cybersecurity Engineer",
      salaryRange: "₹18 LPA - ₹32 LPA",
      demandLevel: "Critical",
      growthRate: "+31%",
      skills: ['Network Security', 'Linux', 'Cryptography', 'Penetration Testing', 'Python', 'SIEM'],
      topics: ['Threat Detection', 'Incident Response', 'Zero Trust', 'Compliance', 'Vulnerability Assessment'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['cybersecurity', 'security', 'penetration', 'testing', 'network', 'cryptography', 'firewall'],
    }
  },
  {
    id: "product-manager",
    title: "Product Manager Career Guide",
    content: `
      Product Managers define the roadmap, strategy, and feature sets for SaaS and enterprise products.
      Core skills: Agile, Scrum, wireframing, SQL, user interviews, roadmap strategy, metrics analysis.
      Emerging skills: AI product design, growth loops, feature flag deployment analytics.
      Recommended projects: Comprehensive product PRD for AI feature, User onboarding optimization design, App teardown and growth proposal.
      Industry Outlook: High demand (+10% growth). Average salary range: ₹15 LPA - ₹30 LPA.
      
      Product Managers are the voice of the customer within engineering teams.
      Strong communication, prioritization, and analytical skills are essential.
      
      Career progression: Associate PM → Product Manager → Senior PM → VP of Product / CPO.
      Entry-level requires Agile methodology, communication, and basic analytics.
      Mid-level requires product strategy, SQL, and data-driven decision making.
      Senior-level requires roadmap ownership, growth strategy, and leadership.
    `,
    metadata: {
      category: "career",
      role: "Product Manager",
      salaryRange: "₹15 LPA - ₹30 LPA",
      demandLevel: "High",
      growthRate: "+10%",
      skills: ['Product Strategy', 'Agile', 'User Research', 'SQL', 'Communication', 'Data Analysis'],
      topics: ['Product Roadmaps', 'User Research', 'Metrics Analysis', 'Prioritization', 'Stakeholder Management'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['product', 'manager', 'agile', 'scrum', 'roadmap', 'strategy', 'user research'],
    }
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer Guide",
    content: `
      UI/UX Designers create beautiful, intuitive, and accessible user flows and UI designs.
      Core skills: Figma, design systems, wireframing, typography, color theory, prototyping, user testing.
      Emerging skills: Design-to-code components, AI design co-pilots, micro-interactions, responsive design.
      Recommended projects: Complete mobile application design system, SaaS dashboard user journey revamp, E-commerce accessibility audit.
      Industry Outlook: Medium demand (+12% growth). Average salary range: ₹10 LPA - ₹20 LPA.
      
      Great designers balance aesthetics with usability and accessibility.
      User research skills are increasingly valued alongside visual design abilities.
      
      Career progression: Jr. Designer → UI/UX Designer → Senior Designer → Design Lead / Head of Design.
      Entry-level requires Figma, typography, and color theory.
      Mid-level requires design systems, prototyping, and user research.
      Senior-level requires accessibility, design leadership, and cross-functional collaboration.
    `,
    metadata: {
      category: "career",
      role: "UI/UX Designer",
      salaryRange: "₹10 LPA - ₹20 LPA",
      demandLevel: "Medium",
      growthRate: "+12%",
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Typography', 'Accessibility'],
      topics: ['Visual Design', 'User Flows', 'Wireframing', 'Design Tokens', 'Responsive Design'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['ui', 'ux', 'designer', 'figma', 'design', 'prototyping', 'typography', 'accessibility'],
    }
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer Guide",
    content: `
      DevOps Engineers bridge software development and operations, automating testing, deployment, and monitoring.
      Core skills: CI/CD, Git, Docker, Kubernetes, Prometheus, Grafana, AWS, Python, shell scripting, Linux.
      Emerging skills: GitOps, Infrastructure testing, automated security compliance checks.
      Recommended projects: Auto-scaling CI/CD pipeline, Distributed system monitoring dashboard, Log aggregation infrastructure.
      Industry Outlook: Very High demand (+21% growth). Average salary range: ₹16 LPA - ₹30 LPA.
      
      DevOps Engineers focus on reliability, automation, and fast deployment cycles.
      Understanding of both development and operations is critical.
      
      Career progression: Jr. DevOps → DevOps Engineer → Sr. DevOps Engineer → Platform Engineer / SRE Lead.
      Entry-level requires Git, Linux, and basic CI/CD concepts.
      Mid-level requires Docker, Kubernetes, cloud platforms, and monitoring tools.
      Senior-level requires platform architecture, SRE practices, and infrastructure strategy.
    `,
    metadata: {
      category: "career",
      role: "DevOps Engineer",
      salaryRange: "₹16 LPA - ₹30 LPA",
      demandLevel: "Very High",
      growthRate: "+21%",
      skills: ['CI/CD', 'Docker', 'Kubernetes', 'Linux', 'Git', 'Cloud Platforms', 'Monitoring', 'Python'],
      topics: ['Pipeline Automation', 'Container Orchestration', 'Infrastructure as Code', 'Monitoring', 'Logging'],
      experienceLevel: 'all',
      contentType: 'career-guide',
      source: 'Career PathFinder Knowledge Base',
      lastUpdated: '2025-01-15',
      keywords: ['devops', 'engineer', 'cicd', 'docker', 'kubernetes', 'git', 'monitoring', 'automation'],
    }
  }
];
