import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = new Date(event.date) > new Date();

  // Generate a gradient background based on event name
  const getGradient = (name) => {
    const colors = [
      'linear-gradient(135deg, #1a237e, #2196f3)',
      'linear-gradient(135deg, #d32f2f, #f44336)',
      'linear-gradient(135deg, #1a237e, #d32f2f)',
      'linear-gradient(135deg, #0d1442, #1a237e)',
      'linear-gradient(135deg, #b71c1c, #d32f2f)',
      'linear-gradient(135deg, #283593, #1976d2)',
      'linear-gradient(135deg, #c62828, #e53935)',
      'linear-gradient(135deg, #0d1442, #283593)'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Get emoji based on event type
  const getEventEmoji = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('tech') || lowerName.includes('conference')) return '💻';
    if (lowerName.includes('music') || lowerName.includes('festival')) return '🎵';
    if (lowerName.includes('art') || lowerName.includes('exhibition')) return '🎨';
    if (lowerName.includes('business') || lowerName.includes('leadership')) return '💼';
    if (lowerName.includes('startup') || lowerName.includes('pitch')) return '🚀';
    if (lowerName.includes('food') || lowerName.includes('wine')) return '🍷';
    if (lowerName.includes('comedy')) return '😂';
    if (lowerName.includes('fashion')) return '👗';
    if (lowerName.includes('science')) return '🔬';
    if (lowerName.includes('charity')) return '🤝';
    return '🎫';
  };

  return (
    <div className="event-card" onClick={() => navigate(`/event/${event._id}`)}>
      <div 
        className="event-card-image" 
        style={{ background: getGradient(event.name) }}
      >
        <div className="event-image-content">
          <span className="event-emoji">{getEventEmoji(event.name)}</span>
          <span className="event-image-title">{event.name}</span>
        </div>
        <div className="event-card-badges">
          {!isUpcoming && (
            <span className="badge badge-past">Past Event</span>
          )}
          {isUpcoming && event.availableSeats === 0 && (
            <span className="badge badge-sold">Sold Out</span>
          )}
          {isUpcoming && event.availableSeats > 0 && (
            <span className="badge badge-available">{event.availableSeats} seats left</span>
          )}
        </div>
      </div>
      
      <div className="event-card-body">
        <h3 className="event-card-title">{event.name}</h3>
        <p className="event-card-description">{event.description || 'No description available'}</p>
        
        <div className="event-card-details">
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">⏰</span>
            <span>{event.time}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span>{event.venue}</span>
          </div>
        </div>
        
        <div className="event-card-footer">
          <div className="event-price">
            <span className="price-amount">${event.price.toFixed(2)}</span>
            <span className="price-label">/ seat</span>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/event/${event._id}`);
            }}
            disabled={!isUpcoming || event.availableSeats === 0}
          >
            {!isUpcoming ? 'Past Event' : event.availableSeats === 0 ? 'Sold Out' : 'Book Now →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;