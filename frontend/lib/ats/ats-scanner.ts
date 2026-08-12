export interface ATSScanResult {
  overallScore: number;
  formattingScore: number;
  keywordScore: number;
  impactScore: number;
  readabilityScore: number;
  extractedKeywords: string[];
  missingSuggestions: string[];
  actionVerbsFound: string[];
  formattingPassed: string[];
  formattingWarnings: string[];
  recommendations: string[];
  contactInfoFound: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    githubOrPortfolio: boolean;
  };
  summary: string;
}

export function scanResumeATS(
  resumeText: string,
  targetRoleOrTitle?: string,
  customJobDescription?: string
): ATSScanResult {
  const cleanText = resumeText.toLowerCase();

  // 1. Contact Information & Header Audit
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\b\d{10}\b/.test(resumeText);
  const hasLinkedin = /linkedin\.com/i.test(resumeText);
  const hasGithubOrPortfolio = /github\.com|portfolio|\.com|\.io|\.dev/i.test(resumeText);

  // 2. Universal Section Header Audit
  const formattingPassed: string[] = [];
  const formattingWarnings: string[] = [];

  const universalSections = [
    { name: 'Contact Information', ok: hasEmail || hasPhone, detail: 'Email or phone number found' },
    { name: 'Work Experience / History', ok: /experience|employment|work history|career|history/i.test(cleanText), detail: 'Work experience section' },
    { name: 'Education & Credentials', ok: /education|university|college|bachelor|degree|master|phd/i.test(cleanText), detail: 'Education section' },
    { name: 'Skills & Competencies', ok: /skills|technologies|tech stack|competencies|tools|proficiencies/i.test(cleanText), detail: 'Skills section' },
    { name: 'Projects / Achievements', ok: /projects|accomplishments|achievements|portfolio|publications/i.test(cleanText), detail: 'Projects or achievements section' }
  ];

  let structurePoints = 0;
  universalSections.forEach(sec => {
    if (sec.ok) {
      structurePoints += 20;
      formattingPassed.push(`Found section: "${sec.name}"`);
    } else {
      formattingWarnings.push(`Missing clear header: "${sec.name}"`);
    }
  });

  const formattingScore = Math.max(30, Math.min(100, structurePoints));

  // 3. Dynamic Keyword & Domain Extraction
  const commonDomainKeywords = [
    // Tech & Dev
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'PostgreSQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux', 'REST API', 'GraphQL', 'Machine Learning', 'AI',
    // Management & Business
    'Project Management', 'Agile', 'Scrum', 'Product Management', 'Strategy', 'Business Analysis',
    'Leadership', 'Cross-functional', 'Budgeting', 'Operations', 'Stakeholder Management',
    // Analytics & Data
    'Data Analysis', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'R', 'ETL', 'Data Visualization',
    // Design & Marketing
    'UI/UX', 'Figma', 'User Research', 'SEO', 'Content Strategy', 'Digital Marketing', 'CRM'
  ];

  const extractedKeywords: string[] = [];
  commonDomainKeywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw.replace('+', '\\+')}\\b`, 'i');
    if (regex.test(cleanText)) {
      extractedKeywords.push(kw);
    }
  });

  // If custom JD or Role Title supplied, audit extra target keywords
  const missingSuggestions: string[] = [];
  let keywordScore = 70;

  if (customJobDescription && customJobDescription.trim().length > 20) {
    const jdWords = (customJobDescription.match(/\b[A-Za-z0-9+#.-]{4,}\b/g) || []).map(w => w.toLowerCase());
    const uniqueJdWords = Array.from(new Set(jdWords)).filter(w =>
      !['with', 'from', 'that', 'have', 'this', 'will', 'your', 'about', 'team', 'work', 'experience', 'skills', 'role', 'job'].includes(w)
    );

    let matchedJdCount = 0;
    uniqueJdWords.forEach(w => {
      if (cleanText.includes(w)) {
        matchedJdCount++;
      } else if (missingSuggestions.length < 6 && w.length > 3) {
        missingSuggestions.push(w.toUpperCase());
      }
    });

    keywordScore = uniqueJdWords.length > 0 ? Math.round((matchedJdCount / uniqueJdWords.length) * 100) : 75;
    keywordScore = Math.max(40, Math.min(100, keywordScore));
  } else if (targetRoleOrTitle && targetRoleOrTitle.trim()) {
    const roleTerm = targetRoleOrTitle.toLowerCase();
    const isRoleMentioned = cleanText.includes(roleTerm);
    keywordScore = isRoleMentioned ? Math.max(80, extractedKeywords.length * 12) : Math.max(60, extractedKeywords.length * 10);
    keywordScore = Math.min(100, keywordScore);
  } else {
    keywordScore = Math.min(100, Math.max(50, extractedKeywords.length * 12));
  }

  // 4. Action Verbs & Quantifiable Achievements Audit
  const universalActionVerbs = [
    'managed', 'led', 'developed', 'achieved', 'increased', 'decreased', 'optimized',
    'delivered', 'created', 'implemented', 'designed', 'built', 'architected', 'scaled',
    'automated', 'launched', 'negotiated', 'streamlined', 'transformed', 'executed'
  ];

  const actionVerbsFound = universalActionVerbs.filter(verb => cleanText.includes(verb));
  const hasMetrics = /\d+%/g.test(cleanText) || /\$\d+/g.test(cleanText) || /\d+x/g.test(cleanText) || /\d+\+/g.test(cleanText);

  let impactPoints = actionVerbsFound.length * 10;
  if (hasMetrics) impactPoints += 30;
  const impactScore = Math.max(30, Math.min(100, impactPoints));

  // 5. Readability, Length & Contact Info Score
  let readPoints = 60;
  if (hasEmail) readPoints += 15;
  if (hasPhone) readPoints += 15;
  if (hasLinkedin || hasGithubOrPortfolio) readPoints += 10;
  if (cleanText.length >= 400 && cleanText.length <= 4000) readPoints += 10;

  const readabilityScore = Math.max(40, Math.min(100, readPoints));

  // 6. Universal Overall Score
  const overallScore = Math.round(
    formattingScore * 0.25 +
    keywordScore * 0.25 +
    impactScore * 0.25 +
    readabilityScore * 0.25
  );

  // Recommendations
  const recommendations: string[] = [];
  if (!hasEmail) {
    recommendations.push('Include a clear email address in your contact header for ATS candidate indexing.');
  }
  if (!hasPhone) {
    recommendations.push('Add a phone number to ensure ATS contact fields populate correctly.');
  }
  if (!hasLinkedin) {
    recommendations.push('Add a LinkedIn profile URL (e.g. linkedin.com/in/yourname) to boost ATS completeness.');
  }
  if (!hasMetrics) {
    recommendations.push('Add quantifiable metrics and numbers (e.g., "increased sales by 30%", "managed 5+ projects") to demonstrate measurable impact.');
  }
  if (actionVerbsFound.length < 4) {
    recommendations.push('Start bullet points with strong action verbs (e.g., "Led", "Developed", "Optimized", "Delivered", "Transformed").');
  }
  if (formattingWarnings.length > 0) {
    recommendations.push(`Add clear standard section headings: ${formattingWarnings.slice(0, 2).map(w => w.replace('Missing clear header: ', '')).join(', ')}.`);
  }

  let summary = `Your resume achieves a general ATS compatibility score of ${overallScore}/100. `;
  if (overallScore >= 80) {
    summary += 'Excellent general ATS readability, strong structure, and clear contact formatting.';
  } else if (overallScore >= 60) {
    summary += 'Good overall foundation. Adding more quantifiable metrics and power action verbs will further boost candidate ranking.';
  } else {
    summary += 'Requires optimization on contact details, section headers, and measurable achievements to pass standard ATS automated filters.';
  }

  return {
    overallScore,
    formattingScore,
    keywordScore,
    impactScore,
    readabilityScore,
    extractedKeywords,
    missingSuggestions,
    actionVerbsFound,
    formattingPassed,
    formattingWarnings,
    recommendations,
    contactInfoFound: {
      email: hasEmail,
      phone: hasPhone,
      linkedin: hasLinkedin,
      githubOrPortfolio: hasGithubOrPortfolio
    },
    summary
  };
}
