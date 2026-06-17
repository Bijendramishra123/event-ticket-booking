const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const seedEvents = require('./src/utils/seed');

// Connect to MongoDB
connectDB();

// Seed data function
const initializeDatabase = async () => {
  try {
    await seedEvents();
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
};

// Run seed after connection
setTimeout(async () => {
  await initializeDatabase();
}, 3000);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ UNHANDLED REJECTION! 💥 Shutting down...');
  console.log('Error:', err.name, err.message);
  console.log('Stack:', err.stack);
  
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log('Error:', err.name, err.message);
  console.log('Stack:', err.stack);
  
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('👋 SIGINT RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(0);
  });
});

console.log('✅ Server configuration complete');