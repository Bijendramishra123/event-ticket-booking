const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Seat = require('../models/Seat');
const Event = require('../models/Event');

const SEAT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked'
};

class BookingService {
  // Confirm booking - WITHOUT transactions
  async confirmBooking(userId, reservationId) {
    try {
      console.log(`📝 Confirming booking: ${reservationId}`);
      
      // Get reservation
      const reservation = await Reservation.findOne({
        _id: reservationId,
        userId,
        isActive: true
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Check if reservation is expired
      if (reservation.isExpired()) {
        await this.releaseReservation(reservationId);
        throw new Error('Reservation has expired. Please reserve again.');
      }

      // Check if all seats are still reserved
      const seats = await Seat.find({
        _id: { $in: reservation.seatIds },
        status: SEAT_STATUS.RESERVED,
        reservedBy: userId
      });

      if (seats.length !== reservation.seatIds.length) {
        throw new Error('Some seats are no longer reserved. Please try again.');
      }

      // Book all seats
      for (const seat of seats) {
        seat.status = SEAT_STATUS.BOOKED;
        seat.bookedBy = userId;
        seat.bookedAt = new Date();
        seat.reservedBy = null;
        seat.reservedAt = null;
        await seat.save();
        console.log(`✅ Booked seat: ${seat.seatNumber}`);
      }

      // Deactivate reservation
      reservation.isActive = false;
      await reservation.save();
      console.log(`✅ Booking confirmed for reservation: ${reservationId}`);

      return {
        success: true,
        bookingId: reservationId,
        seatNumbers: reservation.seatNumbers,
        eventId: reservation.eventId,
        totalAmount: reservation.totalAmount,
        message: 'Booking confirmed successfully!'
      };
    } catch (error) {
      console.error('❌ Booking error:', error.message);
      throw error;
    }
  }

  // Get booking history for user
  async getUserBookings(userId) {
    const bookings = await Reservation.find({
      userId,
      isActive: false,
      seatIds: { $exists: true, $ne: [] }
    })
    .populate('eventId', 'name venue date time')
    .sort({ createdAt: -1 })
    .select('-seatIds');

    return bookings;
  }

  // Get booking details
  async getBookingDetails(bookingId, userId) {
    const booking = await Reservation.findOne({
      _id: bookingId,
      userId,
      isActive: false
    })
    .populate('eventId', 'name venue date time')
    .populate('seatIds', 'seatNumber row column price');

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  // Cancel booking - WITHOUT transactions
  async cancelBooking(bookingId, userId) {
    try {
      console.log(`📝 Cancelling booking: ${bookingId}`);
      
      const booking = await Reservation.findOne({
        _id: bookingId,
        userId,
        isActive: false
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if event is in the future (allow cancellation)
      const event = await Event.findById(booking.eventId);
      if (event && new Date(event.date) < new Date()) {
        throw new Error('Cannot cancel past events');
      }

      // Release seats
      await Seat.updateMany(
        { _id: { $in: booking.seatIds } },
        {
          status: SEAT_STATUS.AVAILABLE,
          bookedBy: null,
          bookedAt: null
        }
      );
      console.log(`✅ Released ${booking.seatIds.length} seats`);

      // Update event available seats
      if (event) {
        event.availableSeats += booking.seatIds.length;
        await event.save();
        console.log(`✅ Updated event available seats: ${event.availableSeats}`);
      }

      // Mark booking as cancelled
      booking.seatIds = [];
      booking.seatNumbers = [];
      await booking.save();
      console.log(`✅ Booking cancelled`);

      return {
        success: true,
        message: 'Booking cancelled successfully'
      };
    } catch (error) {
      console.error('❌ Cancel error:', error.message);
      throw error;
    }
  }
}

module.exports = new BookingService();