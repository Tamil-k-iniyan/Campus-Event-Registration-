const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results and respond with clear field errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return res.status(400).json({
      success: false,
      message: formattedErrors[0].message,
      errors: formattedErrors
    });
  }
  next();
};

// Validation rules for student registration
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('department')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('Department name cannot exceed 80 characters'),
  body('studentId')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 })
    .withMessage('Student ID cannot exceed 30 characters'),
  validate
];

// Validation rules for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Validation rules for event create/update
const eventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Hackathon', 'Other'])
    .withMessage('Invalid category selected'),
  body('eventDate')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Event date must be a valid ISO date'),
  body('startTime')
    .trim()
    .notEmpty()
    .withMessage('Start time is required'),
  body('endTime')
    .trim()
    .notEmpty()
    .withMessage('End time is required'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue must be between 2 and 100 characters'),
  body('organizer')
    .trim()
    .notEmpty()
    .withMessage('Organizer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Organizer must be between 2 and 100 characters'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL format'),
  body('registrationDeadline')
    .notEmpty()
    .withMessage('Registration deadline is required')
    .isISO8601()
    .withMessage('Registration deadline must be a valid ISO date')
    .custom((value, { req }) => {
      const deadline = new Date(value);
      const eventDate = new Date(req.body.eventDate);
      if (deadline > eventDate) {
        throw new Error('Registration deadline cannot be after the event date');
      }
      return true;
    }),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive whole number of at least 1'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'closed', 'cancelled'])
    .withMessage('Status must be draft, published, closed, or cancelled'),
  validate
];

// Validate MongoDB ObjectId in route params
const mongoIdParamValidation = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ID format for ${paramName}`),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  eventValidation,
  mongoIdParamValidation
};
