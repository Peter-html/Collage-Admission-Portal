const Application = require('../models/Application');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');

// ─── Helper: Calculate merit rank for applicants in a course ─────────────────
const calculateMeritRank = async (courseId) => {
  const applications = await Application.find({
    courseId,
    status: { $in: ['pending', 'approved'] },
  }).sort({
    'academicDetails.pcmPercentage': -1, // Highest PCM first
    appliedAt: 1,                         // Earlier application breaks tie
  });

  return applications;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a new application (Student)
// @route   POST /api/applications
// @access  Private (Student)
// ─────────────────────────────────────────────────────────────────────────────
const submitApplication = async (req, res, next) => {
  try {
    const {
      courseId,
      tenthMarks,
      twelfthMarks,
      mathsMarks,
      physicsMarks,
      chemistryMarks,
      // Personal details from frontend registration form
      fullName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      pincode,
      aadharNumber,
      communityCategory,
      fatherName,
      motherName,
      guardianPhone,
      annualIncome,
    } = req.body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!courseId || !tenthMarks || !twelfthMarks || !mathsMarks || !physicsMarks || !chemistryMarks) {
      return res.status(400).json({
        success: false,
        message: 'courseId, tenthMarks, twelfthMarks, mathsMarks, physicsMarks, and chemistryMarks are required',
      });
    }

    // ── Check course exists ──────────────────────────────────────────────────
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ success: false, message: 'Course not found or inactive' });
    }

    // ── Check seats available ────────────────────────────────────────────────
    if (course.remainingSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: `No seats available in ${course.courseName}. All ${course.totalSeats} seats are filled.`,
      });
    }

    // ── Check duplicate application ──────────────────────────────────────────
    const existing = await Application.findOne({
      studentId: req.user._id,
      courseId,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You have already applied for ${course.courseName}. Application ID: ${existing._id}`,
      });
    }

    // ── Check eligibility ────────────────────────────────────────────────────
    const pcm = (parseFloat(mathsMarks) + parseFloat(physicsMarks) + parseFloat(chemistryMarks)) / 3;
    const twelfthPct = parseFloat(twelfthMarks);

    if (twelfthPct < course.eligibility.minPercentage) {
      return res.status(400).json({
        success: false,
        message: `You do not meet the minimum 12th percentage requirement of ${course.eligibility.minPercentage}% for ${course.courseName}. Your 12th: ${twelfthPct}%`,
      });
    }

    // ── Create application ───────────────────────────────────────────────────
    const application = await Application.create({
      studentId: req.user._id,
      courseId,
      academicDetails: {
        tenthMarks: parseFloat(tenthMarks),
        twelfthMarks: parseFloat(twelfthMarks),
        mathsMarks: parseFloat(mathsMarks),
        physicsMarks: parseFloat(physicsMarks),
        chemistryMarks: parseFloat(chemistryMarks),
        // pcmPercentage auto-calculated by pre-save hook
      },
      personalDetails: {
        fullName: fullName || req.user.name,
        phone: phone || req.user.phone,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        pincode,
        aadharNumber,
        communityCategory,
        fatherName,
        motherName,
        guardianPhone,
        annualIncome,
      },
      status: 'pending',
    });

    const populated = await Application.findById(application._id)
      .populate('courseId', 'courseName department')
      .populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! You will be notified by email once reviewed.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get student's own applications
// @route   GET /api/applications/my
// @access  Private (Student)
// ─────────────────────────────────────────────────────────────────────────────
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('courseId', 'courseName department duration totalSeats filledSeats eligibility')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get ALL applications (Admin)
// @route   GET /api/applications
// @access  Private (Manager)
// ─────────────────────────────────────────────────────────────────────────────
const getAllApplications = async (req, res, next) => {
  try {
    const { status, courseId, search, sortBy, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (courseId && courseId !== 'all') filter.courseId = courseId;

    // Build base query
    let query = Application.find(filter)
      .populate('courseId', 'courseName department totalSeats filledSeats')
      .populate('studentId', 'name email phone');

    // Apply search (by student name or email via populate)
    let applications = await query.sort({
      'academicDetails.pcmPercentage': -1,
      appliedAt: 1,
    });

    // Client-side search filter (after populate)
    if (search) {
      const q = search.toLowerCase();
      applications = applications.filter(
        (a) =>
          a.personalDetails.fullName?.toLowerCase().includes(q) ||
          a.studentId?.email?.toLowerCase().includes(q) ||
          a.studentId?.name?.toLowerCase().includes(q) ||
          a.personalDetails.phone?.includes(q)
      );
    }

    // Pagination
    const total = applications.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = applications.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      success: true,
      count: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single application by ID (Admin)
// @route   GET /api/applications/:id
// @access  Private (Manager)
// ─────────────────────────────────────────────────────────────────────────────
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('courseId', 'courseName department totalSeats filledSeats eligibility')
      .populate('studentId', 'name email phone createdAt');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Students can only see their own
    if (req.user.role === 'student' && application.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve an application (with merit-based + seat check logic)
// @route   PUT /api/applications/:id/approve
// @access  Private (Manager)
// ─────────────────────────────────────────────────────────────────────────────
const approveApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate(
      'studentId',
      'name email'
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Application is already approved' });
    }

    // ── Get latest course data ───────────────────────────────────────────────
    const course = await Course.findById(application.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Associated course not found' });
    }

    // ── Check seat availability ──────────────────────────────────────────────
    // If previously rejected (seat was not counted), treat as fresh approval attempt
    const wasRejected = application.status === 'rejected';

    if (course.remainingSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: No remaining seats in ${course.courseName}. (${course.filledSeats}/${course.totalSeats} filled)`,
      });
    }

    // ── Merit-based check ────────────────────────────────────────────────────
    // Sort all pending/approved applicants by PCM desc, appliedAt asc
    const rankedApplicants = await calculateMeritRank(application.courseId);
    const studentPcm = application.academicDetails.pcmPercentage;
    const studentAppliedAt = application.appliedAt;

    // Count how many students with HIGHER or EQUAL priority are already approved
    const higherPriorityApproved = await Application.countDocuments({
      courseId: application.courseId,
      status: 'approved',
      _id: { $ne: application._id },
      $or: [
        { 'academicDetails.pcmPercentage': { $gt: studentPcm } },
        {
          'academicDetails.pcmPercentage': studentPcm,
          appliedAt: { $lt: studentAppliedAt },
        },
      ],
    });

    // Student's effective rank = higher priority approved + 1
    const effectiveRank = higherPriorityApproved + 1;

    if (effectiveRank > course.totalSeats) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: Student's merit rank (${effectiveRank}) exceeds total seats (${course.totalSeats}). Students with higher PCM% should be approved first.`,
        meritRank: effectiveRank,
        totalSeats: course.totalSeats,
      });
    }

    // ── Approve ──────────────────────────────────────────────────────────────
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.rank = effectiveRank;
    await application.save();

    // Update course seat count
    course.filledSeats += 1;
    await course.save();

    // Send approval email
    const emailResult = await sendApprovalEmail({
      studentName: application.personalDetails.fullName || application.studentId.name,
      studentEmail: application.studentId.email,
      courseName: course.courseName,
    });

    res.status(200).json({
      success: true,
      message: `Application approved successfully! Student rank: ${effectiveRank}. ${emailResult.mocked ? '(Email mocked - configure EMAIL_USER in .env)' : 'Email notification sent.'}`,
      data: application,
      meritRank: effectiveRank,
      seatsRemaining: course.remainingSeats,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject an application
// @route   PUT /api/applications/:id/reject
// @access  Private (Manager)
// ─────────────────────────────────────────────────────────────────────────────
const rejectApplication = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const application = await Application.findById(req.params.id).populate(
      'studentId',
      'name email'
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Application is already rejected' });
    }

    const wasApproved = application.status === 'approved';

    // ── Reject ───────────────────────────────────────────────────────────────
    application.status = 'rejected';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.rejectionReason = reason || 'Application did not meet selection criteria';
    await application.save();

    // If was previously approved, free up the seat
    if (wasApproved) {
      const course = await Course.findById(application.courseId);
      if (course && course.filledSeats > 0) {
        course.filledSeats -= 1;
        await course.save();
      }
    }

    // Get course name for email
    const course = await Course.findById(application.courseId);

    // Send rejection email
    const emailResult = await sendRejectionEmail({
      studentName: application.personalDetails.fullName || application.studentId.name,
      studentEmail: application.studentId.email,
      courseName: course?.courseName || 'Applied Course',
      reason: application.rejectionReason,
    });

    res.status(200).json({
      success: true,
      message: `Application rejected. ${wasApproved ? 'Seat has been freed up. ' : ''}${emailResult.mocked ? '(Email mocked)' : 'Email notification sent.'}`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get dashboard stats (Admin)
// @route   GET /api/applications/stats/dashboard
// @access  Private (Manager)
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalApplications,
      pendingCount,
      approvedCount,
      rejectedCount,
      courses,
      recentApplications,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
      Course.find({ isActive: true }),
      Application.find()
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate('courseId', 'courseName')
        .populate('studentId', 'name email'),
    ]);

    // Course-wise breakdown
    const courseStats = await Application.aggregate([
      {
        $group: {
          _id: '$courseId',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          avgPcm: { $avg: '$academicDetails.pcmPercentage' },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          courseName: '$course.courseName',
          department: '$course.department',
          totalSeats: '$course.totalSeats',
          filledSeats: '$course.filledSeats',
          total: 1,
          pending: 1,
          approved: 1,
          rejected: 1,
          avgPcm: { $round: ['$avgPcm', 2] },
        },
      },
      { $sort: { courseName: 1 } },
    ]);

    // Overall seat stats
    const totalSeats = courses.reduce((sum, c) => sum + c.totalSeats, 0);
    const filledSeats = courses.reduce((sum, c) => sum + c.filledSeats, 0);

    // Avg PCM of all applicants
    const avgPcmResult = await Application.aggregate([
      { $group: { _id: null, avg: { $avg: '$academicDetails.pcmPercentage' } } },
    ]);
    const avgPcm = avgPcmResult[0]?.avg?.toFixed(2) || '0';

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalApplications,
          pendingCount,
          approvedCount,
          rejectedCount,
          totalCourses: courses.length,
          totalSeats,
          filledSeats,
          remainingSeats: totalSeats - filledSeats,
          seatUtilization: totalSeats > 0 ? ((filledSeats / totalSeats) * 100).toFixed(1) : '0',
          avgPcm,
        },
        courseStats,
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get merit list for a course (sorted by PCM, then appliedAt)
// @route   GET /api/applications/merit/:courseId
// @access  Private (Manager)
// ─────────────────────────────────────────────────────────────────────────────
const getMeritList = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const applications = await Application.find({ courseId: req.params.courseId })
      .populate('studentId', 'name email phone')
      .sort({ 'academicDetails.pcmPercentage': -1, appliedAt: 1 });

    // Assign merit ranks
    const ranked = applications.map((app, index) => ({
      ...app.toJSON(),
      meritRank: index + 1,
      isWithinSeats: index + 1 <= course.totalSeats,
    }));

    res.status(200).json({
      success: true,
      course: {
        id: course._id,
        name: course.courseName,
        totalSeats: course.totalSeats,
        filledSeats: course.filledSeats,
        remainingSeats: course.remainingSeats,
      },
      count: ranked.length,
      data: ranked,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getAllApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  getDashboardStats,
  getMeritList,
};
