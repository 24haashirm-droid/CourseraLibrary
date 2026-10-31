import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  PlusCircle,
  GraduationCap,
  ShieldCheck,
  Puzzle,
  LogOut,
  LogIn,
  User
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenSubmitModal,
  onOpenAuthModal,
  pendingCount = 0
}) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('library')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Course<span className="text-indigo-600">Finder</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  Academic 20+ / 30+
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Smart Global Library for Long-Duration Courses • <span className="text-indigo-600 font-semibold">Created by Areeb</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Global Library
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('my-learning')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'my-learning'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                My Learning
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-50 text-amber-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Admin Panel
                {pendingCount > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('extension')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'extension'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Puzzle className="w-4 h-4 text-emerald-600" />
              Browser Extension
            </button>
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* Submit Course Button */}
            <button
              onClick={onOpenSubmitModal}
              className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Contribute Course
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {user.role === 'admin' ? (
                      <span className="text-amber-600 font-semibold">Administrator</span>
                    ) : (
                      'Student'
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
