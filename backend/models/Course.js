const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      default: '4 Years',
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1'],
    },
    filledSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    eligibility: {
      minPercentage: {
        type: Number,
        default: 60,
        min: 0,
        max: 100,
      },
      requiredSubjects: {
        type: [String],
        default: ['Mathematics', 'Physics'],
      },
    },
    cutoff: {
      type: Number,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: remainingSeats (always auto-calculated)
courseSchema.virtual('remainingSeats').get(function () {
  return Math.max(0, this.totalSeats - this.filledSeats);
});

// Validation: filledSeats cannot exceed totalSeats
courseSchema.pre('save', function (next) {
  if (this.filledSeats > this.totalSeats) {
    return next(new Error('Filled seats cannot exceed total seats'));
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
