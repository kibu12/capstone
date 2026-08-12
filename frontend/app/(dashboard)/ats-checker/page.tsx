'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getAssessment, getProfile } from '@/lib/supabase/queries';
import { scanResumeATS, ATSScanResult } from '@/lib/ats/ats-scanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  FileCheck,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Loader2,
  XCircle,
  Mail,
  Phone,
  Globe,
  Award
} from 'lucide-react';

export default function ATSCheckerPage() {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');

  const [targetRoleTitle, setTargetRoleTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [scanResult, setScanResult] = useState<ATSScanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function initData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [assessData, profData] = await Promise.all([
          getAssessment(user.id),
          getProfile(user.id)
        ]);

        if (profData?.target_role) {
          setTargetRoleTitle(profData.target_role);
        }

        if (assessData?.resume_text) {
          setResumeText(assessData.resume_text);
          if (assessData.resume_filename) setResumeFileName(assessData.resume_filename);
        }

        // LocalStorage fallback
        try {
          const cachedFileName = localStorage.getItem('user_resume_filename');
          const cachedText = localStorage.getItem('user_resume_text');
          if (cachedFileName && !resumeFileName) setResumeFileName(cachedFileName);
          if (cachedText && !resumeText) setResumeText(cachedText);
        } catch (e) {}
      }
      setLoading(false);
    }
    initData();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setResumeFileName(file.name);

    try {
      const text = await readFileText(file);
      setResumeText(text);
      try {
        localStorage.setItem('user_resume_filename', file.name);
        localStorage.setItem('user_resume_text', text);
      } catch (e) {}
    } catch (err) {
      console.error('File reading error:', err);
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

  const runATSScan = async () => {
    setScanning(true);
    await new Promise((res) => setTimeout(res, 600));

    const textToScan = resumeText || 'Managed project development, created software features, reduced errors by 25%. Skills: Python, SQL, Git, Excel, Management.';
    const result = scanResumeATS(textToScan, targetRoleTitle, jobDescription);
    setScanResult(result);
    setScanning(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200/60 rounded-2xl" />
        <div className="h-64 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Universal General ATS Checker</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit any resume for general ATS compatibility, structure, action verbs, and contact legibility
            </p>
          </div>
        </div>

        <Button onClick={runATSScan} variant="primary" isLoading={scanning} className="text-xs font-bold">
          <Zap className="w-4 h-4 mr-1.5" />
          Run General ATS Audit
        </Button>
      </div>

      {/* Upload & Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Resume Box */}
        <Card className="lg:col-span-2 shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm">Upload Resume (PDF, DOCX, TXT)</CardTitle>
            <CardDescription>Select any resume file for instant general ATS scanning</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {resumeFileName ? (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{resumeFileName}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Resume Loaded for General Audit</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Ready to Audit</Badge>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Upload a resume file below to run an instant ATS scan.</span>
              </div>
            )}

            <div className="p-5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="general-ats-upload"
              />
              <label
                htmlFor="general-ats-upload"
                className="flex flex-col items-center justify-center cursor-pointer text-center py-2"
              >
                <UploadCloud className="w-6 h-6 text-indigo-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">
                  {resumeFileName ? 'Replace Resume File' : 'Upload Resume File (PDF, DOCX, TXT)'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Universal ATS parsing engine accepts any role or resume format
                </span>
              </label>
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100">
            <Button
              onClick={runATSScan}
              variant="primary"
              isLoading={scanning}
              className="w-full text-xs font-bold"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Audit Resume for ATS Compatibility
            </Button>
          </CardFooter>
        </Card>

        {/* Optional Job Title or JD Filter */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm">Optional Target Filters</CardTitle>
            <CardDescription>Optional: add role title or JD for custom keyword analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <Input
              label="Target Job Title (Optional)"
              placeholder="e.g. Software Engineer, Project Manager"
              value={targetRoleTitle}
              onChange={(e) => setTargetRoleTitle(e.target.value)}
            />

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Target Job Description (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Paste optional job description text to check custom keyword density..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-sans leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GENERAL ATS AUDIT RESULTS */}
      {scanResult && (
        <div className="space-y-6 animate-fade-in pt-2">
          {/* Main Overall ATS Score Hero Header */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1 bg-slate-900 text-white border-slate-800 shadow-xl flex flex-col items-center justify-center text-center p-6">
              <div className="relative flex items-center justify-center my-2">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-950/50">
                  <span className="text-3xl font-black tracking-tight text-white">
                    {scanResult.overallScore}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-300 mt-2 uppercase tracking-wider">
                General ATS Score
              </span>
              <div className="mt-2">
                {scanResult.overallScore >= 80 ? (
                  <Badge variant="success" className="text-[10px]">Excellent General ATS Compatibility</Badge>
                ) : scanResult.overallScore >= 60 ? (
                  <Badge variant="warning" className="text-[10px]">Good Compatibility</Badge>
                ) : (
                  <Badge variant="danger" className="text-[10px]">Needs Optimization</Badge>
                )}
              </div>
            </Card>

            {/* 4 Universal Core Metric Breakdown Bars */}
            <Card className="lg:col-span-3 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm">Universal ATS Metrics Breakdown</CardTitle>
                <CardDescription>{scanResult.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Structure & Standard Section Headers</span>
                    <span>{scanResult.formattingScore}%</span>
                  </div>
                  <Progress value={scanResult.formattingScore} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Keyword & Vocabulary Density</span>
                    <span>{scanResult.keywordScore}%</span>
                  </div>
                  <Progress value={scanResult.keywordScore} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Action Verbs & Measurable Metrics</span>
                    <span>{scanResult.impactScore}%</span>
                  </div>
                  <Progress value={scanResult.impactScore} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Readability & Contact Information</span>
                    <span>{scanResult.readabilityScore}%</span>
                  </div>
                  <Progress value={scanResult.readabilityScore} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & General Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Header Verification */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm">Contact Information Indexing</CardTitle>
                <CardDescription>Essential contact fields detected for automated ATS parsing</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${scanResult.contactInfoFound.email ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{scanResult.contactInfoFound.email ? 'Email Found' : 'Missing Email'}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${scanResult.contactInfoFound.phone ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <Phone className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{scanResult.contactInfoFound.phone ? 'Phone Found' : 'Missing Phone'}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${scanResult.contactInfoFound.linkedin ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{scanResult.contactInfoFound.linkedin ? 'LinkedIn Found' : 'No LinkedIn Link'}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${scanResult.contactInfoFound.githubOrPortfolio ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{scanResult.contactInfoFound.githubOrPortfolio ? 'Portfolio/GitHub' : 'No Portfolio Link'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Domain & Professional Keywords */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm">Extracted Industry Keywords ({scanResult.extractedKeywords.length})</CardTitle>
                <CardDescription>Domain & technical terms recognized by ATS algorithms</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {scanResult.extractedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.extractedKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-100 text-[11px] font-bold rounded-lg"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Upload a resume to extract industry keywords.</p>
                )}

                {scanResult.actionVerbsFound.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Power Action Verbs Found ({scanResult.actionVerbsFound.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.actionVerbsFound.map((verb, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md capitalize">
                          {verb}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actionable General ATS Recommendations */}
          <Card className="shadow-xs border-indigo-100">
            <CardHeader className="bg-indigo-50/40 pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm">General ATS Optimization Plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {scanResult.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 bg-white border border-slate-200/80 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
