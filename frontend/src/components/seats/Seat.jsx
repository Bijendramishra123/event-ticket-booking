import React from 'react';
import './Seat.css';

const Seat = ({ seat, isSelected, onSelect }) => {
  const getStatusClass = () => {
    if (isSelected) return 'selected';
    return seat.status;
  };

  const handleClick = () => {
    if (seat.status === 'available') {
      onSelect(seat);
    }
  };

  const getTooltip = () => {
    if (seat.status === 'available') return 'Available';
    if (isSelected) return 'Selected';
    if (seat.status === 'reserved') return 'Reserved';
    if (seat.status === 'booked') return 'Booked';
    return '';
  };

  return (
    <div
      className={`seat ${getStatusClass()}`}
      onClick={handleClick}
      title={getTooltip()}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && seat.status === 'available') {
          onSelect(seat);
        }
      }}
    >
      <span className="seat-number">{seat.seatNumber}</span>
    </div>
  );
};

export default Seat;