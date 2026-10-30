import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, demoLogin, loading } = useAuth();

  // Three separate states for each section
  const [studentEmail, setStudentEmail] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');

  const [errorStudent, setErrorStudent] = useState('');
  const [errorInstructor, setErrorInstructor] = useState('');
  const [errorMentor, setErrorMentor] = useState('');

  // Pre-configured demo accounts
  const demoAccounts = {
    student: {
      id: "usr_stu_1",
      name: "Omar Tarek",
      email: "omar.tarek@student.mec.edu",
      role: "student",
      avatar: "OT",
      phone: "+20 100 482 9101",
      department: "Cohort Alpha (Full Stack)"
    },
    student2: {
      id: "usr_stu_2",
      name: "Sarah Mansour",
      email: "sarah.mansour@student.mec.edu",
      role: "student",
      avatar: "SM",
      phone: "+20 101 883 4521",
      department: "Cohort Alpha (Full Stack)"
    },
    instructor: {
      id: "usr_inst_1",
      name: "Dr. Tarek Ezzat",
      email: "tarek.ezzat@mec.edu",
      role: "instructor",
      avatar: "TE",
      phone: "+20 100 223 9988",
      department: "Lead Engineering Faculty"
    },
    mentor: {
      id: "usr_men_1",
      name: "Ahmed Fathy",
      email: "ahmed.fathy@mec.edu",
      role: "mentor",
      avatar: "AF",
      phone: "+20 109 334 5511",
      department: "Full Stack Mentor"
    }
  };

  const handleRoleLogin = async (e, role, email, setError) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    try {
      await login({
        email,
        role,
        accessPath: 'learner'
      });
      // Navigation is triggered automatically via AuthContext in App.jsx
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between">
      
      {/* Top Banner with Staff Access Link */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-3 border-b border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Operations & Academic Supervisor
        </span>
        <span className="hidden sm:inline text-slate-500">|</span>
        <span className="hidden sm:inline">Academy leadership and operations staff access through a segregated path:</span>
        <button
          onClick={() => onNavigate('/admin')}
          className="underline font-bold text-white hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          Go to Staff & Supervisor Portal &rarr;
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full my-auto">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            MEC ACADEMY • UNIFIED LEARNER PORTALS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Role to Access Portal
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Log in directly through your designated role section. Each section strictly authenticates into that role's portal and pages.
          </p>
        </div>

        {/* The 3 Clearly Labeled Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* =========================================
              SECTION 1: STUDENTS
             ========================================= */}
          <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-sm hover:shadow-md transition-shadow border-2 border-emerald-500/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-emerald-50/50">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-100/70 text-emerald-800">
                  Learner Role
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">Student Portal</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review dynamic attendance ("X of Y sessions attended"), scan instructor QR codes to check in, and access grouped session materials & assignments.
              </p>

              {/* Error message */}
              {errorStudent && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorStudent}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={(e) => handleRoleLogin(e, 'student', studentEmail, setErrorStudent)} className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. omar.tarek@student.mec.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Authenticate as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Fast 1-Click Demo Accounts
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => demoLogin(demoAccounts.student)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      OT
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 block">Omar Tarek</span>
                      <span className="text-[10px] text-slate-500 font-mono">12 of 15 attended (Cohort Alpha)</span>
                    </div>
                  </div>
                  <span className="text-emerald-700 font-bold text-[11px]">Login &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => demoLogin(demoAccounts.student2)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                      SM
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 block">Sarah Mansour</span>
                      <span className="text-[10px] text-slate-500 font-mono">14 of 15 attended</span>
                    </div>
                  </div>
                  <span className="text-emerald-700 font-bold text-[11px]">Login &rarr;</span>
                </button>
              </div>
            </div>

          </div>


          {/* =========================================
              SECTION 2: INSTRUCTORS
             ========================================= */}
          <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-sm hover:shadow-md transition-shadow border-2 border-blue-500/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
            
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-4 ring-blue-50/50">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-100/70 text-blue-800">
                  Faculty Role
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">Instructor Portal</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generate real-time session QR codes for instant check-in and export comprehensive group Excel gradebooks with attendance, assignments & quizzes.
              </p>

              {/* Error message */}
              {errorInstructor && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorInstructor}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={(e) => handleRoleLogin(e, 'instructor', instructorEmail, setErrorInstructor)} className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instructor Email Address
                  </label>
                  <input
                    type="email"
                    value={instructorEmail}
                    onChange={(e) => setInstructorEmail(e.target.value)}
                    placeholder="e.g. tarek.ezzat@mec.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Authenticate as Instructor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Fast 1-Click Demo Accounts
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => demoLogin(demoAccounts.instructor)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      TE
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 block">Dr. Tarek Ezzat</span>
                      <span className="text-[10px] text-slate-500 font-mono">Lead Instructor (Full Stack)</span>
                    </div>
                  </div>
                  <span className="text-blue-700 font-bold text-[11px]">Login &rarr;</span>
                </button>
              </div>
            </div>

          </div>


          {/* =========================================
              SECTION 3: MENTORS
             ========================================= */}
          <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-sm hover:shadow-md transition-shadow border-2 border-purple-500/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-pink-500" />
            
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center ring-4 ring-purple-50/50">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-100/70 text-purple-800">
                  Advisory Role
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">Mentor Portal</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Track assigned group cohorts, identify at-risk learners (<span className="text-purple-700 font-semibold">&lt;75% attendance</span>), and provide targeted technical support.
              </p>

              {/* Error message */}
              {errorMentor && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMentor}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={(e) => handleRoleLogin(e, 'mentor', mentorEmail, setErrorMentor)} className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mentor Email Address
                  </label>
                  <input
                    type="email"
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    placeholder="e.g. ahmed.fathy@mec.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-purple-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Authenticate as Mentor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Fast 1-Click Demo Accounts
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => demoLogin(demoAccounts.mentor)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-300 transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                      AF
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 block">Ahmed Fathy</span>
                      <span className="text-[10px] text-slate-500 font-mono">Lead Mentor (Cohort Alpha)</span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-[11px]">Login &rarr;</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Segregated Access Info Card */}
        <div className="mt-12 bg-white rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Are you an Operations Staff Member or Academic Supervisor?</h4>
              <p className="text-xs text-slate-500">
                Staff administration, course catalog pricing, user enrollment, group linking, and oversight metrics require dedicated staff authentication.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/admin')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-2"
          >
            Access Staff Portal
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 bg-white/60 text-center text-xs text-slate-500">
        <p>© 2026 MEC Academy Learning Management System. Role-separated architecture.</p>
      </footer>

    </div>
  );
}
