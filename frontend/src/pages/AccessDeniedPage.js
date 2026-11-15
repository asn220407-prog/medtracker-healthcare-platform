import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft, FaSignInAlt, FaHeartbeat } from 'react-icons/fa';
import './SystemPage.css';

const AccessDeniedPage = () => {
  return (
    <div className="system-page-container">
      <div className="system-ambient-glow role-danger" aria-hidden="true" />
      <div className="system-card">
        <div className="system-icon-wrapper danger">
          <FaShieldAlt className="system-icon" />
        </div>
        <div className="system-badge danger">
          <span>Error 403 • Restricted Access</span>
        </div>
        <h1 className="system-title">Restricted Clinical Area</h1>
        <p className="system-desc">
          Your current authenticated session does not possess authorized role privileges to access this clinical resource.
        </p>
        <div className="system-actions">
          <Link to="/login" className="system-btn primary">
            <FaSignInAlt /> <span>Switch Account / Sign In</span>
          </Link>
          <Link to="/" className="system-btn ghost">
            <FaArrowLeft /> <span>Return to Portal</span>
          </Link>
        </div>
        <div className="system-footer-note">
          <FaHeartbeat className="system-mini-heart" />
          <span>Role-Based Access Control &amp; IDOR Isolated</span>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;