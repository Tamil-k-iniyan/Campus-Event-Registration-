const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { eventValidation, mongoIdParamValidation } = require('../middleware/validator');

router.get('/', getEvents);
router.get('/:id', mongoIdParamValidation('id'), optionalAuth, getEventById);
router.post('/', protect, authorize('admin'), eventValidation, createEvent);
router.put('/:id', protect, authorize('admin'), mongoIdParamValidation('id'), eventValidation, updateEvent);
router.delete('/:id', protect, authorize('admin'), mongoIdParamValidation('id'), deleteEvent);

module.exports = router;
