const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/user-status/all - Get all tracked courses for current user
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const records = await all(
      `SELECT
        pcs.id as status_id,
        pcs.course_id,
        pcs.status,
        pcs.notes,
        pcs.updated_at,
        c.course_name,
        c.platform,
        c.course_link,
        c.duration,
        c.has_project,
        c.category,
        c.level
       FROM personal_course_status pcs
       JOIN courses c ON pcs.course_id = c.id
       WHERE pcs.user_id = ?
       ORDER BY pcs.updated_at DESC`,
      [req.user.id]
    );

    res.json({ records });
  } catch (err) {
    console.error('Fetch user statuses error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/user-status - Set or update status for a course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { course_id, status, notes } = req.body;

    if (!course_id || !status) {
      return res.status(400).json({ message: 'course_id and status are required.' });
    }

    const validStatuses = ['NOT_COMPLETED', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const course = await get('SELECT id, course_name FROM courses WHERE id = ?', [course_id]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found in database.' });
    }

    const existing = await get(
      'SELECT id FROM personal_course_status WHERE user_id = ? AND course_id = ?',
      [req.user.id, course_id]
    );

    if (existing) {
      await run(
        `UPDATE personal_course_status
         SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, notes !== undefined ? notes : null, existing.id]
      );
    } else {
      await run(
        `INSERT INTO personal_course_status (user_id, course_id, status, notes)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, course_id, status, notes || '']
      );
    }

    const updated = await get(
      'SELECT * FROM personal_course_status WHERE user_id = ? AND course_id = ?',
      [req.user.id, course_id]
    );

    res.json({
      message: `Status updated to ${status} for "${course.course_name}"`,
      statusRecord: updated,
    });
  } catch (err) {
    console.error('Set user status error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/user-status/:courseId - Remove status record
router.delete('/:courseId', authenticateToken, async (req, res) => {
  try {
    await run(
      'DELETE FROM personal_course_status WHERE user_id = ? AND course_id = ?',
      [req.user.id, req.params.courseId]
    );
    res.json({ message: 'Personal course status reset to default.' });
  } catch (err) {
    console.error('Delete user status error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
