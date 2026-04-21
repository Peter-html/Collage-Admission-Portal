const Course = require('../models/Course');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all active courses
// @route   GET /api/courses
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ courseName: 1 });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Manager only)
// ─────────────────────────────────────────────────────────────────────────────
const createCourse = async (req, res, next) => {
  try {
    const {
      courseName,
      department,
      duration,
      totalSeats,
      eligibility,
      cutoff,
    } = req.body;

    if (!courseName || !department || !totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'courseName, department, and totalSeats are required',
      });
    }

    const existing = await Course.findOne({ courseName: courseName.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Course "${courseName}" already exists`,
      });
    }

    const course = await Course.create({
      courseName: courseName.trim(),
      department: department.trim(),
      duration: duration || '4 Years',
      totalSeats: parseInt(totalSeats),
      eligibility: eligibility || { minPercentage: 60, requiredSubjects: ['Mathematics', 'Physics'] },
      cutoff: cutoff ? parseFloat(cutoff) : undefined,
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Manager only)
// ─────────────────────────────────────────────────────────────────────────────
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { courseName, department, duration, totalSeats, eligibility, cutoff, isActive } = req.body;

    if (courseName) course.courseName = courseName.trim();
    if (department) course.department = department.trim();
    if (duration) course.duration = duration;
    if (totalSeats !== undefined) {
      const newTotal = parseInt(totalSeats);
      if (newTotal < course.filledSeats) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total seats below current filled seats (${course.filledSeats})`,
        });
      }
      course.totalSeats = newTotal;
    }
    if (eligibility) course.eligibility = eligibility;
    if (cutoff !== undefined) course.cutoff = parseFloat(cutoff);
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private (Manager only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.filledSeats > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a course with approved students. Deactivate it instead.',
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all courses with full stats (admin view)
// @route   GET /api/courses/admin/all
// @access  Private (Manager only)
// ─────────────────────────────────────────────────────────────────────────────
const getCoursesAdmin = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ courseName: 1 });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getCoursesAdmin };
