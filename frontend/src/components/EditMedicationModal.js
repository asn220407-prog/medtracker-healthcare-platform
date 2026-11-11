
import React, { useState, useEffect } from 'react';
import './Modal.css';

const macroChips = [
  'Once daily at bedtime',
  'Twice daily with meals',
  'Every 8 hours as needed',
  'Once weekly in morning',
];

const EditMedicationModal = ({ closeModal, medication, updateMedication }) => {
  // Helper to format date strings (e.g., YYYY-MM-DDTHH:mm:ss.sssZ) to YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [startDate, setStartDate] = useState(formatDateForInput(medication.start_date));
  const [endDate, setEndDate] = useState(formatDateForInput(medication.end_date));
  const [error, setError] = useState('');

  const handleChipClick = (chipText) => {
    setDosage((prev) => (prev ? `${prev.split('(')[0].trim()} (${chipText})` : chipText));
  };

  useEffect(() => {
    setName(medication.name);
    setDosage(medication.dosage);
    setStartDate(formatDateForInput(medication.start_date));
    setEndDate(formatDateForInput(medication.end_date));
  }, [medication]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }
    setError('');
    updateMedication(medication.id, { name, dosage, start_date: startDate, end_date: endDate });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Medication</h3>
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
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="submit">Update Medication</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicationModal;
