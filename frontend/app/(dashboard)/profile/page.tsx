'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  getProfile,
  updateProfile,
  getAssessment,
  saveAssessment,
  getCareerRecommendation,
  getSkillGaps,
  getRoadmap
} from '@/lib/supabase/queries';
import { formatSalaryInRupees } from '@/lib/utils/format';
import { UserProfile, CareerAssessment, CareerRecommendation, SkillGap, RoadmapPhase } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Shield,
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Loader2,
  X,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<CareerAssessment | null>(null);
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'insights' | 'security'>('profile');

  // Form State
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [careerGoal, setCareerGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Resume State
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showFullResumeText, setShowFullResumeText] = useState(false);
  const [resumeMessage, setResumeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [profData, assessData, recData, skillsData, roadmapData] = await Promise.all([
          getProfile(user.id),
          getAssessment(user.id),
          getCareerRecommendation(user.id),
          getSkillGaps(user.id),
          getRoadmap(user.id)
        ]);

        if (profData) {
          setProfile(profData);
          setFullName(profData.full_name || user.user_metadata?.full_name || '');
          setTargetRole(profData.target_role || recData?.recommended_role || '');
          setExperienceLevel(profData.experience_level || 'Beginner');
          setCareerGoal(profData.career_goal || '');
        } else {
          setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
        }

        if (assessData) {
          setAssessment(assessData);
          if (assessData.resume_filename) setResumeFileName(assessData.resume_filename);
          if (assessData.resume_text) setResumeText(assessData.resume_text);
        }

        // Check local storage fallback for resume
        try {
          const cachedFileName = localStorage.getItem('user_resume_filename');
          const cachedText = localStorage.getItem('user_resume_text');
          if (cachedFileName && !resumeFileName) setResumeFileName(cachedFileName);
          if (cachedText && !resumeText) setResumeText(cachedText);
        } catch (e) {}

        setRecommendation(recData);
        setSkillGaps(skillsData);
        setRoadmap(roadmapData);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateProfile(profile.id, {
        full_name: fullName,
        target_role: targetRole,
        experience_level: experienceLevel,
        career_goal: careerGoal
      });
      setSaveMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !profile) return;
    setUploadingResume(true);
    setResumeMessage(null);

    try {
      const text = await readFileText(file);
      setResumeFileName(file.name);
      setResumeText(text);

      try {
        localStorage.setItem('user_resume_filename', file.name);
        localStorage.setItem('user_resume_text', text);
      } catch (e) {}

      // Extracted Tech Skills
      const extractedSkills: string[] = [];
      const knownSkills = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'SQL', 'Node.js',
        'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Git', 'AWS',
        'Docker', 'Kubernetes', 'Figma', 'System Design', 'PostgreSQL', 'MongoDB'
      ];
      knownSkills.forEach((sk) => {
        const regex = new RegExp(`\\b${sk.replace('+', '\\+')}\\b`, 'i');
        if (regex.test(text)) extractedSkills.push(sk);
      });

      if (assessment) {
        const { user_id, ...assessmentBody } = assessment;
        await saveAssessment(profile.id, {
          ...assessmentBody,
          resume_filename: file.name,
          resume_text: text,
          skills: Array.from(new Set([...(assessment.skills || []), ...extractedSkills]))
        });
      }

      setResumeMessage({
        type: 'success',
        text: `Resume "${file.name}" uploaded & parsed! Auto-extracted ${extractedSkills.length} skills.`
      });
    } catch (err: any) {
      setResumeMessage({ type: 'error', text: err.message || 'Failed to parse resume.' });
    } finally {
      setUploadingResume(false);
    }
  };

  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        let rawText = '';
        if (typeof result === 'string') rawText = result;
        else if (result instanceof ArrayBuffer) rawText = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(result));
        else rawText = file.name;

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200/60 rounded-xl" />
        <div className="h-64 bg-slate-200/60 rounded-xl" />
      </div>
    );
  }

  const activeSkillsList = assessment?.skills || skillGaps.map((s) => s.skill_name);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Profile Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">{fullName}</h1>
            <Badge variant="primary" className="text-[10px]">
              {targetRole || 'Explorer'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{profile?.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/onboarding?retake=true">
            <Button variant="outline" size="sm" className="text-xs">
              Re-take Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Profile Settings
        </button>

        <button
          onClick={() => setActiveTab('resume')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'resume'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Resume & AI CV
          {resumeFileName && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'insights'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Career Insights
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Security
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Details & Objectives</CardTitle>
              <CardDescription>Update target role parameters</CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4 pt-2">
                {saveMessage && (
                  <div
                    className={`p-3 text-xs rounded-lg font-medium ${
                      saveMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSaving}
                  />

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="px-3 py-2 bg-slate-100 border border-slate-200/80 rounded-lg text-slate-500 text-xs font-medium font-mono">
                      {profile?.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Target Career Role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    disabled={isSaving}
                  />

                  <Select
                    label="Experience Level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    disabled={isSaving}
                    options={[
                      { value: 'Student', label: 'Student' },
                      { value: 'Beginner', label: 'Beginner (0-1 yrs)' },
                      { value: 'Junior Professional', label: 'Junior Professional (1-2 yrs)' },
                      { value: 'Mid-Level Professional', label: 'Mid-Level Professional (3+ yrs)' },
                      { value: 'Career Switcher', label: 'Career Switcher' }
                    ]}
                  />
                </div>

                <Input
                  label="Primary Goal"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  disabled={isSaving}
                />
              </CardContent>

              <CardFooter className="pt-2">
                <Button type="submit" size="sm" isLoading={isSaving} className="text-xs font-bold" variant="primary">
                  Save Profile Updates
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Quick Resume Card Widget in Profile Settings */}
          <Card className="flex flex-col justify-between shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Active Resume</CardTitle>
                {resumeFileName ? (
                  <Badge variant="success" className="text-[9px]">AI Synced</Badge>
                ) : (
                  <Badge variant="warning" className="text-[9px]">No File</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              {resumeFileName ? (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{resumeFileName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Parsed for AI Diagnostics</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  No resume file uploaded yet. Upload a resume to automatically extract your tech stack and power your diagnostic assessments.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('resume')}
                className="w-full text-xs font-semibold"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Manage Resume & AI CV
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: RESUME & AI CV */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-xs">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Uploaded Candidate Resume</CardTitle>
                  <CardDescription>
                    Resume text is processed by AI agents to construct your diagnostic assessments and career roadmap.
                  </CardDescription>
                </div>
                {resumeFileName && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    AI Synced
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5 text-xs">
              {resumeMessage && (
                <div
                  className={`p-3.5 text-xs rounded-xl font-semibold flex items-center gap-2 ${
                    resumeMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resumeMessage.text}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="p-5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="profile-resume-input"
                />

                <label
                  htmlFor="profile-resume-input"
                  className="flex flex-col items-center justify-center cursor-pointer text-center py-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-sm">
                    {uploadingResume ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {resumeFileName ? 'Replace Resume (PDF, DOCX, TXT)' : 'Upload Resume (PDF, DOCX, TXT)'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Automatically extracts tech stack, skills matrix, and experience background
                  </span>
                </label>
              </div>

              {/* Active Resume Card & Details */}
              {resumeFileName && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{resumeFileName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Extracted {activeSkillsList.length} candidate skills • Active for Diagnostic RAG Pipeline
                        </p>
                      </div>
                    </div>

                    <Link href="/onboarding?retake=true">
                      <Button size="sm" variant="primary" className="text-xs font-bold">
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Re-run Diagnostic
                      </Button>
                    </Link>
                  </div>

                  {/* Extracted Skills Matrix Pill Cloud */}
                  {activeSkillsList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Extracted Resume Tech Stack ({activeSkillsList.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeSkillsList.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-indigo-900 text-[11px] font-semibold rounded-lg shadow-2xs"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expandable Raw Resume Text Preview */}
                  {resumeText && (
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => setShowFullResumeText((prev) => !prev)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        {showFullResumeText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{showFullResumeText ? 'Hide Resume Text Content' : 'View Extracted Resume Text Content'}</span>
                      </button>

                      {showFullResumeText && (
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                          {(() => {
                            const isBinaryOrPdf =
                              resumeText.includes('%PDF') ||
                              resumeText.includes('\ufffd') ||
                              (resumeText.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g) || []).length > 10;

                            if (isBinaryOrPdf) {
                              const words = (resumeText.match(/[A-Za-z0-9+#.\-]{3,}/g) || [])
                                .filter(w => !['obj', 'endobj', 'stream', 'endstream', 'xref', 'FlateDecode', 'Linearized', 'Filter'].includes(w));
                              const cleanExcerpt = words.slice(0, 35).join(' ');

                              return `📄 FILE: ${resumeFileName || 'Resume.pdf'}\n` +
                                     `STATUS: AI Parsed & Synced for Diagnostic Pipeline\n\n` +
                                     `EXTRACTED TECH STACK (${activeSkillsList.length}):\n` +
                                     activeSkillsList.map(s => `  • ${s}`).join('\n');
                            }
                            return resumeText;
                          })()}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ATS Audit Shortcut Card */}
          <Card className="shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">ATS Resume Audit</CardTitle>
                <Badge variant="primary" className="text-[9px]">AI Scanner</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 text-xs">ATS Compatibility Audit</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Scans keyword density, section headers, action verbs, and experience depth against target role specs.
                </p>
              </div>

              <Link href="/ats-checker">
                <Button variant="primary" size="sm" className="w-full text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Launch ATS Resume Scanner
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: INSIGHTS */}
      {activeTab === 'insights' && recommendation && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Recommended Target Summary</CardTitle>
            <CardDescription>{recommendation.recommended_role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs text-slate-600">
            <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg leading-relaxed">
              {recommendation.summary}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1 text-center font-medium">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase block">Match Score</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{recommendation.career_score}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase block">Growth</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{recommendation.growth_rate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase block">Salary Benchmark</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {formatSalaryInRupees(recommendation.salary_range)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update authentication credentials</CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-3 pt-0">
              {passwordMessage && (
                <div
                  className={`p-3 text-xs rounded-lg font-medium ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </CardContent>

            <CardFooter className="pt-2">
              <Button type="submit" size="sm" isLoading={isUpdatingPassword} className="text-xs font-bold" variant="primary">
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
