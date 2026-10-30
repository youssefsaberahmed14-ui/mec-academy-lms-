const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify student role
const requireStudent = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const user = db.getUserById(userId);
  if (!user || user.role !== 'student') {
    return res.status(403).json({ error: 'Access restricted to students' });
  }
  req.student = user;
  next();
};

// GET /api/student/dashboard
router.get('/dashboard', requireStudent, (req, res) => {
  const studentId = req.student.id;
  const groups = db.getGroupsForUser(studentId, 'student');

  const groupsData = groups.map(group => {
    const course = db.getCourseById(group.courseId);
    const instructor = db.getUserById(group.instructorId);
    const mentor = db.getUserById(group.mentorId);
    const sessions = db.getSessionsByGroup(group.id);
    const groupAttendance = db.getAttendanceForGroup(group.id);
    const studentAttendance = groupAttendance.filter(a => a.studentId === studentId);
    const studentSubmissions = db.getSubmissionsForStudent(studentId);
    const studentQuizSubmissions = db.getQuizSubmissionsForStudent(studentId);

    // Dynamic Attendance derivation strictly from session records:
    // Sessions held: count of sessions with status 'held'
    const heldSessions = sessions.filter(s => s.status === 'held');
    const totalSessionsHeld = heldSessions.length;

    // Sessions attended: count of held sessions student attended
    const attendedSessionIds = new Set(studentAttendance.map(a => a.sessionId));
    const attendedHeldSessionsCount = heldSessions.filter(s => attendedSessionIds.has(s.id)).length;

    const attendanceRatePercentage = totalSessionsHeld > 0 
      ? Math.round((attendedHeldSessionsCount / totalSessionsHeld) * 100) 
      : 100;

    const attendanceSummaryText = `${attendedHeldSessionsCount} of ${totalSessionsHeld} sessions attended`;

    // Map sessions grouped with their 4 sub-sections:
    // 1. recorded sessions
    // 2. assignments (with submission status)
    // 3. instructor materials
    // 4. presentations
    const sessionsGrouped = sessions.map(session => {
      const isAttended = attendedSessionIds.has(session.id);
      const attRecord = studentAttendance.find(a => a.sessionId === session.id);

      const assignmentsWithSubmission = (session.assignments || []).map(asgn => {
        const submission = studentSubmissions.find(sub => sub.assignmentId === asgn.id);
        return {
          ...asgn,
          submission: submission || null,
          isSubmitted: Boolean(submission),
          isGraded: submission ? submission.status === 'graded' : false,
          score: submission ? submission.score : null
        };
      });

      return {
        id: session.id,
        sessionNumber: session.sessionNumber,
        title: session.title,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status, // 'held' or 'scheduled'
        isAttended,
        attendanceDetails: attRecord ? {
          checkInMethod: attRecord.checkInMethod,
          checkInTime: attRecord.checkInTime
        } : null,
        // 1. Recorded session
        recordedSession: session.recordedSession || null,
        // 2. Assignments
        assignments: assignmentsWithSubmission,
        // 3. Instructor materials
        instructorMaterials: session.instructorMaterials || [],
        // 4. Presentations
        presentations: session.presentations || []
      };
    });

    return {
      groupId: group.id,
      groupName: group.name,
      schedule: group.schedule,
      startDate: group.startDate,
      endDate: group.endDate,
      status: group.status,
      course: course ? {
        id: course.id,
        title: course.title,
        code: course.code,
        price: course.price,
        category: course.category,
        totalPlannedSessions: course.totalPlannedSessions,
        hasQuizzes: course.hasQuizzes
      } : null,
      instructor: instructor ? {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        phone: instructor.phone,
        avatar: instructor.avatar,
        specialization: instructor.specialization
      } : null,
      mentor: mentor ? {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        phone: mentor.phone,
        avatar: mentor.avatar,
        expertise: mentor.expertise
      } : null,
      attendance: {
        sessionsAttended: attendedHeldSessionsCount,
        totalSessionsHeld: totalSessionsHeld,
        totalPlannedSessions: course ? course.totalPlannedSessions : sessions.length,
        attendanceRatePercentage,
        summaryText: attendanceSummaryText // "12 of 15 sessions attended"
      },
      sessions: sessionsGrouped,
      quizSubmissions: studentQuizSubmissions
    };
  });

  res.json({
    student: req.student,
    groups: groupsData
  });
});

// POST /api/student/check-in
// QR code check-in endpoint
router.post('/check-in', requireStudent, (req, res) => {
  const { qrCodeToken } = req.body;
  const studentId = req.student.id;

  if (!qrCodeToken) {
    return res.status(400).json({ error: 'QR code token is required' });
  }

  // Trim and clean token string (support direct token string or JSON payload)
  let cleanToken = qrCodeToken.trim();
  try {
    const parsed = JSON.parse(qrCodeToken);
    if (parsed && parsed.token) cleanToken = parsed.token;
  } catch (e) {
    // raw token string
  }

  const session = db.getSessionByToken(cleanToken);
  if (!session) {
    return res.status(404).json({
      error: 'Invalid or expired QR code. Please ask your instructor for the active session code.'
    });
  }

  try {
    const result = db.recordAttendance({
      sessionId: session.id,
      studentId,
      checkInMethod: 'qr_scan'
    });

    const group = db.getGroupById(session.groupId);
    const course = db.getCourseById(group ? group.courseId : null);

    // Re-derive student attendance count for immediate UI update
    const groupSessions = db.getSessionsByGroup(session.groupId);
    const heldSessions = groupSessions.filter(s => s.status === 'held');
    const studentAttendance = db.getAttendanceForStudent(studentId, session.groupId);
    const attendedIds = new Set(studentAttendance.map(a => a.sessionId));
    const attendedCount = heldSessions.filter(s => attendedIds.has(s.id)).length;

    res.json({
      success: true,
      alreadyRecorded: result.alreadyRecorded,
      message: result.alreadyRecorded
        ? `Attendance for Session ${session.sessionNumber} was already recorded earlier.`
        : `Check-in successful! Attendance verified for Session ${session.sessionNumber}: ${session.title}.`,
      session: {
        id: session.id,
        sessionNumber: session.sessionNumber,
        title: session.title,
        date: session.date
      },
      groupName: group ? group.name : 'Class',
      courseTitle: course ? course.title : 'Course',
      checkInTime: result.record.checkInTime,
      attendanceSummary: `${attendedCount} of ${heldSessions.length} sessions attended`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/student/submit-assignment
router.post('/submit-assignment', requireStudent, (req, res) => {
  const { assignmentId, submissionContent, notes } = req.body;
  const studentId = req.student.id;

  if (!assignmentId || !submissionContent) {
    return res.status(400).json({ error: 'Assignment ID and submission link/content are required' });
  }

  try {
    const submission = db.saveAssignmentSubmission({
      assignmentId,
      studentId,
      submissionContent,
      notes: notes || ''
    });

    res.json({
      success: true,
      message: 'Assignment submitted successfully!',
      submission
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
