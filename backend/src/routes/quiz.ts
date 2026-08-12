import { Router } from 'express';
import { generateCourseQuiz } from '../lib/quiz/quiz-engine';

const router = Router();

router.post('/quiz/generate', async (req, res) => {
  try {
    const { skill, courseTitle, questionCount } = req.body;

    const targetSkill = skill || 'AI Engineering';
    const targetTitle = courseTitle || 'AI & Machine Learning Foundations';
    const count = questionCount || 15;

    const quiz = generateCourseQuiz(targetSkill, targetTitle, count);
    return res.json(quiz);
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ error: error.message || 'Quiz generation failed' });
  }
});

export default router;
