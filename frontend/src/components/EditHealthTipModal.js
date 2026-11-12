
import React, { useState, useEffect } from 'react';
import './Modal.css';

const EditHealthTipModal = ({ closeModal, healthTip, updateHealthTip }) => {
  const [tipText, setTipText] = useState(healthTip.tip_text);

  useEffect(() => {
    setTipText(healthTip.tip_text);
  }, [healthTip]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateHealthTip(healthTip.id, { tip_text: tipText });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Health Tip</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Health Tip"
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
          ></textarea>
          <div className="modal-actions">
            <button type="submit">Update Health Tip</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHealthTipModal;
