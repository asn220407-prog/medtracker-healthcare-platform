import React, { useState } from 'react';
import { FaCalendarPlus, FaStethoscope, FaNotesMedical, FaCheck } from 'react-icons/fa';
import './Modal.css';

const LogAppointmentModal = ({ closeModal, addAppointment, patient_id }) => {
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [presentComplaint, setPresentComplaint] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!appointmentDate) {
      setError('Please select an appointment date and time.');
      return;
    }
    setError('');
    addAppointment({
      patient_id,
      appointment_date: appointmentDate,
      present_complaint: presentComplaint,
      final_diagnosis: finalDiagnosis,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-consult-title">
        <h3 id="modal-consult-title">
          <FaCalendarPlus style={{ marginRight: '8px', color: '#0ea5e9' }} />
          Log Clinical Consultation
        </h3>

        {error && <div className="modal-error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Schedule */}
          <label htmlFor="consult-date-time">
            Date &amp; Time of Consultation
          </label>
          <input
            id="consult-date-time"
            type="datetime-local"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />

          {/* Section 2: Symptoms & Complaint */}
          <label htmlFor="consult-complaint">
            <FaStethoscope style={{ marginRight: '6px', color: '#38bdf8' }} />
            Symptoms &amp; Chief Complaint
          </label>
          <textarea
            id="consult-complaint"
            placeholder="Document patient's reported symptoms, onset, and duration..."
            value={presentComplaint}
            onChange={(e) => setPresentComplaint(e.target.value)}
            rows={3}
            required
          />

          {/* Section 3: Clinical Diagnosis */}
          <label htmlFor="consult-diagnosis">
            <FaNotesMedical style={{ marginRight: '6px', color: '#10b981' }} />
            Clinical Assessment &amp; Final Diagnosis
          </label>
          <textarea
            id="consult-diagnosis"
            placeholder="Record clinical findings, ICD assessment, or treatment plan..."
            value={finalDiagnosis}
            onChange={(e) => setFinalDiagnosis(e.target.value)}
            rows={3}
            required
          />

          <div className="modal-actions">
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit">
              <FaCheck style={{ marginRight: '6px' }} /> Save Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogAppointmentModal;