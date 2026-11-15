import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaArrowLeft, FaCompass, FaHome } from 'react-icons/fa';
import './SystemPage.css';

const NotFoundPage = () => {
  return (
    <div className="system-page-container">
      <div className="system-ambient-glow" aria-hidden="true" />
      <div className="system-card">
        <div className="system-icon-wrapper">
          <FaCompass className="system-icon" />
        </div>
        <div className="system-badge">
          <span>Error 404</span>
        </div>
        <h1 className="system-title">Clinical Route Not Found</h1>
        <p className="system-desc">
          The requested clinical endpoint, record, or portal page does not exist or has been relocated within the MedTracker system.
        </p>
        <div className="system-actions">
          <Link to="/" className="system-btn primary">
            <FaHome /> <span>Return to Home</span>
          </Link>
          <button
            type="button"
            className="system-btn ghost"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft /> <span>Go Back</span>
          </button>
        </div>
        <div className="system-footer-note">
          <FaHeartbeat className="system-mini-heart" />
          <span>MedTracker Adherence Platform</span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;