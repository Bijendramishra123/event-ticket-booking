const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Event = require('../models/Event');
const Reservation = require('../models/Reservation');

const SEAT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked'
};

const RESERVATION_EXPIRY_MINUTES = 10;

class ReservationService {
  // Reserve seats
  async reserveSeats(userId, eventId, seatNumbers) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if event has available seats
      if (event.availableSeats < seatNumbers.length) {
        throw new Error('Not enough seats available');
      }

      // Find and lock seats
      const seats = await Seat.find({
        eventId,
        seatNumber: { $in: seatNumbers },
        status: SEAT_STATUS.AVAILABLE
      }).session(session);

      // Check if all requested seats are available
      if (seats.length !== seatNumbers.length) {
        const foundSeatNumbers = seats.map(s => s.seatNumber);
        const unavailableSeats = seatNumbers.filter(sn => !foundSeatNumbers.includes(sn));
        
        const unavailable = await Seat.find({
          eventId,
          seatNumber: { $in: unavailableSeats }
        }).session(session);

        const reservedSeats = unavailable.filter(s => s.status === SEAT_STATUS.RESERVED)
          .map(s => s.seatNumber);
        const bookedSeats = unavailable.filter(s => s.status === SEAT_STATUS.BOOKED)
          .map(s => s.seatNumber);

        let errorMessage = 'Some seats are not available: ';
        if (reservedSeats.length) errorMessage += `${reservedSeats.join(', ')} (reserved) `;
        if (bookedSeats.length) errorMessage += `${bookedSeats.join(', ')} (booked) `;
        
        throw new Error(errorMessage.trim());
      }

      // Reserve the seats
      const seatIds = [];
      let totalAmount = 0;
      
      for (const seat of seats) {
        seat.status = SEAT_STATUS.RESERVED;
        seat.reservedBy = userId;
        seat.reservedAt = new Date();
        await seat.save({ session });
        seatIds.push(seat._id);
        totalAmount += seat.price;
      }

      // Update event available seats
      event.availableSeats -= seats.length;
      await event.save({ session });

      // Create reservation
      const expiresAt = new Date(Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);
      const reservation = await Reservation.create([{
        userId,
        eventId,
        seatIds,
        seatNumbers,
        expiresAt,
        totalAmount,
        isActive: true
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return {
        reservationId: reservation[0]._id,
        seatNumbers,
        expiresAt,
        totalAmount,
        expiryMinutes: RESERVATION_EXPIRY_MINUTES
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Get reservation by ID
  async getReservation(reservationId) {
    const reservation = await Reservation.findOne({
      _id: reservationId,
      isActive: true
    }).populate('eventId', 'name venue date time');

    if (!reservation) {
      throw new Error('Reservation not found or expired');
    }

    if (reservation.isExpired()) {
      await this.releaseReservation(reservationId);
      throw new Error('Reservation has expired');
    }

    return reservation;
  }

  // Release reservation
  async releaseReservation(reservationId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await Reservation.findOne({
        _id: reservationId,
        isActive: true
      }).session(session);

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Release seats
      await Seat.updateMany(
        { _id: { $in: reservation.seatIds } },
        {
          status: SEAT_STATUS.AVAILABLE,
          reservedBy: null,
          reservedAt: null
        },
        { session }
      );

      // Update event available seats
      const event = await Event.findById(reservation.eventId).session(session);
      if (event) {
        event.availableSeats += reservation.seatIds.length;
        await event.save({ session });
      }

      // Deactivate reservation
      reservation.isActive = false;
      await reservation.save({ session });

      await session.commitTransaction();
      session.endSession();

      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Cleanup expired reservations
  async cleanupExpiredReservations() {
    const result = await Reservation.cleanupExpired();
    return { cleanedUp: result };
  }
}

module.exports = new ReservationService();