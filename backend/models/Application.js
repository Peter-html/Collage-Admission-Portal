const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    // Academic details matching the frontend form
    academicDetails: {
      tenthMarks: {
        type: Number,
        required: [true, '10th percentage is required'],
        min: 0,
        max: 100,
      },
      twelfthMarks: {
        type: Number,
        required: [true, '12th percentage is required'],
        min: 0,
        max: 100,
      },
      mathsMarks: {
        type: Number,
        required: [true, 'Maths marks required'],
        min: 0,
        max: 100,
      },
      physicsMarks: {
        type: Number,
        required: [true, 'Physics marks required'],
        min: 0,
        max: 100,
      },
      chemistryMarks: {
        type: Number,
        required: [true, 'Chemistry marks required'],
        min: 0,
        max: 100,
      },
      // PCM percentage auto-calculated on save
      pcmPercentage: {
        type: Number,
      },
    },
    // Personal details from registration form
    personalDetails: {
      fullName:    { type: String, required: true, trim: true },
      phone:       { type: String, required: true },
      dateOfBirth: { type: String },
      gender:      { type: String, enum: ['male', 'female', 'other'] },
      address:     { type: String },
      city:        { type: String },
      state:       { type: String },
      pincode:     { type: String },
      aadharNumber:      { type: String },
      communityCategory: { type: String, enum: ['general', 'obc', 'sc', 'st'] },
      fatherName:   { type: String },
      motherName:   { type: String },
      guardianPhone:{ type: String },
      annualIncome: { type: String },
    },
    documents: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
    },
    rank: {
      type: Number, // Merit rank within the course
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-calculate PCM% before saving
applicationSchema.pre('save', function (next) {
  const { mathsMarks, physicsMarks, chemistryMarks } = this.academicDetails;
  if (mathsMarks !== undefined && physicsMarks !== undefined && chemistryMarks !== undefined) {
    this.academicDetails.pcmPercentage = parseFloat(
      ((mathsMarks + physicsMarks + chemistryMarks) / 3).toFixed(2)
    );
  }
  next();
});

// Compound index: one application per student per course
applicationSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Indexes for sorting/filtering
applicationSchema.index({ courseId: 1, 'academicDetails.pcmPercentage': -1, appliedAt: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
