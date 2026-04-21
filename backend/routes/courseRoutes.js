const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesAdmin,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// ── Public routes ─────────────────────────────────────────────────────────────
// GET /api/courses — All active courses (for students / home page)
router.get('/', getCourses);

// GET /api/courses/:id — Single course
router.get('/:id', getCourse);

// ── Manager-only routes ───────────────────────────────────────────────────────
// GET /api/courses/admin/all — All courses including inactive
router.get('/admin/all', protect, authorize('manager'), getCoursesAdmin);

// POST /api/courses — Create course
router.post('/', protect, authorize('manager'), createCourse);

// PUT /api/courses/:id — Update course
router.put('/:id', protect, authorize('manager'), updateCourse);

// DELETE /api/courses/:id — Delete course
router.delete('/:id', protect, authorize('manager'), deleteCourse);

module.exports = router;
