const bookingService = require('../services/bookingService');
const { HTTP_STATUS } = require('../utils/constants');

const DEMO_USER_ID = '507f1f77bcf86cd799439011';

class BookingController {
  // Confirm booking
  async confirmBooking(req, res, next) {
    try {
      const { reservationId } = req.body;
      const userId = DEMO_USER_ID;

      if (!reservationId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Reservation ID is required'
        });
      }

      console.log('📝 Confirming booking:', { reservationId, userId });

      const booking = await bookingService.confirmBooking(userId, reservationId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: booking,
        message: 'Booking confirmed successfully!'
      });
    } catch (error) {
      console.error('❌ Booking error:', error.message);
      next(error);
    }
  }

  // Get user's booking history
  async getUserBookings(req, res, next) {
    try {
      const userId = DEMO_USER_ID;
      const bookings = await bookingService.getUserBookings(userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }

  // Get booking details
  async getBookingDetails(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = DEMO_USER_ID;

      const booking = await bookingService.getBookingDetails(bookingId, userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel booking
  async cancelBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = DEMO_USER_ID;

      const result = await bookingService.cancelBooking(bookingId, userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();