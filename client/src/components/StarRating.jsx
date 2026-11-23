import React, { useState } from 'react';

const StarRating = ({ value = 0, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating d-inline-flex align-items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hover || value) >= star;
        return (
          <i
            key={star}
            className={`bi ${isFilled ? 'bi-star-fill filled' : 'bi-star'}`}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              fontSize: '1.4rem',
              color: isFilled ? '#f59e0b' : '#cbd5e1',
              marginRight: '4px',
              transition: 'transform 0.1s ease',
            }}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(star);
              }
            }}
            onMouseEnter={() => {
              if (!readOnly) setHover(star);
            }}
            onMouseLeave={() => {
              if (!readOnly) setHover(0);
            }}
          />
        );
      })}
      {value > 0 && <span className="ms-2 fw-semibold text-secondary small">({value}/5)</span>}
    </div>
  );
};

export default StarRating;
