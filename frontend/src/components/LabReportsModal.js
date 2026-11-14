import React, { useState, useEffect, useCallback } from 'react';
import labReportService from '../services/labReportService';
import UploadLabReportModal from './UploadLabReportModal';
import { FaFilePdf, FaFileImage, FaDownload, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import API_BASE_URL from '../config';
import './Modal.css';
import './LabReportsModal.css';

const LabReportsModal = ({ patientId, patientName, token, isDoctor, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await labReportService.getLabReports(patientId, token);
      setReports(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load lab reports.');
    } finally {
      setLoading(false);
    }
  }, [patientId, token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async (reportId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete the lab report "${fileName}"?`)) {
      return;
    }

    try {
      await labReportService.deleteLabReport(reportId, token);
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete lab report.');
    }
  };

  const isPdf = (filePath) => filePath?.toLowerCase().endsWith('.pdf');

  return (
    <div className="modal-overlay">
      <div className="modal-content lab-reports-modal">
        <div className="lab-modal-header">
          <div>
            <h3>Lab Reports</h3>
            {patientName && (
              <p className="lab-modal-subtitle">
                Patient: <strong>{patientName}</strong> (ID: #{patientId})
              </p>
            )}
          </div>
          <button className="close-x-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {error && <div className="modal-error-banner">{error}</div>}

        <div className="lab-modal-actions-bar">
          <span className="reports-count-label">
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} available
          </span>
          {isDoctor && (
            <button
              className="open-upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              <FaPlus /> Upload New Report
            </button>
          )}
        </div>

        <div className="lab-reports-list-container">
          {loading ? (
            <p className="lab-reports-loading">Loading lab reports...</p>
          ) : reports.length === 0 ? (
            <div className="no-lab-reports-box">
              <span className="empty-reports-icon">📂</span>
              <p>No lab reports uploaded yet for this patient.</p>
              {isDoctor && (
                <button
                  className="open-upload-btn-secondary"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload First Lab Report
                </button>
              )}
            </div>
          ) : (
            <ul className="lab-reports-list">
              {reports.map((report) => (
                <li key={report.id} className="lab-report-item">
                  <div className="report-item-icon">
                    {isPdf(report.file_path) ? (
                      <FaFilePdf className="pdf-icon" />
                    ) : (
                      <FaFileImage className="img-icon" />
                    )}
                  </div>
                  <div className="report-item-info">
                    <span className="report-file-name" title={report.file_name}>
                      {report.file_name}
                    </span>
                    <span className="report-item-meta">
                      Uploaded on{' '}
                      {new Date(report.upload_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      by {report.doctor_name || 'Doctor'}
                    </span>
                  </div>
                  <div className="report-item-actions">
                    <a
                      href={`${API_BASE_URL}${report.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="report-view-btn"
                      title="View / Download Report"
                    >
                      <FaDownload /> View
                    </a>
                    {isDoctor && (
                      <button
                        className="report-delete-btn"
                        onClick={() => handleDelete(report.id, report.file_name)}
                        title="Delete Report"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {showUploadModal && (
        <UploadLabReportModal
          patientId={patientId}
          patientName={patientName}
          token={token}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={fetchReports}
        />
      )}
    </div>
  );
};

export default LabReportsModal;
