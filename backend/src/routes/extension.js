const express = require('express');
const { run, get, all } = require('../db');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper to clean URL for fuzzy matching
const cleanUrl = (urlStr) => {
  if (!urlStr) return '';
  try {
    const parsed = new URL(urlStr);
    // remove query parameters and hashes, strip trailing slash
    return (parsed.origin + parsed.pathname).toLowerCase().replace(/\/+$/, '');
  } catch {
    return urlStr.toLowerCase().split('?')[0].split('#')[0].replace(/\/+$/, '');
  }
};

// POST /api/extension/match - Match course on learning platform
router.post('/match', optionalAuth, async (req, res) => {
  try {
    const { url, title, platform } = req.body;

    if (!url && !title) {
      return res.status(400).json({ message: 'URL or title is required to identify course.' });
    }

    const cleanedSearchUrl = cleanUrl(url);
    const allCourses = await all('SELECT * FROM courses');

    let matchedCourse = null;

    // 1. URL match
    if (cleanedSearchUrl) {
      matchedCourse = allCourses.find((c) => {
        const cUrl = cleanUrl(c.course_link);
        return cUrl === cleanedSearchUrl ||
               (cUrl.length > 10 && cleanedSearchUrl.includes(cUrl)) ||
               (cleanedSearchUrl.length > 10 && cUrl.includes(cleanedSearchUrl));
      });
    }

    // 2. Title match fallback
    if (!matchedCourse && title) {
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
      const words = cleanTitle.split(/\s+/).filter((w) => w.length > 3);

      let bestScore = 0;
      for (const c of allCourses) {
        const cName = c.course_name.toLowerCase();
        if (cleanTitle === cName || cName.includes(cleanTitle) || cleanTitle.includes(cName)) {
          matchedCourse = c;
          break;
        }

        // Count overlapping significant keywords
        let matches = 0;
        for (const w of words) {
          if (cName.includes(w)) matches++;
        }
        if (matches >= 3 && matches > bestScore) {
          bestScore = matches;
          matchedCourse = c;
        }
      }
    }

    if (!matchedCourse) {
      return res.json({
        found: false,
        message: 'Course not yet cataloged in CourseFinder library.',
        detected: { url, title, platform },
        canSubmit: true,
      });
    }

    // Fetch personal status if user is authenticated
    let personalStatus = 'NOT_COMPLETED';
    let personalNotes = '';
    let statusRecord = null;

    if (req.user) {
      statusRecord = await get(
        'SELECT * FROM personal_course_status WHERE user_id = ? AND course_id = ?',
        [req.user.id, matchedCourse.id]
      );
      if (statusRecord) {
        personalStatus = statusRecord.status;
        personalNotes = statusRecord.notes;
      }
    }

    let statusLabel = 'You can do this — Not Completed';
    if (personalStatus === 'COMPLETED') {
      statusLabel = 'Already Completed';
    } else if (personalStatus === 'IN_PROGRESS') {
      statusLabel = 'Currently In Progress';
    }

    res.json({
      found: true,
      course: matchedCourse,
      personalStatus,
      statusLabel,
      personalNotes,
      eligible20Plus: matchedCourse.duration >= 20,
      eligible30Plus: matchedCourse.duration >= 30,
      hasProject: Boolean(matchedCourse.has_project),
      isAuthenticated: Boolean(req.user),
      user: req.user ? { id: req.user.id, name: req.user.name, email: req.user.email } : null,
    });
  } catch (err) {
    console.error('Extension match error:', err);
    res.status(500).json({ message: 'Internal server error matching course.' });
  }
});

// POST /api/extension/status - Set course status from extension
router.post('/status', authenticateToken, async (req, res) => {
  try {
    const { course_id, status } = req.body;

    if (!course_id || !status) {
      return res.status(400).json({ message: 'course_id and status are required.' });
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
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, existing.id]
      );
    } else {
      await run(
        `INSERT INTO personal_course_status (user_id, course_id, status)
         VALUES (?, ?, ?)`,
        [req.user.id, course_id, status]
      );
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      course_id,
      status,
    });
  } catch (err) {
    console.error('Extension status update error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/extension/quick-submit - Submit course from extension
router.post('/quick-submit', authenticateToken, async (req, res) => {
  try {
    const { course_name, platform, course_link, duration, has_project, category, description } = req.body;

    if (!course_name || !course_link) {
      return res.status(400).json({ message: 'Course name and link are required.' });
    }

    const dur = parseInt(duration) || 20;

    const result = await run(
      `INSERT INTO course_submissions
       (submitting_user_id, course_name, platform, course_link, duration, has_project, category, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        req.user.id,
        course_name.trim(),
        platform ? platform.trim() : 'Web',
        course_link.trim(),
        dur,
        has_project ? 1 : 0,
        category ? category.trim() : 'Online Course',
        description ? description.trim() : 'Submitted via CourseFinder Browser Extension',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Course submitted to pending review queue!',
      submissionId: result.id,
    });
  } catch (err) {
    console.error('Quick submit error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
