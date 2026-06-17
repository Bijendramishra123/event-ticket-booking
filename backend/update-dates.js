const mongoose = require('mongoose');
const Event = require('./src/models/Event');

async function updateDates() {
  try {
    // Use MongoDB Atlas connection string
    const MONGODB_URI = 'mongodb+srv://bijendramishra2002_db_user:Kd831946@officepantrycluster.b7d7cmw.mongodb.net/event_ticket_booking?retryWrites=true&w=majority';
    
    console.log('📝 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    const events = await Event.find({});
    console.log(`📊 Found ${events.length} events`);
    
    if (events.length === 0) {
      console.log('❌ No events found in database');
      process.exit(0);
    }
    
    const now = new Date();
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + (i + 1) * 3);
      event.date = futureDate;
      await event.save();
      console.log(`✅ Updated "${event.name}" to ${futureDate.toLocaleDateString()}`);
    }

    console.log('✅ All dates updated to future!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

updateDates();