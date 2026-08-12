import { Router } from 'express';
import { runCareerAnalysis } from '../lib/agents/orchestrator';

const router = Router();

router.post('/career-analysis', async (req, res) => {
  try {
    const { userId, profile, assessment } = req.body;

    if (!userId || !assessment) {
      return res.status(400).json({ error: 'Missing userId or assessment parameter' });
    }

    const result = await runCareerAnalysis(userId, profile, assessment);
    return res.json(result);
  } catch (error: any) {
    console.error('Career analysis error:', error);
    return res.status(500).json({ error: error.message || 'Pipeline analysis failed' });
  }
});

export default router;
