const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const XLSX = require('xlsx');
const db = require('../db');

// Middleware to verify instructor role
const requireInstructor = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const user = db.getUserById(userId);
  if (!user || user.role !== 'instructor') {
    return res.status(403).json({ error: 'Access restricted to instructors' });
  }
  req.instructor = user;
  next();
};

// GET /api/instructor/groups
router.get('/groups', requireInstructor, (req, res) => {
  const instructorId = req.instructor.id;
  const groups = db.getGroupsForUser(instructorId, 'instructor');

  const groupsData = groups.map(group => {
    const course = db.getCourseById(group.courseId);
    const mentor = db.getUserById(group.mentorId);
    const students = (group.studentIds || []).map(id => db.getUserById(id)).filter(Boolean);
    const sessions = db.getSessionsByGroup(group.id);
    const attendanceRecords = db.getAttendanceForGroup(group.id);

    const heldSessions = sessions.filter(s => s.status === 'held');

    // Calculate student attendance statistics
    const studentStats = students.map(student => {
      const studentAtt = attendanceRecords.filter(a => a.studentId === student.id);
      const attendedCount = heldSessions.filter(s => studentAtt.some(a => a.sessionId === s.id)).length;
      const rate = heldSessions.length > 0 ? Math.round((attendedCount / heldSessions.length) * 100) : 100;
      return {
        ...student,
        sessionsAttended: attendedCount,
        totalHeld: heldSessions.length,
        attendanceRate: rate,
        isAtRisk: rate < 75
      };
    });

    return {
      id: group.id,
      name: group.name,
      schedule: group.schedule,
      startDate: group.startDate,
      endDate: group.endDate,
      status: group.status,
      course,
      mentor,
      studentsCount: students.length,
      students: studentStats,
      sessionsCount: sessions.length,
      heldSessionsCount: heldSessions.length,
      averageAttendanceRate: studentStats.length > 0
        ? Math.round(studentStats.reduce((sum, s) => sum + s.attendanceRate, 0) / studentStats.length)
        : 100
    };
  });

  res.json({ groups: groupsData });
});

// GET /api/instructor/group/:groupId/details
router.get('/group/:groupId/details', requireInstructor, (req, res) => {
  const { groupId } = req.params;
  const group = db.getGroupById(groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const course = db.getCourseById(group.courseId);
  const mentor = db.getUserById(group.mentorId);
  const students = (group.studentIds || []).map(id => db.getUserById(id)).filter(Boolean);
  const sessions = db.getSessionsByGroup(groupId);
  const attendanceRecords = db.getAttendanceForGroup(groupId);
  const submissions = db.getSubmissionsForGroup(groupId);
  const quizzes = db.getQuizzesForGroup(groupId);
  const quizSubmissions = db.getQuizSubmissionsForGroup(groupId);

  const heldSessions = sessions.filter(s => s.status === 'held');

  // Enrich sessions with attendee rosters
  const enrichedSessions = sessions.map(session => {
    const sessionAtt = attendanceRecords.filter(a => a.sessionId === session.id);
    const attendeeIds = new Set(sessionAtt.map(a => a.studentId));

    const roster = students.map(st => {
      const record = sessionAtt.find(a => a.studentId === st.id);
      return {
        studentId: st.id,
        name: st.name,
        email: st.email,
        attended: attendeeIds.has(st.id),
        checkInTime: record ? record.checkInTime : null,
        checkInMethod: record ? record.checkInMethod : null
      };
    });

    return {
      ...session,
      attendeesCount: attendeeIds.size,
      totalStudents: students.length,
      roster
    };
  });

  res.json({
    group,
    course,
    mentor,
    students,
    sessions: enrichedSessions,
    quizzes,
    submissions,
    quizSubmissions
  });
});

// POST /api/instructor/session/:sessionId/generate-qr
// Generate live QR code for students to scan
router.post('/session/:sessionId/generate-qr', requireInstructor, async (req, res) => {
  const { sessionId } = req.params;
  const session = db.getSessionById(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const group = db.getGroupById(session.groupId);
  if (group.instructorId !== req.instructor.id) {
    return res.status(403).json({ error: 'Unauthorized to generate QR for this session' });
  }

  // Create unique, trackable token
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const token = `MEC-QR-S${session.sessionNumber}-${session.id.slice(-4)}-${randomSuffix}`;

  // Update session in DB
  const updatedSession = db.updateSession(session.id, {
    qrCodeToken: token,
    qrGeneratedAt: new Date().toISOString()
  });

  // Generate QR Code image data URL (PNG)
  try {
    const payload = JSON.stringify({
      token,
      sessionId: session.id,
      sessionNumber: session.sessionNumber,
      title: session.title,
      academy: 'MEC Academy',
      generatedAt: new Date().toISOString()
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 400,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      token,
      qrDataUrl,
      session: updatedSession
    });
  } catch (err) {
    console.error('QR Generation failed:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// POST /api/instructor/session/:sessionId/toggle-attendance
// Manual attendance toggle for exceptional cases
router.post('/session/:sessionId/toggle-attendance', requireInstructor, (req, res) => {
  const { sessionId } = req.params;
  const { studentId, attended } = req.body;

  if (!sessionId || !studentId) {
    return res.status(400).json({ error: 'Session ID and Student ID are required' });
  }

  try {
    const record = db.toggleAttendanceOverride(sessionId, studentId, attended);
    res.json({ success: true, record, attended: Boolean(record) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/instructor/group/:groupId/export-excel
// Authentic Excel Export fulfilling the requirement:
// "Provide an Excel export for the instructor's groups containing:
// all registered students, attendance per session, assignment submissions,
// and quiz submissions where the course uses quizzes."
router.get('/group/:groupId/export-excel', requireInstructor, (req, res) => {
  const { groupId } = req.params;
  const group = db.getGroupById(groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const course = db.getCourseById(group.courseId);
  const mentor = db.getUserById(group.mentorId);
  const students = (group.studentIds || []).map(id => db.getUserById(id)).filter(Boolean);
  const sessions = db.getSessionsByGroup(groupId);
  const attendanceRecords = db.getAttendanceForGroup(groupId);
  const submissions = db.getSubmissionsForGroup(groupId);
  const quizzes = db.getQuizzesForGroup(groupId);
  const quizSubmissions = db.getQuizSubmissionsForGroup(groupId);

  const heldSessions = sessions.filter(s => s.status === 'held');

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: Registered Students & Summary
  // ==========================================
  const summaryRows = students.map((student, idx) => {
    const studentAtt = attendanceRecords.filter(a => a.studentId === student.id);
    const attendedCount = heldSessions.filter(s => studentAtt.some(a => a.sessionId === s.id)).length;
    const attRate = heldSessions.length > 0 ? `${Math.round((attendedCount / heldSessions.length) * 100)}%` : '100%';
    const studentSubs = submissions.filter(sub => sub.studentId === student.id);
    const gradedSubs = studentSubs.filter(sub => sub.score !== null);
    const avgScore = gradedSubs.length > 0 
      ? Math.round(gradedSubs.reduce((acc, sub) => acc + sub.score, 0) / gradedSubs.length)
      : 'N/A';

    return {
      'No.': idx + 1,
      'Student ID': student.id,
      'Full Name': student.name,
      'Email': student.email,
      'Phone': student.phone || 'N/A',
      'Enrollment Status': student.status.toUpperCase(),
      'Sessions Attended': attendedCount,
      'Total Sessions Held': heldSessions.length,
      'Attendance Rate': attRate,
      'Assignments Submitted': studentSubs.length,
      'Avg Assignment Grade': avgScore
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Registered Students');

  // ==========================================
  // SHEET 2: Attendance Per Session
  // ==========================================
  const attendanceMatrixRows = students.map((student, idx) => {
    const row = {
      'No.': idx + 1,
      'Student ID': student.id,
      'Student Name': student.name
    };

    let totalAttended = 0;
    sessions.forEach(sess => {
      const isAttended = attendanceRecords.some(a => a.sessionId === sess.id && a.studentId === student.id);
      const colHeader = `S${sess.sessionNumber}: ${sess.title.slice(0, 20)}... (${sess.status.toUpperCase()})`;
      row[colHeader] = isAttended ? 'PRESENT' : (sess.status === 'held' ? 'ABSENT' : 'UPCOMING');
      if (isAttended) totalAttended++;
    });

    row['Total Attended'] = totalAttended;
    row['Sessions Held'] = heldSessions.length;
    row['Attendance Rate %'] = heldSessions.length > 0 ? `${Math.round((totalAttended / heldSessions.length) * 100)}%` : '100%';

    return row;
  });

  const wsAttendance = XLSX.utils.json_to_sheet(attendanceMatrixRows);
  XLSX.utils.book_append_sheet(workbook, wsAttendance, 'Attendance Per Session');

  // ==========================================
  // SHEET 3: Assignment Submissions
  // ==========================================
  const assignmentRows = [];
  sessions.forEach(session => {
    (session.assignments || []).forEach(asgn => {
      students.forEach(student => {
        const sub = submissions.find(s => s.assignmentId === asgn.id && s.studentId === student.id);
        assignmentRows.push({
          'Session': `Session ${session.sessionNumber}`,
          'Assignment Title': asgn.title,
          'Due Date': asgn.dueDate,
          'Student Name': student.name,
          'Student Email': student.email,
          'Submission Status': sub ? (sub.status ? sub.status.toUpperCase() : 'SUBMITTED') : 'PENDING',
          'Submitted Date': sub ? new Date(sub.submittedAt).toLocaleDateString() : '-',
          'Score': sub && sub.score !== null ? sub.score : '-',
          'Max Points': asgn.maxPoints,
          'Submission URL': sub ? sub.submissionContent : '-',
          'Instructor Feedback': sub ? sub.feedback || 'None' : '-'
        });
      });
    });
  });

  const wsAssignments = XLSX.utils.json_to_sheet(assignmentRows.length > 0 ? assignmentRows : [{ 'Message': 'No assignments configured for this group' }]);
  XLSX.utils.book_append_sheet(workbook, wsAssignments, 'Assignment Submissions');

  // ==========================================
  // SHEET 4: Quiz Submissions (where course uses quizzes)
  // ==========================================
  if (course && course.hasQuizzes) {
    const quizRows = [];
    quizzes.forEach(quiz => {
      students.forEach(student => {
        const qSub = quizSubmissions.find(qs => qs.quizId === quiz.id && qs.studentId === student.id);
        quizRows.push({
          'Quiz Title': quiz.title,
          'Student Name': student.name,
          'Student Email': student.email,
          'Score': qSub ? qSub.score : 'Not Attempted',
          'Max Score': quiz.maxScore,
          'Passing Score': quiz.passingScore,
          'Status': qSub ? (qSub.passed ? 'PASSED' : 'FAILED') : 'PENDING',
          'Submitted At': qSub ? new Date(qSub.submittedAt).toLocaleString() : '-'
        });
      });
    });

    const wsQuizzes = XLSX.utils.json_to_sheet(quizRows.length > 0 ? quizRows : [{ 'Message': 'No quizzes taken yet' }]);
    XLSX.utils.book_append_sheet(workbook, wsQuizzes, 'Quiz Submissions');
  }

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const safeGroupName = group.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `MEC_Group_${safeGroupName}_Report.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// ==========================================
// SESSION & CONTENT CREATION BY INSTRUCTOR
// ==========================================

// POST /api/instructor/group/:groupId/sessions
// Add new session to group
router.post('/group/:groupId/sessions', requireInstructor, (req, res) => {
  const { groupId } = req.params;
  const group = db.getGroupById(groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  if (group.instructorId !== req.instructor.id) {
    return res.status(403).json({ error: 'Unauthorized to add sessions to this group' });
  }

  const { title, sessionNumber, date, startTime, endTime, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Session title is required' });
  }

  try {
    const newSession = db.createSession({
      groupId,
      title: title.trim(),
      sessionNumber: sessionNumber ? Number(sessionNumber) : undefined,
      date: date || new Date().toISOString().split('T')[0],
      startTime: startTime || '18:00',
      endTime: endTime || '21:00',
      status: status || 'scheduled'
    });

    res.status(201).json({
      success: true,
      message: `Session ${newSession.sessionNumber} added successfully`,
      session: newSession
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/instructor/session/:sessionId
// Edit session title, date, status ('held' / 'scheduled')
router.put('/session/:sessionId', requireInstructor, (req, res) => {
  const { sessionId } = req.params;
  const session = db.getSessionById(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const group = db.getGroupById(session.groupId);
  if (group.instructorId !== req.instructor.id) {
    return res.status(403).json({ error: 'Unauthorized to edit this session' });
  }

  const updates = req.body;
  const updated = db.updateSession(sessionId, updates);

  res.json({
    success: true,
    message: 'Session updated successfully',
    session: updated
  });
});

// POST /api/instructor/session/:sessionId/recording
// Add or update video recording
router.post('/session/:sessionId/recording', requireInstructor, (req, res) => {
  const { sessionId } = req.params;
  const session = db.getSessionById(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const group = db.getGroupById(session.groupId);
  if (group.instructorId !== req.instructor.id) {
    return res.status(403).json({ error: 'Unauthorized to edit this session' });
  }

  const { videoUrl, duration, summary, topics } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Video stream URL is required' });
  }

  try {
    const { videoUrl, duration, summary, topics, fileName, fileSize, isLocalFile } = req.body;
    const recording = db.setSessionRecording(sessionId, {
      videoUrl: videoUrl.trim(),
      duration: duration || '2h 00m',
      summary: summary || '',
      topics,
      fileName,
      fileSize,
      isLocalFile
    });

    // If adding recording, also ensure session is marked as held
    db.updateSession(sessionId, { status: 'held' });

    res.json({
      success: true,
      message: 'Session recording published successfully! It is now visible to all enrolled students.',
      recording
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/instructor/session/:sessionId/assignments
// Add an assignment to a session
router.post('/session/:sessionId/assignments', requireInstructor, (req, res) => {
  const { sessionId } = req.params;
  const session = db.getSessionById(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const group = db.getGroupById(session.groupId);
  if (group.instructorId !== req.instructor.id) {
    return res.status(403).json({ error: 'Unauthorized to add assignments to this session' });
  }

  const { title, description, dueDate, maxPoints, attachmentUrl, attachmentName, attachmentSize, isLocalFile } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Assignment title is required' });
  }

  try {
    const newAsgn = db.addAssignmentToSession(sessionId, {
      title: title.trim(),
      description: description || '',
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      maxPoints: Number(maxPoints) || 100,
      attachmentUrl: attachmentUrl || '',
      attachmentName: attachmentName || '',
      attachmentSize: attachmentSize || '',
      isLocalFile: Boolean(isLocalFile)
    });

    res.status(201).json({
      success: true,
      message: `Assignment "${newAsgn.title}" created successfully and published to students.`,
      assignment: newAsgn
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/instructor/session/:sessionId/materials
// Add instructor materials (code files, PDFs, guides)
router.post('/session/:sessionId/materials', requireInstructor, (req, res) => {
  const { sessionId } = req.params;
  const session = db.getSessionById(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const group = db.getGroupById(session.groupId);
  if (group.instructorId !== req.instructor.id) {
    return res.status(403).json({ error: 'Unauthorized to add materials to this session' });
  }

  const { title, type, url, description, size, fileName, isLocalFile } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Material title and resource URL are required' });
  }

  try {
    const newMat = db.addMaterialToSession(sessionId, {
      title: title.trim(),
      type: type || 'code',
      url: url.trim(),
      description: description || '',
      size: size || '1.5 MB',
      fileName: fileName || '',
      isLocalFile: Boolean(isLocalFile)
    });

    res.status(201).json({
      success: true,
      message: `Material "${newMat.title}" attached to Session ${session.sessionNumber}.`,
      material: newMat
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/instructor/session/:sessionId/presentations
// Add presentation slide deck
router.post('/session/:sessionId/presentations', requireInstructor, (req, res) => {
  const { sessionId } = req.params;
  const session = db.getSessionById(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const group = db.getGroupById(session.groupId);
  if (group.instructorId !== req.instructor.id) {
    return res.status(403).json({ error: 'Unauthorized to add presentations to this session' });
  }

  const { title, slidesUrl, slideCount, fileName, fileSize, isLocalFile } = req.body;
  if (!title || !slidesUrl) {
    return res.status(400).json({ error: 'Presentation title and slides URL are required' });
  }

  try {
    const newPres = db.addPresentationToSession(sessionId, {
      title: title.trim(),
      slidesUrl: slidesUrl.trim(),
      slideCount: Number(slideCount) || 30,
      fileName: fileName || '',
      fileSize: fileSize || '',
      isLocalFile: Boolean(isLocalFile)
    });

    res.status(201).json({
      success: true,
      message: `Presentation deck "${newPres.title}" published to Session ${session.sessionNumber}.`,
      presentation: newPres
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
