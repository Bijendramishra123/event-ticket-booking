import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingAPI.getUserBookings();
      setBookings(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading your bookings..." />;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">📋 My Bookings</h1>
          <p className="page-subtitle">View all your confirmed bookings</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3>No bookings yet</h3>
          <p>Start exploring events and book your first ticket!</p>
          <a href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse Events
          </a>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <span className="booking-status confirmed">✅ Confirmed</span>
                <span className="booking-date">
                  {formatDate(booking.createdAt)}
                </span>
              </div>
              <div className="booking-body">
                <h3 className="booking-event-name">
                  {booking.eventId?.name || 'Event'}
                </h3>
                <div className="booking-details">
                  <div className="booking-detail">
                    <span className="detail-label">📅 Date</span>
                    <span className="detail-value">
                      {booking.eventId?.date ? formatDate(booking.eventId.date) : 'N/A'}
                    </span>
                  </div>
                  <div className="booking-detail">
                    <span className="detail-label">📍 Venue</span>
                    <span className="detail-value">
                      {booking.eventId?.venue || 'N/A'}
                    </span>
                  </div>
                  <div className="booking-detail">
                    <span className="detail-label">💺 Seats</span>
                    <span className="detail-value seat-numbers">
                      {booking.seatNumbers?.join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="booking-detail">
                    <span className="detail-label">💰 Total</span>
                    <span className="detail-value amount">
                      ${booking.totalAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Make sure to export default
export default MyBookings;