import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, reservationAPI } from '../services/api';
import SeatGrid from '../components/seats/SeatGrid';
import SeatLegend from '../components/seats/SeatLegend';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventData, seatsData] = await Promise.all([
        eventAPI.getEventById(id),
        eventAPI.getEventSeats(id)
      ]);
      
      setEvent(eventData.data);
      setSeats(seatsData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load event data');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat) => {
    if (seat.status !== 'available') return;
    
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.seatNumber === seat.seatNumber);
      if (isSelected) {
        return prev.filter(s => s.seatNumber !== seat.seatNumber);
      } else {
        if (prev.length >= 10) {
          alert('Maximum 10 seats can be selected');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      setReserving(true);
      const seatNumbers = selectedSeats.map(s => s.seatNumber);
      
      console.log('Reserving seats:', seatNumbers);
      
      const response = await reservationAPI.reserveSeats({
        eventId: id,
        seatNumbers: seatNumbers
      });
      
      console.log('Reservation response:', response);
      
      // Navigate to booking page with reservation ID
      navigate(`/booking/${response.data.reservationId}`, {
        state: {
          reservation: response.data,
          event: event,
          selectedSeats: selectedSeats
        }
      });
    } catch (err) {
      console.error('Reservation error:', err);
      alert(err.message || 'Failed to reserve seats');
      // Refresh seats to show updated status
      await fetchEventData();
      setSelectedSeats([]);
    } finally {
      setReserving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="container">
        <div className="error-message">
          <h3>Error loading event</h3>
          <p>{error || 'Event not found'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '10px' }}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Events
      </button>
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '8px' }}>{event.name}</h1>
            <p style={{ color: '#7f8c8d', marginBottom: '12px' }}>{event.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
              ${event.price.toFixed(2)}
            </div>
            <div style={{ color: '#7f8c8d', fontSize: '14px' }}>per seat</div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
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
          <div className="detail-item">
            <span className="detail-icon">💺</span>
            <span>{event.seatSummary?.available || 0} seats available</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '20px', color: '#2c3e50' }}>Select Your Seats</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#7f8c8d' }}>
              Selected: <strong>{selectedSeats.length}</strong> seats
            </span>
            <button
              className="btn btn-primary"
              onClick={handleReserve}
              disabled={selectedSeats.length === 0 || reserving}
            >
              {reserving ? 'Reserving...' : `Reserve ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        <SeatLegend />
        
        <SeatGrid
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatSelect={handleSeatSelect}
        />
        
        {selectedSeats.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f4f8', borderRadius: '8px' }}>
            <strong>Selected Seats:</strong> {selectedSeats.map(s => s.seatNumber).join(', ')}
            <br />
            <strong>Total:</strong> ${(selectedSeats.length * event.price).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;