import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingConfirmation.css';

const BookingConfirmation = ({ bookingData, onClose }) => {
  const navigate = useNavigate();

  if (!bookingData) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="booking-confirmation-overlay">
      <div className="booking-confirmation-modal">
        <div className="confirmation-header">
          <div className="confirmation-icon">✅</div>
          <h2 className="confirmation-title">Booking Confirmed!</h2>
          <p className="confirmation-subtitle">
            Your seats have been successfully booked
          </p>
        </div>

        <div className="confirmation-body">
          <div className="confirmation-details">
            <div className="detail-row">
              <span className="detail-label">Booking ID</span>
              <span className="detail-value">{bookingData.bookingId || 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Event</span>
              <span className="detail-value">{bookingData.eventName || 'Event'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-value">{bookingData.eventDate ? formatDate(bookingData.eventDate) : 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Venue</span>
              <span className="detail-value">{bookingData.eventVenue || 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Seats</span>
              <span className="detail-value seat-numbers">
                {bookingData.seatNumbers?.join(', ') || 'N/A'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value amount">
                ${bookingData.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          <div className="confirmation-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Browse More Events
            </button>
            <button 
              className="btn btn-secondary"
              onClick={onClose || (() => navigate('/'))}
            >
              Close
            </button>
          </div>
        </div>

        <div className="confirmation-footer">
          <p className="confirmation-note">
            📧 A confirmation email has been sent to your registered email address
          </p>
          <p className="confirmation-note">
            🎫 Please show this confirmation at the venue entrance
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;