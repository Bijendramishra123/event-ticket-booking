const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'https://event-ticket-booking.vercel.app',
  'https://event-ticket-booking-one.vercel.app',
  'https://event-ticket-booking-ynst.vercel.app',
  'https://event-ticket-booking-hfdtu9gr1-bijendra-mishras-projects.vercel.app',
  'https://frontend-lilac-beta-60.vercel.app',
  'https://frontend-hrjfjxt0n-bijendra-mishras-projects.vercel.app',
  'https://event-booking-frontend.vercel.app',
  'https://frontend-pjwlkyhl6-bijendra-mishras-projects.vercel.app',
  'https://frontend-t5yvnie86-bijendra-mishras-projects.vercel.app',
  'https://frontend-jo8meu53b-bijendra-mishras-projects.vercel.app',
  'https://frontend-8hdpkihhm-bijendra-mishras-projects.vercel.app',
  'https://frontend-dipltcu2z-bijendra-mishras-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('📌 Origin:', req.headers.origin);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/reserve', reservationRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;