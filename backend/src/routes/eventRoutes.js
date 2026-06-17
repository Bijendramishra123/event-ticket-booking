const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent, validateId, handleValidationErrors } = require('../utils/validation');

// All routes are public - No authentication needed

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', validateId, handleValidationErrors, eventController.getEventById);
router.get('/:id/seats', validateId, handleValidationErrors, eventController.getEventSeats);

// Admin routes (no auth for demo)
router.post('/', eventController.createEvent);
router.post('/sample', eventController.createSampleEvents);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;