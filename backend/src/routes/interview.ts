import { Router } from 'express';
import { calculateInterviewReadiness } from '../lib/interview/interview-engine';

const router = Router();

router.post('/interview/readiness', async (req, res) => {
  try {
    const { role, conceptMasteryScore, quizAccuracy, skillCoverage, projectCompletion, career, quizAttempts } = req.body;

    const targetRole = role || career || 'AI Engineer';
    const cScore = conceptMasteryScore ?? 75;
    const qAccuracy = quizAccuracy ?? (quizAttempts && quizAttempts.length > 0 ? quizAttempts[0].score : 70);
    const sCoverage = skillCoverage ?? 70;
    const pCompletion = projectCompletion ?? 60;

    const result = calculateInterviewReadiness(targetRole, cScore, qAccuracy, sCoverage, pCompletion);
    return res.json(result);
  } catch (error: any) {
    console.error('Interview readiness calculation error:', error);
    return res.status(500).json({ error: error.message || 'Interview assessment failed' });
  }
});

export default router;
