'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Award, BookOpen, FolderHeart, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('Career Explorer');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setName(data.user.user_metadata?.full_name || data.user.email || 'Career Explorer');
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Analysis', path: '/analysis', icon: Award },
    { name: 'Skill Gap', path: '/skills', icon: BookOpen },
    { name: 'Roadmap', path: '/roadmap', icon: BookOpen },
    { name: 'Projects', path: '/projects', icon: FolderHeart },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between text-slate-300">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            CP
          </div>
          <span className="text-sm font-bold text-white tracking-tight uppercase">
            Pathfinder
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems.map(item => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  active ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-400 mb-2 truncate">
          Logged in as: <br />
          <span className="text-slate-200">{name}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded-lg transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
