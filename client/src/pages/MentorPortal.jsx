import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import { 
  Compass, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Phone, 
  MessageSquare, 
  FileText, 
  Send,
  Sparkles,
  BookOpen,
  UserCheck,
  TrendingUp,
  ShieldAlert,
  Search
} from 'lucide-react';

export default function MentorPortal() {
  const { user } = useAuth();
  
  // Active Separate Page: 'mentees' | 'attendance' | 'advisories'
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['mentees', 'attendance', 'advisories'].includes(hash) ? hash : 'mentees';
  });

  const switchPage = (page) => {
    setActivePage(page);
    window.location.hash = page;
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['mentees', 'attendance', 'advisories'].includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState(null);
  const [mentorNote, setMentorNote] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [notesHistory, setNotesHistory] = useState([]);

  const fetchMentorGroups = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/mentor/groups');
      setGroups(res.groups || []);
    } catch (err) {
      console.error('Failed to load mentor groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorGroups();
  }, []);

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!mentorNote.trim() || !selectedStudentForNote) return;
    
    setNotesHistory(prev => [
      {
        id: Date.now(),
        studentName: selectedStudentForNote.name,
        studentEmail: selectedStudentForNote.email,
        note: mentorNote.trim(),
        date: new Date().toLocaleDateString()
      },
      ...prev
    ]);

    setNoteSuccess(true);
    setTimeout(() => {
      setNoteSuccess(false);
      setSelectedStudentForNote(null);
      setMentorNote('');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading Mentor Advisory Portal...</p>
      </div>
    );
  }

  const currentGroup = groups[selectedGroupIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* Mentor Identity Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Mentor Advisory Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{user.expertise || user.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Student Coaching & Mentorship
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Cohort: <strong className="text-slate-800">{currentGroup?.name}</strong> • Course: <strong>{currentGroup?.course?.title}</strong>
          </p>
        </div>

        {/* Cohort Selector */}
        {groups.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Cohort:</span>
            <select
              value={selectedGroupIdx}
              onChange={(e) => setSelectedGroupIdx(Number(e.target.value))}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer"
            >
              {groups.map((g, idx) => (
                <option key={g.id} value={idx}>
                  {g.name} ({g.students.length} Mentees)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Separate Pages Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => switchPage('mentees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'mentees'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Assigned Mentees</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'mentees' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {currentGroup?.students.length || 0}
          </span>
        </button>

        <button
          onClick={() => switchPage('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'attendance'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Attendance & Progress</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'attendance' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {currentGroup?.heldSessionsCount || 0} Held
          </span>
        </button>

        <button
          onClick={() => switchPage('advisories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'advisories'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Advisory Notes & Coaching</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'advisories' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {notesHistory.length} Notes
          </span>
        </button>
      </div>

      {/* =========================================================================
          PAGE 1: ASSIGNED MENTEES DIRECTORY
          ========================================================================= */}
      {activePage === 'mentees' && currentGroup && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Page 1 of 3</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Mentee Directory</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Assigned Cohort Mentees Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact details, individual attendance standing, and quick advisory action buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentGroup.students.map((student) => {
              const isAtRisk = student.attendanceRate < 75 && student.totalHeld > 0;
              return (
                <div key={student.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isAtRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isAtRisk ? 'Needs Attention' : 'Active Standing'}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {student.attendanceRate}% Attendance
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center">
                        {student.avatar || student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                        <span className="text-xs text-slate-500 font-mono block">{student.email}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <div>Phone: <strong className="font-mono text-slate-700">{student.phone || '+20 100 000 0000'}</strong></div>
                      <div>Attended: <strong className="text-slate-800">{student.attendedCount} of {student.totalHeld} sessions</strong></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedStudentForNote(student);
                        switchPage('advisories');
                      }}
                      className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Write Advisory Note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: ATTENDANCE & PROGRESS TRACKER
          ========================================================================= */}
      {activePage === 'attendance' && currentGroup && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Page 2 of 3</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Attendance Tracker</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Mentees Attendance & Progress Tracker</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of sessions attended out of total held in cohort {currentGroup.name}.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Attendance (Held Sessions)</th>
                    <th className="py-3.5 px-6">Attendance %</th>
                    <th className="py-3.5 px-6">Status / Risk</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentGroup.students.map((student) => {
                    const isAtRisk = student.attendanceRate < 75 && student.totalHeld > 0;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                            {student.avatar || student.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="block">{student.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">{student.email}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-800">
                          {student.attendedCount} of {student.totalHeld} sessions
                        </td>

                        <td className="py-4 px-6">
                          <span className={`font-bold ${
                            student.attendanceRate >= 85 ? 'text-emerald-700' : student.attendanceRate >= 75 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {student.attendanceRate}%
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isAtRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isAtRisk ? 'At Risk (<75%)' : 'Good Standing'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentForNote(student);
                              switchPage('advisories');
                            }}
                            className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
                          >
                            Add Note
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 3: ADVISORY NOTES & COACHING LOG
          ========================================================================= */}
      {activePage === 'advisories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Page 3 of 3</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Coaching Documentation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Advisory Guidance Notes & 1-on-1 Action Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record 1-on-1 coaching notes, homework follow-ups, and student intervention strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Note Writer Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Write New Advisory Note</h3>
              
              <form onSubmit={handleSaveNote} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Mentee</label>
                  <select
                    value={selectedStudentForNote?.id || ''}
                    onChange={(e) => {
                      const st = currentGroup?.students.find(s => s.id === e.target.value);
                      setSelectedStudentForNote(st || null);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">-- Choose a student --</option>
                    {currentGroup?.students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.attendanceRate}% Attendance)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guidance Note & Coaching Action</label>
                  <textarea
                    rows={4}
                    required
                    value={mentorNote}
                    onChange={(e) => setMentorNote(e.target.value)}
                    placeholder="Document coaching discussion, assignments makeup plan, or study recommendations..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {noteSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Advisory note saved to mentee coaching log!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedStudentForNote || !mentorNote.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Log Advisory Note</span>
                </button>
              </form>
            </div>

            {/* Past Notes History */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Coaching Log History ({notesHistory.length})</h3>

              {notesHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No advisory notes recorded yet. Write your first note on the left.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {notesHistory.map((n) => (
                    <div key={n.id} className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{n.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-purple-100/50">
                        {n.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
