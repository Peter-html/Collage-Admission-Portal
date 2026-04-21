const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register  — Student registration
router.post('/register', register);

// POST /api/auth/login  — Login (student or manager)
router.post('/login', login);

// GET  /api/auth/me  — Get current user info
router.get('/me', protect, getMe);

module.exports = router;
