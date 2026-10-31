import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import { 
  Eye, 
  Layers, 
  BookOpen, 
  Compass, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Search,
  Filter
} from 'lucide-react';

export default function SupervisorPortal() {
  const { user } = useAuth();
  
  // Active Separate Page: 'overview' | 'groups' | 'faculty' | 'radar'
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['overview', 'groups', 'faculty', 'radar'].includes(hash) ? hash : 'overview';
  });

  const switchPage = (page) => {
    setActivePage(page);
    window.location.hash = page;
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'groups', 'faculty', 'radar'].includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [flagModalStudent, setFlagModalStudent] = useState(null);
  const [advisoryNote, setAdvisoryNote] = useState('');
  const [advisorySuccess, setAdvisorySuccess] = useState('');

  const fetchOversight = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/supervisor/oversight');
      setData(res);
    } catch (err) {
      console.error('Failed to load supervisor oversight:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOversight();
  }, []);

  const handleIssueAdvisory = async (e) => {
    e.preventDefault();
    if (!flagModalStudent || !advisoryNote.trim()) return;

    try {
      const res = await apiRequest('/supervisor/action/flag-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: flagModalStudent.studentId,
          note: advisoryNote.trim()
        })
      });
      setAdvisorySuccess(res.message);
      setTimeout(() => {
        setAdvisorySuccess('');
        setFlagModalStudent(null);
        setAdvisoryNote('');
      }, 2500);
    } catch (err) {
      alert(err.message || 'Failed to dispatch advisory');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Compiling Academic Quality & Oversight Intelligence...</p>
      </div>
    );
  }

  const { kpis, groupsOverview, instructorMetrics, mentorMetrics, atRiskStudents } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* Supervisor Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl" />

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Academic Quality & Governance
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Academy Supervisory Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Institutional Oversight Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Read-focused cross-group analytics, instructor delivery fidelity, mentor workload, and student intervention radar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-300">{user.name}</span>
            <span className="text-[11px] text-slate-500 font-mono">Academic Director & Supervisor</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center ring-2 ring-rose-400/40">
            KM
          </div>
        </div>
      </div>

      {/* Separate Pages Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => switchPage('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'overview'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Academy KPIs & Highlights</span>
        </button>

        <button
          onClick={() => switchPage('groups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'groups'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cross-Group Matrix</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'groups' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {groupsOverview?.length || 0}
          </span>
        </button>

        <button
          onClick={() => switchPage('faculty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'faculty'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Faculty & Mentors Fidelity</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'faculty' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {(instructorMetrics?.length || 0) + (mentorMetrics?.length || 0)}
          </span>
        </button>

        <button
          onClick={() => switchPage('radar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'radar'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>At-Risk Intervention Radar</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            (atRiskStudents?.length || 0) > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {atRiskStudents?.length || 0}
          </span>
        </button>
      </div>

      {/* =========================================================================
          PAGE 1: ACADEMY KPIS & HIGHLIGHTS
          ========================================================================= */}
      {activePage === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Page 1 of 4</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Executive Performance Indicators</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Academy-Wide Health & Governance KPIs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-level overview of cohorts health, student retention, faculty coverage, and academy attendance.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Cohorts</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{kpis?.activeGroupsCount}</span>
              <span className="text-[10px] text-slate-500 font-mono">across all programs</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Learners</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{kpis?.totalEnrolledStudents}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% active standing</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Academy Attendance</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{kpis?.overallAvgAttendance}%</span>
              <span className="text-[10px] text-slate-500 font-mono">group-weighted average</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sessions Delivered</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">
                {kpis?.sessionsHeldAcrossAcademy}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">of {kpis?.sessionsPlannedAcrossAcademy} planned</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Faculty & Mentors</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {(kpis?.totalInstructors || 0) + (kpis?.totalMentors || 0)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{kpis?.totalInstructors} inst / {kpis?.totalMentors} men</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/30">
              <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">At-Risk Learners</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{kpis?.atRiskStudentsCount}</span>
              <span className="text-[10px] text-rose-700 font-semibold">&lt;75% attendance</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: CROSS-GROUP MATRIX
          ========================================================================= */}
      {activePage === 'groups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Page 2 of 4</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Cross-Cohort Analytics</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Cross-Group Academic Oversight Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive operational health across courses, linked instructors, mentors, and student cohorts.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Cohort Name</th>
                    <th className="py-3.5 px-6">Curriculum Course</th>
                    <th className="py-3.5 px-6">Lead Instructor</th>
                    <th className="py-3.5 px-6">Assigned Mentor</th>
                    <th className="py-3.5 px-6">Enrolled</th>
                    <th className="py-3.5 px-6">Sessions Held / Total</th>
                    <th className="py-3.5 px-6">Cohort Attendance</th>
                    <th className="py-3.5 px-6 text-right">Academic Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupsOverview?.map((grp) => (
                    <tr key={grp.groupId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {grp.groupName}
                        <span className="text-[10px] text-slate-400 block font-normal">{grp.schedule}</span>
                      </td>

                      <td className="py-4 px-6 text-slate-800">
                        <span className="font-semibold block">{grp.course?.title}</span>
                        <span className="text-[11px] text-emerald-700 font-mono font-bold">${grp.course?.price} USD</span>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-800">
                        {grp.instructor?.name}
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-800">
                        {grp.mentor?.name}
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {grp.studentCount} students
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-700">
                        <strong>{grp.sessionsHeld}</strong> / {grp.totalSessions} sessions
                      </td>

                      <td className="py-4 px-6">
                        <span className={`font-bold text-xs ${
                          grp.averageAttendanceRate >= 85 ? 'text-emerald-700' : grp.averageAttendanceRate >= 75 ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {grp.averageAttendanceRate}%
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          grp.health === 'Exemplary'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : grp.health === 'Needs Attention'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {grp.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 3: FACULTY & MENTORS FIDELITY
          ========================================================================= */}
      {activePage === 'faculty' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Page 3 of 4</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Delivery Quality Audit</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Faculty Delivery Oversight & Mentor Caseloads</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervise class attendance averages, lecture fidelity, and student advisory support ratios.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Faculty Delivery Oversight</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Sessions & Class Attendance</span>
              </div>

              <div className="space-y-3">
                {instructorMetrics?.map((inst) => (
                  <div key={inst.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{inst.name}</span>
                        <span className="text-[11px] text-slate-500">{inst.specialization}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {inst.sessionsDelivered} Sessions Taught
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span>Cohorts: <strong>{inst.groupsCount}</strong></span>
                      <span>Students: <strong>{inst.totalStudents}</strong></span>
                      <span>Avg Attendance: <strong className="text-emerald-700 font-bold">{inst.avgGroupAttendance}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">Mentor Caseload & Support Oversight</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Student Caseloads</span>
              </div>

              <div className="space-y-3">
                {mentorMetrics?.map((men) => (
                  <div key={men.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{men.name}</span>
                        <span className="text-[11px] text-slate-500">{men.expertise}</span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        men.flaggedMentees > 0 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {men.flaggedMentees} At-Risk Mentees
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span>Cohorts: <strong>{men.groupsCount}</strong></span>
                      <span>Mentees: <strong>{men.menteeCount} students</strong></span>
                      <span>Ratio: <strong className="text-purple-700 font-bold">1 : {men.menteeCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 4: AT-RISK RADAR
          ========================================================================= */}
      {activePage === 'radar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Page 4 of 4</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Student Intervention</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Student Retention & Risk Radar (&lt;75% Attendance)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct intervention engine to dispatch supervisory advisories and assign mentor follow-up sessions.
            </p>
          </div>

          {atRiskStudents?.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">All Learners in Good Standing!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No students currently have attendance below the 75% threshold across any cohort.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {atRiskStudents?.map((st) => (
                <div key={st.studentId} className="bg-white rounded-3xl p-5 border border-rose-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Attendance Alert
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-600">
                        {st.attendanceRate}% Attendance
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{st.studentName}</h3>
                    <span className="text-xs text-slate-500 font-mono block">{st.studentEmail}</span>
                    <span className="text-xs text-slate-600 block mt-1">Group: <strong>{st.groupName}</strong></span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">
                      Attended {st.sessionsAttended} of {st.totalHeldSessions}
                    </span>

                    <button
                      onClick={() => setFlagModalStudent(st)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    >
                      Issue Advisory
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advisory Modal */}
      {flagModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Issue Academic Advisory: {flagModalStudent.studentName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current attendance: <strong>{flagModalStudent.attendanceRate}%</strong> in {flagModalStudent.groupName}.
            </p>

            <form onSubmit={handleIssueAdvisory} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supervisor Advisory Note & Action Plan</label>
                <textarea
                  rows={4}
                  required
                  value={advisoryNote}
                  onChange={(e) => setAdvisoryNote(e.target.value)}
                  placeholder="Outline attendance warning, required makeup work, or mandatory mentor session..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {advisorySuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{advisorySuccess}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFlagModalStudent(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Advisory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
