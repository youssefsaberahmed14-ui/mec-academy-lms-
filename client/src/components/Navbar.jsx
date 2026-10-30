import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  LogOut, 
  ShieldCheck, 
  User, 
  Compass, 
  Sliders, 
  Eye
} from 'lucide-react';

export default function Navbar({ onNavigate, currentPath }) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <GraduationCap className="w-3.5 h-3.5" /> Student Portal
          </span>
        );
      case 'instructor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <BookOpen className="w-3.5 h-3.5" /> Instructor Portal
          </span>
        );
      case 'mentor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Compass className="w-3.5 h-3.5" /> Mentor Portal
          </span>
        );
      case 'operations':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Sliders className="w-3.5 h-3.5" /> Operations Portal
          </span>
        );
      case 'supervisor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Eye className="w-3.5 h-3.5" /> Supervisor Oversight
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">MEC ACADEMY</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">LMS</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Modern Engineering & Cloud Academy</p>
          </div>
        </div>

        {/* Center / Role indicator */}
        <div className="flex items-center gap-4">
          {user && getRoleBadge(user.role)}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                <span className="text-xs text-slate-500 font-mono truncate max-w-[180px]">{user.email}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center ring-2 ring-indigo-100 shadow-xs">
                {user.avatar || user.name.slice(0, 2).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg border border-slate-200 transition-colors"
                title="Sign out of portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentPath !== '/admin' && (
                <button
                  onClick={() => onNavigate('/admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Staff & Supervisor Access
                </button>
              )}
              {currentPath === '/admin' && (
                <button
                  onClick={() => onNavigate('/login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Learner & Instructor Login
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
