'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  User,
  X,
  LayoutDashboard,
  Award,
  BookOpen,
  GraduationCap,
  Compass,
  HelpCircle,
  FolderHeart,
  CheckCircle,
  LogOut,
  ArrowRight,
  Zap,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface NavSearchItem {
  id: string;
  title: string;
  category: 'Workspace' | 'Intelligence' | 'Validation' | 'Actions';
  description: string;
  path: string;
  icon: any;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  // Dropdown States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // User State
  const [userName, setUserName] = useState('Explorer');
  const [userEmail, setUserEmail] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'RAG Pipeline Active',
      description: 'Vector database synced with latest job market trends.',
      time: '10m ago',
      unread: true,
      type: 'system',
    },
    {
      id: '2',
      title: 'Roadmap Milestone Unlocked',
      description: 'Phase 2: Distributed Systems Architecture is ready.',
      time: '1h ago',
      unread: true,
      type: 'achievement',
    },
    {
      id: '3',
      title: 'Skill Assessment Recommended',
      description: 'Take a quick 5-min quiz on System Design patterns.',
      time: '3h ago',
      unread: false,
      type: 'action',
    },
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect OS for shortcut label (⌘K vs Ctrl K)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

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

  // Global Keyboard Listener for Cmd/Ctrl + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchItems: NavSearchItem[] = [
    {
      id: 'dashboard',
      title: 'Overview',
      category: 'Workspace',
      description: 'Workspace summary, progress trackers, and recent activity.',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'analysis',
      title: 'Career Analysis',
      category: 'Workspace',
      description: 'RAG-powered career recommendations & salary benchmarks.',
      path: '/analysis',
      icon: Award,
    },
    {
      id: 'profile',
      title: 'Profile & Target Role',
      category: 'Workspace',
      description: 'Manage experience level, target role, and preferences.',
      path: '/profile',
      icon: User,
    },
    {
      id: 'skills',
      title: 'Skill Matrix',
      category: 'Intelligence',
      description: 'Identify technical skill gaps and required competencies.',
      path: '/skills',
      icon: BookOpen,
    },
    {
      id: 'learning',
      title: 'Learning Modules',
      category: 'Intelligence',
      description: 'Structured study resources, video tutorials, and docs.',
      path: '/learning',
      icon: GraduationCap,
    },
    {
      id: 'roadmap',
      title: 'Sequential Roadmap',
      category: 'Intelligence',
      description: 'Phased step-by-step milestone path for your goal.',
      path: '/roadmap',
      icon: Compass,
    },
    {
      id: 'quiz',
      title: 'MCQ Concept Assessments',
      category: 'Validation',
      description: 'Interactive quizzes to test and validate core concepts.',
      path: '/quiz',
      icon: HelpCircle,
    },
    {
      id: 'projects',
      title: 'Portfolio Opportunities',
      category: 'Validation',
      description: 'Hands-on capstone project briefs to showcase skills.',
      path: '/projects',
      icon: FolderHeart,
    },
    {
      id: 'interview',
      title: 'Interview Readiness',
      category: 'Validation',
      description: 'AI mock interview simulation and domain questions.',
      path: '/interview',
      icon: CheckCircle,
    },
    {
      id: 'onboarding-wizard',
      title: 'Run Career Assessment Wizard',
      category: 'Actions',
      description: 'Re-run full multi-agent diagnostic to update roadmap.',
      path: '/onboarding?retake=true',
      icon: Zap,
    },
  ];

  // Filter items by search query
  const filteredItems = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation within inline search dropdown
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelectSearchItem(filteredItems[selectedIndex].path);
    }
  };

  const handleSelectSearchItem = (path: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getPageDetails = (path: string) => {
    switch (path) {
      case '/dashboard':
        return { category: 'Workspace', title: 'Overview', icon: LayoutDashboard };
      case '/analysis':
        return { category: 'Workspace', title: 'Career Analysis', icon: Award };
      case '/profile':
        return { category: 'Workspace', title: 'Profile Settings', icon: User };
      case '/skills':
        return { category: 'Intelligence', title: 'Skill Matrix', icon: BookOpen };
      case '/learning':
        return { category: 'Intelligence', title: 'Learning Modules', icon: GraduationCap };
      case '/roadmap':
        return { category: 'Intelligence', title: 'Sequential Roadmap', icon: Compass };
      case '/quiz':
        return { category: 'Validation', title: 'MCQ Assessments', icon: HelpCircle };
      case '/projects':
        return { category: 'Validation', title: 'Portfolio Projects', icon: FolderHeart };
      case '/interview':
        return { category: 'Validation', title: 'Interview Readiness', icon: CheckCircle };
      case '/onboarding':
        return { category: 'Diagnostic', title: 'Career Wizard', icon: Zap };
      default:
        return { category: 'Dashboard', title: 'Career Pathfinder', icon: Sparkles };
    }
  };

  const pageInfo = getPageDetails(pathname);
  const PageIcon = pageInfo.icon;

  const unreadCount = notifications.filter((n) => n.unread).length;
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : 'CP';

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none sticky top-0 z-30 transition-all">
      {/* Left: Enhanced Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 min-w-0">
        <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/60 px-2 py-1 rounded-md text-slate-600 font-semibold">
          <PageIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{pageInfo.category}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold tracking-tight truncate">
          {pageInfo.title}
        </span>
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* INLINE EXPANDABLE SEARCH BAR IN HEADER */}
        <div className="relative" ref={searchContainerRef}>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all duration-200 ${
              isSearchOpen
                ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md w-56 sm:w-72 md:w-80'
                : 'bg-slate-100/90 border-slate-200/80 hover:border-slate-300 w-44 sm:w-56'
            }`}
          >
            <Search
              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                isSearchOpen ? 'text-indigo-600' : 'text-slate-400'
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
                setSelectedIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search workspace..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-sans text-xs"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 rounded-md shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-white border border-slate-200/90 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-sans shadow-2xs font-semibold shrink-0">
                {isMac ? '⌘K' : 'Ctrl K'}
              </kbd>
            )}
          </div>

          {/* INLINE AUTOCOMPLETE SEARCH DROPDOWN (Directly below search input) */}
          {isSearchOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredItems.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Search Results ({filteredItems.length})</span>
                      <span className="text-[9px] font-normal lowercase text-slate-400">↑ ↓ to navigate</span>
                    </div>

                    {filteredItems.map((item, index) => {
                      const ItemIcon = item.icon;
                      const isSelected = index === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSearchItem(item.path)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            <ItemIcon className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-semibold text-xs truncate">
                                {item.title}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 uppercase tracking-wider ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {item.category}
                              </span>
                            </div>
                          </div>

                          <ArrowRight
                            className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                              isSelected ? 'translate-x-0.5 text-white' : 'opacity-0'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                    No matching workspace tools found for "{searchQuery}"
                  </div>
                )}
              </div>

              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>↵ Select</span>
                <span>ESC to close</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Interactive Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Menu */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs hover:bg-slate-50/80 transition-colors flex gap-2.5 ${
                      n.unread ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'system' ? (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      ) : n.type === 'achievement' ? (
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-900 truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  href="/analysis"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1"
                >
                  View All Intelligence Reports <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {userInitials}
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate font-mono">{userEmail || 'Active User'}</p>
              </div>

              <div className="p-1 space-y-0.5 text-xs">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Target Role</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Overview Dashboard</span>
                </Link>
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
