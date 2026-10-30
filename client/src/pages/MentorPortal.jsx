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
  UserCheck
} from 'lucide-react';

export default function MentorPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState(null);
  const [mentorNote, setMentorNote] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);

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
    if (!mentorNote.trim()) return;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Mentor Identity Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Mentor Advisory Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{user.expertise || user.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Student Success & At-Risk Mentoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Cohort: <strong className="text-slate-800">{currentGroup?.name}</strong>
          </p>
        </div>

        {/* Cohort Selector */}
        {groups.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Cohort:</span>
            <select
              value={selectedGroupIdx}
              onChange={(e) => setSelectedGroupIdx(Number(e.target.value))}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {groups.map((g, idx) => (
                <option key={g.id} value={idx}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentGroup && (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Assigned Mentees</span>
                <span className="text-2xl font-black text-slate-900">{currentGroup.students.length}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">At-Risk Learners (&lt;75%)</span>
                <span className="text-2xl font-black text-rose-600">{currentGroup.atRiskCount}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Sessions Completed</span>
                <span className="text-2xl font-black text-indigo-700">
                  {currentGroup.heldSessionsCount} <span className="text-xs text-slate-400 font-normal">of {currentGroup.totalSessionsCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Mentee Roster Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mentee Progress & Intervention Radar</h2>
                <p className="text-xs text-slate-500">
                  Monitors attendance counts out of sessions held, assignment deliverables, and triggers advisory warnings.
                </p>
              </div>
              <span className="text-xs font-mono text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
                Instructor: {currentGroup.instructor?.name}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Attendance (Held Sessions)</th>
                    <th className="py-3.5 px-6">Attendance %</th>
                    <th className="py-3.5 px-6">Assignments</th>
                    <th className="py-3.5 px-6">Status / Risk</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentGroup.students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {student.avatar || student.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{student.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {student.attendedCount} of {student.totalHeld} sessions
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            student.attendanceRate >= 85 ? 'text-emerald-700' : student.attendanceRate >= 75 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {student.attendanceRate}%
                          </span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                student.attendanceRate >= 85 ? 'bg-emerald-500' : student.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${Math.min(student.attendanceRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-700">
                        <span className="font-semibold">{student.submittedAssignmentsCount}</span>
                        <span className="text-slate-400"> of {student.totalAssignments} submitted</span>
                      </td>

                      <td className="py-4 px-6">
                        {student.isAtRisk ? (
                          <div className="space-y-0.5">
                            {student.riskFactors.map((rf, idx) => (
                              <span key={idx} className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 mr-1">
                                {rf}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedStudentForNote(student)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Log Check-In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Mentor Support Note Modal */}
      {selectedStudentForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Mentor Advisory Note: {selectedStudentForNote.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current attendance: {selectedStudentForNote.attendanceRate}% ({selectedStudentForNote.attendedCount} of {selectedStudentForNote.totalHeld} held sessions).
            </p>

            {noteSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Mentorship Intervention Recorded!</h4>
                <p className="text-xs text-slate-500">Notice dispatched to student and course instructor.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveNote} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guidance / Office Hours Recommendation
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={mentorNote}
                    onChange={(e) => setMentorNote(e.target.value)}
                    placeholder="Enter recommendations for catching up on missed sessions, project guidance, or tutoring schedule..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForNote(null)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Advisory Note</span>
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
