import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Info
} from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, loading } = useAuth();

  // Three separate states for each role section
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [errorStudent, setErrorStudent] = useState('');

  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructorPassword, setInstructorPassword] = useState('');
  const [showInstructorPass, setShowInstructorPass] = useState(false);
  const [errorInstructor, setErrorInstructor] = useState('');

  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPassword, setMentorPassword] = useState('');
  const [showMentorPass, setShowMentorPass] = useState(false);
  const [errorMentor, setErrorMentor] = useState('');

  const handleRoleLogin = async (e, role, email, password, setError) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both your registered email and account password.');
      return;
    }

    try {
      await login({
        email: email.trim(),
        password: password.trim(),
        role,
        accessPath: 'learner'
      });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between">
      
      {/* Top Banner with Staff Access Link */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-3 border-b border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Operations Staff & Academic Supervisor
        </span>
        <span className="hidden sm:inline text-slate-500">|</span>
        <span className="hidden sm:inline">Academy leadership and operations staff access through a segregated path:</span>
        <button
          onClick={() => onNavigate('/admin')}
          className="underline font-bold text-white hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          Staff & Supervisor Access &rarr;
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full my-auto">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            MEC ACADEMY • SECURE LEARNER PORTALS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Role to Access Portal
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your registered academy credentials. Each section strictly authenticates into that role's portal and pages.
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
                Review dynamic attendance ("X of Y sessions attended"), scan instructor QR codes to check in, and access course deliverables.
              </p>

              {/* Error message */}
              {errorStudent && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorStudent}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={(e) => handleRoleLogin(e, 'student', studentEmail, studentPassword, setErrorStudent)} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. omar.tarek@student.mec.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showStudentPass ? "text" : "password"}
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPass(!showStudentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showStudentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Sign In as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Password can be changed inside your portal anytime.</span>
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
                Generate real-time session QR codes for instant check-in and export comprehensive group Excel gradebooks with attendance & quizzes.
              </p>

              {/* Error message */}
              {errorInstructor && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorInstructor}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={(e) => handleRoleLogin(e, 'instructor', instructorEmail, instructorPassword, setErrorInstructor)} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instructor Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={instructorEmail}
                    onChange={(e) => setInstructorEmail(e.target.value)}
                    placeholder="e.g. tarek.ezzat@mec.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showInstructorPass ? "text" : "password"}
                      required
                      value={instructorPassword}
                      onChange={(e) => setInstructorPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowInstructorPass(!showInstructorPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showInstructorPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Sign In as Instructor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Password can be changed inside your portal anytime.</span>
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
                Track assigned group cohorts, identify at-risk learners (&lt;75% attendance), and provide targeted technical support.
              </p>

              {/* Error message */}
              {errorMentor && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMentor}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={(e) => handleRoleLogin(e, 'mentor', mentorEmail, mentorPassword, setErrorMentor)} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mentor Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    placeholder="e.g. ahmed.fathy@mec.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showMentorPass ? "text" : "password"}
                      required
                      value={mentorPassword}
                      onChange={(e) => setMentorPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMentorPass(!showMentorPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showMentorPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-purple-200 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Sign In as Mentor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Password can be changed inside your portal anytime.</span>
            </div>

          </div>

        </div>

        {/* Security Note */}
        <div className="mt-10 max-w-xl mx-auto p-4 bg-white/80 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Default initial password for seed accounts is <code className="bg-slate-100 text-indigo-800 font-mono font-bold px-1.5 py-0.5 rounded">Mec@2026</code>. You can change it after signing in.</span>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 bg-white/60 text-center text-xs text-slate-500">
        <p>© 2026 MEC Academy Learning Management System. Role-separated secure architecture.</p>
      </footer>

    </div>
  );
}
