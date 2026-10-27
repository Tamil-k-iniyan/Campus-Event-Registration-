const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { mongoIdParamValidation } = require('../middleware/validator');

router.get('/my', protect, getMyRegistrations);
router.post('/:eventId', protect, mongoIdParamValidation('eventId'), registerForEvent);
router.delete('/:id', protect, mongoIdParamValidation('id'), cancelRegistration);

module.exports = router;
