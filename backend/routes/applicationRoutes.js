const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
  getAllApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  getDashboardStats,
  getMeritList,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// ── Student routes ────────────────────────────────────────────────────────────

// POST /api/applications — Submit application
router.post('/', protect, authorize('student'), submitApplication);

// GET /api/applications/my — Student's own applications
router.get('/my', protect, authorize('student'), getMyApplications);

// ── Manager routes ────────────────────────────────────────────────────────────

// GET /api/applications/stats/dashboard — Dashboard analytics
router.get('/stats/dashboard', protect, authorize('manager'), getDashboardStats);

// GET /api/applications/merit/:courseId — Merit list for a course
router.get('/merit/:courseId', protect, authorize('manager'), getMeritList);

// GET /api/applications — All applications with filters
router.get('/', protect, authorize('manager'), getAllApplications);

// GET /api/applications/:id — Single application (manager or own student)
router.get('/:id', protect, getApplication);

// PUT /api/applications/:id/approve — Approve application
router.put('/:id/approve', protect, authorize('manager'), approveApplication);

// PUT /api/applications/:id/reject — Reject application
router.put('/:id/reject', protect, authorize('manager'), rejectApplication);

module.exports = router;
