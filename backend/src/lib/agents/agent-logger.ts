/**
 * Agent Logger — Observability for Agent Pipeline
 * 
 * Records for every agent execution:
 * - agent_name, input summary, output summary
 * - model, model parameters, latency, token usage
 * - validation result, confidence, errors
 * - timestamp
 * 
 * Does NOT expose sensitive chain-of-thought.
 * Stores only safe reasoning metadata, decisions, scores and evidence references.
 */

export interface AgentLogEntry {
  id: string;
  agentName: string;
  inputSummary: string;
  outputSummary: string;
  model: string;
  modelParameters: Record<string, any>;
  validationResult: 'passed' | 'failed' | 'skipped';
  confidence: number;
  latencyMs: number;
  tokenUsage: { prompt: number; completion: number; total: number } | null;
  errors: string[];
  timestamp: string;
  metadata: Record<string, any>;
}

// In-memory log store (can be persisted to Supabase agent_logs table)
const agentLogs: AgentLogEntry[] = [];
let logCounter = 0;

/**
 * Create a timing context for measuring agent execution latency.
 */
export function startAgentTimer(): { getElapsedMs: () => number } {
  const startTime = Date.now();
  return {
    getElapsedMs: () => Date.now() - startTime,
  };
}

/**
 * Log an agent execution event.
 */
export function logAgentExecution(entry: Omit<AgentLogEntry, 'id' | 'timestamp'>): AgentLogEntry {
  const logEntry: AgentLogEntry = {
    ...entry,
    id: `agent-log-${++logCounter}-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  agentLogs.push(logEntry);

  // Keep only last 1000 entries in memory
  if (agentLogs.length > 1000) {
    agentLogs.splice(0, agentLogs.length - 1000);
  }

  return logEntry;
}

/**
 * Get all agent logs (for evaluation dashboard).
 */
export function getAgentLogs(filters?: {
  agentName?: string;
  validationResult?: string;
  limit?: number;
}): AgentLogEntry[] {
  let results = [...agentLogs];

  if (filters?.agentName) {
    results = results.filter(l => l.agentName === filters.agentName);
  }
  if (filters?.validationResult) {
    results = results.filter(l => l.validationResult === filters.validationResult);
  }

  // Sort by timestamp descending
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Get aggregated agent metrics for the evaluation dashboard.
 */
export function getAgentMetrics(): {
  totalExecutions: number;
  passedValidations: number;
  failedValidations: number;
  averageLatencyMs: number;
  averageConfidence: number;
  errorRate: number;
  agentBreakdown: Record<string, { count: number; avgLatency: number; errorRate: number }>;
} {
  const total = agentLogs.length;
  if (total === 0) {
    return {
      totalExecutions: 0,
      passedValidations: 0,
      failedValidations: 0,
      averageLatencyMs: 0,
      averageConfidence: 0,
      errorRate: 0,
      agentBreakdown: {},
    };
  }

  const passed = agentLogs.filter(l => l.validationResult === 'passed').length;
  const failed = agentLogs.filter(l => l.validationResult === 'failed').length;
  const avgLatency = agentLogs.reduce((sum, l) => sum + l.latencyMs, 0) / total;
  const avgConfidence = agentLogs.reduce((sum, l) => sum + l.confidence, 0) / total;
  const errorCount = agentLogs.filter(l => l.errors.length > 0).length;

  // Per-agent breakdown
  const agentBreakdown: Record<string, { count: number; avgLatency: number; errorRate: number }> = {};
  const agentGroups = new Map<string, AgentLogEntry[]>();

  for (const log of agentLogs) {
    if (!agentGroups.has(log.agentName)) agentGroups.set(log.agentName, []);
    agentGroups.get(log.agentName)!.push(log);
  }

  for (const [name, logs] of agentGroups) {
    const count = logs.length;
    const latency = logs.reduce((sum, l) => sum + l.latencyMs, 0) / count;
    const errors = logs.filter(l => l.errors.length > 0).length;
    agentBreakdown[name] = {
      count,
      avgLatency: Math.round(latency),
      errorRate: Math.round((errors / count) * 100) / 100,
    };
  }

  return {
    totalExecutions: total,
    passedValidations: passed,
    failedValidations: failed,
    averageLatencyMs: Math.round(avgLatency),
    averageConfidence: Math.round(avgConfidence * 100) / 100,
    errorRate: Math.round((errorCount / total) * 100) / 100,
    agentBreakdown,
  };
}

/**
 * Clear all logs (for testing).
 */
export function clearAgentLogs(): void {
  agentLogs.length = 0;
  logCounter = 0;
}
