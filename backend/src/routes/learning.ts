import { Router } from 'express';
import { runLearningAgents } from '../lib/agents/learning-agents';
import { generateAdaptiveStudyMaterial } from '../lib/learning/study-material-generator';

const router = Router();

router.post('/learning/run-agents', async (req, res) => {
  try {
    const { userId, targetCareer, skillGaps, analysisState } = req.body;
    
    // Accept either full analysis state or direct parameter input
    const inputState = analysisState || {
      userId,
      recommendation: { target_role: targetCareer },
      skillGaps: skillGaps || []
    };

    const result = await runLearningAgents(inputState);
    return res.json(result);
  } catch (error: any) {
    console.error('Learning agents execution error:', error);
    return res.status(500).json({ error: error.message || 'Learning agents execution failed' });
  }
});

router.post('/learning/study-material', async (req, res) => {
  try {
    const { skill, topic, courseTitle, experienceLevel, difficulty } = req.body;
    const targetSkill = skill || 'AI Engineering';
    const targetCourse = topic || courseTitle || 'AI & Machine Learning Foundations';
    const targetExp = experienceLevel || difficulty || 'Intermediate';

    const result = generateAdaptiveStudyMaterial(targetSkill, targetCourse, targetExp);
    return res.json(result);
  } catch (error: any) {
    console.error('Study material generation error:', error);
    return res.status(500).json({ error: error.message || 'Study material generation failed' });
  }
});

export default router;
