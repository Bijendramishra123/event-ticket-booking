const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const eventRoutes = require('./routes/eventRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// CORS configuration - Allow all origins for production
const corsOptions = {
  origin: [
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
    'https://frontend-dipltcu2z-bijendra-mishras-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/reserve', reservationRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(errorHandler);

module.exports = app;