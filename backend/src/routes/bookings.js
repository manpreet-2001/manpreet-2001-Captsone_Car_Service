const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  rescheduleBooking,
  getMechanicCalendar
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { validateBooking, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Owner routes
router.route('/')
  .get(validatePagination, getBookings)
  .post(createBooking); // Temporarily remove validation to test

router.route('/calendar/:mechanicId')
  .get(validateObjectId('mechanicId'), getMechanicCalendar);

router.route('/:id')
  .get(validateObjectId('id'), getBooking);

router.route('/:id/status')
  .put(validateObjectId('id'), updateBookingStatus);

router.route('/:id/reschedule')
  .put(validateObjectId('id'), rescheduleBooking);

module.exports = router;
