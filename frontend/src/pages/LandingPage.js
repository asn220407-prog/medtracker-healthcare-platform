import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeartbeat,
  FaCalendarCheck,
  FaChartLine,
  FaFileMedical,
  FaBell,
  FaArrowRight,
  FaCheckCircle,
  FaUserMd,
  FaUser,
  FaShieldAlt,
  FaComments,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import './LandingPage.css';

const faqItems = [
  {
    q: 'How does daily dose tracking work for patients?',
    a: 'Patients log into their personal portal and click on today\'s date on their interactive prescription calendar. A single tap marks the dose as taken with instant green color feedback. Past un-ticked dates are marked red as missed, and future dates are tamper-locked.'
  },
  {
    q: 'Can patients alter doctor prescriptions or consultation notes?',
    a: 'No. The system enforces strict role permissions. Only authenticated doctors can prescribe medications, formulate clinical diagnoses, or upload lab reports. Patients have read-only access to their prescriptions and health tips.'
  },
  {
    q: 'How are adherence percentages and progress calculated?',
    a: 'Adherence is calculated dynamically using the formula: (Total Doses Taken / Prescribed Days Elapsed) * 100. This data is rendered as clear progress bars and interactive graphs showing doses taken vs missed over 7-day and 30-day windows.'
  },
  {
    q: 'How do diagnostic lab reports work?',
    a: 'Doctors can upload blood panels, radiology reports, or diagnostic scans in PDF, JPG, or PNG formats up to 15MB. Both the physician and the assigned patient can preview or download these reports directly inside the application.'
  },
  {
    q: 'How are scheduled alarms and reminders triggered?',
    a: 'Both patients and doctors can schedule daily reminder alarms for each medication. When the scheduled time arrives, the app plays an audio chime and displays a reminder notification.'
  }
];

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-page-root">
      {/* 1. HERO SECTION */}
      <section className="landing-hero-section">
        <div className="hero-glow-backdrop" />
        <div className="hero-container">
          <div className="hero-badge">
            <FaHeartbeat className="hero-badge-icon" />
            <span>MedTracker Healthcare Platform</span>
          </div>

          <h1 className="hero-headline">
            Clinical Prescription Management & <br />
            <span className="hero-headline-gradient">Patient Medication Adherence</span>
          </h1>

          <p className="hero-subtext">
            Bridging the gap between clinic consultations and daily patient routines with 1-click dose verification,
            automated adherence analytics, diagnostic lab storage, and real-time care-team messaging.
          </p>

          <div className="hero-cta-group">
            <Link to="/login" className="hero-btn primary-btn">
              <span>Access Clinical Portal</span>
              <FaArrowRight />
            </Link>
            <Link to="/register" className="hero-btn secondary-btn">
              <span>Create New Account</span>
            </Link>
          </div>

          {/* Quick Stats Strip */}
          <div className="hero-stats-strip">
            <div className="stat-item">
              <span className="stat-number">2 Roles</span>
              <span className="stat-label">Doctor & Patient Portals</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-number">1-Click</span>
              <span className="stat-label">Adherence Dose Logging</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-number">30-Day</span>
              <span className="stat-label">Adherence Trends</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Secure & Confidential</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES (FEATURES GRID) */}
      <section className="landing-features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Comprehensive Capabilities</span>
            <h2 className="section-title">Engineered for Clinical Precision & Ease of Use</h2>
            <p className="section-subtitle">
              Everything care teams and patients need to maintain treatment continuity in one unified web workspace.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon cyan">
                <FaUserMd />
              </div>
              <h3 className="feature-card-title">Physician Clinical Workspace</h3>
              <p className="feature-card-desc">
                Roster management linking doctors to assigned patients, with consultation records (presenting complaints & final diagnoses).
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon emerald">
                <FaCalendarCheck />
              </div>
              <h3 className="feature-card-title">1-Click Adherence Calendar</h3>
              <p className="feature-card-desc">
                Color-coded calendar grid (Green = Taken, Red = Missed, Grey = Future) providing effortless daily dose recording.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon indigo">
                <FaChartLine />
              </div>
              <h3 className="feature-card-title">Adherence Velocity & Charts</h3>
              <p className="feature-card-desc">
                Visual progress bars and Chart.js line and bar graphs calculating exact compliance percentages over 7 and 30 days.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon amber">
                <FaFileMedical />
              </div>
              <h3 className="feature-card-title">Diagnostic Lab Reports</h3>
              <p className="feature-card-desc">
                Multer-powered document management supporting medical PDFs, metabolic panels, and radiology scans with authenticated preview.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon rose">
                <FaBell />
              </div>
              <h3 className="feature-card-title">Audio Medication Alarms</h3>
              <p className="feature-card-desc">
                Customizable daily reminders paired with synthesized Web Audio chimes and browser alerts so doses are never forgotten.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon violet">
                <FaComments />
              </div>
              <h3 className="feature-card-title">Care-Team Direct Chat</h3>
              <p className="feature-card-desc">
                Integrated communication modal allowing patients to ask clarifying questions about side effects or dosages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL-ROLE SHOWCASE */}
      <section className="landing-roles-section" id="roles">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Role-Segregated Workflows</span>
            <h2 className="section-title">Designed for Both Sides of Healthcare</h2>
          </div>

          <div className="roles-comparison-grid">
            {/* Doctor Column */}
            <div className="role-col doctor-col">
              <div className="role-col-header">
                <div className="role-avatar doctor">
                  <FaUserMd />
                </div>
                <div>
                  <h3>Doctor Workspace</h3>
                  <p>For Physicians & Care Teams</p>
                </div>
              </div>

              <ul className="role-checklist">
                <li><FaCheckCircle className="check-icon cyan" /> View only assigned patients via doctor_patient_map</li>
                <li><FaCheckCircle className="check-icon cyan" /> Record Presenting Complaints & Final Diagnoses</li>
                <li><FaCheckCircle className="check-icon cyan" /> Prescribe medications with start/end date validation</li>
                <li><FaCheckCircle className="check-icon cyan" /> Add personalized dietary & health recommendations</li>
                <li><FaCheckCircle className="check-icon cyan" /> Upload blood tests, pathology panels, and PDF reports</li>
                <li><FaCheckCircle className="check-icon cyan" /> Inspect patient adherence calendars in real time</li>
              </ul>

              <Link to="/login" className="role-action-btn doctor-btn">
                <span>Enter as Doctor</span>
                <FaArrowRight />
              </Link>
            </div>

            {/* Patient Column */}
            <div className="role-col patient-col">
              <div className="role-col-header">
                <div className="role-avatar patient">
                  <FaUser />
                </div>
                <div>
                  <h3>Patient Companion</h3>
                  <p>For Patients & Caregivers</p>
                </div>
              </div>

              <ul className="role-checklist">
                <li><FaCheckCircle className="check-icon emerald" /> View personal vitals (Age, Sex, Weight, Assigned Doctor)</li>
                <li><FaCheckCircle className="check-icon emerald" /> 1-tap adherence calendar to tick daily doses</li>
                <li><FaCheckCircle className="check-icon emerald" /> Real-time adherence rate (%) with progress bars</li>
                <li><FaCheckCircle className="check-icon emerald" /> Interactive 7-day & 30-day Chart.js compliance trends</li>
                <li><FaCheckCircle className="check-icon emerald" /> Download and inspect diagnostic lab reports</li>
                <li><FaCheckCircle className="check-icon emerald" /> Set daily alarm reminders with audio chimes</li>
              </ul>

              <Link to="/login" className="role-action-btn patient-btn">
                <span>Enter as Patient</span>
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & ARCHITECTURE */}
      <section className="landing-security-section" id="security">
        <div className="section-container">
          <div className="security-banner">
            <div className="security-banner-icon">
              <FaShieldAlt />
            </div>
            <div className="security-banner-text">
              <h3>Secure Full-Stack Architecture</h3>
              <p>
                MedTracker is built with industry-standard web practices: prepared SQL queries preventing SQL injection,
                Bcrypt password hashing, Role-Based Access Control (RBAC), and stateless JWT sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="landing-faq-section" id="faq">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? 'is-open' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <span>{item.q}</span>
                  {openFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="landing-final-cta-section">
        <div className="section-container">
          <div className="final-cta-card">
            <h2>Ready to Experience MedTracker?</h2>
            <p>
              Log into the demo portals to explore doctor patient rosters or test the patient 1-click adherence calendar.
            </p>
            <div className="final-cta-actions">
              <Link to="/login" className="hero-btn primary-btn">
                <span>Go to Login</span>
                <FaArrowRight />
              </Link>
              <Link to="/register" className="hero-btn secondary-btn">
                <span>Register Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
