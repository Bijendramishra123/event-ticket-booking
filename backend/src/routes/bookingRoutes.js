const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// REMOVED auth middleware - No authentication required

// Confirm booking
router.post('/', bookingController.confirmBooking);

// Get user's bookings
router.get('/my-bookings', bookingController.getUserBookings);

// Get booking details
router.get('/:bookingId', bookingController.getBookingDetails);

// Cancel booking
router.delete('/:bookingId', bookingController.cancelBooking);

module.exports = router;