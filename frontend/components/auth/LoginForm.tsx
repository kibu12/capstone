'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Trophy,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getCareerRecommendation } from '@/lib/supabase/queries';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingUserEmail, setExistingUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setExistingUserEmail(data.user.email || 'another user');
      }
    });
  }, []);

  const handleSignOutCurrent = async () => {
    await supabase.auth.signOut();
    setExistingUserEmail(null);
    try {
      localStorage.clear();
    } catch (e) {}
    router.push('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      await supabase.auth.signOut();

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        setExistingUserEmail(null);
        const rec = await getCareerRecommendation(data.user.id);
        if (rec) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
        return;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-blue-600 selection:text-white">
      {/* ─── LEFT PANEL: BRIGHT LIGHT VISUAL SHOWCASE ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/60 p-12 xl:p-16 flex-col justify-between overflow-hidden border-r border-slate-200/80">
        {/* Subtle Background Grid & Ambient Orbs */}
        <div className="absolute top-0 left-0 w-full h-full bg-creative-grid opacity-40 pointer-events-none" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Lockup */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight font-display">
                CareerPath
              </span>
              <span className="text-slate-300 font-light">|</span>
              <span className="text-sm font-medium text-slate-600">
                Learning
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Visual Showcase Cards */}
        <div className="relative z-10 my-8 space-y-6 max-w-lg">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold mb-3.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Intelligence Platform</span>
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 font-display leading-tight">
              Architect your tech career with precision AI.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Track your 4-stage roadmap, run ATS resume scans, complete applied code blueprints, and practice AI mock interviews.
            </p>
          </div>

          {/* Clean White Elevated Preview Cards */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">4-Pillar ATS Resume Diagnostic</div>
                  <div className="text-[11px] text-slate-500">Validated against production vector criteria</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">AI Mock Interview Simulator</div>
                  <div className="text-[11px] text-slate-500">Real-time rubric grading &amp; trade-off critique</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Checklist */}
        <div className="relative z-10 flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-6 border-t border-slate-200/80">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Access
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Private Row-Level Security
          </span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: CLEAN AUTH FORM ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-md p-6 sm:p-8">
          {/* Mobile Brand Icon */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-900 font-display">CareerPath</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Enter your credentials to access your personalized roadmap.
            </p>
          </div>

          {/* Session Switcher Alert if Already Logged In */}
          {existingUserEmail && (
            <div className="mb-5 p-3.5 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 truncate">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Active: <strong>{existingUserEmail}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleSignOutCurrent}
                className="text-[11px] font-bold text-amber-700 underline hover:text-amber-900 shrink-0 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-slate-50/60 hover:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 font-sans">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-slate-50/60 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign Up */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
