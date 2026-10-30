import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import QRScannerModal from '../components/QRScannerModal';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  QrCode, 
  Video, 
  FileText, 
  FolderDown, 
  Presentation, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Play, 
  Check, 
  Sparkles,
  BookOpen,
  User,
  Compass,
  FileCode,
  FileCheck
} from 'lucide-react';

export default function StudentPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeSessionFilter, setActiveSessionFilter] = useState('all'); // 'all' | 'held' | 'upcoming'
  
  // Assignment submission modal state
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Video viewer modal
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/student/dashboard');
      setData(res);
      // Automatically expand the latest held session by default
      if (res.groups && res.groups.length > 0) {
        const currentGroup = res.groups[selectedGroupIdx] || res.groups[0];
        const heldSessions = currentGroup.sessions.filter(s => s.status === 'held');
        const latestHeld = heldSessions[heldSessions.length - 1];
        if (latestHeld) {
          setExpandedSessions({ [latestHeld.id]: true });
        }
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toggleSession = (id) => {
    setExpandedSessions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await apiRequest('/student/submit-assignment', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: submittingAssignment.id,
          submissionContent: submissionUrl.trim(),
          notes: submissionNotes.trim()
        })
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSubmittingAssignment(null);
        setSubmissionUrl('');
        setSubmissionNotes('');
        fetchDashboard(); // refresh status
      }, 1200);
    } catch (err) {
      alert(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading your MEC student learning portal...</p>
      </div>
    );
  }

  const currentGroup = data?.groups?.[selectedGroupIdx];

  if (!currentGroup) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">No Enrolled Cohorts Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            You are not currently enrolled in any active cohorts. Please contact Academy Operations.
          </p>
        </div>
      </div>
    );
  }

  const { attendance, course, instructor, mentor, sessions } = currentGroup;

  const filteredSessions = sessions.filter(s => {
    if (activeSessionFilter === 'held') return s.status === 'held';
    if (activeSessionFilter === 'upcoming') return s.status === 'scheduled';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Cohort Switcher & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {course?.code || 'MEC'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">{currentGroup.schedule}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {course?.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cohort: <span className="font-semibold text-slate-700">{currentGroup.groupName}</span>
          </p>
        </div>

        {/* Quick Check-In CTA Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer active:scale-98"
          >
            <QrCode className="w-5 h-5" />
            <span>Scan QR Check-In</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          DYNAMIC ATTENDANCE CARD (Requirement: "Show attendance as a count of sessions attended out of the total sessions held for the student's group (for example, '12 of 15 sessions attended'). Derive both numbers from the group's session records.")
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Main Metric Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl" />

          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Dynamic Session Attendance Record
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                {attendance.attendanceRatePercentage >= 85 ? 'Exemplary Attendance' : attendance.attendanceRatePercentage >= 75 ? 'Good Standing' : 'At-Risk Warning'}
              </span>
            </div>

            {/* Attendance Prominent Headline */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {attendance.summaryText}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                ({attendance.attendanceRatePercentage}%)
              </div>
            </div>

            <p className="text-xs text-indigo-200/80 mt-2 max-w-xl leading-relaxed">
              Attendance is derived dynamically from your group's held sessions: you have attended <strong className="text-white">{attendance.sessionsAttended}</strong> out of <strong className="text-white">{attendance.totalSessionsHeld}</strong> sessions conducted so far ({currentGroup.sessions.length - attendance.totalSessionsHeld} upcoming sessions remain).
            </p>
          </div>

          {/* Visual Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-800/80 rounded-full h-3.5 p-0.5 border border-slate-700/60 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  attendance.attendanceRatePercentage >= 85 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : attendance.attendanceRatePercentage >= 75 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-rose-500 to-red-400'
                }`}
                style={{ width: `${Math.min(attendance.attendanceRatePercentage, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[11px] text-indigo-300 font-medium">
              <span>0%</span>
              <span className="text-slate-400">Academic Minimum: 75%</span>
              <span>100% Target</span>
            </div>
          </div>
        </div>

        {/* Cohort Leadership & Mentorship Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Faculty & Mentorship
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Your cohort leads and academic guide.</p>
          </div>

          {/* Instructor */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              {instructor?.avatar || 'IN'}
            </div>
            <div className="truncate">
              <span className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider">Instructor</span>
              <span className="text-xs font-bold text-slate-900 block truncate">{instructor?.name}</span>
              <span className="text-[11px] text-slate-500 truncate block font-mono">{instructor?.email}</span>
            </div>
          </div>

          {/* Mentor */}
          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
              {mentor?.avatar || 'ME'}
            </div>
            <div className="truncate">
              <span className="block text-[10px] font-bold text-purple-700 uppercase tracking-wider">Assigned Mentor</span>
              <span className="text-xs font-bold text-slate-900 block truncate">{mentor?.name}</span>
              <span className="text-[11px] text-slate-500 truncate block font-mono">{mentor?.email}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Cohort Schedule: <strong className="text-slate-700">{currentGroup.schedule}</strong>
          </div>
        </div>

      </div>

      {/* ========================================================
          SESSIONS SECTION (Grouped by Session: recorded sessions, assignments, instructor materials, presentations)
         ======================================================== */}
      <div className="space-y-4">
        
        {/* Sessions Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Curriculum Sessions & Materials</h2>
            <p className="text-xs text-slate-500">
              Grouped by session with video recordings, assignments, code materials, and presentations.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveSessionFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSessionFilter === 'all' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setActiveSessionFilter('held')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSessionFilter === 'held' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Held ({attendance.totalSessionsHeld})
            </button>
            <button
              onClick={() => setActiveSessionFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSessionFilter === 'upcoming' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming ({sessions.length - attendance.totalSessionsHeld})
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isExpanded = Boolean(expandedSessions[session.id]);
            const isHeld = session.status === 'held';

            return (
              <div 
                key={session.id} 
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  session.isAttended 
                    ? 'border-emerald-200/90 shadow-xs' 
                    : isHeld 
                    ? 'border-amber-200/80 shadow-xs' 
                    : 'border-slate-200 opacity-90'
                }`}
              >
                {/* Session Summary Header (Click to Expand) */}
                <div 
                  onClick={() => toggleSession(session.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      session.isAttended 
                        ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200' 
                        : isHeld 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {session.sessionNumber}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Session {session.sessionNumber}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5" /> {session.date}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {session.startTime} - {session.endTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {session.title}
                      </h3>
                    </div>
                  </div>

                  {/* Badges & Expand Indicator */}
                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    {/* Attendance status badge */}
                    {session.isAttended ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check className="w-3.5 h-3.5" /> Attended
                      </span>
                    ) : isHeld ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <Clock className="w-3.5 h-3.5" /> Upcoming
                      </span>
                    )}

                    {/* Expand arrow */}
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Session Subsections:
                    1. Recorded Sessions
                    2. Assignments
                    3. Instructor Materials
                    4. Presentations
                */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/40 space-y-6 animate-in fade-in duration-150">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* =========================================
                          1. RECORDED SESSIONS
                         ========================================= */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                              <Video className="w-4 h-4 text-indigo-600" />
                              Recorded Session
                            </span>
                            {session.recordedSession && (
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {session.recordedSession.duration}
                              </span>
                            )}
                          </div>

                          {session.recordedSession ? (
                            <div className="space-y-3">
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {session.recordedSession.summary}
                              </p>
                              
                              {/* Topics */}
                              {session.recordedSession.topics && (
                                <div className="flex flex-wrap gap-1.5">
                                  {session.recordedSession.topics.map((t, idx) => (
                                    <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-100">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-3">
                              Recording will be published once this session has been delivered.
                            </p>
                          )}
                        </div>

                        {session.recordedSession && (
                          <div className="pt-4 mt-3 border-t border-slate-100">
                            <button
                              onClick={() => setActiveVideo(session)}
                              className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-indigo-700" />
                              <span>Watch Session Video Recording</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* =========================================
                          2. ASSIGNMENTS
                         ========================================= */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              Assignments & Deliverables
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {session.assignments.length} assigned
                            </span>
                          </div>

                          {session.assignments.length > 0 ? (
                            <div className="space-y-3">
                              {session.assignments.map((asgn) => (
                                <div key={asgn.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-bold text-slate-900">{asgn.title}</span>
                                    {asgn.isSubmitted ? (
                                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Submitted ({asgn.score !== null ? `${asgn.score} pts` : 'Pending Grade'})
                                      </span>
                                    ) : (
                                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                        Action Required
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-600 text-[11px] leading-relaxed">
                                    {asgn.description}
                                  </p>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                                    <span>Due Date: <strong>{asgn.dueDate}</strong></span>
                                    <span>Max: {asgn.maxPoints} pts</span>
                                  </div>

                                  {/* Submission button or details */}
                                  <div className="pt-1">
                                    {asgn.isSubmitted ? (
                                      <div className="bg-emerald-50/80 p-2 rounded-lg text-[11px] text-emerald-900 border border-emerald-100 space-y-1">
                                        <div className="flex items-center gap-1 font-semibold">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Submission on file:</span>
                                        </div>
                                        <a 
                                          href={asgn.submission?.submissionContent} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="text-indigo-600 hover:underline block truncate font-mono text-[10px]"
                                        >
                                          {asgn.submission?.submissionContent}
                                        </a>
                                        {asgn.submission?.feedback && (
                                          <p className="text-slate-600 italic">
                                            Feedback: "{asgn.submission.feedback}"
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setSubmittingAssignment(asgn)}
                                        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                      >
                                        <Send className="w-3 h-3" />
                                        <span>Submit Solution / Link</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-3">
                              No assignments were scheduled for this session.
                            </p>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* =========================================
                          3. INSTRUCTOR MATERIALS
                         ========================================= */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                            <FolderDown className="w-4 h-4 text-blue-600" />
                            Instructor Materials
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {session.instructorMaterials.length} files
                          </span>
                        </div>

                        {session.instructorMaterials.length > 0 ? (
                          <div className="space-y-2">
                            {session.instructorMaterials.map((mat) => (
                              <a
                                key={mat.id}
                                href={mat.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between text-xs group"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                                    <FileCode className="w-4 h-4" />
                                  </div>
                                  <div className="truncate">
                                    <span className="font-semibold text-slate-800 block truncate group-hover:text-blue-700">
                                      {mat.title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block truncate">
                                      {mat.description} • {mat.size}
                                    </span>
                                  </div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic py-3">
                            No supplementary materials uploaded for this session yet.
                          </p>
                        )}
                      </div>

                      {/* =========================================
                          4. PRESENTATIONS
                         ========================================= */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700">
                            <Presentation className="w-4 h-4 text-purple-600" />
                            Presentations & Slide Decks
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {session.presentations.length} decks
                          </span>
                        </div>

                        {session.presentations.length > 0 ? (
                          <div className="space-y-2">
                            {session.presentations.map((pres) => (
                              <a
                                key={pres.id}
                                href={pres.slidesUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between text-xs group"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
                                    <Presentation className="w-4 h-4" />
                                  </div>
                                  <div className="truncate">
                                    <span className="font-semibold text-slate-800 block truncate group-hover:text-purple-700">
                                      {pres.title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block">
                                      Interactive Keynote • {pres.slideCount} slides
                                    </span>
                                  </div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0 ml-2" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic py-3">
                            No slide deck presented during this session.
                          </p>
                        )}
                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => {
          fetchDashboard(); // updates attendance numbers instantly!
        }}
      />

      {/* Assignment Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              Submit Solution: {submittingAssignment.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide your GitHub repository, deployed URL, or cloud folder link.
            </p>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900">Solution Submitted!</h4>
                <p className="text-xs text-slate-500">Your instructor and mentor have been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleAssignmentSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Repository or Project URL
                  </label>
                  <input
                    type="url"
                    required
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/your-username/solution"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technical Notes or Commentary (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Describe your design choices or any challenges solved..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingAssignment(null)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Confirm Submission'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-400 font-mono">Session {activeVideo.sessionNumber}</span>
                <h3 className="font-bold text-sm text-white">{activeVideo.title}</h3>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video bg-black flex items-center justify-center relative">
              <div className="text-center p-6 space-y-3">
                <Play className="w-16 h-16 text-indigo-500 mx-auto fill-indigo-500/20" />
                <p className="text-sm font-semibold">Session Video Player</p>
                <p className="text-xs text-slate-400 max-w-md">
                  Simulated playback stream for {activeVideo.recordedSession?.duration} recorded session.
                </p>
                <a
                  href={activeVideo.recordedSession?.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Direct Stream
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
