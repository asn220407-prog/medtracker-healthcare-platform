import React, { useState } from 'react';
import { FaFilePdf, FaLock, FaSpinner } from 'react-icons/fa';
import labReportService from '../services/labReportService';
import './Modal.css';
import './UploadLabReportModal.css';

const UploadLabReportModal = ({ patientId, patientName, token, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Retrieve current user and token fallback
  const effectiveToken = token || localStorage.getItem('token') || '';
  let currentUser = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) {
    currentUser = null;
  }
  let isUserDoctor = currentUser?.role === 'doctor';
  if (!isUserDoctor && effectiveToken) {
    try {
      const decoded = JSON.parse(atob(effectiveToken.split('.')[1]));
      if (decoded && decoded.role === 'doctor') {
        isUserDoctor = true;
      }
    } catch (e) {}
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        setError('Only PDF and image files (.jpg, .jpeg, .png, .webp) are allowed.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size must be under 15MB.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUserDoctor) {
      setError('Physician Authorization Required: Diagnostic lab reports can only be uploaded and signed by licensed attending doctors.');
      return;
    }
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append('report_file', file);
      formData.append('patient_id', patientId);

      // Simulate step progress for smooth UX
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 20 : prev));
      }, 150);

      await labReportService.uploadLabReport(formData, effectiveToken);
      clearInterval(progressTimer);
      setUploadProgress(100);

      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 300);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to upload lab report. Please check permissions and file format.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content upload-report-modal" role="dialog" aria-modal="true" aria-labelledby="modal-upload-title">
        <h3 id="modal-upload-title">Upload Diagnostic Lab Report</h3>
        {patientName && (
          <p className="upload-patient-info">
            Patient: <strong>{patientName}</strong> (ID: #{patientId})
          </p>
        )}

        {error && <div className="modal-error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="file-upload-dropzone">
            <input
              type="file"
              id="lab-report-file-input"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              required
            />
            <label htmlFor="lab-report-file-input" className="file-upload-label">
              <span className="file-upload-icon">
                <FaFilePdf style={{ color: '#0ea5e9' }} />
              </span>
              <span className="file-upload-text">
                {file ? file.name : 'Choose a PDF report or medical scan'}
              </span>
              <span className="file-upload-hint">Supported formats: PDF, JPG, PNG, WEBP (Max 15MB)</span>
            </label>
          </div>

          {/* Upload Progress Bar */}
          {loading && (
            <div className="modal-upload-progress-box">
              <div className="modal-upload-progress-bar">
                <div
                  className="modal-upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="modal-upload-progress-text">
                <FaSpinner className="spin" style={{ marginRight: '6px' }} />
                Transferring report to secure clinical archive... {uploadProgress}%
              </span>
            </div>
          )}

          {!isUserDoctor && (
            <div className="modal-advisory-banner" style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              lineHeight: '1.4'
            }}>
              <strong>Physician Authorization Required:</strong> Diagnostic lab reports can only be uploaded by an authorized doctor. You are currently logged in as a patient.
            </div>
          )}

          <div className="upload-security-footer">
            <FaLock style={{ color: '#10b981', marginRight: '6px' }} />
            <span>Encrypted at Rest in Medical Storage • IDOR Protected</span>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file || !isUserDoctor}
              className="upload-submit-btn"
              title={!isUserDoctor ? 'Doctor authorization required to upload' : ''}
            >
              {loading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadLabReportModal;