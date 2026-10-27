const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getEventRegistrations,
  exportRegistrationsCsv
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdParamValidation } = require('../middleware/validator');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/events/:eventId/registrations', mongoIdParamValidation('eventId'), getEventRegistrations);
router.get('/registrations/export/:eventId', mongoIdParamValidation('eventId'), exportRegistrationsCsv);

module.exports = router;
