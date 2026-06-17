const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// REMOVED auth middleware - No authentication required
// All routes are public for demo

// Reserve seats
router.post('/', reservationController.reserveSeats);

// Get reservation details
router.get('/:reservationId', reservationController.getReservation);

// Release reservation
router.delete('/:reservationId', reservationController.releaseReservation);

// Admin: Cleanup expired reservations
router.post('/cleanup', reservationController.cleanupExpired);

module.exports = router;