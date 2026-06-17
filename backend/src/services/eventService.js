const Event = require('../models/Event');
const Seat = require('../models/Seat');
const { SEAT_STATUS } = require('../utils/constants');

class EventService {
  // Get all events
  async getAllEvents() {
    return await Event.find({ isActive: true })
      .sort({ date: 1 })
      .select('-createdBy');
  }

  // Get event by ID with seat information
  async getEventById(eventId) {
    const event = await Event.findById(eventId)
      .select('-createdBy');
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Get seat summary
    const seats = await Seat.find({ eventId });
    const seatSummary = {
      total: seats.length,
      available: seats.filter(s => s.status === SEAT_STATUS.AVAILABLE).length,
      reserved: seats.filter(s => s.status === SEAT_STATUS.RESERVED).length,
      booked: seats.filter(s => s.status === SEAT_STATUS.BOOKED).length
    };

    return {
      ...event.toObject(),
      seatSummary
    };
  }

  // Get seats for an event
  async getEventSeats(eventId) {
    const seats = await Seat.find({ eventId })
      .sort({ row: 1, column: 1 })
      .select('-__v');
    
    if (!seats.length) {
      throw new Error('No seats found for this event');
    }

    return seats;
  }

  // Create event with seats
  async createEvent(eventData, userId) {
    const { totalSeats, price, ...eventInfo } = eventData;

    // Create event
    const event = await Event.create({
      ...eventInfo,
      totalSeats,
      availableSeats: totalSeats,
      createdBy: userId,
      price
    });

    // Generate seats
    const seats = [];
    const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seatsPerRow = Math.ceil(totalSeats / 8); // Assuming 8 rows max
    
    let seatCount = 0;
    for (let i = 0; i < 8 && seatCount < totalSeats; i++) {
      const row = rows[i];
      const seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatCount);
      
      for (let j = 1; j <= seatsInThisRow; j++) {
        seats.push({
          eventId: event._id,
          seatNumber: `${row}${j}`,
          row: row,
          column: j,
          status: SEAT_STATUS.AVAILABLE,
          price: price
        });
        seatCount++;
      }
    }

    await Seat.insertMany(seats);

    return event;
  }

  // Update event
  async updateEvent(eventId, updateData, userId) {
    const event = await Event.findOne({ _id: eventId, createdBy: userId });
    if (!event) {
      throw new Error('Event not found or unauthorized');
    }

    Object.assign(event, updateData);
    await event.save();
    return event;
  }

  // Delete event
  async deleteEvent(eventId, userId) {
    const event = await Event.findOne({ _id: eventId, createdBy: userId });
    if (!event) {
      throw new Error('Event not found or unauthorized');
    }

    // Delete all seats
    await Seat.deleteMany({ eventId });
    await event.deleteOne();
    
    return true;
  }
}

module.exports = new EventService();