import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventDetails.css';

const EventDetails = ({ event, onBack }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  if (!event) {
    return (
      <div className="event-details-error">
        <p>Event not found</p>
        <button onClick={onBack} className="btn btn-primary">Back to Events</button>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <button onClick={onBack} className="btn btn-secondary back-btn">
        ← Back to Events
      </button>
      
      <div className="event-details-card">
        <div className="event-details-header">
          <div className="event-details-image">
            <img 
              src={event.imageUrl || 'https://via.placeholder.com/800x400?text=Event'} 
              alt={event.name} 
            />
            {new Date(event.date) < new Date() && (
              <span className="event-status-badge past">Past Event</span>
            )}
            {event.availableSeats === 0 && new Date(event.date) > new Date() && (
              <span className="event-status-badge sold-out">Sold Out</span>
            )}
          </div>
          
          <div className="event-details-info">
            <h1 className="event-details-title">{event.name}</h1>
            <p className="event-details-description">{event.description || 'No description available'}</p>
            
            <div className="event-details-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <div>
                  <div className="meta-label">Date</div>
                  <div className="meta-value">{formatDate(event.date)}</div>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon">⏰</span>
                <div>
                  <div className="meta-label">Time</div>
                  <div className="meta-value">{formatTime(event.time)}</div>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <div>
                  <div className="meta-label">Venue</div>
                  <div className="meta-value">{event.venue}</div>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon">💺</span>
                <div>
                  <div className="meta-label">Available Seats</div>
                  <div className="meta-value">{event.availableSeats || 0}</div>
                </div>
              </div>
            </div>
            
            <div className="event-details-footer">
              <div className="event-price">
                <span className="price-label">Price per seat</span>
                <span className="price-value">${event.price?.toFixed(2) || '0.00'}</span>
              </div>
              <button 
                className="btn btn-primary view-seats-btn"
                onClick={() => navigate(`/event/${event._id}`)}
                disabled={event.availableSeats === 0 || new Date(event.date) < new Date()}
              >
                {event.availableSeats === 0 ? 'Sold Out' : 'View Seats'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;