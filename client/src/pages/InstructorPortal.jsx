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
  HelpCircle,
  Layers,
  ArrowRight,
  UploadCloud,
  FileUp,
  HardDrive
} from 'lucide-react';

export default function InstructorPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Active Separate Page: 'sessions' | 'recordings' | 'assignments' | 'materials' | 'roster'
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['sessions', 'recordings', 'assignments', 'materials', 'roster'].includes(hash) ? hash : 'sessions';
  });

  const switchPage = (page) => {
    setActivePage(page);
    window.location.hash = page;
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['sessions', 'recordings', 'assignments', 'materials', 'roster'].includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // QR Modal
  const [qrModalSession, setQrModalSession] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Modals for adding curriculum resources
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);
  
  // Modal target sessions
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
  const [recordingTargetSessionId, setRecordingTargetSessionId] = useState('');

  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentTargetSessionId, setAssignmentTargetSessionId] = useState('');

  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialTargetSessionId, setMaterialTargetSessionId] = useState('');

  const [presentationModalOpen, setPresentationModalOpen] = useState(false);
  const [presentationTargetSessionId, setPresentationTargetSessionId] = useState('');

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
    source: 'file', // 'file' | 'url'
    videoUrl: '',
    duration: '2h 15m',
    summary: '',
    topics: '',
    fileName: '',
    fileSize: '',
    isLocalFile: false
  });

  const [assignmentForm, setAssignmentForm] = useState({
    source: 'file', // 'file' | 'url'
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxPoints: 100,
    attachmentUrl: '',
    attachmentName: '',
    attachmentSize: '',
    isLocalFile: false
  });

  const [materialForm, setMaterialForm] = useState({
    source: 'file', // 'file' | 'url'
    title: '',
    type: 'code',
    url: '',
    description: '',
    size: '2.5 MB',
    fileName: '',
    isLocalFile: false
  });

  const [presentationForm, setPresentationForm] = useState({
    source: 'file', // 'file' | 'url'
    title: '',
    slidesUrl: '',
    slideCount: 40,
    fileName: '',
    fileSize: '',
    isLocalFile: false
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

  const allSessions = groupDetails?.sessions || [];
  const recordingsList = allSessions.filter(s => s.recordedSession);

  // File Handlers for uploading from device
  const handleRecordingFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = () => {
      setRecordingForm(prev => ({
        ...prev,
        source: 'file',
        videoUrl: reader.result,
        fileName: file.name,
        fileSize: sizeMB,
        isLocalFile: true,
        summary: prev.summary || `Class Recording: ${file.name.replace(/\.[^/.]+$/, '')}`
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAssignmentFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeFormatted = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' 
      : (file.size / 1024).toFixed(0) + ' KB';
    
    const reader = new FileReader();
    reader.onload = () => {
      setAssignmentForm(prev => ({
        ...prev,
        attachmentUrl: reader.result,
        attachmentName: file.name,
        attachmentSize: sizeFormatted,
        isLocalFile: true,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleMaterialFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeFormatted = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' 
      : (file.size / 1024).toFixed(0) + ' KB';
    
    let detectedType = 'code';
    const ext = file.name.split('.').pop().toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) detectedType = 'doc';
    else if (['ppt', 'pptx', 'key'].includes(ext)) detectedType = 'slides';
    else if (['zip', 'rar', 'tar', 'gz', 'json', 'py', 'js', 'ts', 'java'].includes(ext)) detectedType = 'code';

    const reader = new FileReader();
    reader.onload = () => {
      setMaterialForm(prev => ({
        ...prev,
        source: 'file',
        url: reader.result,
        fileName: file.name,
        size: sizeFormatted,
        type: detectedType,
        isLocalFile: true,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePresentationFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeFormatted = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' 
      : (file.size / 1024).toFixed(0) + ' KB';
    
    const reader = new FileReader();
    reader.onload = () => {
      setPresentationForm(prev => ({
        ...prev,
        source: 'file',
        slidesUrl: reader.result,
        fileName: file.name,
        fileSize: sizeFormatted,
        slideCount: prev.slideCount || 35,
        isLocalFile: true,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
    };
    reader.readAsDataURL(file);
  };

  // Open modal helpers with target session
  const openRecordingModal = (targetSession = null) => {
    const session = targetSession || allSessions[0];
    setRecordingTargetSessionId(session ? session.id : '');
    if (session && session.recordedSession) {
      setRecordingForm({
        source: session.recordedSession.isLocalFile ? 'file' : 'url',
        videoUrl: session.recordedSession.videoUrl || '',
        duration: session.recordedSession.duration || '2h 15m',
        summary: session.recordedSession.summary || '',
        topics: (session.recordedSession.topics || []).join(', '),
        fileName: session.recordedSession.fileName || '',
        fileSize: session.recordedSession.fileSize || '',
        isLocalFile: Boolean(session.recordedSession.isLocalFile)
      });
    } else {
      setRecordingForm({
        source: 'file',
        videoUrl: '',
        duration: '2h 15m',
        summary: '',
        topics: '',
        fileName: '',
        fileSize: '',
        isLocalFile: false
      });
    }
    setRecordingModalOpen(true);
  };

  const openAssignmentModal = (targetSession = null) => {
    const session = targetSession || allSessions[0];
    setAssignmentTargetSessionId(session ? session.id : '');
    setAssignmentForm({
      source: 'file',
      title: session ? `Assignment: ${session.title}` : 'Practical Lab Assignment',
      description: '',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      maxPoints: 100,
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: '',
      isLocalFile: false
    });
    setAssignmentModalOpen(true);
  };

  const openMaterialModal = (targetSession = null) => {
    const session = targetSession || allSessions[0];
    setMaterialTargetSessionId(session ? session.id : '');
    setMaterialForm({
      source: 'file',
      title: session ? `Resources for ${session.title}` : 'Lecture Resource File',
      type: 'code',
      url: '',
      description: '',
      size: '2.5 MB',
      fileName: '',
      isLocalFile: false
    });
    setMaterialModalOpen(true);
  };

  const openPresentationModal = (targetSession = null) => {
    const session = targetSession || allSessions[0];
    setPresentationTargetSessionId(session ? session.id : '');
    setPresentationForm({
      source: 'file',
      title: session ? `Slide Deck: ${session.title}` : 'Chapter Keynote Presentation',
      slidesUrl: '',
      slideCount: 40,
      fileName: '',
      fileSize: '',
      isLocalFile: false
    });
    setPresentationModalOpen(true);
  };

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

  // Save Recording
  const handleSaveRecording = async (e) => {
    e.preventDefault();
    if (!recordingTargetSessionId || !recordingForm.videoUrl.trim()) {
      alert('Please select a target session and provide a video file or stream URL.');
      return;
    }
    setSubmittingResource(true);
    try {
      const targetSession = allSessions.find(s => s.id === recordingTargetSessionId);
      const res = await apiRequest(`/instructor/session/${recordingTargetSessionId}/recording`, {
        method: 'POST',
        body: JSON.stringify(recordingForm)
      });
      showStatus(`Recording saved for Session ${targetSession?.sessionNumber || ''}! Visible to students.`);
      setRecordingModalOpen(false);
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert(err.message || 'Failed to save recording');
    } finally {
      setSubmittingResource(false);
    }
  };

  // Save Assignment
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentTargetSessionId || !assignmentForm.title.trim()) {
      alert('Please select a target session and provide an assignment title.');
      return;
    }
    setSubmittingResource(true);
    try {
      const targetSession = allSessions.find(s => s.id === assignmentTargetSessionId);
      const res = await apiRequest(`/instructor/session/${assignmentTargetSessionId}/assignments`, {
        method: 'POST',
        body: JSON.stringify(assignmentForm)
      });
      showStatus(`Assignment added to Session ${targetSession?.sessionNumber || ''}! Visible to students.`);
      setAssignmentModalOpen(false);
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert(err.message || 'Failed to add assignment');
    } finally {
      setSubmittingResource(false);
    }
  };

  // Save Material
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!materialTargetSessionId || !materialForm.title.trim() || !materialForm.url.trim()) {
      alert('Please select a target session and choose a local file or URL.');
      return;
    }
    setSubmittingResource(true);
    try {
      const targetSession = allSessions.find(s => s.id === materialTargetSessionId);
      const res = await apiRequest(`/instructor/session/${materialTargetSessionId}/materials`, {
        method: 'POST',
        body: JSON.stringify(materialForm)
      });
      showStatus(`Material attached to Session ${targetSession?.sessionNumber || ''}! Visible to students.`);
      setMaterialModalOpen(false);
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      alert(err.message || 'Failed to add material');
    } finally {
      setSubmittingResource(false);
    }
  };

  // Save Presentation
  const handleSavePresentation = async (e) => {
    e.preventDefault();
    if (!presentationTargetSessionId || !presentationForm.title.trim() || !presentationForm.slidesUrl.trim()) {
      alert('Please select a target session and provide slide deck file or URL.');
      return;
    }
    setSubmittingResource(true);
    try {
      const targetSession = allSessions.find(s => s.id === presentationTargetSessionId);
      const res = await apiRequest(`/instructor/session/${presentationTargetSessionId}/presentations`, {
        method: 'POST',
        body: JSON.stringify(presentationForm)
      });
      showStatus(`Slide deck attached to Session ${targetSession?.sessionNumber || ''}! Visible to students.`);
      setPresentationModalOpen(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading Instructor Control Center...</p>
      </div>
    );
  }

  const activeGroupSummary = groups.find(g => g.id === selectedGroupId);
  
  // Aggregate all assignments across sessions
  const allAssignments = [];
  allSessions.forEach(s => {
    (s.assignments || []).forEach(a => {
      allAssignments.push({ ...a, sessionNumber: s.sessionNumber, sessionTitle: s.title, sessionId: s.id });
    });
  });

  // Aggregate all materials and presentations
  const allMaterials = [];
  allSessions.forEach(s => {
    (s.instructorMaterials || s.materials || []).forEach(m => {
      allMaterials.push({ ...m, itemType: 'material', sessionNumber: s.sessionNumber, sessionTitle: s.title, sessionId: s.id });
    });
    (s.presentations || []).forEach(p => {
      allMaterials.push({ ...p, itemType: 'presentation', sessionNumber: s.sessionNumber, sessionTitle: s.title, sessionId: s.id });
    });
  });

  const studentsList = groupDetails?.students || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* Group Selector & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Instructor Dashboard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Faculty Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {activeGroupSummary?.name || 'Class Cohort'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Course: <strong>{activeGroupSummary?.course?.title}</strong> • Schedule: <strong>{activeGroupSummary?.schedule}</strong>
          </p>
        </div>

        {/* Cohort Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-left md:text-right">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Cohort Group
            </label>
            <select
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
            >
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({grp.studentsCount} Students)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Success / Status Message Notification */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Separate Pages Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => switchPage('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'sessions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sessions Schedule</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'sessions' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {allSessions.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('recordings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'recordings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Recorded Lectures</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'recordings' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {recordingsList.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'assignments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Assignments & Tasks</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'assignments' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {allAssignments.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'materials'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FolderDown className="w-4 h-4" />
          <span>Materials & Slides</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'materials' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {allMaterials.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'roster'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students Roster & Excel</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'roster' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {studentsList.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          PAGE 1: SESSIONS SCHEDULE & QR ATTENDANCE
          ========================================================================= */}
      {activePage === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Page 1 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Live Curriculum & Check-in</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Sessions Schedule & QR Attendance</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate live QR codes for student check-ins, switch session status, and monitor attendance in real time.
              </p>
            </div>

            <button
              onClick={() => {
                setSessionForm(prev => ({
                  ...prev,
                  sessionNumber: allSessions.length + 1,
                  title: `Session ${allSessions.length + 1}: `
                }));
                setAddSessionModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Session</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">{allSessions.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Completed (Held)</span>
              <span className="text-xl font-black text-emerald-600 mt-0.5 block">
                {allSessions.filter(s => s.status === 'held').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Scheduled</span>
              <span className="text-xl font-black text-blue-600 mt-0.5 block">
                {allSessions.filter(s => s.status === 'scheduled').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Average Attendance</span>
              <span className="text-xl font-black text-indigo-600 mt-0.5 block">{activeGroupSummary?.averageAttendanceRate || 0}%</span>
            </div>
          </div>

          {/* Sessions List */}
          {detailsLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              Loading sessions...
            </div>
          ) : (
            <div className="space-y-4">
              {allSessions.map((session) => {
                const isHeld = session.status === 'held';
                const attendeesCount = session.attendeesCount || 0;
                const totalStudents = session.totalStudents || studentsList.length;
                const sessionRate = totalStudents > 0 ? Math.round((attendeesCount / totalStudents) * 100) : 0;

                return (
                  <div
                    key={session.id}
                    className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all ${
                      isHeld ? 'border-slate-200 shadow-xs' : 'border-dashed border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info */}
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

                      {/* Right: Actions */}
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
                          <span>Generate Attendance QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Resource Attachments Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {session.recordedSession ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-[11px] font-semibold border border-red-200">
                            <Video className="w-3 h-3" /> Video Attached ({session.recordedSession.duration}) {session.recordedSession.isLocalFile && '• 📁 Device File'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[11px]">
                            No recording
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-semibold border border-blue-200">
                          <FileText className="w-3 h-3" /> {session.assignments?.length || 0} Assignments
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-semibold border border-purple-200">
                          <FolderDown className="w-3 h-3" /> {(session.instructorMaterials?.length || session.materials?.length || 0) + (session.presentations?.length || 0)} Materials & Slides
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openRecordingModal(session)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                        >
                          + Recording
                        </button>
                        <button
                          onClick={() => openAssignmentModal(session)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                        >
                          + Assignment
                        </button>
                        <button
                          onClick={() => openMaterialModal(session)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                        >
                          + Material
                        </button>
                        <button
                          onClick={() => openPresentationModal(session)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                        >
                          + Slides
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          PAGE 2: RECORDED LECTURES & VIDEO VAULT
          ========================================================================= */}
      {activePage === 'recordings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Page 2 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Video Knowledge Base</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Recorded Lectures & Video Vault</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload video replays directly from your device or link YouTube streams for any session.
              </p>
            </div>

            <button
              onClick={() => openRecordingModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add / Upload Recording</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allSessions.map((session) => {
              const rec = session.recordedSession;
              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                    rec ? 'border-slate-200 shadow-xs' : 'border-dashed border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                        Session {session.sessionNumber}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{session.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">{session.title}</h3>

                    {rec ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-red-900 truncate">
                            <Video className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="truncate">
                              {rec.fileName ? `📁 ${rec.fileName}` : rec.videoUrl}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold bg-white text-red-700 px-2 py-0.5 rounded-md border border-red-200 shrink-0">
                            {rec.duration}
                          </span>
                        </div>

                        {rec.summary && (
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {rec.summary}
                          </p>
                        )}

                        {rec.topics && rec.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {rec.topics.map((top, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                #{top}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p>No video recording published yet for Session {session.sessionNumber}.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    {rec ? (
                      <a
                        href={rec.videoUrl}
                        download={rec.isLocalFile ? (rec.fileName || 'lecture_video.mp4') : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        <Play className="w-3.5 h-3.5 fill-blue-600" />
                        <span>{rec.isLocalFile ? 'Download / Play Video' : 'Watch Stream'}</span>
                      </a>
                    ) : <span />}

                    <button
                      onClick={() => openRecordingModal(session)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {rec ? 'Edit Recording' : '+ Add Recording'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 3: ASSIGNMENTS & HOMEWORK TASKS
          ========================================================================= */}
      {activePage === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Page 3 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Graded Work & Tasks</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Assignments & Practical Tasks</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign coding tasks, upload exercise files from device, and choose target session.
              </p>
            </div>

            <button
              onClick={() => openAssignmentModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Assignments List */}
          {allAssignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Assignments Created Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create assignments to challenge students and collect code submissions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Session {assignment.sessionNumber}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {assignment.maxPoints} Points
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{assignment.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {assignment.description || 'No detailed instructions provided.'}
                    </p>

                    {assignment.attachmentUrl && (
                      <div className="mt-3">
                        <a
                          href={assignment.attachmentUrl}
                          download={assignment.attachmentName || 'assignment_attachment'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File: {assignment.attachmentName || 'Task Attachment'} ({assignment.attachmentSize || ''})</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: {assignment.dueDate}
                    </span>

                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Active Task
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          PAGE 4: MATERIALS & PRESENTATION SLIDES
          ========================================================================= */}
      {activePage === 'materials' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Page 4 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Curriculum Handouts</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Learning Materials & Slide Decks</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload local code repositories, PDFs, and slide decks from your device or attach web links.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openMaterialModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Upload Material</span>
              </button>

              <button
                onClick={() => openPresentationModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Presentation className="w-4 h-4" />
                <span>+ Upload Slides</span>
              </button>
            </div>
          </div>

          {/* Materials Grid */}
          {allMaterials.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <FolderDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Materials Attached Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload files or attach slides so students can download them from the portal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allMaterials.map((mat) => {
                const isPresentation = mat.itemType === 'presentation';
                return (
                  <div key={mat.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isPresentation ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {isPresentation ? 'Presentation' : (mat.type || 'Resource')}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Session {mat.sessionNumber}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{mat.title}</h3>
                      {mat.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mat.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-400">
                        {isPresentation 
                          ? `${mat.slideCount} slides ${mat.isLocalFile ? '• 📁 Device File' : ''}` 
                          : `${mat.size || 'File'} ${mat.isLocalFile ? '• 📁 Device File' : ''}`
                        }
                      </span>

                      <a
                        href={isPresentation ? mat.slidesUrl : mat.url}
                        download={mat.isLocalFile ? (mat.fileName || mat.title) : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        <span>{mat.isLocalFile ? 'Download File' : 'Open Resource'}</span>
                        {mat.isLocalFile ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          PAGE 5: STUDENTS ROSTER & EXCEL EXPORT
          ========================================================================= */}
      {activePage === 'roster' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Page 5 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Cohort Registry</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Students Roster & Attendance Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect registered students, view individual attendance rates, and download comprehensive Excel reports.
              </p>
            </div>

            <button
              onClick={handleExcelExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>Export Official Excel (.xlsx)</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6">Contact Email</th>
                    <th className="py-3.5 px-6">Phone Number</th>
                    <th className="py-3.5 px-6 text-center">Attendance Fraction</th>
                    <th className="py-3.5 px-6 text-center">Rate</th>
                    <th className="py-3.5 px-6 text-right">Academic Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsList.map((st) => {
                    const heldSessions = allSessions.filter(s => s.status === 'held');
                    const attendedCount = heldSessions.filter(s => 
                      s.roster?.some(r => r.studentId === st.id && r.attended)
                    ).length;
                    const totalHeld = heldSessions.length;
                    const rate = totalHeld > 0 ? Math.round((attendedCount / totalHeld) * 100) : 100;
                    const isAtRisk = totalHeld > 0 && rate < 75;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            {st.avatar || st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{st.name}</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-600">{st.email}</td>
                        <td className="py-4 px-6 font-mono text-slate-500">{st.phone || '+20 100 000 0000'}</td>
                        <td className="py-4 px-6 text-center font-bold text-slate-800">
                          {attendedCount} / {totalHeld} sessions
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            isAtRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {rate}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-[11px] font-semibold ${
                            isAtRisk ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {isAtRisk ? 'At Risk (<75%)' : 'Good Standing'}
                          </span>
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
          MODALS FOR CURRICULUM ACTIONS
          ========================================================================= */}

      {/* MODAL 1: CREATE NEW SESSION */}
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    placeholder="21:00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Status</label>
                <select
                  value={sessionForm.status}
                  onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="scheduled">Scheduled (Upcoming)</option>
                  <option value="held">Held (Completed & Counted in Attendance)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSessionModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT RECORDING (WITH SESSION SELECTOR & LOCAL FILE UPLOAD) */}
      {recordingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Attach Video Lecture Recording
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Select session number and upload local video file or provide link.</p>

            <form onSubmit={handleSaveRecording} className="mt-4 space-y-3.5 text-xs">
              {/* Target Session Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Target Session (رقم المحاضرة)</span>
                  <span className="text-[11px] font-mono text-blue-600 font-bold">
                    Session #{allSessions.find(s => s.id === recordingTargetSessionId)?.sessionNumber || ''}
                  </span>
                </label>
                <select
                  required
                  value={recordingTargetSessionId}
                  onChange={(e) => setRecordingTargetSessionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Session Number --</option>
                  {allSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      Session {s.sessionNumber}: {s.title} ({s.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Switcher */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Video Source (مصدر الفيديو)</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                  <button
                    type="button"
                    onClick={() => setRecordingForm(prev => ({ ...prev, source: 'file' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      recordingForm.source === 'file' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Local File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordingForm(prev => ({ ...prev, source: 'url' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      recordingForm.source === 'url' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Web / Stream URL</span>
                  </button>
                </div>

                {recordingForm.source === 'file' ? (
                  <div className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50/50 text-center space-y-2 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="video/*,.mp4,.webm,.mov,.mkv"
                      onChange={handleRecordingFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                    {recordingForm.fileName ? (
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{recordingForm.fileName} ({recordingForm.fileSize})</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Choose video file from your device</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">MP4, WebM, MOV, or MKV</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required={recordingForm.source === 'url'}
                      value={recordingForm.videoUrl}
                      onChange={(e) => setRecordingForm({ ...recordingForm, videoUrl: e.target.value, isLocalFile: false })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (مدة المحاضرة)</label>
                <input
                  type="text"
                  value={recordingForm.duration}
                  onChange={(e) => setRecordingForm({ ...recordingForm, duration: e.target.value })}
                  placeholder="e.g. 2h 30m"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Summary & Recap</label>
                <textarea
                  rows={2}
                  value={recordingForm.summary}
                  onChange={(e) => setRecordingForm({ ...recordingForm, summary: e.target.value })}
                  placeholder="Key concepts covered in this session..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Topics (comma separated)</label>
                <input
                  type="text"
                  value={recordingForm.topics}
                  onChange={(e) => setRecordingForm({ ...recordingForm, topics: e.target.value })}
                  placeholder="Architecture, API Design, Security"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordingModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Recording</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD ASSIGNMENT (WITH SESSION SELECTOR & ATTACHMENT FROM DEVICE) */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Create Assignment & Homework Task
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Specify session number, requirements, and attach exercise file.</p>

            <form onSubmit={handleSaveAssignment} className="mt-4 space-y-3.5 text-xs">
              {/* Target Session Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Target Session (رقم المحاضرة)</span>
                  <span className="text-[11px] font-mono text-blue-600 font-bold">
                    Session #{allSessions.find(s => s.id === assignmentTargetSessionId)?.sessionNumber || ''}
                  </span>
                </label>
                <select
                  required
                  value={assignmentTargetSessionId}
                  onChange={(e) => setAssignmentTargetSessionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Session Number --</option>
                  {allSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      Session {s.sessionNumber}: {s.title} ({s.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="e.g. Build a RESTful Order Microservice"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions & Requirements</label>
                <textarea
                  rows={3}
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  placeholder="Describe the deliverables, rubric, and submission requirements..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Optional File Attachment from Device */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Attach Task Starter File (ملف من الجهاز - اختياري)</span>
                  <span className="text-[10px] text-slate-400">PDF, ZIP, DOCX, Code</span>
                </label>
                <div className="p-3 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50/50 text-center space-y-1.5 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleAssignmentFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileUp className="w-6 h-6 text-indigo-600 mx-auto" />
                  {assignmentForm.attachmentName ? (
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{assignmentForm.attachmentName} ({assignmentForm.attachmentSize})</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Choose assignment file from device</p>
                      <p className="text-[10px] text-slate-400">Starter code ZIP, PDF guide, or task description</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Points</label>
                  <input
                    type="number"
                    value={assignmentForm.maxPoints}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ATTACH MATERIAL (WITH SESSION SELECTOR & DEVICE FILE UPLOAD) */}
      {materialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Attach Learning Material
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Select session number and upload file from device or provide web link.</p>

            <form onSubmit={handleSaveMaterial} className="mt-4 space-y-3.5 text-xs">
              {/* Target Session Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Target Session (رقم المحاضرة)</span>
                  <span className="text-[11px] font-mono text-blue-600 font-bold">
                    Session #{allSessions.find(s => s.id === materialTargetSessionId)?.sessionNumber || ''}
                  </span>
                </label>
                <select
                  required
                  value={materialTargetSessionId}
                  onChange={(e) => setMaterialTargetSessionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Session Number --</option>
                  {allSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      Session {s.sessionNumber}: {s.title} ({s.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Switcher */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Material Source (مصدر الملف)</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                  <button
                    type="button"
                    onClick={() => setMaterialForm(prev => ({ ...prev, source: 'file' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      materialForm.source === 'file' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Local File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialForm(prev => ({ ...prev, source: 'url' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      materialForm.source === 'url' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>External URL / Repo</span>
                  </button>
                </div>

                {materialForm.source === 'file' ? (
                  <div className="p-4 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl bg-slate-50/50 text-center space-y-2 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      onChange={handleMaterialFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FolderDown className="w-8 h-8 text-purple-600 mx-auto" />
                    {materialForm.fileName ? (
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{materialForm.fileName} ({materialForm.size})</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Choose file from your device</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">ZIP, PDF, DOCX, Code, or Notes</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required={materialForm.source === 'url'}
                      value={materialForm.url}
                      onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value, isLocalFile: false })}
                      placeholder="https://github.com/..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Starter Code & Boilerplate Repo"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Type</label>
                  <select
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="code">Code Repository</option>
                    <option value="doc">Documentation / PDF</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="cheatsheet">Cheat Sheet</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">File Size / Label</label>
                  <input
                    type="text"
                    value={materialForm.size}
                    onChange={(e) => setMaterialForm({ ...materialForm, size: e.target.value })}
                    placeholder="e.g. 2.4 MB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaterialModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Attach Material</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ATTACH PRESENTATION SLIDES (WITH SESSION SELECTOR & DEVICE FILE UPLOAD) */}
      {presentationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Attach Slide Presentation Deck
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Select session number and upload slides from device or provide web link.</p>

            <form onSubmit={handleSavePresentation} className="mt-4 space-y-3.5 text-xs">
              {/* Target Session Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Target Session (رقم المحاضرة)</span>
                  <span className="text-[11px] font-mono text-blue-600 font-bold">
                    Session #{allSessions.find(s => s.id === presentationTargetSessionId)?.sessionNumber || ''}
                  </span>
                </label>
                <select
                  required
                  value={presentationTargetSessionId}
                  onChange={(e) => setPresentationTargetSessionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Session Number --</option>
                  {allSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      Session {s.sessionNumber}: {s.title} ({s.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Switcher */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Slides Source (مصدر السلايدات)</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                  <button
                    type="button"
                    onClick={() => setPresentationForm(prev => ({ ...prev, source: 'file' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      presentationForm.source === 'file' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Local File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresentationForm(prev => ({ ...prev, source: 'url' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      presentationForm.source === 'url' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Slides / Link</span>
                  </button>
                </div>

                {presentationForm.source === 'file' ? (
                  <div className="p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl bg-slate-50/50 text-center space-y-2 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.key"
                      onChange={handlePresentationFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Presentation className="w-8 h-8 text-amber-600 mx-auto" />
                    {presentationForm.fileName ? (
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{presentationForm.fileName} ({presentationForm.fileSize})</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Choose slides file from your device</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PDF, PPTX, or Keynote presentation</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required={presentationForm.source === 'url'}
                      value={presentationForm.slidesUrl}
                      onChange={(e) => setPresentationForm({ ...presentationForm, slidesUrl: e.target.value, isLocalFile: false })}
                      placeholder="https://docs.google.com/presentation/d/..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Presentation Title</label>
                <input
                  type="text"
                  required
                  value={presentationForm.title}
                  onChange={(e) => setPresentationForm({ ...presentationForm, title: e.target.value })}
                  placeholder="e.g. Chapter 4: Cloud Infrastructure & CI/CD"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slide Count</label>
                <input
                  type="number"
                  value={presentationForm.slideCount}
                  onChange={(e) => setPresentationForm({ ...presentationForm, slideCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPresentationModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingResource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Attach Slides</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal */}
      {qrModalSession && (
        <QRGeneratorModal
          session={qrModalSession}
          onClose={() => setQrModalSession(null)}
        />
      )}

    </div>
  );
}
