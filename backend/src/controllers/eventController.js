const Event = require('../models/Event');
const Seat = require('../models/Seat');
const { HTTP_STATUS } = require('../utils/constants');

const SEAT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked'
};

const DEMO_USER_ID = '507f1f77bcf86cd799439011';

class EventController {
  // Get all events
  async getAllEvents(req, res, next) {
    try {
      const events = await Event.find({ isActive: true })
        .sort({ date: 1 })
        .select('-createdBy');
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      next(error);
    }
  }

  // Get event by ID
  async getEventById(req, res, next) {
    try {
      const { id } = req.params;
      
      const event = await Event.findById(id).select('-createdBy');
      
      if (!event) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Event not found'
        });
      }

      const seats = await Seat.find({ eventId: id });
      const seatSummary = {
        total: seats.length,
        available: seats.filter(s => s.status === SEAT_STATUS.AVAILABLE).length,
        reserved: seats.filter(s => s.status === SEAT_STATUS.RESERVED).length,
        booked: seats.filter(s => s.status === SEAT_STATUS.BOOKED).length
      };

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          ...event.toObject(),
          seatSummary
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get seats for an event
  async getEventSeats(req, res, next) {
    try {
      const { id } = req.params;
      
      const seats = await Seat.find({ eventId: id })
        .sort({ row: 1, column: 1 })
        .select('-__v');
      
      if (!seats || seats.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'No seats found for this event'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        count: seats.length,
        data: seats
      });
    } catch (error) {
      next(error);
    }
  }

  // Create event
  async createEvent(req, res, next) {
    try {
      const { totalSeats, price, ...eventInfo } = req.body;
      const userId = DEMO_USER_ID;

      const event = await Event.create({
        ...eventInfo,
        totalSeats,
        availableSeats: totalSeats,
        createdBy: userId,
        price
      });

      const seats = [];
      const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const seatsPerRow = 8;
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

      if (seats.length > 0) {
        await Seat.insertMany(seats);
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Create sample events
  async createSampleEvents(req, res, next) {
    try {
      const count = parseInt(req.query.count) || 5;
      const userId = DEMO_USER_ID;
      
      const sampleEvents = [];
      
      const eventNames = [
        'Tech Conference 2024',
        'Summer Music Festival',
        'Startup Pitch Night',
        'Art Exhibition Gala',
        'Business Leadership Summit'
      ];
      
      const venues = [
        'Convention Center',
        'City Park Amphitheater',
        'Innovation Hub',
        'Modern Art Gallery',
        'Grand Hotel'
      ];
      
      const descriptions = [
        'Annual technology conference featuring the latest in AI and Machine Learning',
        'Live music performances with international artists',
        'Watch 10 innovative startups pitch to investors',
        'Experience contemporary art from emerging artists',
        'Learn from top CEOs and business leaders'
      ];
      
      const maxEvents = Math.min(count, eventNames.length);
      
      for (let i = 0; i < maxEvents; i++) {
        const totalSeats = Math.floor(Math.random() * 30) + 20;
        const price = Math.floor(Math.random() * 150) + 50;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (i + 1) * 3);
        
        const event = await Event.create({
          name: eventNames[i % eventNames.length],
          description: descriptions[i % descriptions.length],
          date: futureDate,
          time: (Math.floor(Math.random() * 6) + 6) + ':00 PM',
          venue: venues[i % venues.length],
          totalSeats: totalSeats,
          price: price,
          createdBy: userId,
          isActive: true
        });
        
        const seats = [];
        const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const seatsPerRow = 8;
        let seatCount = 0;
        
        for (let j = 0; j < 8 && seatCount < totalSeats; j++) {
          const row = rows[j];
          const seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatCount);
          
          for (let k = 1; k <= seatsInThisRow; k++) {
            seats.push({
              eventId: event._id,
              seatNumber: row + k,
              row: row,
              column: k,
              status: SEAT_STATUS.AVAILABLE,
              price: price
            });
            seatCount++;
          }
        }
        
        if (seats.length > 0) {
          await Seat.insertMany(seats);
        }
        
        sampleEvents.push(event);
        console.log('✅ Created sample event: "' + event.name + '" with ' + seats.length + ' seats');
      }
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        count: sampleEvents.length,
        data: sampleEvents,
        message: sampleEvents.length + ' sample events created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update event
  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const event = await Event.findById(id);
      
      if (!event) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Event not found'
        });
      }

      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt' && key !== 'updatedAt') {
          event[key] = updateData[key];
        }
      });
      
      await event.save();
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: event,
        message: 'Event updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete event
  async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;
      
      const event = await Event.findById(id);
      
      if (!event) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Event not found'
        });
      }

      await Seat.deleteMany({ eventId: id });
      await event.deleteOne();
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();