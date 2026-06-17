import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { reservationAPI, bookingAPI } from '../services/api';
import { useTimer } from '../hooks/useTimer';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookingPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  // Define handleExpire before using it in useTimer
  const handleExpire = async () => {
    try {
      console.log('⏰ Reservation expired, releasing seats...');
      await reservationAPI.releaseReservation(reservationId);
      setError('Reservation has expired. Please try again.');
    } catch (err) {
      console.error('Error releasing reservation:', err);
    }
  };

  // Now useTimer with handleExpire defined
  const { formatTime, isExpired, reset } = useTimer(600, handleExpire);

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  useEffect(() => {
    // Reset timer when reservation loads
    if (reservation) {
      const expiresAt = new Date(reservation.expiresAt);
      const now = new Date();
      const secondsRemaining = Math.floor((expiresAt - now) / 1000);
      if (secondsRemaining > 0) {
        reset(secondsRemaining);
      }
    }
  }, [reservation]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Fetching reservation:', reservationId);
      const data = await reservationAPI.getReservation(reservationId);
      setReservation(data.data);
      console.log('✅ Reservation fetched:', data.data);
    } catch (err) {
      setError(err.message || 'Reservation not found or expired');
      console.error('Error fetching reservation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setConfirming(true);
      console.log('📝 Confirming booking for reservation:', reservationId);
      const result = await bookingAPI.confirmBooking({ reservationId });
      console.log('✅ Booking confirmed:', result);
      setBookingSuccess(true);
      
      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Booking error:', err);
      alert(err.message || 'Failed to confirm booking');
      // Refresh reservation to get updated status
      await fetchReservation();
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    
    try {
      console.log('📝 Cancelling reservation:', reservationId);
      await reservationAPI.releaseReservation(reservationId);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading reservation..." />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h3>Reservation Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '10px' }}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#27ae60', marginBottom: '10px' }}>Booking Confirmed!</h1>
          <p style={{ color: '#7f8c8d', fontSize: '18px' }}>
            Your seats have been successfully booked.
          </p>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            Redirecting to events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px' }}>
          Confirm Your Booking
        </h1>
        
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f4f8', borderRadius: '8px' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>
            {reservation?.eventId?.name || 'Event'}
          </h3>
          <p style={{ color: '#7f8c8d' }}>
            📍 {reservation?.eventId?.venue || 'Venue'} | 📅 {reservation?.eventId?.date ? new Date(reservation.eventId.date).toLocaleDateString() : ''}
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <strong style={{ color: '#7f8c8d', fontSize: '14px' }}>Seats</strong>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>
              {reservation?.seatNumbers?.join(', ') || 'N/A'}
            </p>
          </div>
          <div>
            <strong style={{ color: '#7f8c8d', fontSize: '14px' }}>Total Amount</strong>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
              ${reservation?.totalAmount?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px', padding: '15px', background: isExpired ? '#fee' : '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: isExpired ? '#c0392b' : '#27ae60' }}>
            {isExpired ? '⏰ Reservation Expired' : '⏱️ Time Remaining'}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: isExpired ? '#c0392b' : '#2c3e50' }}>
            {formatTime()}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-success"
            onClick={handleConfirmBooking}
            disabled={isExpired || confirming}
            style={{ flex: 1, minWidth: '150px' }}
          >
            {confirming ? 'Confirming...' : '✅ Confirm Booking'}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleCancelReservation}
            disabled={confirming}
            style={{ flex: 1, minWidth: '150px' }}
          >
            ❌ Cancel Reservation
          </button>
        </div>
        
        <p style={{ color: '#7f8c8d', fontSize: '14px', marginTop: '15px', textAlign: 'center' }}>
          You have {isExpired ? '0' : Math.floor((new Date(reservation?.expiresAt) - new Date()) / 1000)} seconds to complete your booking
        </p>
      </div>
    </div>
  );
};

export default BookingPage;