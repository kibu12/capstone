'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import AgentPipeline from '@/components/ai/AgentPipeline';
import { UploadCloud, FileText, CheckCircle2, Sparkles, Loader2, X, Paperclip, Zap } from 'lucide-react';

export default function AssessmentWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retakeParam = searchParams.get('retake');

  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState('Beginner');

  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  const [skills, setSkills] = useState<string[]>([]);
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

        // Clean PDF binary artifacts (%PDF, stream bytes, obj references)
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
    setPipelineStep(1); // Skill gap analysis
    await timer(1000);
    setPipelineStep(2); // Roadmap construction
    await timer(1000);
    setPipelineStep(3); // Advisor evaluation
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

      // Run orchestrator pipeline
      const analysisState = await runCareerAnalysis(userId, profile, assessment);

      if (analysisState.errors && analysisState.errors.length > 0) {
        throw new Error(analysisState.errors[0]);
      }

      // Clear old details and write persistent DB values
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

      // Update target profile meta metrics
      try {
        await updateProfile(userId, {
          target_role: targetRole,
          experience_level: experience,
          career_goal: careerGoal
        });
      } catch (e) {
        // Silently continue
      }

      // Run extended Learning Intelligence & Interview Agents
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

  const experienceOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Junior Professional', label: 'Junior Professional' },
    { value: 'Mid-Level Professional', label: 'Mid-Level Professional' },
    { value: 'Career Switcher', label: 'Career Switcher' }
  ];

  const targetRoleOptions = [
    { value: 'AI Engineer', label: 'AI Engineer' },
    { value: 'Machine Learning Engineer', label: 'Machine Learning Engineer' },
    { value: 'Full Stack Developer', label: 'Full Stack Developer' },
    { value: 'Data Scientist', label: 'Data Scientist' },
    { value: 'Data Analyst', label: 'Data Analyst' },
    { value: 'Cloud Engineer', label: 'Cloud Engineer' },
    { value: 'Cybersecurity Engineer', label: 'Cybersecurity Engineer' },
    { value: 'Product Manager', label: 'Product Manager' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' }
  ];

  const interestOptions = [
    'Artificial Intelligence', 'Software Development', 'Data Science',
    'Cybersecurity', 'Cloud Computing', 'UI/UX', 'Product Management',
    'Business', 'Finance', 'Robotics'
  ];

  const skillOptions = [
    'Python', 'Java', 'JavaScript', 'React', 'SQL',
    'Machine Learning', 'Deep Learning', 'Git', 'AWS', 'Docker', 'Figma'
  ];

  if (analyzing) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-12">
        <h2 className="text-xl font-bold text-center text-slate-800">
          {resumeFile ? 'Analyzing resume & career profile...' : 'Analyzing your career profile...'}
        </h2>
        <AgentPipeline currentStep={pipelineStep} active={analyzing} />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-slate-100 shadow-xl bg-white">
      <CardHeader>
        <div className="flex justify-between items-center text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <CardTitle>
          {step === 1 && 'Experience & Resume Upload'}
          {step === 2 && 'Select your interests'}
          {step === 3 && 'Choose your skills'}
          {step === 4 && 'Target role & goals'}
        </CardTitle>
        <CardDescription>
          {step === 1 && 'Upload resume or select level to auto-fill diagnostic'}
          {step === 2 && 'Pick what excites you'}
          {step === 3 && 'Select your existing tech stack'}
          {step === 4 && 'Identify career goals'}
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[240px] space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            {/* Resume Upload Box */}
            <div className="p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl transition-all">
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
                  className="flex flex-col items-center justify-center cursor-pointer text-center py-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-sm">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Upload Resume for AI Diagnostic (PDF, DOCX, TXT)
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Automatically extracts tech stack, experience level, and role alignment
                  </span>
                </label>
              ) : (
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{resumeFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(resumeFile.size / 1024).toFixed(1)} KB • Resume Loaded
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeResume}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {parsingResume && (
                <div className="mt-2 text-center text-xs text-indigo-600 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing resume content & extracting skills...</span>
                </div>
              )}
            </div>

            {/* Resume Parse Notification Banner */}
            {resumeParseSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resumeParseSuccess}</span>
              </div>
            )}

            <Select
              label="Experience Level"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              options={experienceOptions}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Input
                placeholder="Add custom interest..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
              />
              <Button type="button" variant="secondary" onClick={addCustomInterest}>
                Add
              </Button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {interests.map((i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md"
                  >
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {resumeFile && (
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                <span>Skills extracted from resume are pre-selected below. You can add or toggle more.</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {skillOptions.map((skill) => {
                const selected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      selected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Input
                placeholder="Add custom skill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              />
              <Button type="button" variant="secondary" onClick={addCustomSkill}>
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Select
              label="Target Role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              options={targetRoleOptions}
            />

            <Input
              label="What do you want to achieve?"
              placeholder="Get my first job"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={handlePrev} disabled={step === 1}>
          Back
        </Button>

        {step < 4 ? (
          <Button onClick={handleNext}>Next Step</Button>
        ) : (
          <Button onClick={startAnalysis} variant="primary" className="font-bold">
            <Zap className="w-4 h-4 mr-1.5" />
            Analyze My Career
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
