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
  FileCheck,
  LayoutDashboard,
  Layers,
  ArrowRight,
  Download,
  Search,
  Filter,
  CheckCircle
} from 'lucide-react';

export default function StudentPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  
  // Navigation tabs: 'overview' | 'sessions' | 'recordings' | 'assignments' | 'materials'
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['overview', 'sessions', 'recordings', 'assignments', 'materials'].includes(hash) ? hash : 'overview';
  });

  const switchTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'sessions', 'recordings', 'assignments', 'materials'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  
  const [expandedSessions, setExpandedSessions] = useState({});
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeSessionFilter, setActiveSessionFilter] = useState('all'); // 'all' | 'held' | 'upcoming'
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // 'all' | 'pending' | 'submitted'
  const [searchQuery, setSearchQuery] = useState('');
  
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
        fetchDashboard();
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

  // Flattened lists for dedicated pages
  const allAssignments = sessions.flatMap(s => 
    (s.assignments || []).map(a => ({ ...a, sessionNumber: s.sessionNumber, sessionTitle: s.title }))
  );
  const pendingAssignments = allAssignments.filter(a => !a.isSubmitted);
  const submittedAssignments = allAssignments.filter(a => a.isSubmitted);

  const allRecordings = sessions
    .filter(s => s.recordedSession)
    .map(s => ({ ...s.recordedSession, sessionNumber: s.sessionNumber, sessionTitle: s.title, sessionId: s.id, date: s.date }));

  const allMaterials = sessions.flatMap(s => 
    (s.instructorMaterials || []).map(m => ({ ...m, sessionNumber: s.sessionNumber, sessionTitle: s.title }))
  );

  const allPresentations = sessions.flatMap(s => 
    (s.presentations || []).map(p => ({ ...p, sessionNumber: s.sessionNumber, sessionTitle: s.title }))
  );

  const filteredSessions = sessions.filter(s => {
    if (activeSessionFilter === 'held') return s.status === 'held';
    if (activeSessionFilter === 'upcoming') return s.status === 'scheduled';
    if (activeSessionFilter === 'attended') return s.isAttended;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Fast Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          MULTI-PAGE TAB NAVIGATION (تقسيم صفحة الطلاب لكذا صفحة)
         ======================================================== */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200 text-xs font-bold scrollbar-none">
        
        {/* Tab 1: Dashboard Overview */}
        <button
          onClick={() => switchTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview & Attendance</span>
        </button>

        {/* Tab 2: Sessions */}
        <button
          onClick={() => switchTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'sessions'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sessions Schedule</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {sessions.length}
          </span>
        </button>

        {/* Tab 3: Recorded Sessions */}
        <button
          onClick={() => switchTab('recordings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'recordings'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Recorded Lectures</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700">
            {allRecordings.length}
          </span>
        </button>

        {/* Tab 4: Assignments */}
        <button
          onClick={() => switchTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'assignments'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Assignments & Tasks</span>
          {pendingAssignments.length > 0 && (
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-extrabold">
              {pendingAssignments.length} pending
            </span>
          )}
        </button>

        {/* Tab 5: Materials & Presentations */}
        <button
          onClick={() => switchTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'materials'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FolderDown className="w-4 h-4" />
          <span>Materials & Slide Decks</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {allMaterials.length + allPresentations.length}
          </span>
        </button>

      </div>

      {/* ========================================================
          PAGE 1: OVERVIEW & ATTENDANCE DASHBOARD
         ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main Attendance Card & Faculty Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Dynamic Attendance Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Dynamic Session Attendance Record
                  </span>
                  <span className="text-xs text-indigo-300 font-mono">
                    {attendance.attendanceRatePercentage >= 85 ? 'Exemplary Standing' : attendance.attendanceRatePercentage >= 75 ? 'Good Standing' : 'At-Risk Notice'}
                  </span>
                </div>

                {/* Exact Requirement String */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    {attendance.summaryText}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    ({attendance.attendanceRatePercentage}%)
                  </div>
                </div>

                <p className="text-xs text-indigo-200/80 mt-2 max-w-xl leading-relaxed">
                  Attendance is derived dynamically from your group's session records: you have attended <strong className="text-white">{attendance.sessionsAttended}</strong> out of <strong className="text-white">{attendance.totalSessionsHeld}</strong> held sessions ({currentGroup.sessions.length - attendance.totalSessionsHeld} scheduled sessions remain).
                </p>
              </div>

              {/* Progress bar */}
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
                  <span className="text-slate-400">Academic Target: 75%</span>
                  <span>100% Target</span>
                </div>
              </div>
            </div>

            {/* Faculty & Mentor Contact Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Assigned Faculty & Mentorship
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Your primary instructor and guidance mentor.</p>
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
                Class Hours: <strong className="text-slate-700">{currentGroup.schedule}</strong>
              </div>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div 
              onClick={() => setActiveTab('sessions')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Sessions Completed</span>
                <span className="text-2xl font-black text-slate-900">
                  {attendance.totalSessionsHeld} <span className="text-xs text-slate-400 font-normal">of {sessions.length}</span>
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              onClick={() => setActiveTab('assignments')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Completed Tasks</span>
                <span className="text-2xl font-black text-emerald-600">
                  {submittedAssignments.length} <span className="text-xs text-slate-400 font-normal">of {allAssignments.length}</span>
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              onClick={() => setActiveTab('recordings')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Recorded Lectures</span>
                <span className="text-2xl font-black text-blue-700">{allRecordings.length}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              onClick={() => setActiveTab('materials')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Slide Decks & Code</span>
                <span className="text-2xl font-black text-purple-700">{allMaterials.length + allPresentations.length}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>

          </div>

          {/* Quick Recent Action Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Latest Recorded Session */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Latest Recorded Session</h3>
                </div>
                <button
                  onClick={() => setActiveTab('recordings')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              {allRecordings.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Session {allRecordings[allRecordings.length - 1].sessionNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {allRecordings[allRecordings.length - 1].duration}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {allRecordings[allRecordings.length - 1].sessionTitle}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {allRecordings[allRecordings.length - 1].summary}
                  </p>
                  <button
                    onClick={() => setActiveVideo(sessions.find(s => s.id === allRecordings[allRecordings.length - 1].sessionId))}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Session Video</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pending Assignments Action Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Action Items: Pending Deliverables</h3>
                </div>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              {pendingAssignments.length > 0 ? (
                <div className="space-y-2.5">
                  {pendingAssignments.slice(0, 2).map(asgn => (
                    <div key={asgn.id} className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{asgn.title}</span>
                        <span className="text-[11px] text-slate-500 block">Due date: {asgn.dueDate} • {asgn.maxPoints} pts</span>
                      </div>
                      <button
                        onClick={() => setSubmittingAssignment(asgn)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                      >
                        Submit Link
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-800">All Assignments Submitted!</p>
                  <p className="text-slate-400">You are up to date on all group course deliverables.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          PAGE 2: SESSIONS & ATTENDANCE SCHEDULE
         ======================================================== */}
      {activeTab === 'sessions' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum Sessions & Attendance History</h2>
              <p className="text-xs text-slate-500">
                Detailed timeline of all scheduled and conducted sessions with check-in records.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveSessionFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSessionFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({sessions.length})
              </button>
              <button
                onClick={() => setActiveSessionFilter('held')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSessionFilter === 'held' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Held ({attendance.totalSessionsHeld})
              </button>
              <button
                onClick={() => setActiveSessionFilter('attended')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSessionFilter === 'attended' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Attended ({attendance.sessionsAttended})
              </button>
              <button
                onClick={() => setActiveSessionFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSessionFilter === 'upcoming' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming ({sessions.length - attendance.totalSessionsHeld})
              </button>
            </div>
          </div>

          <div className="space-y-3">
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

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
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

                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/50 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendance Record</span>
                          <span className="font-bold text-slate-900">
                            {session.isAttended ? 'Verified Present' : isHeld ? 'Marked Absent' : 'Pending Session'}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-In Method</span>
                          <span className="font-mono text-slate-800">
                            {session.attendanceDetails ? (session.attendanceDetails.checkInMethod === 'qr_scan' ? '⚡ QR Scan' : 'Manual Override') : 'N/A'}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Assignments</span>
                          <span className="font-bold text-slate-900">{session.assignments.length} assigned</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Lecture Recording</span>
                          <span className="font-bold text-slate-900">{session.recordedSession ? 'Available' : 'None'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================
          PAGE 3: RECORDED LECTURES & RECAPS
         ======================================================== */}
      {activeTab === 'recordings' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recorded Sessions Video Library</h2>
              <p className="text-xs text-slate-500">
                Rewatch delivered classes, review architectural discussions, and explore topic timestamps.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
              {allRecordings.length} Recordings Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allRecordings.map((rec, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="aspect-video bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-5 flex flex-col justify-between text-white relative">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                        Session {rec.sessionNumber}
                      </span>
                      <span className="text-xs font-mono text-indigo-200 bg-black/40 px-2 py-0.5 rounded">
                        {rec.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-center my-auto">
                      <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all cursor-pointer">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Recorded on {rec.date}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {rec.sessionTitle}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {rec.summary}
                    </p>

                    {/* Topic Tags */}
                    {rec.topics && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rec.topics.map((t, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => setActiveVideo(sessions.find(s => s.id === rec.sessionId))}
                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" />
                    <span>Watch Recording Stream</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================
          PAGE 4: ASSIGNMENTS & TASKS DELIVERABLES
         ======================================================== */}
      {activeTab === 'assignments' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Course Assignments & Homework Deliverables</h2>
              <p className="text-xs text-slate-500">
                Submit project solutions, track instructor grades, and review feedback.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setAssignmentFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  assignmentFilter === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Tasks ({allAssignments.length})
              </button>
              <button
                onClick={() => setAssignmentFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  assignmentFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({pendingAssignments.length})
              </button>
              <button
                onClick={() => setAssignmentFilter('submitted')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  assignmentFilter === 'submitted' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Submitted ({submittedAssignments.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {allAssignments
              .filter(a => {
                if (assignmentFilter === 'pending') return !a.isSubmitted;
                if (assignmentFilter === 'submitted') return a.isSubmitted;
                return true;
              })
              .map((asgn) => (
                <div 
                  key={asgn.id} 
                  className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between space-y-4 ${
                    asgn.isSubmitted ? 'border-emerald-200' : 'border-amber-200/90'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                        Session {asgn.sessionNumber}
                      </span>
                      {asgn.isSubmitted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {asgn.score !== null ? `Graded: ${asgn.score}/${asgn.maxPoints} pts` : 'Submitted (Under Review)'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Action Required
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {asgn.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {asgn.description}
                    </p>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Due Date: <strong className="text-slate-700">{asgn.dueDate}</strong></span>
                      <span>Weight: <strong className="text-slate-700">{asgn.maxPoints} pts</strong></span>
                    </div>

                    {/* Downloadable Assignment File from Device */}
                    {asgn.attachmentUrl && (
                      <div className="pt-2">
                        <a
                          href={asgn.attachmentUrl}
                          download={asgn.attachmentName || `${asgn.title}_exercise`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
                        >
                          <FolderDown className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Download Assignment File ({asgn.attachmentName || asgn.attachmentSize || 'Attached File'})</span>
                        </a>
                      </div>
                    )}

                    {/* Submission detail box */}
                    {asgn.isSubmitted && asgn.submission && (
                      <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
                        <span className="font-bold text-emerald-900 block">Submitted Solution URL:</span>
                        <a 
                          href={asgn.submission.submissionContent}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 font-mono text-[11px] hover:underline block truncate"
                        >
                          {asgn.submission.submissionContent}
                        </a>
                        {asgn.submission.feedback && (
                          <div className="pt-1 text-slate-700 italic border-t border-emerald-200/50">
                            Instructor Feedback: "{asgn.submission.feedback}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    {asgn.isSubmitted ? (
                      <button
                        onClick={() => setSubmittingAssignment(asgn)}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        Update Submission Link
                      </button>
                    ) : (
                      <button
                        onClick={() => setSubmittingAssignment(asgn)}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Project Repository / Link</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* ========================================================
          PAGE 5: MATERIALS & PRESENTATION SLIDE DECKS
         ======================================================== */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Lecture Materials & Presentation Decks</h2>
              <p className="text-xs text-slate-500">
                Official course slides, downloadable guides, and starter code repositories.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
              {allMaterials.length + allPresentations.length} Resources
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Instructor Materials (Code, PDFs, Notes) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FolderDown className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Code Repositories & Guides ({allMaterials.length})</h3>
                </div>
              </div>

              <div className="space-y-3">
                {allMaterials.map((mat) => (
                  <a
                    key={mat.id}
                    href={mat.url}
                    download={mat.isLocalFile ? (mat.fileName || mat.title) : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shrink-0">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                            S{mat.sessionNumber}
                          </span>
                          <span className="font-bold text-slate-900 block truncate group-hover:text-blue-700">
                            {mat.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {mat.description || (mat.isLocalFile ? 'Uploaded File from Instructor' : 'Web Resource')} • {mat.size} {mat.isLocalFile && '• 📁 Downloadable'}
                        </span>
                      </div>
                    </div>
                    {mat.isLocalFile ? (
                      <Download className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Presentation Slide Decks */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Presentation className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-base">Keynote Slide Decks ({allPresentations.length})</h3>
                </div>
              </div>

              <div className="space-y-3">
                {allPresentations.map((pres) => (
                  <a
                    key={pres.id}
                    href={pres.slidesUrl}
                    download={pres.isLocalFile ? (pres.fileName || pres.title) : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 transition-all flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl shrink-0">
                        <Presentation className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                            S{pres.sessionNumber}
                          </span>
                          <span className="font-bold text-slate-900 block truncate group-hover:text-purple-700">
                            {pres.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Slide Deck • {pres.slideCount} slides {pres.isLocalFile && '• 📁 Downloadable'}
                        </span>
                      </div>
                    </div>
                    {pres.isLocalFile ? (
                      <Download className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0 ml-2" />
                    )}
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* QR Scanner Modal (Available from any tab) */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => {
          fetchDashboard();
        }}
      />

      {/* Assignment Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
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
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-400 font-mono">Session {activeVideo.sessionNumber}</span>
                <h3 className="font-bold text-sm text-white">{activeVideo.title}</h3>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Video Player Box */}
            <div className="bg-black flex items-center justify-center relative overflow-hidden min-h-[300px]">
              {activeVideo.recordedSession?.videoUrl?.startsWith('data:video') || activeVideo.recordedSession?.isLocalFile ? (
                <video
                  controls
                  autoPlay
                  className="w-full max-h-[480px] bg-black"
                  src={activeVideo.recordedSession?.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="aspect-video w-full flex items-center justify-center text-center p-6 space-y-3">
                  <div>
                    <Play className="w-16 h-16 text-indigo-500 mx-auto fill-indigo-500/20" />
                    <p className="text-sm font-semibold mt-2">Session Video Player</p>
                    <p className="text-xs text-slate-400 max-w-md mt-1">
                      Lecture replay stream ({activeVideo.recordedSession?.duration || '2h 00m'}).
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <a
                        href={activeVideo.recordedSession?.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Watch Stream URL
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Footer info */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-mono">
                Duration: <strong className="text-slate-200">{activeVideo.recordedSession?.duration}</strong>
                {activeVideo.recordedSession?.fileName && ` • 📁 ${activeVideo.recordedSession.fileName}`}
              </span>

              {activeVideo.recordedSession?.videoUrl && (
                <a
                  href={activeVideo.recordedSession.videoUrl}
                  download={activeVideo.recordedSession?.fileName || `Session_${activeVideo.sessionNumber}_recording.mp4`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Video</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
