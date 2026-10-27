const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Register current student for an event (with atomic capacity check)
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user.id;
    const { notes } = req.body;

    // 1. Verify Event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // 2. Check Event status
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: `Registration is not available. Event status is ${event.status}.`
      });
    }

    // 3. Check Registration Deadline
    const now = new Date();
    if (now > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this event.'
      });
    }

    // 4. Check for existing active registration
    const existingReg = await Registration.findOne({
      student: studentId,
      event: eventId
    });

    if (existingReg && existingReg.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.'
      });
    }

    // 5. Atomic Seat Reservation using MongoDB conditional increment
    // This prevents race conditions and ensures capacity is never exceeded
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'published',
        $expr: { $lt: ['$registeredCount', '$capacity'] }
      },
      {
        $inc: { registeredCount: 1 }
      },
      {
        new: true
      }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed: Event is already at maximum capacity.'
      });
    }

    // 6. Record or update registration
    let registration;
    try {
      if (existingReg) {
        // Re-confirming previously cancelled registration
        existingReg.status = 'confirmed';
        existingReg.registeredAt = new Date();
        existingReg.cancelledAt = null;
        if (notes) existingReg.notes = notes;
        registration = await existingReg.save();
      } else {
        registration = await Registration.create({
          student: studentId,
          event: eventId,
          status: 'confirmed',
          notes: notes || ''
        });
      }
    } catch (regError) {
      // Rollback seat increment if registration document creation failed
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
      throw regError;
    }

    // Populate event info for immediate frontend update
    await registration.populate('event', 'title category eventDate venue startTime endTime');

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event!',
      registration,
      remainingSeats: Math.max(0, updatedEvent.capacity - updatedEvent.registeredCount)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an existing registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student)
const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Find registration belonging to user
    const registration = await Registration.findOne({
      _id: id,
      student: studentId
    }).populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.'
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This registration is already cancelled.'
      });
    }

    // Check if the event date has already passed
    if (new Date() >= new Date(registration.event.eventDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration for an event that has already occurred or started.'
      });
    }

    // Update status to cancelled
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save();

    // Atomically decrement registered count on the event
    await Event.findByIdAndUpdate(registration.event._id, {
      $inc: { registeredCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations of the logged-in student
// @route   GET /api/registrations/my
// @access  Private (Student)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ student: req.user.id })
      .populate({
        path: 'event',
        select: 'title category eventDate startTime endTime venue organizer imageUrl capacity registeredCount status'
      })
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations
};
