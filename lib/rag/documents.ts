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
      Industry Outlook: Very High demand (+28% growth). Average salary range: $130,000 - $185,000.
    `,
    metadata: {
      category: "career",
      role: "AI Engineer",
      salaryRange: "$130k - $185k",
      demandLevel: "Very High",
      growthRate: "+28%"
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
      Industry Outlook: High demand (+22% growth). Average salary range: $140,000 - $190,000.
    `,
    metadata: {
      category: "career",
      role: "Machine Learning Engineer",
      salaryRange: "$140k - $190k",
      demandLevel: "High",
      growthRate: "+22%"
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
      Industry Outlook: Very High demand (+15% growth). Average salary range: $95,000 - $145,000.
    `,
    metadata: {
      category: "career",
      role: "Full Stack Developer",
      salaryRange: "$95k - $145k",
      demandLevel: "Very High",
      growthRate: "+15%"
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
      Industry Outlook: High demand (+20% growth). Average salary range: $110,000 - $160,000.
    `,
    metadata: {
      category: "career",
      role: "Data Scientist",
      salaryRange: "$110k - $160k",
      demandLevel: "High",
      growthRate: "+20%"
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
      Industry Outlook: Medium demand (+11% growth). Average salary range: $75,000 - $105,000.
    `,
    metadata: {
      category: "career",
      role: "Data Analyst",
      salaryRange: "$75k - $105k",
      demandLevel: "Medium",
      growthRate: "+11%"
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
      Industry Outlook: High demand (+18% growth). Average salary range: $120,000 - $170,000.
    `,
    metadata: {
      category: "career",
      role: "Cloud Engineer",
      salaryRange: "$120k - $170k",
      demandLevel: "High",
      growthRate: "+18%"
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
      Industry Outlook: Critical demand (+31% growth). Average salary range: $125,000 - $180,000.
    `,
    metadata: {
      category: "career",
      role: "Cybersecurity Engineer",
      salaryRange: "$125k - $180k",
      demandLevel: "Critical",
      growthRate: "+31%"
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
      Industry Outlook: High demand (+10% growth). Average salary range: $100,000 - $155,000.
    `,
    metadata: {
      category: "career",
      role: "Product Manager",
      salaryRange: "$100k - $155k",
      demandLevel: "High",
      growthRate: "+10%"
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
      Industry Outlook: Medium demand (+12% growth). Average salary range: $85,000 - $130,000.
    `,
    metadata: {
      category: "career",
      role: "UI/UX Designer",
      salaryRange: "$85k - $130k",
      demandLevel: "Medium",
      growthRate: "+12%"
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
      Industry Outlook: Very High demand (+21% growth). Average salary range: $125,000 - $175,000.
    `,
    metadata: {
      category: "career",
      role: "DevOps Engineer",
      salaryRange: "$125k - $175k",
      demandLevel: "Very High",
      growthRate: "+21%"
    }
  }
];
