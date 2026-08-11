'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getQuizzes, saveQuizAttempt, updateConceptPerformance, getConceptPerformances } from '@/lib/supabase/queries';
import { Quiz, QuizQuestion, ConceptPerformance } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [concepts, setConcepts] = useState<ConceptPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        Promise.all([
          getQuizzes(user.id),
          getConceptPerformances(user.id)
        ]).then(([qList, cList]) => {
          const sampleQuiz: Quiz = {
            id: 'demo-quiz',
            user_id: user.id,
            title: 'AI Engineering & System Concepts Assessment',
            difficulty: 'Intermediate',
            total_questions: 3,
            passing_score: 70,
            quiz_questions: [
              {
                concept_name: 'Vector Search',
                question: 'When performing high-dimensional vector similarity retrieval, which metric is most effective for dense text embeddings?',
                option_a: 'Euclidean distance',
                option_b: 'Cosine similarity',
                option_c: 'Manhattan distance',
                option_d: 'Hamming distance',
                correct_answer: 'B',
                explanation: 'Cosine similarity measures directional alignment regardless of vector length, making it ideal for semantic text embeddings.',
                difficulty: 'Medium'
              },
              {
                concept_name: 'Overfitting Detection',
                question: 'A neural model achieves 99% accuracy on training data but 58% on validation data. What issue is occurring?',
                option_a: 'Underfitting',
                option_b: 'Overfitting',
                option_c: 'Data normalization failure',
                option_d: 'Vanishing gradient',
                correct_answer: 'B',
                explanation: 'High training accuracy combined with poor validation performance is a classic sign of overfitting.',
                difficulty: 'Medium'
              },
              {
                concept_name: 'RAG Architecture',
                question: 'Why are text chunk overlaps used during document embedding indexing?',
                option_a: 'To compress vector file size',
                option_b: 'To prevent context loss across chunk boundaries',
                option_c: 'To encrypt sensitive user tokens',
                option_d: 'To double database write speed',
                correct_answer: 'B',
                explanation: 'Overlapping chunks ensure that sentences or key phrases split at boundary cuts retain full semantic context.',
                difficulty: 'Hard'
              }
            ]
          };

          const activeList = qList.length > 0 ? qList : [sampleQuiz];
          setQuizzes(activeList);
          setConcepts(cList);
          setActiveQuiz(activeList[0]);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleSelectAnswer = (qIndex: number, option: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !activeQuiz.quiz_questions) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let correctCount = 0;
    const questions = activeQuiz.quiz_questions;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const selected = answers[i];
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;

      // Update concept performance tracking
      await updateConceptPerformance(user.id, q.concept_name, activeQuiz.title, isCorrect);
    }

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    await saveQuizAttempt(user.id, {
      quiz_id: activeQuiz.id,
      score: calculatedScore,
      total_questions: questions.length,
      correct_answers: correctCount,
      passed: calculatedScore >= activeQuiz.passing_score
    });

    // Refresh concept performances list
    const updatedConcepts = await getConceptPerformances(user.id);
    setConcepts(updatedConcepts);
  };

  const handleRetest = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  const weakConcepts = concepts.filter(c => c.status === 'Weak' || c.status === 'Critical');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">MCQ Assessment & Weak Concepts</h1>
        <p className="text-slate-500 mt-1">Test your technical knowledge and detect weak areas for targeted revision.</p>
      </div>

      {/* Weak Concept Detection Notification */}
      {weakConcepts.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="danger">Weak Concept Alert</Badge>
              <CardTitle className="text-sm text-rose-900">Targeted Revision Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-rose-800">The performance engine detected weak concept scores in your recent attempts:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {weakConcepts.map(c => (
                <span key={c.id} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 text-xs font-bold rounded-lg shadow-sm">
                  {c.concept_name} ({c.mastery_score}% Mastery)
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Quiz Card */}
      {activeQuiz && activeQuiz.quiz_questions && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-1">
              <Badge variant="primary">{activeQuiz.difficulty}</Badge>
              <span className="text-xs text-slate-400 font-semibold">{activeQuiz.quiz_questions.length} Questions</span>
            </div>
            <CardTitle>{activeQuiz.title}</CardTitle>
            <CardDescription>Passing score: {activeQuiz.passing_score}%</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {submitted && (
              <div className={`p-4 rounded-xl text-center border ${score >= activeQuiz.passing_score ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                <h3 className="text-lg font-bold">Quiz Result: {score}%</h3>
                <p className="text-xs mt-1">
                  {score >= activeQuiz.passing_score ? 'Congratulations! You passed this concept quiz.' : 'Score below passing target. Review concept explanations below.'}
                </p>
              </div>
            )}

            <div className="space-y-8">
              {activeQuiz.quiz_questions.map((q: QuizQuestion, index: number) => {
                const selectedOption = answers[index];

                return (
                  <div key={index} className="space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Question {index + 1}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{q.concept_name}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {[
                        { key: 'A', text: q.option_a },
                        { key: 'B', text: q.option_b },
                        { key: 'C', text: q.option_c },
                        { key: 'D', text: q.option_d }
                      ].map(opt => {
                        const isSelected = selectedOption === opt.key;
                        const isCorrectOption = q.correct_answer === opt.key;

                        let style = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                        if (submitted) {
                          if (isCorrectOption) style = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                          else if (isSelected && !isCorrectOption) style = 'bg-rose-50 border-rose-500 text-rose-800';
                        } else if (isSelected) {
                          style = 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold';
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectAnswer(index, opt.key)}
                            disabled={submitted}
                            className={`p-3 text-xs text-left rounded-lg border transition-all ${style}`}
                          >
                            <span className="mr-2 font-bold">{opt.key}.</span> {opt.text}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                        <span className="font-bold text-slate-800 block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            {submitted ? (
              <Button onClick={handleRetest} className="w-full">Retest Quiz</Button>
            ) : (
              <Button onClick={handleSubmitQuiz} disabled={Object.keys(answers).length < activeQuiz.quiz_questions.length} className="w-full">
                Submit Answers & Evaluate Concepts
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
