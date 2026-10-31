const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/submissions - User submit a new course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { course_name, platform, course_link, duration, has_project, category, description } = req.body;

    if (!course_name || !platform || !course_link || duration === undefined) {
      return res.status(400).json({ message: 'Course name, platform, course link, and duration are required.' });
    }

    const dur = parseInt(duration);
    if (isNaN(dur) || dur <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive integer in hours.' });
    }

    // Optional check: is it already in courses?
    const existingCourse = await get(
      'SELECT id, course_name FROM courses WHERE LOWER(course_link) = LOWER(?) OR LOWER(course_name) = LOWER(?)',
      [course_link.trim(), course_name.trim()]
    );

    if (existingCourse) {
      return res.status(400).json({
        message: `This course is already in the CourseFinder global library as "${existingCourse.course_name}".`,
      });
    }

    const result = await run(
      `INSERT INTO course_submissions
       (submitting_user_id, course_name, platform, course_link, duration, has_project, category, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        req.user.id,
        course_name.trim(),
        platform.trim(),
        course_link.trim(),
        dur,
        has_project ? 1 : 0,
        category ? category.trim() : 'General',
        description ? description.trim() : '',
      ]
    );

    const submission = await get('SELECT * FROM course_submissions WHERE id = ?', [result.id]);
    res.status(201).json({
      message: 'Course submitted successfully! It is now pending administrator review.',
      submission,
    });
  } catch (err) {
    console.error('Submit course error:', err);
    res.status(500).json({ message: 'Internal server error submitting course.' });
  }
});

// GET /api/submissions/my - Submitting user view their own submissions
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const submissions = await all(
      `SELECT * FROM course_submissions
       WHERE submitting_user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ submissions });
  } catch (err) {
    console.error('Fetch my submissions error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/submissions - Admin list all submissions
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT
        s.*,
        u.name as submitter_name,
        u.email as submitter_email,
        reviewer.name as reviewer_name
      FROM course_submissions s
      JOIN users u ON s.submitting_user_id = u.id
      LEFT JOIN users reviewer ON s.reviewed_by = reviewer.id
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ` WHERE s.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY s.created_at DESC`;

    const submissions = await all(sql, params);
    res.json({ submissions });
  } catch (err) {
    console.error('Admin fetch submissions error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/submissions/:id/review - Admin approve or reject submission
router.put('/:id/review', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, admin_notes, course_name, platform, course_link, duration, has_project, category, description } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "approve" or "reject".' });
    }

    const submission = await get('SELECT * FROM course_submissions WHERE id = ?', [req.params.id]);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (action === 'approve') {
      // Use any admin overrides or original submission data
      const finalName = course_name || submission.course_name;
      const finalPlatform = platform || submission.platform;
      const finalLink = course_link || submission.course_link;
      const finalDuration = duration !== undefined ? parseInt(duration) : submission.duration;
      const finalHasProject = has_project !== undefined ? (has_project ? 1 : 0) : submission.has_project;
      const finalCategory = category || submission.category;
      const finalDesc = description || submission.description;

      // Add to global courses
      const courseResult = await run(
        `INSERT INTO courses
         (course_name, platform, course_link, duration, has_project, category, description, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [finalName, finalPlatform, finalLink, finalDuration, finalHasProject, finalCategory, finalDesc, submission.submitting_user_id]
      );

      // Update submission status
      await run(
        `UPDATE course_submissions
         SET status = 'Approved', admin_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [admin_notes || 'Approved and published to Global Course Library.', req.user.id, req.params.id]
      );

      const createdCourse = await get('SELECT * FROM courses WHERE id = ?', [courseResult.id]);
      return res.json({
        message: 'Submission approved and course published to Global Course Library!',
        course: createdCourse,
      });
    } else {
      // Reject
      await run(
        `UPDATE course_submissions
         SET status = 'Rejected', admin_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [admin_notes || 'Submission rejected by administrator.', req.user.id, req.params.id]
      );

      return res.json({ message: 'Submission marked as rejected.' });
    }
  } catch (err) {
    console.error('Review submission error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
