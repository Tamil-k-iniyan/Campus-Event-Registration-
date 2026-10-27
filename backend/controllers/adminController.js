const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// @desc    Get Admin Dashboard statistics and analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalEvents,
      upcomingEvents,
      totalStudents,
      totalRegistrations,
      confirmedRegistrations,
      recentRegistrations,
      eventsList
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ eventDate: { $gte: now }, status: 'published' }),
      User.countDocuments({ role: 'student' }),
      Registration.countDocuments(),
      Registration.countDocuments({ status: 'confirmed' }),
      Registration.find()
        .sort({ registeredAt: -1 })
        .limit(6)
        .populate('student', 'name email department studentId')
        .populate('event', 'title eventDate venue category'),
      Event.find()
        .sort({ eventDate: 1 })
        .limit(10)
        .select('title category eventDate venue capacity registeredCount status')
    ]);

    // Calculate category distribution
    const categoryStats = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        upcomingEvents,
        totalStudents,
        totalRegistrations,
        confirmedRegistrations
      },
      categoryStats,
      recentRegistrations,
      eventsList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registered students for a specific event
// @route   GET /api/admin/events/:eventId/registrations
// @access  Private (Admin only)
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { search, status } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const filter = { event: eventId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    let registrations = await Registration.find(filter)
      .populate('student', 'name email phone department studentId')
      .sort({ registeredAt: -1 });

    // In-memory search filter on populated student data
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      registrations = registrations.filter((reg) => {
        const student = reg.student;
        if (!student) return false;
        return (
          student.name?.toLowerCase().includes(q) ||
          student.email?.toLowerCase().includes(q) ||
          student.studentId?.toLowerCase().includes(q) ||
          student.department?.toLowerCase().includes(q)
        );
      });
    }

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        category: event.category,
        eventDate: event.eventDate,
        venue: event.venue,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        status: event.status
      },
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export registered students for an event as CSV
// @route   GET /api/admin/registrations/export/:eventId
// @access  Private (Admin only)
const exportRegistrationsCsv = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('student', 'name email phone department studentId')
      .sort({ registeredAt: 1 });

    // Construct CSV content
    const headers = [
      'Registration ID',
      'Student Name',
      'Email',
      'Phone',
      'Department',
      'Student ID',
      'Status',
      'Registered At',
      'Notes'
    ];

    const rows = registrations.map((r) => {
      const s = r.student || {};
      const escapeCsv = (str) =>
        `"${String(str || '').replace(/"/g, '""')}"`;

      return [
        escapeCsv(r._id),
        escapeCsv(s.name),
        escapeCsv(s.email),
        escapeCsv(s.phone),
        escapeCsv(s.department),
        escapeCsv(s.studentId),
        escapeCsv(r.status),
        escapeCsv(r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ''),
        escapeCsv(r.notes)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    const sanitizedTitle = event.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `registrations_${sanitizedTitle}_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getEventRegistrations,
  exportRegistrationsCsv
};
