
import React, { useState } from 'react';
import './Modal.css';

const AddPatientModal = ({ closeModal, addPatient }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [password, setPassword] = useState(''); // New password state
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (age < 0 && weight < 0) {
      setError('Age and weight cannot be negative.');
      return;
    }
    if (age < 0) {
      setError('Age cannot be negative.');
      return;
    }
    if (weight < 0) {
      setError('Weight cannot be negative.');
      return;
    }
    setError('');
    addPatient({ email, password, fullName, sex, age, weight, role: 'patient' }); // Use password state
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Patient</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" // New password input field
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <input
            type="number"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="submit">Add Patient</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
