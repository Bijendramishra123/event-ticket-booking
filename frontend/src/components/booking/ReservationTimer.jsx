import React, { useState, useEffect } from 'react';
import './ReservationTimer.css';

const ReservationTimer = ({ 
  expiresAt, 
  onExpire, 
  onExtend, 
  showExtend = false,
  className = '' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = Math.floor((expiry - now) / 1000);
      return Math.max(0, diff);
    };

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        if (onExpire) onExpire();
      }
    };

    // Initial calculation
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
      totalMinutes: mins,
      totalSeconds: seconds
    };
  };

  const getTimerColor = () => {
    if (isExpired) return 'danger';
    if (timeRemaining < 60) return 'warning';
    if (timeRemaining < 180) return 'caution';
    return 'success';
  };

  const getProgressPercentage = () => {
    // Assuming initial time is 10 minutes (600 seconds)
    const initialTime = 600;
    return Math.min(100, (timeRemaining / initialTime) * 100);
  };

  const { minutes, seconds, totalMinutes } = formatTime(timeRemaining);

  if (isExpired) {
    return (
      <div className={`reservation-timer expired ${className}`}>
        <div className="timer-icon">⏰</div>
        <div className="timer-status">Reservation Expired</div>
        <div className="timer-message">Please try again</div>
      </div>
    );
  }

  return (
    <div className={`reservation-timer ${getTimerColor()} ${className}`}>
      <div className="timer-header">
        <span className="timer-icon">⏱️</span>
        <span className="timer-label">Time Remaining</span>
      </div>
      
      <div className="timer-display">
        <span className="timer-minutes">{minutes}</span>
        <span className="timer-separator">:</span>
        <span className="timer-seconds">{seconds}</span>
      </div>
      
      <div className="timer-progress">
        <div 
          className="timer-progress-bar" 
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      <div className="timer-footer">
        <span className="timer-detail">
          {totalMinutes} minute{totalMinutes !== 1 ? 's' : ''} remaining
        </span>
        {showExtend && onExtend && (
          <button 
            className="btn btn-secondary timer-extend-btn"
            onClick={onExtend}
            disabled={isExpired}
          >
            + Extend Time
          </button>
        )}
      </div>
    </div>
  );
};

export default ReservationTimer;