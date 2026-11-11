
import React, { useState } from 'react';
import './Modal.css';

const macroChips = [
  'Once daily at bedtime',
  'Twice daily with meals',
  'Every 8 hours as needed',
  'Once weekly in morning',
];

const AddMedicationModal = ({ closeModal, addMedication, patient_id }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleChipClick = (chipText) => {
    setDosage((prev) => (prev ? `${prev.split('(')[0].trim()} (${chipText})` : chipText));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }
    setError('');
    addMedication({ patient_id, name, dosage, start_date: startDate, end_date: endDate });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Medication</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Medication Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Dosage (e.g. 20mg)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          />
          <div className="macro-chips-wrapper">
            <span className="macro-chips-title">Schedule Macros:</span>
            <div className="macro-chips-list">
              {macroChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="macro-chip-btn"
                  onClick={() => handleChipClick(chip)}
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="submit">Add Medication</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModal;
