'use client';

import { useState } from 'react';
import { Search, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationDropdown } from './NotificationDropdown';
/* AUTH_DISABLED_TEMPORARILY (Supabase/StackAuth)
   REASON: Temporarily disabling remote auth for local testing.
   ROLLBACK_INSTRUCTIONS:
     - Remove surrounding comment markers on UserButton import and JSX usage.
     - Restore env vars and provider wrappers.
*/
// import { UserButton } from '@stackframe/stack';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled in real-time via onSearchChange
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      if (res.ok) {
        // The server will handle redirecting to login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <a href="/dashboard" aria-label="Go to dashboard" className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="w-8 h-1 bg-red-600 rounded"></div>
                <div className="w-8 h-1 bg-red-600 rounded"></div>
                <div className="w-8 h-1 bg-red-600 rounded"></div>
              </div>
              <span className="text-white text-xl font-semibold">Letushack</span>
            </a>

            <nav className="flex items-center gap-8">
              <a href="/leaderboard" className="text-white hover:text-gray-300 transition-colors">Leaderboard</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Courses</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Challenges</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Community</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-gray-900 text-white border border-gray-700 rounded-lg pl-12 pr-4 py-2.5 w-64 focus:outline-none focus:border-gray-600 transition-colors"
              />
            </form>

            <NotificationDropdown />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-900 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>

            {/* AUTH_DISABLED_TEMPORARILY: User menu hidden in guest mode. ROLLBACK: Uncomment UserButton below. */}
            {/**
            <div className="flex items-center">
              <UserButton />
            </div>
            */}
          </div>
        </div>
      </div>
    </header>
  );
}