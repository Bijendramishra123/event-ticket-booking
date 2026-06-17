import React from 'react';
import Seat from './Seat';
import './SeatGrid.css';

const SeatGrid = ({ seats, selectedSeats, onSeatSelect }) => {
  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Sort rows
  const sortedRows = Object.keys(seatsByRow).sort();

  if (seats.length === 0) {
    return (
      <div className="seat-grid-empty">
        <p>No seats available for this event</p>
      </div>
    );
  }

  return (
    <div className="seat-grid-container">
      <div className="seat-grid-stage">STAGE</div>
      
      <div className="seat-grid">
        {sortedRows.map(row => (
          <div key={row} className="seat-row">
            <div className="seat-row-label">{row}</div>
            <div className="seat-row-seats">
              {seatsByRow[row]
                .sort((a, b) => a.column - b.column)
                .map(seat => {
                  const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
                  return (
                    <Seat
                      key={seat._id}
                      seat={seat}
                      isSelected={isSelected}
                      onSelect={onSeatSelect}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;