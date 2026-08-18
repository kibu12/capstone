'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Award, 
  BookOpen, 
  FolderHeart, 
  User, 
  LogOut, 
  GraduationCap, 
  HelpCircle, 
  CheckCircle,
  FileCheck,
  Compass,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('Explorer');
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Explorer');
        setEmail(data.user.email || '');
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navGroups = [
    {
      label: 'WORKSPACE',
      items: [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Career Analysis', path: '/analysis', icon: Award },
        { name: 'Profile Settings', path: '/profile', icon: User },
      ]
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { name: 'Skills & Learning Hub', path: '/learning', icon: GraduationCap },
        { name: 'Sequential Roadmap', path: '/roadmap', icon: Compass },
      ]
    },
    {
      label: 'VALIDATION & BUILDS',
      items: [
        { name: 'MCQ Assessments', path: '/quiz', icon: HelpCircle },
        { name: 'Portfolio Capstones', path: '/projects', icon: FolderHeart },
        { name: 'Interview Readiness', path: '/interview', icon: CheckCircle },
      ]
    }
  ];

  const initials = name ? name.substring(0, 2).toUpperCase() : 'CP';

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-slate-800/80 flex flex-col justify-between text-slate-300 shrink-0 select-none">
      <div className="p-4 space-y-6">
        {/* Workspace Brand Header */}
        <div className="px-2 py-2 flex items-center justify-between border-b border-slate-800/80 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
              CP
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100 tracking-tight leading-none group-hover:text-indigo-400 transition-colors">
                Career Pathfinder
              </span>
            </div>
          </Link>
        </div>

        {/* Categorized Navigation Groups */}
        <div className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                {group.label}
              </span>

              {group.items.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <span className={`relative flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      active 
                        ? 'bg-gradient-to-r from-indigo-900/60 to-slate-850 text-white shadow-sm border border-indigo-500/30' 
                        : 'hover:bg-slate-900/80 hover:text-slate-100 text-slate-400'
                    }`}>
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-glow" />
                      )}
                      <span className="flex items-center gap-2.5">
                        <item.icon className={`h-4 w-4 transition-colors ${active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                        {item.name}
                      </span>
                      {active ? (
                        <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Diagnostic Wizard Action Pill */}
        <div className="px-2 pt-2">
          <Link
            href="/onboarding?retake=true"
            className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-700/40 rounded-xl hover:border-indigo-500/60 transition-all text-xs font-semibold text-indigo-200 group"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Re-run Diagnostic</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* User Account Footer Card */}
      <div className="p-3 m-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-500/40 flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-2xs">
            {initials}
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-bold text-slate-200 truncate">{name}</span>
            <span className="text-[10px] text-slate-400 truncate font-mono">{email}</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
