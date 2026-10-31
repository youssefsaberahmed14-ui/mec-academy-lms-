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
  Award,
  Plus,
  Video,
  FileText,
  FolderDown,
  Presentation,
  ExternalLink,
  Edit,
  Play,
  FileCode,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function InstructorPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // QR Modal
  const [qrModalSession, setQrModalSession] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Modals for adding curriculum resources
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);
  const [recordingModalSession, setRecordingModalSession] = useState(null);
  const [assignmentModalSession, setAssignmentModalSession] = useState(null);
  const [materialModalSession, setMaterialModalSession] = useState(null);
  const [presentationModalSession, setPresentationModalSession] = useState(null);

  // Form states
  const [sessionForm, setSessionForm] = useState({
    title: '',
    sessionNumber: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '21:00',
    status: 'scheduled'
  });

  const [recordingForm, setRecordingForm] = useState({
    videoUrl: '',
    duration: '2h 15m',
    summary: '',
    topics: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxPoints: 100
  });

  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'code',
    url: '',
    description: '',
    size: '2.5 MB'
  });

  const [presentationForm, setPresentationForm] = useState({
    title: '',
    slidesUrl: '',
    slideCount: 40
  });

  const [submittingResource, setSubmittingResource] = useState(false);

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 5000);
  };

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

  // Handle Excel Export
  const handleExcelExport = async () => {
    if (!selectedGroupId) return;
    setIsExporting(true);
    setStatusMessage('');
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

      showStatus(`Exported ${filename} with 4 sheets (Roster, Attendance, Assignments, Quizzes).`);
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
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert('Error updating attendance: ' + err.message);
    }
  };

  // Toggle session status ('held' vs 'scheduled')
  const handleToggleSessionStatus = async (session) => {
    const nextStatus = session.status === 'held' ? 'scheduled' : 'held';
    try {
      await apiRequest(`/instructor/session/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      showStatus(`Session ${session.sessionNumber} marked as ${nextStatus.toUpperCase()}.`);
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Create New Session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.title.trim()) return;
    setSubmittingResource(true);
    try {
      const res = await apiRequest(`/instructor/group/${selectedGroupId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(sessionForm)
      });
      showStatus(res.message || 'Session added successfully!');
      setAddSessionModalOpen(false);
      setSessionForm({
        title: '',
        sessionNumber: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '21:00',
        status: 'scheduled'
      });
      fetchGroupDetails(selectedGroupId);
      fetchGroups();
    } catch (err) {
      alert(err.message || 'Failed to create session');
    } finally {
      setSubmittingResource(false);
    }
  };

  // Add/Edit Recording
  const handleSaveRecording = async (e) => {
    e.preventDefault();
    if (!recordingModalSession || !recordingForm.videoUrl.trim()) return;
    setSubmittingResource(true);
    try {
      const res = await apiRequest(`/instructor/session/${recordingModalSession.id}/recording`, {
        method: 'POST',
        body: JSON.stringify(recordingForm)
      });
      showStatus(res.message || 'Recording published! Visible to students.');
      setRecordingModalSession(null);
      setRecordingForm({ videoUrl: '', duration: '2h 15m', summary: '', topics: '' });
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert(err.message || 'Failed to save recording');
    } finally {
      setSubmittingResource(false);
    }
  };

  // Add Assignment
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentModalSession || !assignmentForm.title.trim()) return;
    setSubmittingResource(true);
    try {
      const res = await apiRequest(`/instructor/session/${assignmentModalSession.id}/assignments`, {
        method: 'POST',
        body: JSON.stringify(assignmentForm)
      });
      showStatus(res.message || 'Assignment added! Visible to students.');
      setAssignmentModalSession(null);
      setAssignmentForm({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        maxPoints: 100
      });
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert(err.message || 'Failed to add assignment');
    } finally {
      setSubmittingResource(false);
    }
  };

  // Add Material
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!materialModalSession || !materialForm.title.trim() || !materialForm.url.trim()) return;
    setSubmittingResource(true);
    try {
      const res = await apiRequest(`/instructor/session/${materialModalSession.id}/materials`, {
        method: 'POST',
        body: JSON.stringify(materialForm)
      });
      showStatus(res.message || 'Material attached! Visible to students.');
      setMaterialModalSession(null);
      setMaterialForm({ title: '', type: 'code', url: '', description: '', size: '2.5 MB' });
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert(err.message || 'Failed to add material');
    } finally {
      setSubmittingResource(false);
    }
  };

  // Add Presentation
  const handleSavePresentation = async (e) => {
    e.preventDefault();
    if (!presentationModalSession || !presentationForm.title.trim() || !presentationForm.slidesUrl.trim()) return;
    setSubmittingResource(true);
    try {
      const res = await apiRequest(`/instructor/session/${presentationModalSession.id}/presentations`, {
        method: 'POST',
        body: JSON.stringify(presentationForm)
      });
      showStatus(res.message || 'Slide deck published! Visible to students.');
      setPresentationModalSession(null);
      setPresentationForm({ title: '', slidesUrl: '', slideCount: 40 });
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert(err.message || 'Failed to add presentation');
    } finally {
      setSubmittingResource(false);
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
            Group Attendance & Curriculum Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Cohort: <strong className="text-slate-800">{activeGroupSummary?.name}</strong>
          </p>
        </div>

        {/* Group Selector & Top Actions */}
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

          {/* Add Session CTA */}
          <button
            onClick={() => {
              setSessionForm(prev => ({
                ...prev,
                sessionNumber: (groupDetails?.sessions?.length || 0) + 1,
                title: `Session ${(groupDetails?.sessions?.length || 0) + 1}: `
              }));
              setAddSessionModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Session</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExcelExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span>Export Gradebook (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
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
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Curriculum Quizzes</span>
              <span className="text-2xl font-black text-amber-700">
                {activeGroupSummary.course?.hasQuizzes ? 'Enabled' : 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Sessions List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sessions & Curriculum Management</h2>
            <p className="text-xs text-slate-500">
              Generate QR codes, manage lecture recordings, add assignments, and attach materials for students.
            </p>
          </div>

          <button
            onClick={() => {
              setSessionForm(prev => ({
                ...prev,
                sessionNumber: (groupDetails?.sessions?.length || 0) + 1,
                title: `Session ${(groupDetails?.sessions?.length || 0) + 1}: `
              }));
              setAddSessionModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Session</span>
          </button>
        </div>

        {detailsLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Loading session rosters and curriculum items...
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
                  className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all ${
                    isHeld ? 'border-slate-200 shadow-xs' : 'border-dashed border-slate-300 bg-slate-50/50'
                  }`}
                >
                  {/* Top Line: Session Header & Controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Session Info */}
                    <div className="flex items-start gap-3.5">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
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
                          
                          {/* Status button toggle */}
                          <button
                            onClick={() => handleToggleSessionStatus(session)}
                            title="Click to toggle session status"
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                              isHeld ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {session.status} (Click to toggle)
                          </button>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {session.title}
                        </h3>
                      </div>
                    </div>

                    {/* QR Code Action & Live Roster Stats */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span><strong>{attendeesCount}</strong> of {totalStudents} present</span>
                        <span className="text-slate-400">({sessionRate}%)</span>
                      </div>

                      <button
                        onClick={() => setQrModalSession(session)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-indigo-600" />
                        <span>Attendance QR</span>
                      </button>
                    </div>

                  </div>

                  {/* Attachment Management Section */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Curriculum Attachments (Instantly Visible in Student Portal)
                      </span>

                      {/* Action buttons to attach items */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => {
                            setRecordingModalSession(session);
                            if (session.recordedSession) {
                              setRecordingForm({
                                videoUrl: session.recordedSession.videoUrl || '',
                                duration: session.recordedSession.duration || '2h 00m',
                                summary: session.recordedSession.summary || '',
                                topics: (session.recordedSession.topics || []).join(', ')
                              });
                            } else {
                              setRecordingForm({ videoUrl: '', duration: '2h 15m', summary: '', topics: '' });
                            }
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{session.recordedSession ? 'Edit Recording' : '+ Recording'}</span>
                        </button>

                        <button
                          onClick={() => setAssignmentModalSession(session)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>+ Assignment</span>
                        </button>

                        <button
                          onClick={() => setMaterialModalSession(session)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FolderDown className="w-3.5 h-3.5" />
                          <span>+ Material</span>
                        </button>

                        <button
                          onClick={() => setPresentationModalSession(session)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          <span>+ Slide Deck</span>
                        </button>
                      </div>
                    </div>

                    {/* Chips showing current attachments */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {session.recordedSession ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200">
                          <Video className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Video ({session.recordedSession.duration})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-xl">
                          No recording attached
                        </span>
                      )}

                      {session.assignments && session.assignments.length > 0 ? (
                        session.assignments.map(asgn => (
                          <span key={asgn.id} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{asgn.title}</span>
                          </span>
                        ))
                      ) : null}

                      {session.instructorMaterials && session.instructorMaterials.length > 0 ? (
                        session.instructorMaterials.map(mat => (
                          <span key={mat.id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
                            <FileCode className="w-3.5 h-3.5 text-blue-600" />
                            <span>{mat.title}</span>
                          </span>
                        ))
                      ) : null}

                      {session.presentations && session.presentations.length > 0 ? (
                        session.presentations.map(pres => (
                          <span key={pres.id} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-800 rounded-xl border border-purple-200">
                            <Presentation className="w-3.5 h-3.5 text-purple-600" />
                            <span>{pres.title} ({pres.slideCount} slides)</span>
                          </span>
                        ))
                      ) : null}
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

      {/* ========================================================
          MODAL 1: CREATE NEW SESSION
         ======================================================== */}
      {addSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Add New Curriculum Session</h3>
            <p className="text-xs text-slate-500 mt-0.5">Define session number, title, date, and initial status.</p>

            <form onSubmit={handleCreateSession} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session #</label>
                  <input
                    type="number"
                    required
                    value={sessionForm.sessionNumber}
                    onChange={(e) => setSessionForm({ ...sessionForm, sessionNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title / Topic</label>
                <input
                  type="text"
                  required
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  placeholder="e.g. Session 17: Microservices Orchestration"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    placeholder="18:00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    placeholder="21:00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Status</label>
                <select
                  value={sessionForm.status}
                  onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="scheduled">Scheduled (Upcoming)</option>
                  <option value="held">Held (Completed & Counted in Attendance)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSessionModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ADD/EDIT RECORDING
         ======================================================== */}
      {recordingModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Attach Video Recording: Session {recordingModalSession.sessionNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">This recording will appear in the student's Recorded Lectures page.</p>

            <form onSubmit={handleSaveRecording} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Video Stream / YouTube URL</label>
                <input
                  type="url"
                  required
                  value={recordingForm.videoUrl}
                  onChange={(e) => setRecordingForm({ ...recordingForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={recordingForm.duration}
                  onChange={(e) => setRecordingForm({ ...recordingForm, duration: e.target.value })}
                  placeholder="e.g. 2h 30m"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Summary & Recap</label>
                <textarea
                  rows={2}
                  value={recordingForm.summary}
                  onChange={(e) => setRecordingForm({ ...recordingForm, summary: e.target.value })}
                  placeholder="Summary of topics discussed in this session..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topics (comma separated)</label>
                <input
                  type="text"
                  value={recordingForm.topics}
                  onChange={(e) => setRecordingForm({ ...recordingForm, topics: e.target.value })}
                  placeholder="e.g. Docker, Kubernetes, CI/CD"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordingModalSession(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Recording</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ADD ASSIGNMENT
         ======================================================== */}
      {assignmentModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Create Assignment: Session {assignmentModalSession.sessionNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Students will be able to submit their solutions from their portal.</p>

            <form onSubmit={handleSaveAssignment} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="e.g. Assignment 10: Docker Compose Cluster"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Points</label>
                  <input
                    type="number"
                    value={assignmentForm.maxPoints}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deliverable Instructions</label>
                <textarea
                  rows={3}
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  placeholder="Describe requirements and evaluation criteria..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignmentModalSession(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ADD MATERIAL
         ======================================================== */}
      {materialModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Attach Material: Session {materialModalSession.sessionNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Attach starter code, reference guide, or PDF lecture notes.</p>

            <form onSubmit={handleSaveMaterial} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Starter Code Repository.zip"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">File Type</label>
                  <select
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="code">Code / GitHub</option>
                    <option value="pdf">PDF Document</option>
                    <option value="zip">ZIP Archive</option>
                    <option value="doc">Reference Document</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Size</label>
                  <input
                    type="text"
                    value={materialForm.size}
                    onChange={(e) => setMaterialForm({ ...materialForm, size: e.target.value })}
                    placeholder="e.g. 3.2 MB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Download / Repository URL</label>
                <input
                  type="url"
                  required
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                  placeholder="https://github.com/mec-academy/repo"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="e.g. Includes boilerplate and unit test harness"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaterialModalSession(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Attach Material</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: ADD PRESENTATION SLIDE DECK
         ======================================================== */}
      {presentationModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Attach Slide Deck: Session {presentationModalSession.sessionNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Attach presentation slides for students to review.</p>

            <form onSubmit={handleSavePresentation} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slide Deck Title</label>
                <input
                  type="text"
                  required
                  value={presentationForm.title}
                  onChange={(e) => setPresentationForm({ ...presentationForm, title: e.target.value })}
                  placeholder="e.g. Session Presentation Deck"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Slides URL</label>
                  <input
                    type="url"
                    required
                    value={presentationForm.slidesUrl}
                    onChange={(e) => setPresentationForm({ ...presentationForm, slidesUrl: e.target.value })}
                    placeholder="https://slides.mec.edu/..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slide Count</label>
                  <input
                    type="number"
                    value={presentationForm.slideCount}
                    onChange={(e) => setPresentationForm({ ...presentationForm, slideCount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPresentationModalSession(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Slide Deck</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
