const mongoose = require('mongoose');

const RESERVATION_EXPIRY_MINUTES = 10;

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  seatIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true
  }],
  seatNumbers: [{
    type: String,
    required: true
  }],
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);
    },
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

reservationSchema.index({ userId: 1, isActive: 1 });
reservationSchema.index({ eventId: 1, isActive: 1 });

reservationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

reservationSchema.methods.isValid = function() {
  return this.isActive && !this.isExpired();
};

reservationSchema.pre('save', function(next) {
  if (this.isModified('seatIds') && this.seatIds.length === 0) {
    return next(new Error('At least one seat is required'));
  }
  next();
});

reservationSchema.statics.cleanupExpired = async function() {
  const expiredReservations = await this.find({
    expiresAt: { $lt: new Date() },
    isActive: true
  });

  const Seat = mongoose.model('Seat');
  
  for (let i = 0; i < expiredReservations.length; i++) {
    const reservation = expiredReservations[i];
    
    // Release all seats
    await Seat.updateMany(
      { _id: { $in: reservation.seatIds } },
      { 
        status: 'available',
        reservedBy: null,
        reservedAt: null
      }
    );

    // Deactivate reservation
    reservation.isActive = false;
    await reservation.save();
  }

  return expiredReservations.length;
};

module.exports = mongoose.model('Reservation', reservationSchema);