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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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

      {/* Oversight KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Cohorts</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{kpis?.activeGroupsCount}</span>
          <span className="text-[10px] text-slate-500 font-mono">across all programs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Learners</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{kpis?.totalEnrolledStudents}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">100% active standing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Academy Attendance</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{kpis?.overallAvgAttendance}%</span>
          <span className="text-[10px] text-slate-500 font-mono">group-weighted average</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sessions Delivered</span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {kpis?.sessionsHeldAcrossAcademy}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">of {kpis?.sessionsPlannedAcrossAcademy} planned</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Faculty & Mentors</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {kpis?.totalInstructors + kpis?.totalMentors}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{kpis?.totalInstructors} inst / {kpis?.totalMentors} men</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/30">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">At-Risk Learners</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{kpis?.atRiskStudentsCount}</span>
          <span className="text-[10px] text-rose-700 font-semibold">&lt;75% attendance</span>
        </div>

      </div>

      {/* ========================================================
          1. CROSS-GROUP OVERSIGHT MATRIX
         ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Cross-Group Academic Oversight Matrix</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive operational health across courses, linked instructors, mentors, and student cohorts.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            Read-focused oversight
          </span>
        </div>

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

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        TE
                      </div>
                      <span className="font-medium text-slate-800">{grp.instructor?.name}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px]">
                        AF
                      </div>
                      <span className="font-medium text-slate-800">{grp.mentor?.name}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-semibold text-slate-900">
                    {grp.studentCount} students
                  </td>

                  <td className="py-4 px-6 font-mono text-slate-700">
                    <strong>{grp.sessionsHeld}</strong> / {grp.totalSessions} sessions
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs ${
                        grp.averageAttendanceRate >= 85 ? 'text-emerald-700' : grp.averageAttendanceRate >= 75 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {grp.averageAttendanceRate}%
                      </span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            grp.averageAttendanceRate >= 85 ? 'bg-emerald-500' : grp.averageAttendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(grp.averageAttendanceRate, 100)}%` }}
                        />
                      </div>
                    </div>
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

      {/* ========================================================
          2. INSTRUCTOR FIDELITY & MENTOR CASELOAD OVERSIGHT
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Instructor Performance Breakdown */}
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
              <div key={inst.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{inst.name}</span>
                    <span className="text-[11px] text-slate-500">{inst.specialization}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {inst.sessionsDelivered} Sessions Taught
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
                  <span>Groups Assigned: <strong>{inst.groupsCount}</strong></span>
                  <span>Students Reached: <strong>{inst.totalStudents}</strong></span>
                  <span>Avg Class Attendance: <strong className="text-emerald-700 font-bold">{inst.avgGroupAttendance}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Caseload & At-Risk Support */}
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
              <div key={men.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
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

                <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
                  <span>Groups Mentored: <strong>{men.groupsCount}</strong></span>
                  <span>Total Mentees: <strong>{men.menteeCount} students</strong></span>
                  <span>Support Ratio: <strong className="text-purple-700 font-bold">1 : {men.menteeCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================
          3. STUDENT RISK RADAR & SUPERVISOR ADVISORY ACTIONS
         ======================================================== */}
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xs p-6 space-y-4 bg-gradient-to-br from-white via-rose-50/10 to-rose-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Risk Radar (&lt;75% Attendance Threshold)</h3>
              <p className="text-xs text-slate-500">
                Academy supervisor actions: issue academic advisories and notify course instructors & mentors.
              </p>
            </div>
          </div>
        </div>

        {atRiskStudents?.length > 0 ? (
          <div className="space-y-3">
            {atRiskStudents.map((st) => (
              <div 
                key={st.studentId}
                className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{st.studentName}</span>
                    <span className="text-[11px] font-mono text-slate-500">({st.studentEmail})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      Attendance: {st.attendanceRate}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span>Cohort: <strong>{st.groupName}</strong></span>
                    <span>•</span>
                    <span>Attendance: <strong className="text-rose-700">{st.attendanceSummary}</strong></span>
                    <span>•</span>
                    <span>Instructor: <strong>{st.instructorName}</strong></span>
                    <span>•</span>
                    <span>Mentor: <strong>{st.mentorName}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => setFlagModalStudent(st)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Supervisor Advisory</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            All enrolled students currently meet the required 75% attendance threshold.
          </p>
        )}
      </div>

      {/* Advisory Modal */}
      {flagModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Issue Official Academic Advisory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: <strong className="text-slate-800">{flagModalStudent.studentName}</strong> ({flagModalStudent.attendanceRate}% attendance).
            </p>

            {advisorySuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Advisory Dispatched!</h4>
                <p className="text-xs text-slate-500">{advisorySuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleIssueAdvisory} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supervisory Notice Content & Remediation Mandate
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={advisoryNote}
                    onChange={(e) => setAdvisoryNote(e.target.value)}
                    placeholder="Enter academic warning or required catch-up assignments before cohort graduation..."
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFlagModalStudent(null)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Issue Advisory</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
