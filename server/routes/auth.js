const express = require('express');
const router = express.Router();
const db = require('../db');

// Login endpoint
router.post('/login', (req, res) => {
  const { email, role, accessPath } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email' });
  }

  // Access path enforcement:
  // Admin path (/admin, /staff) ONLY permits operations and supervisor
  if (accessPath === 'staff' || accessPath === 'admin') {
    if (user.role !== 'operations' && user.role !== 'supervisor') {
      return res.status(403).json({
        error: `Access Denied: The Staff Portal is reserved for Operations and Supervisors. Role "${user.role}" must log in via the Learner & Instructor Portal.`
      });
    }
  }

  // Learner-facing login (/login) ONLY permits students, instructors, mentors
  if (accessPath === 'learner' || accessPath === 'public') {
    if (user.role === 'operations' || user.role === 'supervisor') {
      return res.status(403).json({
        error: `Access Denied: Operations and Supervisors must use the dedicated Staff Portal.`
      });
    }
    // Check role section matching if specified
    if (role && user.role !== role) {
      return res.status(403).json({
        error: `User "${user.name}" is registered as a ${user.role}, not a ${role}. Please log in under the ${user.role.toUpperCase()} section.`
      });
    }
  }

  // Token / session simulation
  const token = `mec_tok_${user.id}_${Date.now()}`;

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      department: user.department || user.specialization || user.expertise || ''
    }
  });
});

// Demo users grouped for convenience
router.get('/demo-users', (req, res) => {
  const users = db.getUsers();
  res.json({
    students: users.filter(u => u.role === 'student'),
    instructors: users.filter(u => u.role === 'instructor'),
    mentors: users.filter(u => u.role === 'mentor'),
    operations: users.filter(u => u.role === 'operations'),
    supervisors: users.filter(u => u.role === 'supervisor')
  });
});

// Current user profile check
router.get('/me', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

module.exports = router;
