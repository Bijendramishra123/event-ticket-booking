const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');

const SEAT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked'
};

async function seedEvents() {
  try {
    // Check if events already exist
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log('📊 Database already has events, skipping seed');
      return;
    }

    console.log('🌱 Seeding database with sample events...');

    // Create a demo user ID
    const demoUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

    const eventsData = [
      {
        name: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest in AI and Machine Learning',
        date: new Date('2024-12-15'),
        time: '09:00 AM',
        venue: 'Convention Center, Hall A',
        totalSeats: 50,
        price: 99.99,
        createdBy: demoUserId,
        isActive: true
      },
      {
        name: 'Summer Music Festival',
        description: 'Live music performances with international artists',
        date: new Date('2024-12-20'),
        time: '07:00 PM',
        venue: 'City Park Amphitheater',
        totalSeats: 30,
        price: 149.99,
        createdBy: demoUserId,
        isActive: true
      },
      {
        name: 'Startup Pitch Night',
        description: 'Watch 10 innovative startups pitch to investors',
        date: new Date('2024-11-25'),
        time: '06:30 PM',
        venue: 'Innovation Hub, Startup Center',
        totalSeats: 20,
        price: 49.99,
        createdBy: demoUserId,
        isActive: true
      },
      {
        name: 'Art Exhibition Gala',
        description: 'Experience contemporary art from emerging artists',
        date: new Date('2024-12-10'),
        time: '08:00 PM',
        venue: 'Modern Art Gallery',
        totalSeats: 25,
        price: 75.00,
        createdBy: demoUserId,
        isActive: true
      },
      {
        name: 'Business Leadership Summit',
        description: 'Learn from top CEOs and business leaders',
        date: new Date('2024-12-05'),
        time: '10:00 AM',
        venue: 'Grand Hotel, Conference Room',
        totalSeats: 40,
        price: 199.99,
        createdBy: demoUserId,
        isActive: true
      }
    ];

    // Create events and seats
    for (let i = 0; i < eventsData.length; i++) {
      const eventData = eventsData[i];
      
      // Create event
      const event = new Event(eventData);
      await event.save();
      
      // Generate seats
      const seats = [];
      const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const seatsPerRow = 8;
      let seatCount = 0;
      
      for (let j = 0; j < 8 && seatCount < event.totalSeats; j++) {
        const row = rows[j];
        const seatsInThisRow = Math.min(seatsPerRow, event.totalSeats - seatCount);
        
        for (let k = 1; k <= seatsInThisRow; k++) {
          seats.push({
            eventId: event._id,
            seatNumber: row + k,
            row: row,
            column: k,
            status: SEAT_STATUS.AVAILABLE,
            price: event.price
          });
          seatCount++;
        }
      }

      if (seats.length > 0) {
        await Seat.insertMany(seats);
      }
      
      console.log('✅ Created event: "' + event.name + '" with ' + seats.length + ' seats');
    }

    console.log('✅ Database seeded successfully with sample data!');
    console.log('📊 Total events created: ' + eventsData.length);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  }
}

module.exports = seedEvents;