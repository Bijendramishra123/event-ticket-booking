import React from 'react';
import './SeatLegend.css';

const SeatLegend = () => {
  const legendItems = [
    { status: 'available', label: 'Available' },
    { status: 'selected', label: 'Selected' },
    { status: 'reserved', label: 'Reserved' },
    { status: 'booked', label: 'Booked' }
  ];

  return (
    <div className="seat-legend">
      {legendItems.map(item => (
        <div key={item.status} className="legend-item">
          <div className={`legend-color ${item.status}`}></div>
          <span className="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SeatLegend;