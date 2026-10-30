import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import QRGeneratorModal from '../components/QRGeneratorModal';
import { 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  QrCode, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ChevronRight, 
  GraduationCap, 
  Sparkles,
  Search,
  Check,
  X,
  RefreshCw,
  Award
} from 'lucide-react';

export default function InstructorPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Active session for QR modal
  const [qrModalSession, setQrModalSession] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  // Fetch instructor's groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/instructor/groups');
      setGroups(res.groups || []);
      if (res.groups && res.groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(res.groups[0].id);
      }
    } catch (err) {
      console.error('Failed to load instructor groups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full details of the active group
  const fetchGroupDetails = async (groupId) => {
    if (!groupId) return;
    try {
      setDetailsLoading(true);
      const res = await apiRequest(`/instructor/group/${groupId}/details`);
      setGroupDetails(res);
    } catch (err) {
      console.error('Failed to load group details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupDetails(selectedGroupId);
    }
  }, [selectedGroupId]);

  // Handle Excel Export (Requirement: Excel export with registered students, attendance per session, assignment submissions, quiz submissions)
  const handleExcelExport = async () => {
    if (!selectedGroupId) return;
    setIsExporting(true);
    setExportNotice('');
    try {
      const blob = await apiRequest(`/instructor/group/${selectedGroupId}/export-excel`, {
        responseType: 'blob'
      });
      
      const groupName = groupDetails?.group?.name || 'Group';
      const cleanName = groupName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `MEC_Group_${cleanName}_Report.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportNotice(`Successfully exported ${filename} with 4 sheets (Roster, Attendance, Assignments, Quizzes).`);
      setTimeout(() => setExportNotice(''), 6000);
    } catch (err) {
      alert('Excel export error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Manual Attendance Toggle
  const handleToggleAttendance = async (sessionId, studentId, currentAttended) => {
    try {
      await apiRequest(`/instructor/session/${sessionId}/toggle-attendance`, {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          attended: !currentAttended
        })
      });
      // Refresh current details to update rosters and metrics
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert('Error updating attendance: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading Instructor Teaching Dashboard...</p>
      </div>
    );
  }

  const activeGroupSummary = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Instructor Identity & Group Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Instructor Faculty Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{user.department || user.specialization}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Group Attendance & Grading Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Cohort: <strong className="text-slate-800">{activeGroupSummary?.name}</strong>
          </p>
        </div>

        {/* Group Selector & Excel Export Action */}
        <div className="flex flex-wrap items-center gap-3">
          {groups.length > 1 && (
            <select
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}

          {/* ========================================================
              EXCEL EXPORT BUTTON (Requirement: "Provide an Excel export for the instructor's groups containing: all registered students, attendance per session, assignment submissions, and quiz submissions where the course uses quizzes.")
             ======================================================== */}
          <button
            onClick={handleExcelExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span>Export Group Gradebook (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification */}
      {exportNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      {activeGroupSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Registered Students</span>
              <span className="text-2xl font-black text-slate-900">{activeGroupSummary.studentsCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Sessions Completed</span>
              <span className="text-2xl font-black text-slate-900">
                {activeGroupSummary.heldSessionsCount} <span className="text-xs text-slate-400 font-normal">of {activeGroupSummary.sessionsCount}</span>
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Average Attendance</span>
              <span className="text-2xl font-black text-emerald-600">
                {activeGroupSummary.averageAttendanceRate}%
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Quizzes Configured</span>
              <span className="text-2xl font-black text-amber-700">
                {activeGroupSummary.course?.hasQuizzes ? 'Enabled' : 'None'}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Main Content Area: Sessions List with QR Generation & Roster */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sessions & Live QR Code Generator</h2>
            <p className="text-xs text-slate-500">
              Generate dynamic session check-in QR codes for students to scan in class, and review verified attendance.
            </p>
          </div>
        </div>

        {detailsLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Loading session rosters...
          </div>
        ) : groupDetails?.sessions ? (
          <div className="space-y-4">
            {groupDetails.sessions.map((session) => {
              const isHeld = session.status === 'held';
              const attendeesCount = session.attendeesCount || 0;
              const totalStudents = session.totalStudents || groupDetails.students.length;
              const sessionRate = totalStudents > 0 ? Math.round((attendeesCount / totalStudents) * 100) : 0;

              return (
                <div 
                  key={session.id} 
                  className={`bg-white rounded-2xl border p-5 transition-all ${
                    isHeld ? 'border-slate-200 shadow-xs' : 'border-dashed border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Session Info */}
                    <div className="flex items-start gap-3.5">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isHeld ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        S{session.sessionNumber}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Session {session.sessionNumber}
                          </span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {session.date}
                          </span>
                          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {session.startTime} - {session.endTime}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isHeld ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {session.title}
                        </h3>
                      </div>
                    </div>

                    {/* QR Code Action & Live Roster Stats */}
                    <div className="flex flex-wrap items-center gap-3">
                      
                      {/* Attendance Counter Pill */}
                      <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span><strong>{attendeesCount}</strong> of {totalStudents} present</span>
                        <span className="text-slate-400">({sessionRate}%)</span>
                      </div>

                      {/* ========================================================
                          GENERATE QR CODE BUTTON (Requirement: "Let the instructor generate a QR code for a session so students can scan it to record attendance.")
                         ======================================================== */}
                      <button
                        onClick={() => setQrModalSession(session)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-indigo-600" />
                        <span>Generate / Display QR Code</span>
                      </button>

                    </div>

                  </div>

                  {/* Student Attendance Roster for this session */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Session Student Roster (Instant Verification & Manual Override)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {session.roster?.map((st) => (
                        <div 
                          key={st.studentId}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-colors ${
                            st.attended 
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-semibold block truncate">{st.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono truncate">
                              {st.checkInMethod === 'qr_scan' ? '⚡ QR Verified' : st.attended ? 'Manual check' : 'Absent'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleAttendance(session.id, st.studentId, st.attended)}
                            title={st.attended ? 'Mark as absent' : 'Mark as present'}
                            className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              st.attended 
                                ? 'bg-emerald-600 text-white hover:bg-rose-600' 
                                : 'bg-slate-200 text-slate-600 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            {st.attended ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* QR Generator Modal */}
      {qrModalSession && (
        <QRGeneratorModal
          isOpen={Boolean(qrModalSession)}
          session={qrModalSession}
          groupId={selectedGroupId}
          onClose={() => setQrModalSession(null)}
          onSessionUpdated={(updated) => {
            fetchGroupDetails(selectedGroupId);
          }}
        />
      )}

    </div>
  );
}
