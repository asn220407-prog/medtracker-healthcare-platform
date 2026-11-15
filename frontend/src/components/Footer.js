import React from 'react';
import { FaHeartbeat, FaLock, FaUserMd, FaUser, FaEnvelope } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname.startsWith('/vital-tracker');
  if (isAuthPage || isDashboardPage) {
    return null;
  }

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-faint-watermark" aria-hidden="true">
        MEDTRACKER
      </div>

      <div className="footer-top-accent-line"></div>

      <div className="footer-container">
        {/* Brand & Purpose Column */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="footer-logo-icon">
              <FaHeartbeat />
            </div>
            <span>MedTracker</span>
          </Link>
          <p className="footer-tagline">
            A transparent medication adherence platform bridging the care loop between licensed physicians and their patients.
          </p>
          <div className="footer-honest-badge">
            <FaLock className="badge-icon" />
            <span>Authenticated Role Guards &amp; IDOR Isolated</span>
          </div>
        </div>

        {/* 3 Link Columns */}
        <div className="footer-links-grid">
          {/* Column 1: Platform & Capabilities */}
          <div className="footer-nav-col">
            <h4>Capabilities</h4>
            <ul>
              <li>
                <button type="button" onClick={() => scrollTo('features')} className="footer-link-btn">
                  Dose Calendar
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('features')} className="footer-link-btn">
                  7 &amp; 30-Day Trends
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('features')} className="footer-link-btn">
                  Consultation Records
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('features')} className="footer-link-btn">
                  Diagnostic Reports
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('how-it-works')} className="footer-link-btn">
                  Workflow Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Portals */}
          <div className="footer-nav-col">
            <h4>Portals</h4>
            <ul>
              <li>
                <Link to="/login" className="footer-nav-link">
                  <FaUserMd /> Physician Workspace
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-nav-link">
                  <FaUser /> Patient Companion
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-nav-link">
                  Create Account
                </Link>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('roles')} className="footer-link-btn">
                  Role Comparison
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & FAQ */}
          <div className="footer-nav-col">
            <h4>Trust &amp; Contact</h4>
            <ul>
              <li>
                <button type="button" onClick={() => scrollTo('security')} className="footer-link-btn">
                  Security Architecture
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('faq')} className="footer-link-btn">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <a href="mailto:support@medtracker.local" className="footer-nav-link">
                  <FaEnvelope /> Support Desk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Medical Disclaimer */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="footer-disclaimer">
            <strong>Important Medical Notice:</strong> MedTracker is an adherence tracking and clinical logger utility. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
          </p>
          <div className="footer-copyright-row">
            <span>&copy; {currentYear} MedTracker Systems. All rights reserved.</span>
            <span className="footer-version-tag">Build v2.4 (Clinical)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
