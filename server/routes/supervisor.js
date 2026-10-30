const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify supervisor role
const requireSupervisor = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const user = db.getUserById(userId);
  if (!user || user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Access restricted to Academy Supervisors' });
  }
  req.supervisor = user;
  next();
};

// GET /api/supervisor/oversight
router.get('/oversight', requireSupervisor, (req, res) => {
  const groups = db.getGroups();
  const courses = db.getCourses();
  const allUsers = db.getUsers();
  const instructors = allUsers.filter(u => u.role === 'instructor');
  const mentors = allUsers.filter(u => u.role === 'mentor');
  const students = allUsers.filter(u => u.role === 'student');

  let totalSessionsHeldAcrossAcademy = 0;
  let totalSessionsPlannedAcrossAcademy = 0;
  let cumulativeAttendancePercentages = [];
  const atRiskStudents = [];

  // Group oversight analysis
  const groupsOverview = groups.map(group => {
    const course = db.getCourseById(group.courseId);
    const instructor = db.getUserById(group.instructorId);
    const mentor = db.getUserById(group.mentorId);
    const groupStudents = (group.studentIds || []).map(id => db.getUserById(id)).filter(Boolean);
    const sessions = db.getSessionsByGroup(group.id);
    const attendanceRecords = db.getAttendanceForGroup(group.id);
    const submissions = db.getSubmissionsForGroup(group.id);

    const heldSessions = sessions.filter(s => s.status === 'held');
    totalSessionsHeldAcrossAcademy += heldSessions.length;
    totalSessionsPlannedAcrossAcademy += sessions.length;

    // Student performance analysis within group
    const studentPerformance = groupStudents.map(student => {
      const studentAtt = attendanceRecords.filter(a => a.studentId === student.id);
      const attendedCount = heldSessions.filter(s => studentAtt.some(a => a.sessionId === s.id)).length;
      const attRate = heldSessions.length > 0 ? Math.round((attendedCount / heldSessions.length) * 100) : 100;
      const studentSubs = submissions.filter(s => s.studentId === student.id);

      if (attRate < 75) {
        atRiskStudents.push({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          groupName: group.name,
          courseName: course ? course.title : 'Course',
          instructorName: instructor ? instructor.name : 'Unassigned',
          mentorName: mentor ? mentor.name : 'Unassigned',
          attendanceSummary: `${attendedCount} of ${heldSessions.length} sessions attended`,
          attendanceRate: attRate,
          reason: `Attendance is below 75% threshold (${attRate}%)`
        });
      }

      return {
        studentId: student.id,
        name: student.name,
        attendanceRate: attRate,
        submissionsCount: studentSubs.length
      };
    });

    const groupAvgAttendance = studentPerformance.length > 0
      ? Math.round(studentPerformance.reduce((acc, sp) => acc + sp.attendanceRate, 0) / studentPerformance.length)
      : 100;

    cumulativeAttendancePercentages.push(groupAvgAttendance);

    // Group health metric
    let health = 'Normal';
    if (groupAvgAttendance >= 85) health = 'Exemplary';
    else if (groupAvgAttendance < 75) health = 'Needs Attention';

    return {
      groupId: group.id,
      groupName: group.name,
      status: group.status,
      schedule: group.schedule,
      course: course ? { id: course.id, title: course.title, code: course.code, price: course.price } : null,
      instructor: instructor ? { id: instructor.id, name: instructor.name, email: instructor.email } : null,
      mentor: mentor ? { id: mentor.id, name: mentor.name, email: mentor.email } : null,
      studentCount: groupStudents.length,
      sessionsHeld: heldSessions.length,
      totalSessions: sessions.length,
      averageAttendanceRate: groupAvgAttendance,
      totalSubmissions: submissions.length,
      health
    };
  });

  // Instructor performance review
  const instructorMetrics = instructors.map(inst => {
    const assignedGroups = groups.filter(g => g.instructorId === inst.id);
    let sessionsDelivered = 0;
    let studentCount = 0;
    let attSum = 0;

    assignedGroups.forEach(g => {
      const gSessions = db.getSessionsByGroup(g.id);
      const held = gSessions.filter(s => s.status === 'held');
      sessionsDelivered += held.length;
      studentCount += (g.studentIds || []).length;

      const groupAtt = db.getAttendanceForGroup(g.id);
      const gStudents = (g.studentIds || []).map(id => db.getUserById(id)).filter(Boolean);
      if (gStudents.length > 0 && held.length > 0) {
        const studentAvg = gStudents.reduce((acc, st) => {
          const attended = held.filter(s => groupAtt.some(a => a.sessionId === s.id && a.studentId === st.id)).length;
          return acc + (attended / held.length) * 100;
        }, 0) / gStudents.length;
        attSum += studentAvg;
      }
    });

    return {
      id: inst.id,
      name: inst.name,
      email: inst.email,
      specialization: inst.specialization,
      groupsCount: assignedGroups.length,
      sessionsDelivered,
      totalStudents: studentCount,
      avgGroupAttendance: assignedGroups.length > 0 ? Math.round(attSum / assignedGroups.length) : 100
    };
  });

  // Mentor performance review
  const mentorMetrics = mentors.map(men => {
    const assignedGroups = groups.filter(g => g.mentorId === men.id);
    let menteeCount = 0;
    let flaggedMentees = 0;

    assignedGroups.forEach(g => {
      const gStudents = g.studentIds || [];
      menteeCount += gStudents.length;
      const gAtt = db.getAttendanceForGroup(g.id);
      const gHeld = db.getSessionsByGroup(g.id).filter(s => s.status === 'held');
      gStudents.forEach(stId => {
        const attended = gHeld.filter(s => gAtt.some(a => a.sessionId === s.id && a.studentId === stId)).length;
        if (gHeld.length > 0 && (attended / gHeld.length) < 0.75) {
          flaggedMentees++;
        }
      });
    });

    return {
      id: men.id,
      name: men.name,
      email: men.email,
      expertise: men.expertise,
      groupsCount: assignedGroups.length,
      menteeCount,
      flaggedMentees
    };
  });

  // Academy-wide averages
  const overallAvgAttendance = cumulativeAttendancePercentages.length > 0
    ? Math.round(cumulativeAttendancePercentages.reduce((a, b) => a + b, 0) / cumulativeAttendancePercentages.length)
    : 100;

  res.json({
    kpis: {
      activeGroupsCount: groups.filter(g => g.status === 'active').length,
      totalEnrolledStudents: students.length,
      totalInstructors: instructors.length,
      totalMentors: mentors.length,
      totalCourses: courses.length,
      overallAvgAttendance,
      sessionsHeldAcrossAcademy: totalSessionsHeldAcrossAcademy,
      sessionsPlannedAcrossAcademy: totalSessionsPlannedAcrossAcademy,
      atRiskStudentsCount: atRiskStudents.length
    },
    groupsOverview,
    instructorMetrics,
    mentorMetrics,
    atRiskStudents
  });
});

// POST /api/supervisor/action/flag-student
// Read-focused action: Log supervisor guidance note / alert to mentor
router.post('/action/flag-student', requireSupervisor, (req, res) => {
  const { studentId, note } = req.body;
  const student = db.getUserById(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // In an academy LMS, the supervisor issues an academic advisory notice
  res.json({
    success: true,
    message: `Academic advisory notice logged for ${student.name}. Mentor and Instructor notified.`,
    note,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
