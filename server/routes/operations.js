const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify operations or supervisor role
const requireOpsOrSupervisor = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const user = db.getUserById(userId);
  if (!user || (user.role !== 'operations' && user.role !== 'supervisor')) {
    return res.status(403).json({ error: 'Access restricted to Operations staff and Supervisors' });
  }
  req.user = user;
  next();
};

// ==========================================
// 1. COURSES (Add, List, Edit with visible price)
// ==========================================

// GET /api/operations/courses
router.get('/courses', requireOpsOrSupervisor, (req, res) => {
  const courses = db.getCourses();
  const groups = db.getGroups();

  const enrichedCourses = courses.map(c => {
    const activeGroupsCount = groups.filter(g => g.courseId === c.id).length;
    return {
      ...c,
      activeGroupsCount
    };
  });

  res.json({ courses: enrichedCourses });
});

// POST /api/operations/courses
router.post('/courses', requireOpsOrSupervisor, (req, res) => {
  const { title, code, price, category, totalPlannedSessions, hasQuizzes, description } = req.body;

  if (!title || price === undefined) {
    return res.status(400).json({ error: 'Course title and price are required' });
  }

  try {
    const newCourse = db.createCourse({
      title,
      code,
      price: Number(price),
      category,
      totalPlannedSessions: Number(totalPlannedSessions) || 12,
      hasQuizzes: Boolean(hasQuizzes),
      description
    });
    res.status(201).json({ success: true, course: newCourse });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/operations/courses/:id
router.put('/courses/:id', requireOpsOrSupervisor, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedCourse = db.updateCourse(id, updates);
  if (!updatedCourse) return res.status(404).json({ error: 'Course not found' });

  res.json({ success: true, course: updatedCourse });
});

// ==========================================
// 2. USERS (Instructors, Mentors, Students)
// ==========================================

// GET /api/operations/users
router.get('/users', requireOpsOrSupervisor, (req, res) => {
  const { role } = req.query;
  const users = db.getUsers(role);
  const groups = db.getGroups();

  const enrichedUsers = users.map(u => {
    let assignedGroupsCount = 0;
    if (u.role === 'instructor') {
      assignedGroupsCount = groups.filter(g => g.instructorId === u.id).length;
    } else if (u.role === 'mentor') {
      assignedGroupsCount = groups.filter(g => g.mentorId === u.id).length;
    } else if (u.role === 'student') {
      assignedGroupsCount = groups.filter(g => (g.studentIds || []).includes(u.id)).length;
    }
    const safeUser = db.sanitizeUser(u);
    return {
      ...safeUser,
      assignedGroupsCount
    };
  });

  res.json({ users: enrichedUsers });
});

// POST /api/operations/users
router.post('/users', requireOpsOrSupervisor, (req, res) => {
  const { name, email, role, password, phone, specialization, expertise } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and valid role are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists' });
  }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  try {
    const newUser = db.createUser({
      name,
      email,
      role,
      password: password ? String(password).trim() : 'Mec@2026',
      phone: phone || '',
      avatar: initials,
      specialization: specialization || expertise || '',
      expertise: expertise || specialization || '',
      status: 'active'
    });
    res.status(201).json({ success: true, user: db.sanitizeUser(newUser) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/operations/users/:id
router.put('/users/:id', requireOpsOrSupervisor, (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  // If password update is included
  if (updates.password) {
    updates.password = String(updates.password).trim();
  }

  const updatedUser = db.updateUser(id, updates);
  if (!updatedUser) return res.status(404).json({ error: 'User not found' });

  res.json({ success: true, user: db.sanitizeUser(updatedUser) });
});

// ==========================================
// 3. GROUPS (Links Course, Instructor, Mentor, Enrolled Students)
// ==========================================

// GET /api/operations/groups
router.get('/groups', requireOpsOrSupervisor, (req, res) => {
  const groups = db.getGroups();

  const enrichedGroups = groups.map(g => {
    const course = db.getCourseById(g.courseId);
    const instructor = db.getUserById(g.instructorId);
    const mentor = db.getUserById(g.mentorId);
    const students = (g.studentIds || []).map(id => db.getUserById(id)).filter(Boolean);
    const sessions = db.getSessionsByGroup(g.id);
    const heldSessions = sessions.filter(s => s.status === 'held');

    return {
      ...g,
      course,
      instructor,
      mentor,
      students,
      studentsCount: students.length,
      sessionsCount: sessions.length,
      heldSessionsCount: heldSessions.length
    };
  });

  res.json({ groups: enrichedGroups });
});

// POST /api/operations/groups
router.post('/groups', requireOpsOrSupervisor, (req, res) => {
  const { name, courseId, instructorId, mentorId, studentIds, schedule, startDate, endDate, status } = req.body;

  if (!name || !courseId || !instructorId || !mentorId) {
    return res.status(400).json({
      error: 'Group name, course, instructor, and mentor are all required to create a group'
    });
  }

  try {
    const newGroup = db.createGroup({
      name,
      courseId,
      instructorId,
      mentorId,
      studentIds: Array.isArray(studentIds) ? studentIds : [],
      schedule: schedule || 'Mon & Wed 18:00 - 21:00',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      status: status || 'active'
    });

    res.status(201).json({ success: true, group: newGroup });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/operations/groups/:id
router.put('/groups/:id', requireOpsOrSupervisor, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedGroup = db.updateGroup(id, updates);
  if (!updatedGroup) return res.status(404).json({ error: 'Group not found' });

  res.json({ success: true, group: updatedGroup });
});

module.exports = router;
