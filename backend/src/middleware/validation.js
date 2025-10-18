const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'mechanic', 'owner'])
    .withMessage('Role must be admin, mechanic, or owner'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Vehicle validation rules
const validateVehicle = [
  body('make')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Make is required and must be less than 50 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model is required and must be less than 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 1900 and next year'),
  body('licensePlate')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('License plate is required and must be less than 20 characters'),
  body('vin')
    .optional({ nullable: true, checkFalsy: true }),
    // VIN is completely optional - no validation
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color must be less than 30 characters'),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  handleValidationErrors
];

// Service validation rules
const validateService = [
  body('serviceName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service name is required and must be less than 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description is required and must be less than 500 characters'),
  body('category')
    .isIn(['maintenance', 'repair', 'inspection', 'diagnostic', 'emergency', 'preventive', 'cosmetic'])
    .withMessage('Invalid service category'),
  body('baseCost')
    .isFloat({ min: 0 })
    .withMessage('Base cost must be a positive number'),
  body('estimatedDuration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('costType')
    .optional()
    .isIn(['fixed', 'hourly', 'variable'])
    .withMessage('Cost type must be fixed, hourly, or variable'),
  handleValidationErrors
];

// Booking validation rules
const validateBooking = [
  body('vehicle')
    .isMongoId()
    .withMessage('Valid vehicle ID is required'),
  body('service')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('bookingDate')
    .isISO8601()
    .withMessage('Valid booking date is required')
    .custom((value) => {
      const bookingDate = new Date(value);
      const now = new Date();
      if (bookingDate < now) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  body('bookingTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time format (HH:MM) is required'),
  body('serviceLocation')
    .isIn(['at_garage', 'mobile', 'pickup_delivery', 'roadside'])
    .withMessage('Invalid service location'),
  body('specialInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be less than 500 characters'),
  handleValidationErrors
];

// Review validation rules
const validateReview = [
  body('booking')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  body('detailedRatings.quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),
  body('detailedRatings.timeliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Timeliness rating must be between 1 and 5'),
  body('detailedRatings.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('detailedRatings.cleanliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Cleanliness rating must be between 1 and 5'),
  body('detailedRatings.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  handleValidationErrors
];

// Contact validation rules
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateVehicle,
  validateService,
  validateBooking,
  validateReview,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateContact
};
