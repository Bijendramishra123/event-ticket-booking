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
  // Reserve seats - WITHOUT transactions (completely removed)
  async reserveSeats(userId, eventId, seatNumbers) {
    try {
      console.log('📝 Starting reservation process...');
      
      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      console.log('✅ Event found:', event.name);

      // Check if event has available seats
      if (event.availableSeats < seatNumbers.length) {
        throw new Error(`Not enough seats available. Only ${event.availableSeats} seats left`);
      }

      // Find available seats
      const availableSeats = await Seat.find({
        eventId,
        seatNumber: { $in: seatNumbers },
        status: SEAT_STATUS.AVAILABLE
      });
      console.log(`✅ Found ${availableSeats.length} available seats`);

      // Check if all requested seats are available
      if (availableSeats.length !== seatNumbers.length) {
        const foundSeatNumbers = availableSeats.map(s => s.seatNumber);
        const unavailableSeats = seatNumbers.filter(sn => !foundSeatNumbers.includes(sn));
        
        // Check status of unavailable seats
        const unavailable = await Seat.find({
          eventId,
          seatNumber: { $in: unavailableSeats }
        });

        const reservedSeats = unavailable.filter(s => s.status === SEAT_STATUS.RESERVED)
          .map(s => s.seatNumber);
        const bookedSeats = unavailable.filter(s => s.status === SEAT_STATUS.BOOKED)
          .map(s => s.seatNumber);

        let errorMessage = 'Some seats are not available: ';
        if (reservedSeats.length) errorMessage += `${reservedSeats.join(', ')} (reserved) `;
        if (bookedSeats.length) errorMessage += `${bookedSeats.join(', ')} (booked) `;
        
        throw new Error(errorMessage.trim());
      }

      // Reserve the seats (one by one, no transaction)
      const seatIds = [];
      let totalAmount = 0;
      
      for (const seat of availableSeats) {
        seat.status = SEAT_STATUS.RESERVED;
        seat.reservedBy = userId;
        seat.reservedAt = new Date();
        await seat.save();
        seatIds.push(seat._id);
        totalAmount += seat.price;
        console.log(`✅ Reserved seat: ${seat.seatNumber}`);
      }

      // Update event available seats
      event.availableSeats -= availableSeats.length;
      await event.save();
      console.log(`✅ Updated event available seats: ${event.availableSeats}`);

      // Create reservation
      const expiresAt = new Date(Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);
      const reservation = await Reservation.create({
        userId,
        eventId,
        seatIds,
        seatNumbers,
        expiresAt,
        totalAmount,
        isActive: true
      });
      console.log(`✅ Created reservation: ${reservation._id}`);

      return {
        reservationId: reservation._id,
        seatNumbers,
        expiresAt,
        totalAmount,
        expiryMinutes: RESERVATION_EXPIRY_MINUTES
      };
    } catch (error) {
      console.error('❌ Reservation error:', error.message);
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

  // Release reservation - WITHOUT transactions
  async releaseReservation(reservationId) {
    try {
      console.log(`📝 Releasing reservation: ${reservationId}`);
      
      const reservation = await Reservation.findOne({
        _id: reservationId,
        isActive: true
      });

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
        }
      );
      console.log(`✅ Released ${reservation.seatIds.length} seats`);

      // Update event available seats
      const event = await Event.findById(reservation.eventId);
      if (event) {
        event.availableSeats += reservation.seatIds.length;
        await event.save();
        console.log(`✅ Updated event available seats: ${event.availableSeats}`);
      }

      // Deactivate reservation
      reservation.isActive = false;
      await reservation.save();
      console.log(`✅ Reservation deactivated`);

      return true;
    } catch (error) {
      console.error('❌ Release error:', error.message);
      throw error;
    }
  }

  // Cleanup expired reservations
  async cleanupExpiredReservations() {
    console.log('📝 Cleaning up expired reservations...');
    const result = await Reservation.cleanupExpired();
    console.log(`✅ Cleaned up ${result} expired reservations`);
    return { cleanedUp: result };
  }
}

module.exports = new ReservationService();