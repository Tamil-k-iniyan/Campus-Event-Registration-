const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Hackathon', 'Other'],
      default: 'Technical'
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      default: 'Campus Event Committee'
    },
    imageUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required']
    },
    capacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'cancelled'],
      default: 'published'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual remaining seats
eventSchema.virtual('remainingSeats').get(function () {
  return Math.max(0, this.capacity - (this.registeredCount || 0));
});

// Virtual isRegistrationOpen
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  const deadline = new Date(this.registrationDeadline);
  return (
    this.status === 'published' &&
    now <= deadline &&
    this.registeredCount < this.capacity
  );
});

// Indexes for fast searching and filtering
eventSchema.index({ eventDate: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ title: 'text', description: 'text', venue: 'text' });

module.exports = mongoose.model('Event', eventSchema);
