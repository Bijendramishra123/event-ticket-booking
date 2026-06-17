const reservationService = require('../services/reservationService');
const { HTTP_STATUS } = require('../utils/constants');

class ReservationController {
  // Reserve seats
  async reserveSeats(req, res, next) {
    try {
      const { eventId, seatNumbers } = req.body;
      // Use demo user ID if not provided
      const userId = req.user?._id || '507f1f77bcf86cd799439011';

      // Validate seat numbers
      if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'At least one seat is required'
        });
      }

      // Check maximum seats
      const MAX_SEATS = 10;
      if (seatNumbers.length > MAX_SEATS) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Cannot reserve more than ${MAX_SEATS} seats at a time`
        });
      }

      const reservation = await reservationService.reserveSeats(
        userId,
        eventId,
        seatNumbers
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: reservation,
        message: 'Seats reserved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get reservation details
  async getReservation(req, res, next) {
    try {
      const { reservationId } = req.params;
      const userId = req.user?._id || '507f1f77bcf86cd799439011';
      
      const reservation = await reservationService.getReservation(reservationId);
      
      // Check if user owns this reservation
      if (reservation.userId.toString() !== userId.toString()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'You do not have access to this reservation'
        });
      }

      // Calculate remaining time
      const now = new Date();
      const expiresAt = new Date(reservation.expiresAt);
      const remainingTime = Math.max(0, Math.floor((expiresAt - now) / 1000));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          ...reservation.toObject(),
          remainingSeconds: remainingTime,
          isExpired: remainingTime === 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Release reservation
  async releaseReservation(req, res, next) {
    try {
      const { reservationId } = req.params;
      const userId = req.user?._id || '507f1f77bcf86cd799439011';
      
      const reservation = await reservationService.getReservation(reservationId);
      if (reservation.userId.toString() !== userId.toString()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'You do not have access to this reservation'
        });
      }

      await reservationService.releaseReservation(reservationId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Reservation released successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Cleanup expired reservations
  async cleanupExpired(req, res, next) {
    try {
      const result = await reservationService.cleanupExpiredReservations();
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
        message: 'Expired reservations cleaned up'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservationController();