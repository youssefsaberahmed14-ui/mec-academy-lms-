import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Sliders, 
  Eye, 
  EyeOff,
  ArrowRight, 
  Lock, 
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Info
} from 'lucide-react';

export default function StaffLoginPage({ onNavigate }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('operations'); // 'operations' | 'supervisor'
  const [errorMessage, setErrorMessage] = useState('');

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both your staff email and password.');
      return;
    }

    try {
      await login({
        email: email.trim(),
        password: password.trim(),
        role: selectedRole,
        accessPath: 'staff'
      });
    } catch (err) {
      setErrorMessage(err.message || 'Staff authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-sm">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white">MEC ACADEMY</span>
            <span className="text-[11px] text-slate-400 block font-mono">STAFF & GOVERNANCE ACCESS GATEWAY</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/login')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Learner Login</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto px-4 py-8 my-auto">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Staff Authentication</h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted portal for Operations Administration & Academic Supervisor Oversight.
            </p>
          </div>

          {/* Role selector tab */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => setSelectedRole('operations')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'operations'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Operations</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('supervisor')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'supervisor'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Supervisor</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Staff Academy Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'operations' ? 'mariam.samir@mec.edu' : 'khaled.masry@mec.edu'}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Access Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your staff password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                selectedRole === 'operations'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <span>Authenticate as {selectedRole === 'operations' ? 'Operations Staff' : 'Academy Supervisor'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secure Hint */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Default seed password is <code className="bg-slate-950 text-indigo-300 font-mono px-1 py-0.5 rounded">Mec@2026</code>.</span>
          </div>

        </div>

      </main>

      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-600">
        MEC Academy Administrative Architecture • Secure Access Control
      </footer>

    </div>
  );
}
