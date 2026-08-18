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
  getRoadmap,
} from '@/lib/supabase/queries';
import { formatSalaryInRupees } from '@/lib/utils/format';
import { scanResumeATS, ATSScanResult } from '@/lib/ats/ats-scanner';
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
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  Award,
  Check,
  Plus,
  HelpCircle,
  RefreshCw,
  Lightbulb,
  FileCheck,
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

  // Integrated Mandatory ATS State
  const [atsResult, setAtsResult] = useState<ATSScanResult | null>(null);
  const [isScanningATS, setIsScanningATS] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Perform background ATS evaluation
  const runBackgroundATS = (text: string, roleTitle: string) => {
    if (!text || text.trim().length < 20) return;
    setIsScanningATS(true);
    try {
      const result = scanResumeATS(text, roleTitle || 'AI Engineer');
      setAtsResult(result);
      try {
        localStorage.setItem('user_ats_scan_result', JSON.stringify(result));
      } catch (e) {}
    } catch (err) {
      console.warn('Background ATS evaluation error:', err);
    } finally {
      setIsScanningATS(false);
    }
  };

  useEffect(() => {
    // Check URL search params on client for tab switching
    try {
      const params = new URLSearchParams(window.location.search);
      const requestedTab = params.get('tab');
      if (requestedTab === 'resume' || requestedTab === 'insights' || requestedTab === 'security') {
        setActiveTab(requestedTab);
      }
    } catch (e) {}

    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [profData, assessData, recData, skillsData, roadmapData] = await Promise.all([
          getProfile(user.id),
          getAssessment(user.id),
          getCareerRecommendation(user.id),
          getSkillGaps(user.id),
          getRoadmap(user.id),
        ]);

        let loadedTargetRole = 'AI Engineer';

        if (profData) {
          setProfile(profData);
          setFullName(profData.full_name || user.user_metadata?.full_name || '');
          loadedTargetRole = profData.target_role || recData?.recommended_role || 'AI Engineer';
          setTargetRole(loadedTargetRole);
          setExperienceLevel(profData.experience_level || 'Beginner');
          setCareerGoal(profData.career_goal || '');
        } else {
          setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
        }

        let currentResumeText = '';
        let currentResumeFile = '';

        if (assessData) {
          setAssessment(assessData);
          if (assessData.resume_filename) currentResumeFile = assessData.resume_filename;
          if (assessData.resume_text) currentResumeText = assessData.resume_text;
        }

        // Local storage fallback for resume
        try {
          const cachedFileName = localStorage.getItem('user_resume_filename');
          const cachedText = localStorage.getItem('user_resume_text');
          if (cachedFileName && !currentResumeFile) currentResumeFile = cachedFileName;
          if (cachedText && !currentResumeText) currentResumeText = cachedText;
        } catch (e) {}

        if (currentResumeFile) setResumeFileName(currentResumeFile);
        if (currentResumeText) {
          setResumeText(currentResumeText);
          // Run mandatory background ATS evaluation automatically
          runBackgroundATS(currentResumeText, loadedTargetRole);
        }

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
        career_goal: careerGoal,
      });
      setSaveMessage({ type: 'success', text: 'Profile updated successfully.' });

      // Re-run ATS evaluation with new target role in background
      if (resumeText) {
        runBackgroundATS(resumeText, targetRole);
      }
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
        'Python',
        'Java',
        'JavaScript',
        'TypeScript',
        'React',
        'SQL',
        'Node.js',
        'Machine Learning',
        'Deep Learning',
        'PyTorch',
        'TensorFlow',
        'Git',
        'AWS',
        'Docker',
        'Kubernetes',
        'Figma',
        'System Design',
        'PostgreSQL',
        'MongoDB',
        'RAG',
        'LLMs',
        'REST APIs',
        'FastAPI',
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
          skills: Array.from(new Set([...(assessment.skills || []), ...extractedSkills])),
        });
      }

      // Execute Mandatory Background ATS Scan
      runBackgroundATS(text, targetRole || recommendation?.recommended_role || 'AI Engineer');

      setResumeMessage({
        type: 'success',
        text: `Resume "${file.name}" uploaded, parsed, and evaluated against ATS standards! Auto-extracted ${extractedSkills.length} technical skills.`,
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
        else if (result instanceof ArrayBuffer)
          rawText = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(result));
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
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto p-4">
        <div className="h-20 bg-slate-200/70 rounded-2xl" />
        <div className="h-64 bg-slate-200/70 rounded-2xl" />
      </div>
    );
  }

  const activeSkillsList = assessment?.skills || skillGaps.map((s) => s.skill_name);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Top Profile Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{fullName}</h1>
            <Badge variant="primary" className="text-xs px-2.5 py-0.5">
              {targetRole || 'Explorer'}
            </Badge>
            {atsResult && (
              <Badge variant="success" className="text-[10px] font-bold">
                ATS Score: {atsResult.overallScore}/100
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">{profile?.email}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/onboarding?retake=true">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Re-take Full Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Settings
        </button>

        <button
          onClick={() => setActiveTab('resume')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'resume'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Resume & ATS Diagnostics
          {resumeFileName ? (
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-emerald-100 text-emerald-800">
              {atsResult ? `${atsResult.overallScore}%` : 'Uploaded'}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-amber-100 text-amber-800">
              Mandatory
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'insights'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Career Insights
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* ─── TAB 1: PROFILE SETTINGS ─── */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-xs">
            <CardHeader className="border-b border-slate-100/90 pb-4">
              <CardTitle className="text-sm font-bold">Profile Details & Career Objectives</CardTitle>
              <CardDescription className="text-xs">
                Update your candidate parameters, experience tier, and target role benchmarks
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4 pt-4 text-xs">
                {saveMessage && (
                  <div
                    className={`p-3 text-xs rounded-xl font-medium ${
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
                      { value: 'Career Switcher', label: 'Career Switcher' },
                    ]}
                  />
                </div>

                <Input
                  label="Primary Career Goal"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  disabled={isSaving}
                />
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <Button type="submit" size="sm" isLoading={isSaving} className="text-xs font-bold" variant="primary">
                  Save Profile Updates
                </Button>
                <span className="text-[11px] text-slate-400 font-mono">
                  Saves auto-trigger background ATS sync
                </span>
              </CardFooter>
            </form>
          </Card>

          {/* Quick Resume & ATS Widget in Profile Settings */}
          <div className="space-y-6">
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Mandatory Resume Status</CardTitle>
                  {resumeFileName ? (
                    <Badge variant="success" className="text-[9px]">Verified & Synced</Badge>
                  ) : (
                    <Badge variant="warning" className="text-[9px]">Action Required</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs">
                {resumeFileName ? (
                  <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">{resumeFileName}</p>
                        <p className="text-[10px] text-slate-500">Evaluated against {targetRole || 'AI Engineer'}</p>
                      </div>
                    </div>

                    {atsResult && (
                      <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>ATS Compliance Rating:</span>
                        <span className="text-indigo-600 font-extrabold">{atsResult.overallScore}/100</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Resume Upload Mandatory</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      Upload your resume to enable ATS evaluation, keyword matching, and accurate skill verification.
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('resume')}
                  className="w-full text-xs font-bold"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  View Full ATS Diagnostic & Optimization
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB 2: RESUME & INTEGRATED ATS DIAGNOSTICS ─── */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          {/* Top Mandatory Status / Dropzone Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Resume Ingestion & Status */}
            <Card className="lg:col-span-2 shadow-xs">
              <CardHeader className="border-b border-slate-100/90 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold">Candidate Resume & Document Ingestion</CardTitle>
                    <CardDescription className="text-xs">
                      Mandatory resume profile evaluated automatically by the background ATS scoring pipeline
                    </CardDescription>
                  </div>
                  {resumeFileName && (
                    <Badge variant="success" className="flex items-center gap-1 self-start sm:self-auto">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ATS Diagnostic Active
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-5 text-xs">
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
                <div className="p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl transition-all">
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
                    <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2.5 shadow-sm">
                      {uploadingResume ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {resumeFileName ? 'Replace Current Resume (PDF, DOCX, TXT)' : 'Upload Mandatory Resume (PDF, DOCX, TXT)'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 max-w-sm">
                      Auto-extracts contact headers, technical competencies, action verbs, and executes background ATS audit
                    </span>
                  </label>
                </div>

                {/* Active Resume Bar */}
                {resumeFileName && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{resumeFileName}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Extracted {activeSkillsList.length} candidate skills • Evaluated for {targetRole || 'AI Engineer'}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runBackgroundATS(resumeText, targetRole || 'AI Engineer')}
                      isLoading={isScanningATS}
                      className="text-xs font-semibold self-start sm:self-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      Re-Scan ATS
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right 1 Col: Overall Score & Contact Legibility */}
            <Card className="shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">ATS Compliance Rating</CardTitle>
                  <Badge variant="primary" className="text-[9px]">Background Audit</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-xs">
                {atsResult ? (
                  <div className="space-y-4">
                    {/* Score Circle & Title */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-100 rounded-2xl text-center space-y-1.5">
                      <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block font-mono">
                        Overall Compatibility
                      </span>
                      <div className="text-3xl font-extrabold text-indigo-950">
                        {atsResult.overallScore}
                        <span className="text-xs text-indigo-400 font-bold ml-0.5">/100</span>
                      </div>
                      <p className="text-[11px] text-indigo-700 font-medium">
                        {atsResult.overallScore >= 80
                          ? '✨ High ATS Pass Probability'
                          : atsResult.overallScore >= 60
                          ? '⚡ Good Foundation • Optimization Recommended'
                          : '⚠️ Key Formatting & Keyword Gaps Detected'}
                      </p>
                    </div>

                    {/* Contact Info Detection */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Contact Header Parsability
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 text-[11px] font-semibold ${
                            atsResult.contactInfoFound.email
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email: {atsResult.contactInfoFound.email ? 'Found' : 'Missing'}</span>
                        </div>

                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 text-[11px] font-semibold ${
                            atsResult.contactInfoFound.phone
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Phone: {atsResult.contactInfoFound.phone ? 'Found' : 'Missing'}</span>
                        </div>

                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 text-[11px] font-semibold ${
                            atsResult.contactInfoFound.linkedin
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>LinkedIn: {atsResult.contactInfoFound.linkedin ? 'Found' : 'Missing'}</span>
                        </div>

                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 text-[11px] font-semibold ${
                            atsResult.contactInfoFound.githubOrPortfolio
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>GitHub: {atsResult.contactInfoFound.githubOrPortfolio ? 'Found' : 'Missing'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 space-y-2 border-2 border-dashed rounded-xl">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No ATS Diagnostic Yet</p>
                    <p className="text-[11px]">Upload your resume above to run the automatic background audit.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── ATS DETAILED BREAKDOWN & OPTIMIZATION PLAYBOOK ─── */}
          {atsResult && (
            <div className="space-y-6">
              {/* 4-Pillar Score Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">1. Section Structure</span>
                    <span className="text-xs font-black text-indigo-600">{atsResult.formattingScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${atsResult.formattingScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Standard headings: Experience, Skills, Education, Projects
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">2. Keyword Alignment</span>
                    <span className="text-xs font-black text-indigo-600">{atsResult.keywordScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${atsResult.keywordScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Target skills matched against {targetRole || 'AI Engineer'} specs
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">3. Measurable Impact</span>
                    <span className="text-xs font-black text-indigo-600">{atsResult.impactScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${atsResult.impactScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Quantified metrics (%, $, x) and strong action verbs
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">4. Parser Legibility</span>
                    <span className="text-xs font-black text-indigo-600">{atsResult.readabilityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${atsResult.readabilityScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Contact headers, clean text decoding, length balance
                  </p>
                </div>
              </div>

              {/* Keyword Intelligence Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detected Keywords */}
                <Card className="shadow-xs">
                  <CardHeader className="border-b border-slate-100/90 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <CardTitle className="text-xs font-bold">
                          Detected Keywords in Resume ({atsResult.extractedKeywords.length})
                        </CardTitle>
                      </div>
                      <Badge variant="success" className="text-[9px]">Verified</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {atsResult.extractedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.extractedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No standard domain keywords detected.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Missing Recommended Keywords */}
                <Card className="shadow-xs">
                  <CardHeader className="border-b border-slate-100/90 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-indigo-600" />
                        <CardTitle className="text-xs font-bold">
                          High-Impact Keywords to Add for {targetRole || 'AI Engineer'}
                        </CardTitle>
                      </div>
                      <Badge variant="primary" className="text-[9px]">Recommended</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {atsResult.missingSuggestions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.missingSuggestions.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-indigo-600" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {['PyTorch', 'Vector Databases', 'RAG Pipelines', 'Docker', 'Kubernetes', 'CI/CD'].map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-indigo-600" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ─── ACTIONABLE HOW TO IMPROVE PLAYBOOK ─── */}
              <Card className="shadow-xs bg-gradient-to-b from-white to-slate-50/50">
                <CardHeader className="border-b border-slate-100/90 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Actionable ATS Optimization & Improvement Guide
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Concrete rules and proven formulas to elevate your resume ranking on corporate ATS parsers (Workday, Greenhouse, Lever)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-xs">
                  {/* Dynamic Automated Recommendations */}
                  {atsResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono">
                        Targeted Priority Fixes For Your Resume
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {atsResult.recommendations.map((rec, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white border border-slate-200/90 rounded-xl flex items-start gap-2.5 shadow-2xs"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4 Best Practice Playbook Cards */}
                  <div className="pt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-mono">
                      Universal ATS Optimization Playbook
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Formula Card */}
                      <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                          <Zap className="w-4 h-4 text-indigo-600" />
                          <span>The High-Impact Bullet Point Formula</span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          Structure every work and project bullet point using this 3-part framework:
                        </p>
                        <div className="p-2.5 bg-white rounded-xl border border-indigo-100 font-mono text-[11px] text-indigo-900 font-bold">
                          [Action Verb] + [Technical Tool/Task] + [Measurable Business Metric / %]
                        </div>
                        <p className="text-[10px] text-slate-500 italic">
                          Example: &quot;Architected an end-to-end RAG pipeline using Python and pgvector, reducing search query latency by 45% across 20k daily requests.&quot;
                        </p>
                      </div>

                      {/* Formatting Rules */}
                      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>Formatting &amp; Layout Best Practices</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-600">
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Single Column Format:</strong> Avoid complex multi-column sidebars, text boxes, and tables that trip ATS scanners.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Standard Headings:</strong> Use clear titles like &quot;Professional Experience&quot;, &quot;Technical Skills&quot;, &quot;Projects&quot;, and &quot;Education&quot;.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Keyword Placement Strategy */}
                      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span>Strategic Keyword Placement</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-600">
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span><strong>Skills Matrix at Top:</strong> List your core languages, frameworks, and cloud tools right below your summary for immediate parser indexing.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span><strong>Contextual Repetition:</strong> Mention core technologies naturally inside project and job descriptions to boost contextual relevance score.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Contact Header Checklist */}
                      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                          <Globe className="w-4 h-4 text-sky-600" />
                          <span>Contact Header &amp; Hyperlinks</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-600">
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                            <span>Include plain text email and phone number (avoid embedding contact info inside images or SVG logos).</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                            <span>Provide clean URLs for LinkedIn (<code>linkedin.com/in/username</code>) and GitHub / Portfolio.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Extracted Text */}
                  {resumeText && (
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => setShowFullResumeText((prev) => !prev)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        {showFullResumeText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{showFullResumeText ? 'Hide Extracted Resume Text Content' : 'View Extracted Resume Text Content'}</span>
                      </button>

                      {showFullResumeText && (
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                          {(() => {
                            const isBinaryOrPdf =
                              resumeText.includes('%PDF') ||
                              resumeText.includes('\ufffd') ||
                              (resumeText.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g) || []).length > 10;

                            if (isBinaryOrPdf) {
                              const words = (resumeText.match(/[A-Za-z0-9+#.\-]{3,}/g) || []).filter(
                                (w) =>
                                  ![
                                    'obj',
                                    'endobj',
                                    'stream',
                                    'endstream',
                                    'xref',
                                    'FlateDecode',
                                    'Linearized',
                                    'Filter',
                                  ].includes(w)
                              );
                              return (
                                `📄 FILE: ${resumeFileName || 'Resume.pdf'}\n` +
                                `STATUS: Evaluated by Background ATS Engine\n\n` +
                                `EXTRACTED TECH STACK (${activeSkillsList.length}):\n` +
                                activeSkillsList.map((s) => `  • ${s}`).join('\n')
                              );
                            }
                            return resumeText;
                          })()}
                        </pre>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: CAREER INSIGHTS ─── */}
      {activeTab === 'insights' && recommendation && (
        <Card className="max-w-3xl shadow-xs">
          <CardHeader className="border-b border-slate-100/90 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Recommended Target Role Summary</CardTitle>
                <CardDescription className="text-xs">{recommendation.recommended_role}</CardDescription>
              </div>
              <Badge variant="primary" className="text-xs">{recommendation.recommended_role}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs text-slate-600">
            <p className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl leading-relaxed text-slate-800 font-medium">
              {recommendation.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-center font-medium">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Career Match Score</span>
                <span className="text-base font-extrabold text-indigo-600 mt-0.5 block">
                  {recommendation.career_score}%
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Market Growth Rate</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {recommendation.growth_rate}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Compensation</span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                  {formatSalaryInRupees(recommendation.salary_range)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── TAB 4: SECURITY ─── */}
      {activeTab === 'security' && (
        <Card className="max-w-md shadow-xs">
          <CardHeader className="border-b border-slate-100/90 pb-4">
            <CardTitle className="text-sm font-bold">Change Password</CardTitle>
            <CardDescription className="text-xs">Update your authentication credentials</CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-3 pt-4">
              {passwordMessage && (
                <div
                  className={`p-3 text-xs rounded-xl font-medium ${
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

            <CardFooter className="pt-2 border-t border-slate-100">
              <Button
                type="submit"
                size="sm"
                isLoading={isUpdatingPassword}
                className="text-xs font-bold"
                variant="primary"
              >
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
