const { body, param, validationResult } = require('express-validator');

// Validation rules
const validateEvent = [
  body('name').notEmpty().withMessage('Event name is required').trim(),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('time').notEmpty().withMessage('Event time is required'),
  body('venue').notEmpty().withMessage('Venue is required').trim(),
  body('totalSeats').isInt({ min: 1, max: 1000 }).withMessage('Total seats must be between 1 and 1000'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

const validateReservation = [
  body('eventId').isMongoId().withMessage('Invalid event ID'),
  body('seatNumbers').isArray({ min: 1 }).withMessage('At least one seat is required'),
  body('seatNumbers.*').notEmpty().withMessage('Seat number cannot be empty')
];

const validateBooking = [
  body('reservationId').isMongoId().withMessage('Invalid reservation ID')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateEvent,
  validateReservation,
  validateBooking,
  validateId,
  handleValidationErrors
};