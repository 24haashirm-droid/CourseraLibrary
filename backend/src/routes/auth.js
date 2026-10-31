const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../db');
const { JWT_SECRET, authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash, 'user']
    );

    const user = {
      id: result.id,
      name: name.trim(),
      email: cleanEmail,
      role: 'user',
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error while registering user.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRow = await get('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!userRow) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, userRow.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error while signing in.' });
  }
});

// Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRow = await get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get stats
    const stats = await get(
      `SELECT
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedCount,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as inProgressCount,
        COUNT(CASE WHEN status = 'NOT_COMPLETED' THEN 1 END) as savedCount,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN c.duration ELSE 0 END), 0) as totalHoursEarned,
        COUNT(CASE WHEN status = 'COMPLETED' AND c.has_project = 1 THEN 1 END) as completedProjectsCount
       FROM personal_course_status pcs
       JOIN courses c ON pcs.course_id = c.id
       WHERE pcs.user_id = ?`,
      [req.user.id]
    );

    const submissionStats = await get(
      `SELECT
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pendingSubmissions,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approvedSubmissions,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejectedSubmissions
       FROM course_submissions
       WHERE submitting_user_id = ?`,
      [req.user.id]
    );

    res.json({
      user: userRow,
      stats: {
        ...stats,
        ...submissionStats,
      },
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Admin: List all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await all(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
        (SELECT COUNT(*) FROM personal_course_status WHERE user_id = u.id AND status = 'COMPLETED') as completed_courses,
        (SELECT COUNT(*) FROM course_submissions WHERE submitting_user_id = u.id) as submissions_count
       FROM users u ORDER BY u.created_at DESC`
    );
    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
