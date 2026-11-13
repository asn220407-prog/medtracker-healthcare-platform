import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ percentage = 0, label, totalTaken, prescribedDaysPassed, size = 'medium' }) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const getColorClass = (val) => {
    if (val >= 80) return 'progress-high';
    if (val >= 50) return 'progress-medium';
    return 'progress-low';
  };

  return (
    <div className={`progress-bar-container progress-${size}`}>
      {label && (
        <div className="progress-bar-header">
          <span className="progress-label">{label}</span>
          <span className="progress-percentage">
            {clampedPercentage}%
            {totalTaken !== undefined && prescribedDaysPassed !== undefined && (
              <small className="progress-details"> ({totalTaken}/{prescribedDaysPassed} days)</small>
            )}
          </span>
        </div>
      )}
      <div className="progress-track">
        <div
          className={`progress-fill ${getColorClass(clampedPercentage)}`}
          style={{ width: `${clampedPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
