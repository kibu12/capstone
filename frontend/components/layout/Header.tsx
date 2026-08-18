'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  GraduationCap,
  HelpCircle,
  FolderHeart,
  CheckCircle,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Zap,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Dropdown States
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // User State
  const [userName, setUserName] = useState('Explorer');
  const [userEmail, setUserEmail] = useState('');

  const learningRef = useRef<HTMLDivElement>(null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch current user details
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(
          data.user.user_metadata?.full_name ||
            data.user.email?.split('@')[0] ||
            'Explorer'
        );
        setUserEmail(data.user.email || '');
      }
    });
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsLearningOpen(false);
    setIsPracticeOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Global Keyboard Listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLearningOpen(false);
        setIsPracticeOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        learningRef.current &&
        !learningRef.current.contains(event.target as Node)
      ) {
        setIsLearningOpen(false);
      }
      if (
        practiceRef.current &&
        !practiceRef.current.contains(event.target as Node)
      ) {
        setIsPracticeOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : 'CP';

  const isLearningActive =
    pathname.startsWith('/learning') ||
    pathname.startsWith('/skills') ||
    pathname.startsWith('/roadmap');
  const isPracticeActive =
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/interview');

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 select-none shadow-2xs w-full">
      <div className="w-full h-full px-6 md:px-8 flex items-center justify-between gap-4 relative">
        {/* Left: Google Learning Style Brand Lockup */}
        <div className="flex items-center shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">
                CareerPath
              </span>
              <span className="text-slate-300 font-light">|</span>
              <span className="text-sm font-medium text-slate-600">
                Learning
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Google-Style Clean Navigation Tabs */}
        <nav className="hidden lg:flex items-center justify-center space-x-1 text-sm absolute left-1/2 -translate-x-1/2">
          {/* Overview */}
          <Link
            href="/dashboard"
            className={`px-3.5 py-2 rounded-full transition-colors font-medium text-xs md:text-sm ${
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview
          </Link>

          {/* Career Match */}
          <Link
            href="/analysis"
            className={`px-3.5 py-2 rounded-full transition-colors font-medium text-xs md:text-sm ${
              pathname === '/analysis'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Career Match
          </Link>

          {/* Learning & Roadmap Dropdown */}
          <div className="relative" ref={learningRef}>
            <button
              onClick={() => {
                setIsLearningOpen((prev) => !prev);
                setIsPracticeOpen(false);
              }}
              className={`px-3.5 py-2 rounded-full transition-colors font-medium text-xs md:text-sm flex items-center gap-1 cursor-pointer ${
                isLearningActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Learning &amp; Roadmap</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isLearningOpen ? 'rotate-180' : 'opacity-60'
                }`}
              />
            </button>

            {isLearningOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/learning"
                  onClick={() => setIsLearningOpen(false)}
                  className={`p-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors ${
                    pathname.startsWith('/learning') || pathname.startsWith('/skills')
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Skills &amp; Learning Hub</div>
                    <div className="text-[10px] text-slate-500 font-normal">Skill matrix &amp; study guides</div>
                  </div>
                </Link>

                <Link
                  href="/roadmap"
                  onClick={() => setIsLearningOpen(false)}
                  className={`p-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors ${
                    pathname === '/roadmap'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Career Roadmap</div>
                    <div className="text-[10px] text-slate-500 font-normal">Sequential milestone path</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Practice & Builds Dropdown */}
          <div className="relative" ref={practiceRef}>
            <button
              onClick={() => {
                setIsPracticeOpen((prev) => !prev);
                setIsLearningOpen(false);
              }}
              className={`px-3.5 py-2 rounded-full transition-colors font-medium text-xs md:text-sm flex items-center gap-1 cursor-pointer ${
                isPracticeActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Practice &amp; Builds</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isPracticeOpen ? 'rotate-180' : 'opacity-60'
                }`}
              />
            </button>

            {isPracticeOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/quiz"
                  onClick={() => setIsPracticeOpen(false)}
                  className={`p-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors ${
                    pathname === '/quiz'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">MCQ Assessments</div>
                    <div className="text-[10px] text-slate-500 font-normal">Diagnostic concept tests</div>
                  </div>
                </Link>

                <Link
                  href="/projects"
                  onClick={() => setIsPracticeOpen(false)}
                  className={`p-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors ${
                    pathname === '/projects'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <FolderHeart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Portfolio Capstones</div>
                    <div className="text-[10px] text-slate-500 font-normal">Industry-grade project specs</div>
                  </div>
                </Link>

                <Link
                  href="/interview"
                  onClick={() => setIsPracticeOpen(false)}
                  className={`p-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors ${
                    pathname === '/interview'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Interview Simulator</div>
                    <div className="text-[10px] text-slate-500 font-normal">Mock practice &amp; scoring</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Google-Style User Profile & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="User Profile"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
                {userInitials}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50">
                  <p className="font-semibold text-slate-900 truncate">{userName}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail || 'Active User'}</p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile &amp; Target Role</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Overview Dashboard</span>
                  </Link>
                  <Link
                    href="/onboarding?retake=true"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                  >
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Re-take Assessment</span>
                  </Link>
                </div>

                <div className="p-1.5 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── MOBILE SLIDE-DOWN MENU ─── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl space-y-1.5 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>Overview</span>
          </Link>

          <Link
            href="/analysis"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Career Match</span>
          </Link>

          <Link
            href="/learning"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Skills &amp; Learning</span>
          </Link>

          <Link
            href="/roadmap"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Career Roadmap</span>
          </Link>

          <Link
            href="/quiz"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>MCQ Assessments</span>
          </Link>

          <Link
            href="/projects"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <FolderHeart className="w-4 h-4 text-emerald-600" />
            <span>Portfolio Projects</span>
          </Link>

          <Link
            href="/interview"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <CheckCircle className="w-4 h-4 text-amber-600" />
            <span>Interview Simulator</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 text-slate-800"
          >
            <User className="w-4 h-4 text-slate-600" />
            <span>Profile &amp; Settings</span>
          </Link>
        </div>
      )}
    </header>
  );
}
