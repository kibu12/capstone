/**
 * Unified LLM Client for Fine-Tuned & Cloud Models
 * Supports:
 * - Local Fine-Tuned Career Agent (Ollama: http://localhost:11434)
 * - OpenAI / Gemini / Groq / vLLM compatible endpoints
 * - Resilient JSON parsing and graceful fallback
 */

import { ResearchResult, RoadmapResult } from '../../types/agents';

export interface LLMClientConfig {
  ollamaEndpoint: string;
  ollamaModel: string;
  apiBaseUrl?: string;
  apiKey?: string;
  apiModel?: string;
  timeoutMs: number;
}

const DEFAULT_CONFIG: LLMClientConfig = {
  ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'career-agent',
  apiBaseUrl: process.env.AI_API_BASE_URL,
  apiKey: process.env.AI_API_KEY,
  apiModel: process.env.AI_MODEL_NAME || 'gemini-2.5-flash',
  timeoutMs: 15000,
};

/**
 * Clean and parse JSON from LLM response (strips markdown ```json ... ``` codeblocks)
 */
export function cleanJsonOutput<T = any>(rawText: string): T {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

/**
 * Query LLM backend (tries Ollama first if enabled, or cloud endpoint)
 */
export async function queryLLM(
  systemPrompt: string,
  userPrompt: string,
  config: Partial<LLMClientConfig> = {}
): Promise<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // 1. Try Ollama local fine-tuned model first
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    const res = await fetch(`${cfg.ollamaEndpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: cfg.ollamaModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        format: 'json',
        options: { temperature: 0.1, top_p: 0.9 }
      })
    });

    clearTimeout(timer);

    if (res.ok) {
      const data: any = await res.json();
      const content = data.message?.content;
      if (content) return content;
    }
  } catch (err: any) {
    // Local fine-tuned model not running or timed out; try Cloud API if configured
  }

  // 2. Try Cloud API if key exists
  if (cfg.apiKey && cfg.apiBaseUrl) {
    const res = await fetch(`${cfg.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify({
        model: cfg.apiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      })
    });

    if (res.ok) {
      const data: any = await res.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }

  throw new Error('No LLM backend available (Ollama or Cloud API)');
}

export const LLMClient = {
  /**
   * Check if the fine-tuned model service is currently reachable
   */
  async isModelOnline(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${DEFAULT_CONFIG.ollamaEndpoint}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Research Agent generation via fine-tuned model
   */
  async generateResearch(
    role: string,
    experienceLevel: string,
    interests: string[],
    context?: string
  ): Promise<ResearchResult | null> {
    try {
      const system = (
        "You are the Career Research AI Agent for Career PathFinder. " +
        "Analyze target roles, market requirements, emerging technologies, " +
        "and salary benchmarks. Output strictly valid JSON with requiredSkills, " +
        "emergingSkills, importantTechnologies, and careerContext."
      );
      const user = `Analyze career requirements for the role of '${role}'. Candidate experience level: '${experienceLevel}'. Candidate interests: ${interests.join(', ')}. Context: ${context || 'None'}`;
      
      const raw = await queryLLM(system, user);
      const parsed = cleanJsonOutput(raw);
      
      if (parsed && Array.isArray(parsed.requiredSkills)) {
        return {
          role: parsed.role || role,
          requiredSkills: parsed.requiredSkills,
          emergingSkills: parsed.emergingSkills || [],
          importantTechnologies: parsed.importantTechnologies || [],
          careerContext: parsed.careerContext || ''
        };
      }
    } catch (e) {
      // Fallback handled by agent
    }
    return null;
  },

  /**
   * Roadmap Agent generation via fine-tuned model
   */
  async generateRoadmap(
    role: string,
    priorityGaps: string[]
  ): Promise<RoadmapResult | null> {
    try {
      const system = (
        "You are the Career Roadmap AI Agent for Career PathFinder. " +
        "Generate sequenced, phased learning roadmaps tailored to the candidate's " +
        "skill gaps. Provide phase numbers, titles, duration, concrete skill targets, resources, and portfolio project suggestions. " +
        "Output strictly valid JSON."
      );
      const user = `Generate a customized, sequenced learning roadmap for candidate targeting '${role}'. Identified Priority Skill Gaps: ${priorityGaps.join(', ')}.`;
      
      const raw = await queryLLM(system, user);
      const parsed = cleanJsonOutput(raw);

      if (parsed && Array.isArray(parsed.phases)) {
        return {
          phases: parsed.phases.map((p: any, idx: number) => ({
            phaseNumber: p.phaseNumber || idx + 1,
            title: p.title || `Phase ${idx + 1}`,
            description: p.description || '',
            duration: p.duration || '3-4 Weeks',
            skills: p.skills || [],
            resources: p.resources || []
          }))
        };
      }
    } catch (e) {
      // Fallback handled by agent
    }
    return null;
  },

  /**
   * Advisor Agent generation via fine-tuned model
   */
  async generateAdvisory(
    role: string,
    experienceLevel: string,
    metrics: { assessments: number; quizzes: number; avgQuiz: number; projects: number }
  ): Promise<{ summary: string; reasoning: string[]; careerScore?: number; confidence?: string } | null> {
    try {
      const system = (
        "You are the Career Advisor AI Agent for Career PathFinder. " +
        "Deliver calibrated, evidence-backed career readiness evaluations. " +
        "RULES: " +
        "1. Never say 'You will definitely become X' - always say 'Current readiness: Y%'. " +
        "2. State your confidence level (high, moderate, low, insufficient) based on available evidence. " +
        "3. Structure your reasoning with clear [FACT], [INFERENCE], and [RECOMMENDATION] tags. " +
        "Output strictly valid JSON."
      );
      const user = `Generate evidence-based career advice for user targeting '${role}'. Profile: Experience Level '${experienceLevel}', Assessments Completed: ${metrics.assessments}, Quizzes Completed: ${metrics.quizzes} (Average score: ${metrics.avgQuiz}%), Projects Completed: ${metrics.projects}.`;

      const raw = await queryLLM(system, user);
      const parsed = cleanJsonOutput(raw);

      if (parsed && parsed.summary && Array.isArray(parsed.reasoning)) {
        return {
          summary: parsed.summary,
          reasoning: parsed.reasoning,
          careerScore: parsed.careerScore,
          confidence: parsed.confidence
        };
      }
    } catch (e) {
      // Fallback handled by agent
    }
    return null;
  }
};
