const express = require('express');
const { run, get, all } = require('../db');
const { optionalAuth, authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses - List courses with search & filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      durationFilter, // '20+', '30+', or 'all'
      minDuration,
      maxDuration,
      project, // 'yes', 'no', or 'all'
      platform,
      category,
      status, // 'COMPLETED', 'IN_PROGRESS', 'NOT_COMPLETED' (requires auth or returns unmatched)
      sortBy = 'duration_desc', // 'duration_desc', 'duration_asc', 'name_asc', 'newest'
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;

    let sql = `
      SELECT
        c.*,
        pcs.status as personal_status,
        pcs.notes as personal_notes,
        pcs.updated_at as status_updated_at
      FROM courses c
      LEFT JOIN personal_course_status pcs
        ON pcs.course_id = c.id AND pcs.user_id = ?
      WHERE 1=1
    `;

    const params = [currentUserId];

    // Search filter
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += ` AND (c.course_name LIKE ? OR c.description LIKE ? OR c.tags LIKE ? OR c.platform LIKE ? OR c.category LIKE ?)`;
      params.push(q, q, q, q, q);
    }

    // Duration filter
    // Note requirement: "Users can filter courses into 20+ Hours and 30+ Hours categories. A 35-hour course qualifies for both categories."
    const cleanDurFilter = (durationFilter || '').toString().trim().replace(/\s+/g, '+');
    if (cleanDurFilter === '20+' || cleanDurFilter === '20') {
      sql += ` AND c.duration >= 20`;
    } else if (cleanDurFilter === '30+' || cleanDurFilter === '30') {
      sql += ` AND c.duration >= 30`;
    }

    if (minDuration && !isNaN(parseInt(minDuration))) {
      sql += ` AND c.duration >= ?`;
      params.push(parseInt(minDuration));
    }

    if (maxDuration && !isNaN(parseInt(maxDuration))) {
      sql += ` AND c.duration <= ?`;
      params.push(parseInt(maxDuration));
    }

    // Project binary filter
    if (project === 'yes' || project === '1') {
      sql += ` AND c.has_project = 1`;
    } else if (project === 'no' || project === '0') {
      sql += ` AND c.has_project = 0`;
    }

    // Platform filter
    if (platform && platform !== 'all') {
      sql += ` AND LOWER(c.platform) = LOWER(?)`;
      params.push(platform);
    }

    // Category filter
    if (category && category !== 'all') {
      sql += ` AND LOWER(c.category) = LOWER(?)`;
      params.push(category);
    }

    // Personal status filter
    if (status && currentUserId) {
      if (status === 'NOT_COMPLETED') {
        sql += ` AND (pcs.status = 'NOT_COMPLETED' OR pcs.status IS NULL)`;
      } else {
        sql += ` AND pcs.status = ?`;
        params.push(status);
      }
    }

    // Sorting
    switch (sortBy) {
      case 'duration_desc':
        sql += ` ORDER BY c.duration DESC, c.course_name ASC`;
        break;
      case 'duration_asc':
        sql += ` ORDER BY c.duration ASC, c.course_name ASC`;
        break;
      case 'name_asc':
        sql += ` ORDER BY c.course_name ASC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY c.created_at DESC, c.id DESC`;
        break;
    }

    const courses = await all(sql, params);

    // Metadata: list of unique platforms and categories for filter options
    const platforms = await all(`SELECT DISTINCT platform FROM courses ORDER BY platform`);
    const categories = await all(`SELECT DISTINCT category FROM courses WHERE category IS NOT NULL ORDER BY category`);

    res.json({
      total: courses.length,
      courses,
      filterMeta: {
        platforms: platforms.map((p) => p.platform),
        categories: categories.map((c) => c.category),
      },
    });
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ message: 'Internal server error fetching courses.' });
  }
});

// GET /api/courses/:id - Single course details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const course = await get(
      `SELECT
        c.*,
        pcs.status as personal_status,
        pcs.notes as personal_notes,
        pcs.updated_at as status_updated_at
       FROM courses c
       LEFT JOIN personal_course_status pcs
         ON pcs.course_id = c.id AND pcs.user_id = ?
       WHERE c.id = ?`,
      [currentUserId, req.params.id]
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.json({ course });
  } catch (err) {
    console.error('Fetch course error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/courses - Admin add course directly
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { course_name, platform, course_link, duration, has_project, category, description, level, tags } = req.body;

    if (!course_name || !platform || !course_link || duration === undefined) {
      return res.status(400).json({ message: 'Course name, platform, link, and duration are required.' });
    }

    const dur = parseInt(duration);
    if (isNaN(dur) || dur <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number of hours.' });
    }

    const result = await run(
      `INSERT INTO courses (course_name, platform, course_link, duration, has_project, category, description, level, tags, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_name.trim(),
        platform.trim(),
        course_link.trim(),
        dur,
        has_project ? 1 : 0,
        category ? category.trim() : 'General',
        description ? description.trim() : '',
        level ? level.trim() : 'Beginner',
        tags ? tags.trim() : '',
        req.user.id,
      ]
    );

    const created = await get('SELECT * FROM courses WHERE id = ?', [result.id]);
    res.status(201).json({ message: 'Course added successfully.', course: created });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/courses/:id - Admin update course
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { course_name, platform, course_link, duration, has_project, category, description, level, tags } = req.body;

    const existing = await get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const dur = duration !== undefined ? parseInt(duration) : existing.duration;

    await run(
      `UPDATE courses
       SET course_name = ?, platform = ?, course_link = ?, duration = ?, has_project = ?, category = ?, description = ?, level = ?, tags = ?
       WHERE id = ?`,
      [
        course_name !== undefined ? course_name.trim() : existing.course_name,
        platform !== undefined ? platform.trim() : existing.platform,
        course_link !== undefined ? course_link.trim() : existing.course_link,
        dur,
        has_project !== undefined ? (has_project ? 1 : 0) : existing.has_project,
        category !== undefined ? category.trim() : existing.category,
        description !== undefined ? description.trim() : existing.description,
        level !== undefined ? level.trim() : existing.level,
        tags !== undefined ? tags.trim() : existing.tags,
        req.params.id,
      ]
    );

    const updated = await get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Course updated successfully.', course: updated });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/courses/:id - Admin delete course
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    await run('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
