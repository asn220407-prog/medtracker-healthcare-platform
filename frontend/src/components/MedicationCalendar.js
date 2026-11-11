import React, { useState } from 'react';
import './MedicationCalendar.css';

// A robust, timezone-safe function to get 'YYYY-MM-DD' from a Date object.
const toYYYYMMDD = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const MedicationCalendar = ({ medication, userRole, takenDates = [], onDateClick }) => {
  const startDateString = medication.start_date ? medication.start_date.split('T')[0] : null;
  const endDateString = medication.end_date ? medication.end_date.split('T')[0] : null;

  // Initialize currentMonth intelligently:
  // If today is within prescription period, show today's month.
  // Otherwise, default to the prescription's start_date month so the patient immediately sees their active days!
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const todayString = toYYYYMMDD(today);
    if (startDateString && endDateString && todayString >= startDateString && todayString <= endDateString) {
      return today;
    }
    if (startDateString) {
      const parts = startDateString.split('-');
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    }
    return today;
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    for (let i = 1; i <= 31; i++) {
      const d = new Date(year, month, i);
      if (d.getMonth() === month) {
        days.push(i);
      }
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const jumpToToday = () => setCurrentMonth(new Date());
  const jumpToPrescription = () => {
    if (startDateString) {
      const parts = startDateString.split('-');
      setCurrentMonth(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
    }
  };

  const getDayClass = (dayNumber) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const dayString = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    
    const todayString = toYYYYMMDD(new Date());

    const isTaken = takenDates.includes(dayString);
    const isPrescribedDay = startDateString && endDateString && dayString >= startDateString && dayString <= endDateString;

    let className = 'calendar-day';
    if (isPrescribedDay) {
      if (isTaken) {
        className += ' taken'; // Green
      } else if (dayString < todayString) {
        className += ' missed'; // Red
      } else {
        className += ' prescribed';
      }
    } else {
      className += ' outside-prescription';
    }

    if (dayString === todayString) {
      className += ' today';
    }

    return className;
  };

  return (
    <div className="medication-calendar">
      <div className="calendar-header">
        <div className="calendar-nav-controls">
          <button onClick={prevMonth} title="Previous Month">&lt;</button>
          <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextMonth} title="Next Month">&gt;</button>
        </div>
        <div className="calendar-quick-jumps">
          <button className="jump-btn jump-today" onClick={jumpToToday} title="Jump to Current Month">
            Today
          </button>
          {startDateString && (
            <button className="jump-btn jump-presc" onClick={jumpToPrescription} title="Jump to Prescription Active Month">
              Rx Month
            </button>
          )}
        </div>
      </div>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-label">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}
        {daysInMonth.map((dayNumber) => {
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth() + 1;
          const dayString = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
          
          const isTaken = takenDates.includes(dayString);
          const isPrescribedDay = startDateString && endDateString && dayString >= startDateString && dayString <= endDateString;
          const isClickable = (userRole === 'patient' || userRole === 'doctor') && isPrescribedDay;

          return (
            <div
              key={dayString}
              className={`${getDayClass(dayNumber)} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onDateClick(medication.id, dayString, isTaken)}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedicationCalendar;
