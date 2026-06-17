import React, { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import EventList from '../components/events/EventList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventAPI.getAllEvents();
      setEvents(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading amazing events..." />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <span>⚠️</span>
          <div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={fetchEvents} className="btn btn-primary" style={{ marginTop: '10px' }}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            🎟️ <span className="gradient-text">Upcoming Events</span>
          </h1>
          <p className="page-subtitle">
            Discover and book tickets for the best events in town
          </p>
        </div>
        <div className="page-stats">
          <div className="stat-card">
            <span className="stat-number">{events.length}</span>
            <span className="stat-label">Events Available</span>
          </div>
        </div>
      </div>
      
      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎭</div>
          <h3>No events available</h3>
          <p>Check back later for upcoming events</p>
        </div>
      ) : (
        <EventList events={events} />
      )}
    </div>
  );
};

export default HomePage;