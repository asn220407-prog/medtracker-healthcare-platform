import React, { useState, useEffect } from 'react';
import './Modal.css';

const EditPatientModal = ({ closeModal, patient, updatePatient }) => {
  const [fullName, setFullName] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setFullName(patient.full_name || '');
      setSex(patient.sex || '');
      setAge(patient.age || '');
      setWeight(patient.weight || '');
    }
  }, [patient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const ageNum = parseInt(age, 10);
    const weightNum = parseInt(weight, 10);

    if (isNaN(ageNum) || isNaN(weightNum) || ageNum < 0 || weightNum < 0) {
      setError('Age and weight must be valid, non-negative numbers.');
      return;
    }
    
    updatePatient(patient.user_id, { fullName, sex, age: ageNum, weight: weightNum });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Patient</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            min="0"
          />
          <input
            type="number"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            min="0"
          />
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="submit">Update Patient</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;