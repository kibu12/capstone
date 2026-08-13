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

  // Client-side fallback question generator — position-balanced, plausible distractors
  // This is only used when the backend API is unreachable.
  const generateDynamicQuestions = (count: number = 15): QuizQuestion[] => {
    const questionPool: QuizQuestion[] = [
      {
        concept_name: 'Architecture & Scalability',
        question: 'When scaling an AI Engineering system, which factor is most likely to create a critical performance bottleneck?',
        option_a: 'Inconsistent code formatting across source files',
        option_b: 'Network latency and unoptimized payload serialization',
        option_c: 'Number of comments in configuration files',
        option_d: 'Using camelCase instead of snake_case naming',
        correct_answer: 'B',
        explanation: 'Network latency and payload serialization overhead are primary scalability concerns that directly impact system throughput.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Token Management',
        question: 'What happens when input tokens exceed the maximum context window of an LLM?',
        option_a: 'The model silently ignores previous instructions',
        option_b: 'GPU memory allocation automatically doubles',
        option_c: 'The API returns a context length error or truncates input',
        option_d: 'The model switches to a larger architecture variant',
        correct_answer: 'C',
        explanation: 'Exceeding the context window limit causes the API to either return an error or truncate the input to fit within bounds.',
        difficulty: 'Easy'
      },
      {
        concept_name: 'Prompt Engineering',
        question: 'Which prompting technique best improves LLM reasoning on complex multi-step tasks?',
        option_a: 'Removing all system-level instructions entirely',
        option_b: 'Setting the temperature parameter above 1.5',
        option_c: 'Reducing the prompt to a single keyword',
        option_d: 'Using chain-of-thought step-by-step reasoning',
        correct_answer: 'D',
        explanation: 'Chain-of-thought prompting guides the model through explicit intermediate steps, improving accuracy on multi-step reasoning.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Vector Similarity Search',
        question: 'In a RAG system, which metric measures directional alignment between vector embeddings?',
        option_a: 'Manhattan distance between vector endpoints',
        option_b: 'Hamming distance of binary representations',
        option_c: 'Euclidean distance in high-dimensional space',
        option_d: 'Cosine similarity of embedding vectors',
        correct_answer: 'D',
        explanation: 'Cosine similarity measures the cosine of the angle between two vectors, capturing directional alignment regardless of magnitude.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'RAG Context Chunking',
        question: 'Why are overlapping chunk boundaries configured during document indexing in RAG systems?',
        option_a: 'To reduce the total size of the vector index',
        option_b: 'To preserve semantic context that spans chunk boundaries',
        option_c: 'To increase the speed of batch write operations',
        option_d: 'To encrypt document content at rest in storage',
        correct_answer: 'B',
        explanation: 'Chunk overlaps ensure that concepts split across boundaries retain their full semantic context in both chunks.',
        difficulty: 'Hard'
      },
      {
        concept_name: 'Overfitting & Generalization',
        question: 'A model achieves 98% accuracy on training data but 52% on the test set. What does this indicate?',
        option_a: 'The model has memorized training noise instead of patterns',
        option_b: 'The dataset requires additional feature engineering',
        option_c: 'The learning rate was configured too conservatively',
        option_d: 'The test set contains corrupted label annotations',
        correct_answer: 'A',
        explanation: 'A large gap between training and test accuracy indicates overfitting — memorizing noise rather than learning generalizable patterns.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Error Resilience',
        question: 'An AI pipeline experiences intermittent API timeouts. Which pattern best prevents silent data loss?',
        option_a: 'Wrapping all calls in empty try-catch blocks',
        option_b: 'Returning cached stale data without any logging',
        option_c: 'Implementing exponential backoff retries with structured logging',
        option_d: 'Disabling timeout limits on all HTTP requests',
        correct_answer: 'C',
        explanation: 'Exponential backoff handles transient failures gracefully, while structured logging ensures errors are captured for debugging.',
        difficulty: 'Hard'
      },
      {
        concept_name: 'Security & Input Validation',
        question: 'Before passing user inputs to LLM prompts, what is the recommended security approach?',
        option_a: 'Evaluate inputs using dynamic code execution',
        option_b: 'Store inputs directly in plaintext log files',
        option_c: 'Pass inputs through without any transformation',
        option_d: 'Validate against a strict schema and sanitize before injection',
        correct_answer: 'D',
        explanation: 'Schema validation and sanitization prevent prompt injection attacks by ensuring only safe input formats reach the LLM.',
        difficulty: 'Hard'
      },
      {
        concept_name: 'Query Optimization',
        question: 'What is the main advantage of implementing caching layers in AI services?',
        option_a: 'Forcing client browsers to reload page assets',
        option_b: 'Increasing total disk storage consumption',
        option_c: 'Reducing redundant computation and response latency',
        option_d: 'Automatically deleting stale database entries',
        correct_answer: 'C',
        explanation: 'Caching avoids redundant computation by storing previously calculated results, significantly reducing response latency.',
        difficulty: 'Easy'
      },
      {
        concept_name: 'Asynchronous Execution',
        question: 'Why should blocking synchronous calls be avoided on the main event loop?',
        option_a: 'They freeze the event loop and block all other operations',
        option_b: 'They automatically trigger database backup procedures',
        option_c: 'They increase available memory for child processes',
        option_d: 'They enable parallel GPU computation by default',
        correct_answer: 'A',
        explanation: 'Blocking the main event loop prevents all other pending callbacks and I/O operations from being processed.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Hyperparameter Tuning',
        question: 'How does setting a low temperature (e.g. 0.1) affect LLM outputs?',
        option_a: 'It increases the maximum token output length',
        option_b: 'It enables multi-turn conversation memory',
        option_c: 'It expands the model vocabulary size dynamically',
        option_d: 'It produces more deterministic and focused responses',
        correct_answer: 'D',
        explanation: 'Low temperature restricts sampling to higher-probability tokens, producing more deterministic and consistent outputs.',
        difficulty: 'Easy'
      },
      {
        concept_name: 'Model Fine-Tuning',
        question: 'An organization with limited GPU resources wants to adapt an LLM for domain tasks. Which approach is most efficient?',
        option_a: 'Training the model from scratch on domain data',
        option_b: 'Increasing the base model parameters by 10x',
        option_c: 'Applying LoRA to train low-rank adapter matrices',
        option_d: 'Converting the transformer architecture to RNN',
        correct_answer: 'C',
        explanation: 'LoRA freezes pre-trained weights and injects small trainable matrices, achieving adaptation with a fraction of the compute.',
        difficulty: 'Expert'
      },
      {
        concept_name: 'API Rate Limiting',
        question: 'Which algorithm provides fair rate limiting with controlled burst support for API consumers?',
        option_a: 'Binary search over request timestamps',
        option_b: 'Token bucket algorithm with per-consumer quotas',
        option_c: 'Bubble sort on request priority headers',
        option_d: 'Dijkstra pathfinding across service routes',
        correct_answer: 'B',
        explanation: 'The token bucket algorithm allows controlled bursts while enforcing sustained rate limits with fair per-consumer quotas.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Data Normalization',
        question: 'Why is feature scaling applied before training gradient-based models?',
        option_a: 'It converts categorical features into ordinal types',
        option_b: 'It removes null values from the training dataset',
        option_c: 'It prevents high-magnitude features from dominating gradients',
        option_d: 'It increases the total number of training samples',
        correct_answer: 'C',
        explanation: 'Feature scaling ensures all features contribute proportionally to gradient updates during optimization.',
        difficulty: 'Medium'
      },
      {
        concept_name: 'Hallucination Mitigation',
        question: 'Which evaluation approach verifies that RAG-generated answers are grounded in retrieved context?',
        option_a: 'Faithfulness and groundedness scoring',
        option_b: 'CSS accessibility contrast analysis',
        option_c: 'HTTP response header field validation',
        option_d: 'Browser cookie expiration auditing',
        correct_answer: 'A',
        explanation: 'Faithfulness metrics verify that every claim in the output is directly supported by facts in the retrieved context.',
        difficulty: 'Medium'
      }
    ];

    // Shuffle questions and return requested count
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
              {weakConcepts.map((c, idx) => (
                <span key={c.id || c.concept_name || `concept-${idx}`} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-900 text-[11px] font-semibold rounded-lg shadow-2xs">
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
