const mongoose = require('mongoose');

const SEAT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked'
};

const seatSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true
  },
  row: {
    type: String,
    required: [true, 'Row is required'],
    trim: true
  },
  column: {
    type: Number,
    required: [true, 'Column is required'],
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'booked'],
    default: 'available',
    required: true,
    index: true
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservedAt: {
    type: Date,
    default: null
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bookedAt: {
    type: Date,
    default: null
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ eventId: 1, status: 1 });

seatSchema.pre('save', function(next) {
  if (this.status === 'booked' && !this.bookedAt) {
    this.bookedAt = new Date();
  }
  if (this.status === 'reserved' && !this.reservedAt) {
    this.reservedAt = new Date();
  }
  next();
});

seatSchema.statics.isSeatAvailable = async function(eventId, seatNumber) {
  const seat = await this.findOne({ eventId, seatNumber });
  return seat && seat.status === 'available';
};

seatSchema.methods.reserve = async function(userId) {
  if (this.status !== 'available') {
    throw new Error('Seat is not available');
  }
  this.status = 'reserved';
  this.reservedBy = userId;
  this.reservedAt = new Date();
  return this.save();
};

seatSchema.methods.book = async function(userId) {
  if (this.status !== 'reserved') {
    throw new Error('Seat is not reserved');
  }
  this.status = 'booked';
  this.bookedBy = userId;
  this.bookedAt = new Date();
  return this.save();
};

seatSchema.methods.release = async function() {
  if (this.status === 'reserved') {
    this.status = 'available';
    this.reservedBy = null;
    this.reservedAt = null;
    return this.save();
  }
  throw new Error('Seat is not reserved');
};

module.exports = mongoose.model('Seat', seatSchema);