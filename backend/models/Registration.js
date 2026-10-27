const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    cancelledAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate registrations for the same event by the same student
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
