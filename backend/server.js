/**
 * ST.JOSEPH Engineering College — Admission Portal Backend
 * Entry point: server.js
 *
 * Tech Stack: Node.js + Express.js + MongoDB (Mongoose) + JWT + Nodemailer
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { seedAdmin, seedCourses } = require('./config/seeder');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { verifyEmailConnection } = require('./utils/emailService');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const courseRoutes      = require('./routes/courseRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP Request Logger ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Global Rate Limiter ───────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api/', limiter);

// Auth endpoints get a stricter rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 ST.JOSEPH Admission Portal API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 ST.JOSEPH Engineering College Admission Portal API',
    docs: 'See README.md for API documentation',
    health: '/api/health',
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Server Bootstrap ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Auto-seed admin + courses (safe: checks before inserting)
    await seedAdmin();
    await seedCourses();

    // 3. Verify email connection (non-blocking)
    verifyEmailConnection();

    // 4. Start Express server
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  🎓 ST.JOSEPH Engineering College — Admission Portal');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  🚀 Server running on     : http://localhost:${PORT}`);
      console.log(`  🌍 Environment           : ${process.env.NODE_ENV || 'development'}`);
      console.log(`  📋 API Base URL          : http://localhost:${PORT}/api`);
      console.log(`  🔑 Default Admin         : ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('  API Endpoints:');
      console.log('    POST   /api/auth/register');
      console.log('    POST   /api/auth/login');
      console.log('    GET    /api/auth/me');
      console.log('    GET    /api/courses');
      console.log('    POST   /api/courses             [manager]');
      console.log('    GET    /api/applications        [manager]');
      console.log('    POST   /api/applications        [student]');
      console.log('    GET    /api/applications/my     [student]');
      console.log('    PUT    /api/applications/:id/approve [manager]');
      console.log('    PUT    /api/applications/:id/reject  [manager]');
      console.log('    GET    /api/applications/stats/dashboard [manager]');
      console.log('═══════════════════════════════════════════════════════');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
