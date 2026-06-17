import axios from 'axios';

// Use relative path for Docker nginx proxy
const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = 'demo_token_' + Date.now();
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Sending request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url, 'status:', response.status);
    return response.data;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received');
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0
      });
    } else {
      console.error('Request setup error:', error.message);
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 500
      });
    }
  }
);

// API functions
export const eventAPI = {
  getAllEvents: () => api.get('/events'),
  getEventById: (id) => api.get(`/events/${id}`),
  getEventSeats: (id) => api.get(`/events/${id}/seats`)
};

export const reservationAPI = {
  reserveSeats: (data) => api.post('/reserve', data),
  getReservation: (reservationId) => api.get(`/reserve/${reservationId}`),
  releaseReservation: (reservationId) => api.delete(`/reserve/${reservationId}`)
};

export const bookingAPI = {
  confirmBooking: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getBookingDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`)
};

export default api;