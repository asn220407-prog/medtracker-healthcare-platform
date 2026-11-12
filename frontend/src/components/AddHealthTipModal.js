
import React, { useState } from 'react';
import './Modal.css';

const AddHealthTipModal = ({ closeModal, addHealthTip, patient_id }) => {
  const [tipText, setTipText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addHealthTip({ patient_id, tip_text: tipText });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Health Tip</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Health Tip"
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
          ></textarea>
          <div className="modal-actions">
            <button type="submit">Add Health Tip</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHealthTipModal;
