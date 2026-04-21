/**
 * Database Seeder
 * Creates default admin account + initial courses on startup
 * Run manually: node config/seeder.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');

const defaultCourses = [
  {
    courseName: 'Computer Science & Engineering',
    department: 'CSE',
    duration: '4 Years',
    totalSeats: 180,
    eligibility: { minPercentage: 60, requiredSubjects: ['Mathematics', 'Physics'] },
    cutoff: 75,
  },
  {
    courseName: 'Electronics & Communication Engineering',
    department: 'ECE',
    duration: '4 Years',
    totalSeats: 120,
    eligibility: { minPercentage: 60, requiredSubjects: ['Mathematics', 'Physics'] },
    cutoff: 65,
  },
  {
    courseName: 'Mechanical Engineering',
    department: 'MECH',
    duration: '4 Years',
    totalSeats: 120,
    eligibility: { minPercentage: 60, requiredSubjects: ['Mathematics', 'Physics'] },
    cutoff: 60,
  },
  {
    courseName: 'Civil Engineering',
    department: 'CIVIL',
    duration: '4 Years',
    totalSeats: 60,
    eligibility: { minPercentage: 60, requiredSubjects: ['Mathematics', 'Physics'] },
    cutoff: 55,
  },
  {
    courseName: 'Electrical & Electronics Engineering',
    department: 'EEE',
    duration: '4 Years',
    totalSeats: 60,
    eligibility: { minPercentage: 60, requiredSubjects: ['Mathematics', 'Physics'] },
    cutoff: 60,
  },
  {
    courseName: 'Information Technology',
    department: 'IT',
    duration: '4 Years',
    totalSeats: 120,
    eligibility: { minPercentage: 60, requiredSubjects: ['Mathematics', 'Physics'] },
    cutoff: 70,
  },
];

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stjoseph';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin Manager';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'manager',
    });
    console.log(`✅ Default admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }
};

const seedCourses = async () => {
  const existingCount = await Course.countDocuments();
  if (existingCount === 0) {
    await Course.insertMany(defaultCourses);
    console.log(`✅ ${defaultCourses.length} default courses seeded`);
  } else {
    console.log(`ℹ️  Courses already exist (${existingCount}). Skipping seed.`);
  }
};

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB for seeding...');

    await seedAdmin();
    await seedCourses();

    console.log('🌱 Seeding complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

// Export for use in server.js auto-seeding
module.exports = { seedAdmin, seedCourses };

// Run directly if called as script
if (require.main === module) {
  runSeeder();
}
