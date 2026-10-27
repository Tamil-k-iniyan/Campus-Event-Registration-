const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events with search, filtering, sorting, and pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      timeframe,
      sortBy = 'eventDate',
      order = 'asc',
      page = 1,
      limit = 9
    } = req.query;

    const query = {};

    // By default, public users only view published or closed events, not drafts
    if (status && ['published', 'closed', 'cancelled', 'draft'].includes(status)) {
      query.status = status;
    } else {
      query.status = { $in: ['published', 'closed'] };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search filter across title, description, and venue
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
        { organizer: searchRegex }
      ];
    }

    // Timeframe filter (upcoming vs past)
    const now = new Date();
    if (timeframe === 'upcoming') {
      query.eventDate = { $gte: now };
    } else if (timeframe === 'past') {
      query.eventDate = { $lt: now };
    }

    // Sorting
    const sortField = sortBy === 'createdAt' ? 'createdAt' : 'eventDate';
    const sortDirection = order === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortDirection };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: events.length,
      total: totalEvents,
      page: pageNum,
      totalPages: Math.ceil(totalEvents / limitNum),
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID with student registration status if authenticated
// @route   GET /api/events/:id
// @access  Public (Optional auth header inspected)
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Check if the current user is registered (if auth token was supplied)
    let isUserRegistered = false;
    let userRegistration = null;

    if (req.user) {
      userRegistration = await Registration.findOne({
        event: event._id,
        student: req.user.id,
        status: 'confirmed'
      });
      isUserRegistered = !!userRegistration;
    }

    res.status(200).json({
      success: true,
      event,
      isUserRegistered,
      registrationId: userRegistration ? userRegistration._id : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin only)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      venue,
      organizer,
      imageUrl,
      registrationDeadline,
      capacity,
      status
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      venue,
      organizer: organizer || 'Campus Event Committee',
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      registrationDeadline,
      capacity,
      status: status || 'published',
      registeredCount: 0,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Ensure capacity is not reduced below existing confirmed registrations
    if (req.body.capacity && req.body.capacity < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than the current number of registered students (${event.registeredCount}).`
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Cascade delete associated registrations
    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(event._id);

    res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
