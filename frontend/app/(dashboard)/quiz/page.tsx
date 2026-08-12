'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getQuizzes, saveQuizAttempt, updateConceptPerformance, getConceptPerformances } from '@/lib/supabase/queries';
import { generateCourseQuiz } from '@/lib/api-client';
import { Quiz, QuizQuestion, ConceptPerformance } from '@/types/learning';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { HelpCircle, AlertTriangle, CheckCircle2, RotateCcw, Sparkles, RefreshCw, Zap } from 'lucide-react';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [concepts, setConcepts] = useState<ConceptPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [retesting, setRetesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Client-side fallback dynamic question generator for high reliability
  const generateDynamicQuestions = (count: number = 15): QuizQuestion[] => {
    const questionPool: QuizQuestion[] = [
      {
        concept_name: 'Architecture & Scalability',
        question: 'When scaling a system powered by AI Engineering, which issue is a critical performance bottleneck?',
        option_a: 'Excessive network latency and unoptimized payload sizes',
        option_b: 'Color contrast ratio in UI themes',
        option_c: 'File extension naming styles',
        option_d: 'Whitespace in source comments',
        correct_answer: 'A',
        explanation: 'Network latency and unoptimized payload sizes are primary scalability bottlenecks.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Token Management',
        question: 'What occurs when prompt payload tokens exceed the maximum context window of an LLM model?',
        option_a: 'The model returns a context length error or truncates input tokens',
        option_b: 'The model automatically expands its parameter size',
        option_c: 'The server reboots',
        option_d: 'Memory usage drops to 0',
        correct_answer: 'A',
        explanation: 'Context window bounds force truncation or return context length exception errors.',
        difficulty: 'Easy'
      },
      {
        concept_name: 'Prompt Engineering',
        question: 'Which technique improves LLM reasoning accuracy when handling multi-step AI Engineering tasks?',
        option_a: 'Chain-of-Thought (CoT) prompting',
        option_b: 'Truncating system messages',
        option_c: 'Increasing temperature to 2.0',
        option_d: 'Removing system instructions',
        correct_answer: 'A',
        explanation: 'Chain-of-Thought prompting encourages the model to break complex reasoning into intermediate steps.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Vector Similarity Search',
        question: 'Which distance metric measures directional alignment between dense text vector embeddings?',
        option_a: 'Cosine similarity',
        option_b: 'Euclidean distance',
        option_c: 'Manhattan distance',
        option_d: 'Hamming distance',
        correct_answer: 'A',
        explanation: 'Cosine similarity calculates the cosine of the angle between two high-dimensional vectors.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'RAG Context Chunking',
        question: 'Why are text chunk overlaps configured during document embedding indexing?',
        option_a: 'To preserve semantic context across chunk boundary cuts',
        option_b: 'To compress vector index size',
        option_c: 'To encrypt private key strings',
        option_d: 'To double database write speed',
        correct_answer: 'A',
        explanation: 'Overlap windows prevent sentence truncation at chunk cuts from losing context.',
        difficulty: 'Hard'
      },
      {
        concept_name: 'Overfitting & Generalization',
        question: 'A neural model yields 98% accuracy on training data but 52% on test sets. What problem exists?',
        option_a: 'Overfitting',
        option_b: 'Underfitting',
        option_c: 'Gradient explosion',
        option_d: 'Data normalization error',
        correct_answer: 'A',
        explanation: 'High training score coupled with low validation score signals that the model overfitted noise.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Error Resilience',
        question: 'Which architectural pattern best prevents silent failures in an AI execution pipeline?',
        option_a: 'Implementing explicit telemetry logging, backoff retries, and fallback boundaries',
        option_b: 'Wrapping execution in empty try-catch blocks',
        option_c: 'Ignoring HTTP exception codes',
        option_d: 'Returning null fallbacks without logging',
        correct_answer: 'A',
        explanation: 'Telemetry combined with backoff retries and fallback boundaries prevents silent system failures.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Security & Input Validation',
        question: 'How should untrusted user inputs be handled before passing them to LLM prompts?',
        option_a: 'Strictly schema-validated and sanitized prior to prompt construction',
        option_b: 'Passed directly without escaping',
        option_c: 'Stored without type checking',
        option_d: 'Evaluated using raw JavaScript eval() calls',
        correct_answer: 'A',
        explanation: 'Inputs must be strictly schema-validated and sanitized to prevent prompt injection attacks.',
        difficulty: 'Hard'
      },
      {
        concept_name: 'Query Optimization',
        question: 'What is the main benefit of implementing caching layers for LLM embeddings?',
        option_a: 'Reduces computational overhead and speeds up response latency',
        option_b: 'Increases disk storage consumption unnecessarily',
        option_c: 'Forces client browsers to constantly reload',
        option_d: 'Deletes database schemas',
        correct_answer: 'A',
        explanation: 'Caching avoids redundant embedding computation and speeds up response times.',
        difficulty: 'Easy'
      },
      {
        concept_name: 'Asynchronous Execution',
        question: 'Why should blocking synchronous calls be avoided on main event loops in web applications?',
        option_a: 'They cause thread deadlock and UI event loop freeze',
        option_b: 'They speed up execution memory',
        option_c: 'They automate CSS updates',
        option_d: 'They trigger automatic database backups',
        correct_answer: 'A',
        explanation: 'Blocking synchronous calls on main thread loops freezes event dispatchers.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Hyperparameter Tuning',
        question: 'How does setting a lower LLM temperature parameter (e.g., 0.1 vs 0.9) affect model outputs?',
        option_a: 'Produces more deterministic and focused responses',
        option_b: 'Produces highly creative and random text variations',
        option_c: 'Disables response token generation',
        option_d: 'Increases maximum context window size',
        correct_answer: 'A',
        explanation: 'Low temperature restricts probability distribution sampling to top tokens, resulting in deterministic outputs.',
        difficulty: 'Easy'
      },
      {
        concept_name: 'Model Fine-Tuning',
        question: 'What is the primary objective of LoRA (Low-Rank Adaptation) in LLM fine-tuning?',
        option_a: 'To adapt model weights efficiently with significantly fewer trainable parameters',
        option_b: 'To convert model weights into plain text files',
        option_c: 'To replace transformer attention mechanisms with linear regression',
        option_d: 'To double GPU VRAM requirements',
        correct_answer: 'A',
        explanation: 'LoRA freezes pre-trained model weights and injects trainable rank decomposition matrices.',
        difficulty: 'Hard'
      },
      {
        concept_name: 'API Rate Limiting',
        question: 'Which algorithm is commonly used by API gateways to manage request rate limits?',
        option_a: 'Leaky Bucket or Token Bucket algorithm',
        option_b: 'Bubble Sort algorithm',
        option_c: 'Dijkstra shortest path algorithm',
        option_d: 'Binary Search tree algorithm',
        correct_answer: 'A',
        explanation: 'Token bucket and leaky bucket algorithms regulate traffic flow and enforce throughput limits.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Data Normalization',
        question: 'Why is feature scaling (e.g. Min-Max or Z-score normalization) applied before training gradient-based models?',
        option_a: 'Ensures features contribute equally to cost function gradients during optimization',
        option_b: 'Increases missing data values',
        option_c: 'Converts numerical matrices into string arrays',
        option_d: 'Prevents database indexing',
        correct_answer: 'A',
        explanation: 'Normalized feature ranges prevent large magnitude features from dominating gradient updates.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Hallucination Mitigation',
        question: 'Which evaluation technique checks if RAG generated answers are grounded strictly in retrieved context docs?',
        option_a: 'Faithfulness & Groundedness evaluation',
        option_b: 'Color palette contrast check',
        option_c: 'Syntax linting check',
        option_d: 'Cookie expiration check',
        correct_answer: 'A',
        explanation: 'Faithfulness metrics verify that claims in the output text are backed by facts in retrieved context chunks.',
        difficulty: 'Medium'
      }
    ];

    // Shuffle and pick requested count
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        Promise.all([
          getQuizzes(user.id),
          getConceptPerformances(user.id),
          generateCourseQuiz('AI Engineering', ['AI & Machine Learning Foundations']).catch(() => null)
        ]).then(([qList, cList, generatedQuizObj]) => {
          const questions = generatedQuizObj?.questions || generateDynamicQuestions(15);
          const activeQuizObj: Quiz = {
            id: qList[0]?.id || 'dynamic-quiz',
            user_id: user.id,
            title: generatedQuizObj?.title || 'AI Engineering — 15 Question Mastery Assessment',
            difficulty: 'Intermediate',
            total_questions: questions.length,
            passing_score: 70,
            quiz_questions: questions
          };

          setQuizzes([activeQuizObj]);
          setConcepts(cList);
          setActiveQuiz(activeQuizObj);
          setLoading(false);
        }).catch(err => {
          console.error("Quiz load error:", err);
          const fallbackQuestions = generateDynamicQuestions(15);
          const fallbackQuiz: Quiz = {
            id: 'dynamic-quiz',
            user_id: user.id,
            title: 'AI Engineering — 15 Question Mastery Assessment',
            difficulty: 'Intermediate',
            total_questions: 15,
            passing_score: 70,
            quiz_questions: fallbackQuestions
          };
          setActiveQuiz(fallbackQuiz);
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

      await updateConceptPerformance(user.id, q.concept_name, activeQuiz.title, isCorrect);
    }

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);
    try {
      localStorage.setItem('last_quiz_score', String(calculatedScore));
    } catch (e) {}

    await saveQuizAttempt(user.id, {
      quiz_id: activeQuiz.id,
      score: calculatedScore,
      total_questions: questions.length,
      correct_answers: correctCount,
      passed: calculatedScore >= activeQuiz.passing_score
    });

    const updatedConcepts = await getConceptPerformances(user.id);
    setConcepts(updatedConcepts);
  };

  // Re-test handler generating fresh questions on demand
  const handleRetest = async () => {
    setRetesting(true);
    try {
      let freshQuestions: QuizQuestion[] = [];
      try {
        const freshQuizObj = await generateCourseQuiz('AI Engineering', ['AI & Machine Learning Foundations']);
        if (freshQuizObj?.questions && freshQuizObj.questions.length > 0) {
          freshQuestions = freshQuizObj.questions;
        } else {
          freshQuestions = generateDynamicQuestions(15);
        }
      } catch (e) {
        freshQuestions = generateDynamicQuestions(15);
      }

      if (activeQuiz) {
        setActiveQuiz({
          ...activeQuiz,
          quiz_questions: freshQuestions,
          total_questions: freshQuestions.length
        });
      }

      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setToastMessage('Generated 15 fresh AI concept questions!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Retest quiz generation error:", err);
    } finally {
      setRetesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-20 bg-slate-200/60 rounded-2xl" />
        <div className="h-64 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  const weakConcepts = concepts.filter(c => c.status === 'Weak' || c.status === 'Critical');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar with Re-Test Trigger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">MCQ Concept Testing</h1>
            {activeQuiz && (
              <Badge variant="primary" className="text-[10px]">
                PASSING TARGET: {activeQuiz.passing_score}%
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test technical knowledge and detect weak areas for targeted study.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRetest}
            isLoading={retesting}
            variant="outline"
            size="sm"
            className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${retesting ? 'animate-spin' : ''}`} />
            <span>Re-Test</span>
          </Button>
        </div>
      </div>

      {/* Success Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <Badge variant="success">Fresh Set Active</Badge>
        </div>
      )}

      {/* Weak Concept Alert */}
      {weakConcepts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Targeted Revision Recommended
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0 text-xs">
            <div className="flex flex-wrap gap-1.5">
              {weakConcepts.map(c => (
                <span key={c.id} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-900 text-[11px] font-semibold rounded-lg shadow-2xs">
                  {c.concept_name} ({c.mastery_score}% Mastery)
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Quiz Card */}
      {activeQuiz && activeQuiz.quiz_questions && (
        <Card className="shadow-xs">
          <CardHeader className="border-b border-slate-100/80 pb-4">
            <div>
              <CardTitle className="text-base">{activeQuiz.title}</CardTitle>
              <CardDescription>
                {activeQuiz.quiz_questions.length} Questions • Difficulty: {activeQuiz.difficulty}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {submitted && (
              <div className={`p-5 rounded-2xl text-center border text-xs shadow-xs ${
                score >= activeQuiz.passing_score 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium' 
                  : 'bg-rose-50/80 border-rose-200 text-rose-950 font-medium'
              }`}>
                <h3 className="text-lg font-extrabold tracking-tight">Quiz Score: {score}%</h3>
                <p className="mt-1 leading-relaxed">
                  {score >= activeQuiz.passing_score 
                    ? 'Congratulations! Passed concept validation benchmark.' 
                    : 'Score is below target passing score (70%). Review detailed explanation callouts below.'}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {activeQuiz.quiz_questions.map((q: QuizQuestion, index: number) => {
                const selectedOption = answers[index];

                return (
                  <div key={index} className="space-y-3 p-5 border border-slate-200/80 rounded-2xl bg-slate-50/50 hover:bg-slate-50/80 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                        Question {index < 9 ? `0${index + 1}` : index + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                        {q.concept_name}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-relaxed">{q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {[
                        { key: 'A', text: q.option_a },
                        { key: 'B', text: q.option_b },
                        { key: 'C', text: q.option_c },
                        { key: 'D', text: q.option_d }
                      ].map(opt => {
                        const isSelected = selectedOption === opt.key;
                        const isCorrectOption = q.correct_answer === opt.key;

                        let style = 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300';
                        if (submitted) {
                          if (isCorrectOption) style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs';
                          else if (isSelected && !isCorrectOption) style = 'bg-rose-50 border-rose-500 text-rose-900 font-semibold';
                        } else if (isSelected) {
                          style = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-2xs ring-1 ring-indigo-500/20';
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectAnswer(index, opt.key)}
                            disabled={submitted}
                            className={`p-3 text-xs text-left rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${style}`}
                          >
                            <span className="font-mono font-bold shrink-0 text-slate-400">{opt.key}.</span>
                            <span className="leading-relaxed font-medium">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="mt-3 p-4 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Concept Explanation:
                        </span>
                        <p className="leading-relaxed text-slate-600">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="pt-4 border-t border-slate-100">
            {submitted ? (
              <Button onClick={handleRetest} isLoading={retesting} size="md" className="w-full text-xs font-bold" variant="primary">
                <RotateCcw className="w-4 h-4 mr-2" /> Re-Test Fresh Quiz
              </Button>
            ) : (
              <Button 
                onClick={handleSubmitQuiz} 
                disabled={Object.keys(answers).length < activeQuiz.quiz_questions.length} 
                size="md"
                className="w-full text-xs font-bold"
                variant="primary"
              >
                Submit Answers ({Object.keys(answers).length}/{activeQuiz.quiz_questions.length} Answered)
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
