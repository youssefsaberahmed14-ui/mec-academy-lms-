const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify mentor role
const requireMentor = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const user = db.getUserById(userId);
  if (!user || user.role !== 'mentor') {
    return res.status(403).json({ error: 'Access restricted to mentors' });
  }
  req.mentor = user;
  next();
};

// GET /api/mentor/groups
router.get('/groups', requireMentor, (req, res) => {
  const mentorId = req.mentor.id;
  const groups = db.getGroupsForUser(mentorId, 'mentor');

  const groupsData = groups.map(group => {
    const course = db.getCourseById(group.courseId);
    const instructor = db.getUserById(group.instructorId);
    const students = (group.studentIds || []).map(id => db.getUserById(id)).filter(Boolean);
    const sessions = db.getSessionsByGroup(group.id);
    const attendanceRecords = db.getAttendanceForGroup(group.id);
    const submissions = db.getSubmissionsForGroup(group.id);

    const heldSessions = sessions.filter(s => s.status === 'held');

    const studentsAnalysis = students.map(student => {
      const studentAtt = attendanceRecords.filter(a => a.studentId === student.id);
      const attendedCount = heldSessions.filter(s => studentAtt.some(a => a.sessionId === s.id)).length;
      const attRate = heldSessions.length > 0 ? Math.round((attendedCount / heldSessions.length) * 100) : 100;

      const studentSubs = submissions.filter(s => s.studentId === student.id);
      const totalAssignments = sessions.reduce((acc, s) => acc + (s.assignments ? s.assignments.length : 0), 0);

      const isLowAttendance = attRate < 75;
      const isMissingAssignments = studentSubs.length < Math.floor(totalAssignments * 0.7);

      return {
        ...student,
        attendedCount,
        totalHeld: heldSessions.length,
        attendanceRate: attRate,
        submittedAssignmentsCount: studentSubs.length,
        totalAssignments,
        isAtRisk: isLowAttendance || isMissingAssignments,
        riskFactors: [
          ...(isLowAttendance ? [`Low Attendance (${attRate}% < 75%)`] : []),
          ...(isMissingAssignments ? [`Missing Assignments (${studentSubs.length}/${totalAssignments})`] : [])
        ]
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
      instructor,
      students: studentsAnalysis,
      heldSessionsCount: heldSessions.length,
      totalSessionsCount: sessions.length,
      atRiskCount: studentsAnalysis.filter(s => s.isAtRisk).length
    };
  });

  res.json({
    mentor: req.mentor,
    groups: groupsData
  });
});

module.exports = router;
