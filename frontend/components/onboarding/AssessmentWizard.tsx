'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  clearExistingCareerData,
  saveAssessment,
  getCareerRecommendation,
  saveCareerRecommendation,
  saveSkillGaps,
  saveRoadmapPhases,
  saveProjects,
  updateProfile,
  saveCourses,
  saveLearningResources,
  saveStudyMaterials,
  saveQuiz,
  saveInterviewAssessment
} from '@/lib/supabase/queries';
import { runCareerAnalysis, runLearningAgents } from '@/lib/api-client';
import { SkillGapResult } from '@/types/agents';
import { SkillGap } from '@/types/career';
import AgentPipeline from '@/components/ai/AgentPipeline';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  Target,
  Code2,
  Cpu,
  Brain,
  ShieldCheck,
  Check,
  Plus,
  Briefcase,
  GraduationCap,
  Layers,
} from 'lucide-react';

export default function AssessmentWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retakeParam = searchParams.get('retake');

  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState('Beginner');

  const [interests, setInterests] = useState<string[]>([
    'Artificial Intelligence',
    'Software Development',
  ]);
  const [customInterest, setCustomInterest] = useState('');

  const [skills, setSkills] = useState<string[]>([
    'Python',
    'JavaScript',
    'React',
    'SQL',
  ]);
  const [customSkill, setCustomSkill] = useState('');

  const [targetRole, setTargetRole] = useState('AI Engineer');
  const [careerGoal, setCareerGoal] = useState('Get my first job');

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeParseSuccess, setResumeParseSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        try {
          const rec = await getCareerRecommendation(data.user.id);
          if (rec && retakeParam !== 'true') {
            router.push('/dashboard');
          }
        } catch (e) {
          // If check fails, stay on wizard
        }
      }
    });
  }, [router, retakeParam]);

  // Client-side Resume Text Reader & Keyword Extractor
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setResumeFile(file);
    setParsingResume(true);
    setResumeParseSuccess(null);

    try {
      const text = await readFileText(file);
      setResumeText(text);

      // AI Tech Stack Extractor
      const extractedSkills: string[] = [];
      const knownSkills = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'SQL', 'Node.js',
        'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Git', 'AWS',
        'Docker', 'Kubernetes', 'Figma', 'System Design', 'PostgreSQL', 'MongoDB',
        'C++', 'Go', 'GraphQL', 'Next.js', 'Tailwind', 'RAG', 'Vector Search'
      ];

      knownSkills.forEach((sk) => {
        const regex = new RegExp(`\\b${sk.replace('+', '\\+')}\\b`, 'i');
        if (regex.test(text)) {
          extractedSkills.push(sk);
        }
      });

      if (extractedSkills.length > 0) {
        setSkills((prev) => Array.from(new Set([...prev, ...extractedSkills])));
      }

      // Experience Level Heuristics
      const lowerText = text.toLowerCase();
      if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('architect')) {
        setExperience('Mid-Level Professional');
      } else if (lowerText.includes('junior') || lowerText.includes('intern') || lowerText.includes('entry')) {
        setExperience('Junior Professional');
      } else if (lowerText.includes('student') || lowerText.includes('university') || lowerText.includes('bachelor')) {
        setExperience('Student');
      }

      // Target Role Heuristics
      if (lowerText.includes('machine learning') || lowerText.includes('ml engineer')) {
        setTargetRole('Machine Learning Engineer');
      } else if (lowerText.includes('ai engineer') || lowerText.includes('llm') || lowerText.includes('rag')) {
        setTargetRole('AI Engineer');
      } else if (lowerText.includes('full stack') || lowerText.includes('frontend') || lowerText.includes('backend')) {
        setTargetRole('Full Stack Developer');
      } else if (lowerText.includes('data scientist') || lowerText.includes('data analysis')) {
        setTargetRole('Data Scientist');
      }

      // Extracted Interests
      const extractedInterests: string[] = [];
      if (lowerText.includes('ai') || lowerText.includes('machine learning')) extractedInterests.push('Artificial Intelligence');
      if (lowerText.includes('software') || lowerText.includes('developer')) extractedInterests.push('Software Development');
      if (lowerText.includes('data') || lowerText.includes('analytics')) extractedInterests.push('Data Science');
      if (lowerText.includes('cloud') || lowerText.includes('aws')) extractedInterests.push('Cloud Computing');

      if (extractedInterests.length > 0) {
        setInterests((prev) => Array.from(new Set([...prev, ...extractedInterests])));
      }

      setResumeParseSuccess(
        `Extracted ${extractedSkills.length || 'multiple'} skills and auto-populated experience & target role!`
      );
    } catch (err) {
      console.error('Resume reading error:', err);
    } finally {
      setParsingResume(false);
    }
  };

  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        let rawText = '';
        if (typeof result === 'string') {
          rawText = result;
        } else if (result instanceof ArrayBuffer) {
          rawText = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(result));
        } else {
          rawText = file.name;
        }

        const cleanedText = rawText
          .replace(/%PDF-[\d\.]+/g, '')
          .replace(/<<[\s\S]*?>>/g, '')
          .replace(/stream[\s\S]*?endstream/g, '')
          .replace(/obj[\s\S]*?endobj/g, '')
          .replace(/[^\x20-\x7E\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        resolve(cleanedText.length > 50 ? cleanedText : `Resume Document: ${file.name}`);
      };
      reader.onerror = (err) => reject(err);

      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeText('');
    setResumeParseSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests((prev) => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleNext = () => {
    if (step < 4) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const startAnalysis = async () => {
    if (!userId) return;
    setAnalyzing(true);
    setPipelineStep(0);

    const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

    await timer(800);
    setPipelineStep(1);
    await timer(1000);
    setPipelineStep(2);
    await timer(1000);
    setPipelineStep(3);
    await timer(800);

    try {
      const profile = { id: userId, full_name: '', email: '' };
      const assessment = {
        user_id: userId,
        interests,
        skills,
        preferred_industries: [targetRole],
        experience_level: experience,
        target_role: targetRole,
        career_goal: careerGoal,
        assessment_score: 75,
        resume_text: resumeText || undefined,
        resume_filename: resumeFile?.name || undefined
      };

      const analysisState = await runCareerAnalysis(userId, profile, assessment);

      if (analysisState.errors && analysisState.errors.length > 0) {
        throw new Error(analysisState.errors[0]);
      }

      try { await clearExistingCareerData(userId); } catch (e) { console.warn("clearExistingCareerData skipped:", e); }
      try { await saveAssessment(userId, assessment); } catch (e) { console.warn("saveAssessment skipped:", e); }

      if (analysisState.recommendation) {
        try { await saveCareerRecommendation(userId, analysisState.recommendation); } catch (e) { console.warn("saveCareerRecommendation skipped:", e); }
      }
      const hasResume = Boolean(resumeFile || resumeText);

      if (analysisState.skillGaps) {
        try {
          const mappedSkills = analysisState.skillGaps.map((g: SkillGapResult) => {
            const isVerified = hasResume && (g.currentLevel >= 65 || skills.some(s => s.toLowerCase() === g.skillName.toLowerCase()));
            const status: SkillGap['status'] = isVerified ? 'Completed' : 'Not Started';
            return {
              skill_name: g.skillName,
              current_level: isVerified ? Math.max(85, g.currentLevel) : 15,
              required_level: g.requiredLevel,
              priority: g.priority,
              category: g.category,
              status
            };
          });

          await saveSkillGaps(userId, mappedSkills);
          try {
            localStorage.setItem('user_skills_data', JSON.stringify(mappedSkills));
            window.dispatchEvent(new Event('skill_status_changed'));
          } catch (e) {}
        } catch (e) { console.warn("saveSkillGaps skipped:", e); }
      }

      if (analysisState.roadmap?.phases) {
        try {
          const mappedPhases = analysisState.roadmap.phases.map((p: any, idx: number) => {
            let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';
            let progress = 0;

            if (hasResume) {
              if (idx === 0) {
                status = 'Completed';
                progress = 100;
              } else if (idx === 1) {
                status = 'In Progress';
                progress = 50;
              }
            }

            return {
              title: p.title,
              description: p.description,
              duration: p.duration,
              phase: p.phaseNumber,
              skills: p.skills,
              resources: p.resources,
              status,
              progress
            };
          });

          await saveRoadmapPhases(userId, mappedPhases);
        } catch (e) { console.warn("saveRoadmapPhases skipped:", e); }
      }

      if (analysisState.projects) {
        try {
          await saveProjects(userId, analysisState.projects.map((p: any) => ({
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            skills: p.skills,
            status: 'Not Started',
            estimated_time: p.estimated_time,
            portfolio_value: p.portfolio_value
          })));
        } catch (e) { console.warn("saveProjects skipped:", e); }
      }

      try {
        await updateProfile(userId, {
          target_role: targetRole,
          experience_level: experience,
          career_goal: careerGoal
        });
      } catch (e) {}

      try {
        const learningOutput = await runLearningAgents(analysisState);
        if (learningOutput && learningOutput.courses.length > 0) {
          const mappedCourses = learningOutput.courses.map((c: any, idx: number) => {
            let status = 'Not Started';
            let progress = 0;
            if (hasResume) {
              if (idx === 0) {
                status = 'Completed';
                progress = 100;
              } else if (idx === 1) {
                status = 'In Progress';
                progress = 50;
              }
            }
            return { ...c, status, progress };
          });

          const savedCourses = await saveCourses(userId, mappedCourses);
          try {
            localStorage.setItem('user_courses_data', JSON.stringify(savedCourses));
            window.dispatchEvent(new Event('course_status_changed'));
          } catch (e) {}

          for (let i = 0; i < savedCourses.length; i++) {
            const courseObj = savedCourses[i];
            const courseId = courseObj.id;

            const courseResources = learningOutput.learningResources.slice(i * 2, (i + 1) * 2);
            if (courseResources.length > 0) {
              await saveLearningResources(userId, courseResources.map((r: any) => ({ ...r, course_id: courseId })));
            }

            if (learningOutput.studyMaterials[i]) {
              await saveStudyMaterials(userId, [{ ...learningOutput.studyMaterials[i], course_id: courseId }]);
            }

            if (learningOutput.quizzesWithQuestions[i]) {
              const { questions, ...quizData } = learningOutput.quizzesWithQuestions[i];
              await saveQuiz(userId, { ...quizData, course_id: courseId }, questions);
            }
          }

          if (learningOutput.interviewAssessment) {
            await saveInterviewAssessment(userId, learningOutput.interviewAssessment);
          }
        }
      } catch (learningError) {
        console.warn("Learning Intelligence saving error:", learningError);
      }

      window.location.href = '/dashboard';
    } catch (err) {
      console.error("General analysis wizard error:", err);
      window.location.href = '/dashboard';
    } finally {
      setAnalyzing(false);
    }
  };

  const experienceList = [
    { id: 'Student', title: 'Student', desc: 'Enrolled in university or bootcamp', icon: GraduationCap },
    { id: 'Beginner', title: 'Beginner', desc: '0 - 1 year of hands-on coding', icon: Brain },
    { id: 'Junior Professional', title: 'Junior Professional', desc: '1 - 3 years industry experience', icon: Briefcase },
    { id: 'Mid-Level Professional', title: 'Mid-Level Professional', desc: '3 - 6 years production engineering', icon: Cpu },
    { id: 'Career Switcher', title: 'Career Switcher', desc: 'Transitioning from another discipline', icon: Layers },
  ];

  const popularRoles = [
    { role: 'AI Engineer', tag: 'High Demand', desc: 'LLMs, RAG & Vector Systems' },
    { role: 'Machine Learning Engineer', tag: 'Deep Tech', desc: 'Model Training & MLOps' },
    { role: 'Full Stack Developer', tag: 'Evergreen', desc: 'Modern React & Backend APIs' },
    { role: 'Cloud Engineer', tag: 'Infrastructure', desc: 'AWS, Kubernetes & Terraform' },
    { role: 'Data Scientist', tag: 'Analytics', desc: 'Statistical Modeling & Python' },
    { role: 'Cybersecurity Engineer', tag: 'Security', desc: 'Security Architecture & Auditing' },
  ];

  const availableInterests = [
    'Artificial Intelligence', 'Software Development', 'Data Science',
    'Cybersecurity', 'Cloud Computing', 'UI/UX Design', 'System Architecture',
    'Robotics', 'DevOps & CI/CD', 'Web3 & Blockchain'
  ];

  const commonSkills = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'SQL',
    'Machine Learning', 'Deep Learning', 'PyTorch', 'Docker', 'Kubernetes',
    'AWS', 'Git', 'Next.js', 'PostgreSQL', 'FastAPI', 'Node.js'
  ];

  const careerGoalOptions = [
    'Get my first tech job',
    'Level up to Senior Engineer',
    'Pivot into AI & Machine Learning',
    'Maximize compensation & land top offers'
  ];

  if (analyzing) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            {resumeFile ? 'Analyzing Resume & Synthesizing Multi-Agent RAG Model...' : 'Generating Your AI Career Architecture...'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-sans">
            Evaluating competency deltas against production job vector criteria and building personalized roadmap.
          </p>
        </div>

        <AgentPipeline currentStep={pipelineStep} active={analyzing} />
      </div>
    );
  }

  const stepProgress = Math.round((step / 4) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto font-sans selection:bg-blue-600 selection:text-white">
      {/* ─── TOP WORKSPACE BAR ─── */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 tracking-tight font-display">
              CareerPath
            </span>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-sm font-medium text-slate-600">
              Diagnostic Studio
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">
            Step {step} of 4 ({stepProgress}%)
          </span>
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN WORKSPACE CANVAS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT COMPANION TELEMETRY PANEL (4 COLS) ── */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold mb-2 font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Diagnostic Telemetry</span>
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Live Candidate Profile
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Our multi-agent engine dynamically evaluates your background in real-time.
            </p>
          </div>

          {/* Stepper Timeline Navigation */}
          <div className="space-y-2.5 border-t border-slate-200/80 pt-4">
            {[
              { num: 1, title: 'Experience & Resume', active: step === 1, done: step > 1 },
              { num: 2, title: 'Engineering Domains', active: step === 2, done: step > 2 },
              { num: 3, title: 'Technical Stack', active: step === 3, done: step > 3 },
              { num: 4, title: 'Target Role & Goals', active: step === 4, done: step > 4 },
            ].map((s) => (
              <div
                key={s.num}
                className={`p-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                  s.active
                    ? 'bg-white border border-blue-600 shadow-xs font-bold text-slate-900 ring-2 ring-blue-600/10'
                    : s.done
                    ? 'bg-emerald-50/60 border border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-white/60 border border-slate-200/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      s.active
                        ? 'bg-blue-600 text-white'
                        : s.done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.done ? '✓' : s.num}
                  </span>
                  <span>{s.title}</span>
                </div>
                {s.active && <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Current</span>}
              </div>
            ))}
          </div>

          {/* Live Extracted Telemetry Snapshot */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Detected Parameters
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Experience Level:</span>
                <span className="font-bold text-slate-800">{experience}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Interests Selected:</span>
                <span className="font-bold text-blue-600">{interests.length} Domains</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Skills Staged:</span>
                <span className="font-bold text-indigo-600">{skills.length} Competencies</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Target Role:</span>
                <span className="font-bold text-emerald-700">{targetRole}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Row-Level Data Privacy Guaranteed</span>
          </div>
        </div>

        {/* ── RIGHT MAIN INTERACTIVE STEP WORKSPACE (8 COLS) ── */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg relative min-h-[540px] flex flex-col justify-between">
          <div>
            {/* ── STEP 1: EXPERIENCE & RESUME INTELLIGENCE ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    Experience &amp; Resume Intelligence
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
                    Upload your resume to automatically extract your technical skills, or select your baseline level.
                  </p>
                </div>

                {/* Dropzone Upload */}
                <div className="p-6 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 rounded-3xl transition-all duration-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="resume-upload-input"
                  />

                  {!resumeFile ? (
                    <label
                      htmlFor="resume-upload-input"
                      className="flex flex-col items-center justify-center cursor-pointer text-center py-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 font-display">
                        Drop your Resume here or click to browse
                      </span>
                      <span className="text-xs text-slate-500 mt-1 font-sans">
                        PDF, DOCX, or TXT • Instant AI skill extraction &amp; ATS audit
                      </span>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">{resumeFile.name}</div>
                          <div className="text-[11px] text-slate-500">{(resumeFile.size / 1024).toFixed(1)} KB • Ready for RAG evaluation</div>
                        </div>
                      </div>
                      <button
                        onClick={removeResume}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove resume"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {parsingResume && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 p-3 rounded-2xl border border-blue-200">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing resume text &amp; isolating technical competencies...</span>
                  </div>
                )}

                {resumeParseSuccess && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resumeParseSuccess}</span>
                  </div>
                )}

                {/* Experience Level Cards Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 font-sans">
                    Or Choose Your Experience Baseline
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {experienceList.map((item) => {
                      const Icon = item.icon;
                      const isSelected = experience === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setExperience(item.id)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{item.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: CORE ENGINEERING DOMAINS & INTERESTS ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    Select Your Engineering Domains
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
                    Choose the technical specializations that align with your career ambitions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableInterests.map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-xs text-blue-950 font-bold'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white text-slate-800 font-medium'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{interest}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Interest Input */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">
                    Add Custom Specialization
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                      placeholder="e.g., Quantum Computing, Embedded Systems"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 hover:bg-white"
                    />
                    <button
                      type="button"
                      onClick={addCustomInterest}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: TECHNICAL COMPETENCIES & SKILLS ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                      Verified Technical Skills
                    </h1>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      {skills.length} Selected
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
                    Select technologies you know or have used in past projects.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {commonSkills.map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{skill}</span>
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Skill Input */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">
                    Add Custom Framework or Tool
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                      placeholder="e.g., Redis, LangChain, Kafka, Rust"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 hover:bg-white"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: TARGET ROLE & OBJECTIVES ── */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    Target Role &amp; Objectives
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
                    Tell us what engineering position you are pursuing so our RAG engine can compute your exact gap delta.
                  </p>
                </div>

                {/* Popular Target Roles Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 font-sans">
                    Select Target Engineering Title
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {popularRoles.map((item) => {
                      const isSelected = targetRole === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setTargetRole(item.role)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900">{item.role}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              {item.tag}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Target Role Type-In Input */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">
                      Or Type Your Custom Target Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Embedded Robotics Engineer, NLP Research Scientist, SRE Lead"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 hover:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Career Goals Radio Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 font-sans">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {careerGoalOptions.map((goal) => {
                      const isSelected = careerGoal === goal;
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setCareerGoal(goal)}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
                          }`}
                        >
                          <span>{goal}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Goal Type-In Input */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">
                      Or Type Your Custom Career Goal
                    </label>
                    <input
                      type="text"
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      placeholder="e.g. Transition into AI within 4 months with a senior compensation package"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 hover:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── BOTTOM WORKSPACE CONTROLS ─── */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startAnalysis}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-blue-200 animate-spin" />
                <span>Generate My AI Career Architecture</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
