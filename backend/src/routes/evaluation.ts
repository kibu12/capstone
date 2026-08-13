/**
 * Evaluation Dashboard API Route
 * 
 * Provides admin endpoints for:
 * - Running the full evaluation test suite
 * - Viewing agent health metrics
 * - MCQ bias analysis
 * - RAG retrieval quality
 * - Career prediction accuracy
 */

import { Router, Request, Response } from 'express';
import { runFullTestSuite } from '../lib/evaluation/test-runner';
import { getAgentMetrics, getAgentLogs } from '../lib/agents/agent-logger';
import { generateCourseQuiz } from '../lib/quiz/quiz-engine';
import { validateQuizSet, DEFAULT_VALIDATOR_CONFIG } from '../lib/quiz/mcq-validator';
import { verifyPositionDistribution } from '../lib/quiz/mcq-shuffler';

const router = Router();

/**
 * GET /api/evaluation/run — Run the full evaluation test suite
 */
router.get('/run', async (req: Request, res: Response) => {
  try {
    const report = runFullTestSuite();
    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Test suite execution failed' });
  }
});

/**
 * GET /api/evaluation/agent-health — View agent execution metrics
 */
router.get('/agent-health', async (req: Request, res: Response) => {
  try {
    const metrics = getAgentMetrics();
    res.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch agent metrics' });
  }
});

/**
 * GET /api/evaluation/agent-logs — View recent agent execution logs
 */
router.get('/agent-logs', async (req: Request, res: Response) => {
  try {
    const { agentName, limit } = req.query;
    const logs = getAgentLogs({
      agentName: agentName as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });
    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch agent logs' });
  }
});

/**
 * GET /api/evaluation/mcq-analysis — Run MCQ bias and quality analysis
 */
router.get('/mcq-analysis', async (req: Request, res: Response) => {
  try {
    // Generate a quiz and analyze it
    const quiz = generateCourseQuiz('AI Engineering', 'Evaluation Analysis', 20);
    const questions = quiz.quiz_questions || [];
    const validation = validateQuizSet(questions, DEFAULT_VALIDATOR_CONFIG);
    const distribution = verifyPositionDistribution(questions);

    // Calculate length statistics
    const lengthStats = questions.map(q => {
      const options = [q.option_a, q.option_b, q.option_c, q.option_d];
      const correctIdx = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer);
      const correctLen = options[correctIdx].length;
      const distractorLens = options.filter((_, i) => i !== correctIdx).map(o => o.length);
      const avgDistractorLen = distractorLens.reduce((a, b) => a + b, 0) / distractorLens.length;
      return {
        question: q.question.substring(0, 60) + '...',
        correctAnswerLength: correctLen,
        avgDistractorLength: Math.round(avgDistractorLen),
        lengthRatio: avgDistractorLen > 0 ? Math.round((correctLen / avgDistractorLen) * 100) / 100 : 1,
        correct_answer: q.correct_answer,
      };
    });

    res.json({
      success: true,
      analysis: {
        totalQuestions: questions.length,
        positionDistribution: distribution.distribution,
        positionPercentages: distribution.percentages,
        positionBalanced: distribution.isBalanced,
        maxDeviation: Math.round(distribution.maxDeviation * 100) / 100,
        qualityValidation: {
          averageScore: validation.averageQualityScore,
          passedQuestions: validation.passedQuestions,
          failedQuestions: validation.failedQuestions,
          failedIndices: validation.failedIndices,
        },
        lengthBiasAnalysis: lengthStats,
        qualityReport: quiz.quality_report,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'MCQ analysis failed' });
  }
});

/**
 * GET /api/evaluation/dashboard — Aggregated evaluation dashboard data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const agentMetrics = getAgentMetrics();
    const testReport = runFullTestSuite();

    // Quick MCQ check
    const quiz = generateCourseQuiz('AI Engineering', 'Dashboard Check', 15);
    const questions = quiz.quiz_questions || [];
    const distribution = verifyPositionDistribution(questions);

    res.json({
      success: true,
      dashboard: {
        systemHealth: {
          status: testReport.passRate >= 80 ? 'healthy' : testReport.passRate >= 50 ? 'degraded' : 'critical',
          testPassRate: testReport.passRate,
          totalTests: testReport.totalTests,
          passed: testReport.totalPassed,
          failed: testReport.totalFailed,
        },
        agentMetrics,
        mcqHealth: {
          positionBalanced: distribution.isBalanced,
          positionDistribution: distribution.percentages,
          maxDeviation: Math.round(distribution.maxDeviation * 100) / 100,
          qualityScore: quiz.quality_report.average_quality_score,
        },
        testSuites: testReport.suites.map(s => ({
          name: s.suiteName,
          passed: s.passed,
          failed: s.failed,
          executionTimeMs: s.executionTimeMs,
        })),
        lastEvaluated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Dashboard data fetch failed' });
  }
});

export default router;
