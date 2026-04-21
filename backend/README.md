# ST.JOSEPH Engineering College — Admission Portal Backend

A production-ready Node.js + Express + MongoDB backend for the Engineering College Admission Portal.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (must be running first)
net start MongoDB

# 3. Start development server (auto-restart)
npm run dev

# 4. OR start production server
npm start
```

Server runs at: **http://localhost:5000**

## Default Admin
- Email: `admin@stjoseph`
- Password: `admin123`

## Environment Variables (.env)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/stjoseph_admissions
JWT_SECRET=stjoseph_super_secret_key_2026_admission_portal
ADMIN_EMAIL=admin@stjoseph
ADMIN_PASSWORD=admin123
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |
| GET | `/api/courses` | Public |
| POST | `/api/courses` | Manager |
| PUT | `/api/courses/:id` | Manager |
| DELETE | `/api/courses/:id` | Manager |
| POST | `/api/applications` | Student |
| GET | `/api/applications/my` | Student |
| GET | `/api/applications` | Manager |
| PUT | `/api/applications/:id/approve` | Manager |
| PUT | `/api/applications/:id/reject` | Manager |
| GET | `/api/applications/stats/dashboard` | Manager |
| GET | `/api/applications/merit/:courseId` | Manager |
| GET | `/api/health` | Public |
