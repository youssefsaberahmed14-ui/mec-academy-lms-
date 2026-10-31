const express = require('express');
const router = express.Router();
const db = require('../db');

// Login endpoint with password verification
router.post('/login', (req, res) => {
  const { email, password, role, accessPath } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password
  const storedPassword = user.password || 'Mec@2026';
  if (storedPassword !== String(password).trim()) {
    return res.status(401).json({ error: 'Invalid email or password' });
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

  // Sanitize user (never expose password to client)
  res.json({
    token,
    user: db.sanitizeUser(user)
  });
});

// Change Password endpoint for all authenticated users
router.post('/change-password', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const actualPassword = user.password || 'Mec@2026';
  if (actualPassword !== String(currentPassword).trim()) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  db.updatePassword(user.id, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully! Please use your new password next time you log in.'
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
  res.json({ user: db.sanitizeUser(user) });
});

module.exports = router;
