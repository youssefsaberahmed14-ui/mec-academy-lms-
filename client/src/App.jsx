import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import StudentPortal from './pages/StudentPortal';
import InstructorPortal from './pages/InstructorPortal';
import MentorPortal from './pages/MentorPortal';
import OperationsPortal from './pages/OperationsPortal';
import SupervisorPortal from './pages/SupervisorPortal';

function AppContent() {
  const { user, logout } = useAuth();
  
  // Simple client-side path tracking (handles browser history & direct links)
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname === '/admin' ? '/admin' : '/login';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname === '/admin' ? '/admin' : '/login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // If not authenticated: show either Learner 3-section Login or Staff Login
  if (!user) {
    if (currentPath === '/admin') {
      return (
        <StaffLoginPage onNavigate={navigateTo} />
      );
    }
    return (
      <LoginPage onNavigate={navigateTo} />
    );
  }

  // If authenticated: strictly role-separated portal rendering
  const renderRolePortal = () => {
    switch (user.role) {
      case 'student':
        return <StudentPortal />;
      case 'instructor':
        return <InstructorPortal />;
      case 'mentor':
        return <MentorPortal />;
      case 'operations':
        return <OperationsPortal />;
      case 'supervisor':
        return <SupervisorPortal />;
      default:
        return (
          <div className="p-8 text-center text-rose-600 font-bold">
            Unrecognized role: {user.role}. Please log out and sign in with a valid account.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar onNavigate={navigateTo} currentPath={currentPath} />
      
      <main className="flex-1 pb-16">
        {renderRolePortal()}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 MEC Academy • Unified Learning Management System</span>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Role: <strong className="text-slate-700 capitalize">{user.role}</strong></span>
            <span>•</span>
            <span>User: <strong className="text-slate-700">{user.name}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
