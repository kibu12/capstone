'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { clearExistingCareerData, saveAssessment, saveCareerRecommendation, saveSkillGaps, saveRoadmapPhases, saveProjects, updateProfile, saveCourses, saveLearningResources, saveStudyMaterials, saveQuiz, saveInterviewAssessment } from '@/lib/supabase/queries';
import { runCareerAnalysis } from '@/lib/agents/orchestrator';
import { runLearningAgents } from '@/lib/agents/learning-agents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import AgentPipeline from '@/components/ai/AgentPipeline';

export default function AssessmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState('Beginner');
  
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  
  const [targetRole, setTargetRole] = useState('AI Engineer');
  const [careerGoal, setCareerGoal] = useState('Get my first job');

  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const startAnalysis = async () => {
    if (!userId) return;
    setAnalyzing(true);
    setPipelineStep(0);

    // Simulate Agent transitions for visual appeal
    const timer = (ms: number) => new Promise(res => setTimeout(res, ms));

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
        assessment_score: 75
      };

      // Run orchestrator
      const analysisState = await runCareerAnalysis(userId, profile, assessment);

      if (analysisState.errors && analysisState.errors.length > 0) {
        throw new Error(analysisState.errors[0]);
      }

      // Clear old details and write persistent DB values
      await clearExistingCareerData(userId);
      await saveAssessment(userId, assessment);
      
      if (analysisState.recommendation) {
        await saveCareerRecommendation(userId, analysisState.recommendation);
      }
      if (analysisState.skillGaps) {
        await saveSkillGaps(userId, analysisState.skillGaps.map(g => ({
          skill_name: g.skillName,
          current_level: g.currentLevel,
          required_level: g.requiredLevel,
          priority: g.priority,
          category: g.category,
          status: 'Not Started'
        })));
      }
      if (analysisState.roadmap?.phases) {
        await saveRoadmapPhases(userId, analysisState.roadmap.phases.map(p => ({
          title: p.title,
          description: p.description,
          duration: p.duration,
          phase: p.phaseNumber,
          skills: p.skills,
          resources: p.resources,
          status: 'Not Started',
          progress: 0
        })));
      }
      if (analysisState.projects) {
        await saveProjects(userId, analysisState.projects.map(p => ({
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          skills: p.skills,
          status: 'Not Started',
          estimated_time: p.estimated_time,
          portfolio_value: p.portfolio_value
        })));
      }

      // Update target profile meta metrics
      await updateProfile(userId, {
        target_role: targetRole,
        experience_level: experience,
        career_goal: careerGoal
      });

      // Run extended Learning Intelligence & Interview Agents
      const learningOutput = await runLearningAgents(analysisState);
      if (learningOutput) {
        const savedCourses = await saveCourses(userId, learningOutput.courses);
        const courseIdMap = savedCourses[0]?.id;

        await saveLearningResources(
          userId,
          learningOutput.learningResources.map(r => ({ ...r, course_id: courseIdMap }))
        );
        await saveStudyMaterials(
          userId,
          learningOutput.studyMaterials.map(m => ({ ...m, course_id: courseIdMap }))
        );

        for (const quizObj of learningOutput.quizzesWithQuestions) {
          const { questions, ...quizData } = quizObj;
          await saveQuiz(userId, { ...quizData, course_id: courseIdMap }, questions);
        }

        await saveInterviewAssessment(userId, learningOutput.interviewAssessment);
      }

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
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
        <h2 className="text-xl font-bold text-center text-slate-800">Analyzing your career profile...</h2>
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
          {step === 1 && 'Current Experience Level'}
          {step === 2 && 'Select your interests'}
          {step === 3 && 'Choose your skills'}
          {step === 4 && 'Target role & goals'}
        </CardTitle>
        <CardDescription>
          {step === 1 && 'Provide context to help customize matches'}
          {step === 2 && 'Pick what excites you'}
          {step === 3 && 'Select your existing tech stack'}
          {step === 4 && 'Identify career goals'}
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[220px]">
        {step === 1 && (
          <div className="space-y-4">
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
              {interestOptions.map(interest => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                      selected ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                {interests.map(i => (
                  <span key={i} className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {skillOptions.map(skill => {
                const selected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      selected ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                {skills.map(s => (
                  <span key={s} className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
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
          <Button onClick={startAnalysis}>Analyze My Career</Button>
        )}
      </CardFooter>
    </Card>
  );
}
