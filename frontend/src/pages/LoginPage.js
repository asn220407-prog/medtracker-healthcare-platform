import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaHeartbeat,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaExclamationCircle,
  FaSpinner,
  FaUserMd,
  FaUser,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import PillArchitectureIllustration from '../components/PillArchitectureIllustration';
import './Auth.css';

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authService.login({ email: email.trim(), password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      if (data.user.role === 'doctor') {
        navigate('/dashboard');
      } else {
        navigate('/vital-tracker');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const apiMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null);
      setErrorMessage(apiMsg || error.message || 'Authentication failed. Please check your credentials and role.');
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="auth-page-wrapper">
      <div className="auth-simple-card">
        {/* Left Side: Clean Medical Presentation */}
        <div className="auth-left-panel">
          <div className="auth-brand">
            <Link to="/" className="brand-logo-link">
              <FaHeartbeat className="brand-icon" />
              <span className="brand-name">MedTracker</span>
            </Link>
          </div>

          <div className="auth-hero-text">
            <h2>Simplifying Daily Health &amp; Medication Routines</h2>
            <p>
              Designed for both patients and healthcare teams. Log daily doses with 1-click verification, receive direct doctor guidance, and access lab reports.
            </p>
          </div>

          <div className="auth-illustration-wrapper">
            <PillArchitectureIllustration />
          </div>
        </div>

        {/* Right Side: Simple Clean Login Form */}
        <div className="auth-right-panel">
          <div className="auth-top-nav">
            <Link to="/" className="back-home-btn">
              <FaArrowLeft /> Back to Home
            </Link>
            <button
              type="button"
              className="theme-switcher-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Please enter your email and password to log in.</p>
          </div>

          {/* Simple Role Switch */}
          <div className="simple-role-toggle">
            <button
              type="button"
              className={`role-tab ${!isDoctor ? 'active' : ''}`}
              onClick={() => {
                setRole('patient');
                setErrorMessage('');
              }}
            >
              <FaUser /> Patient
            </button>
            <button
              type="button"
              className={`role-tab ${isDoctor ? 'active' : ''}`}
              onClick={() => {
                setRole('doctor');
                setErrorMessage('');
              }}
            >
              <FaUserMd /> Doctor
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="auth-error-box">
              <FaExclamationCircle />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-clean-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-field-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isDoctor ? 'doctor@hospital.com' : 'patient@hospital.com'}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-field-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="btn-spinner" /> Signing in...
                </>
              ) : (
                `Sign In as ${isDoctor ? 'Doctor' : 'Patient'}`
              )}
            </button>
          </form>

          <div className="auth-bottom-link">
            Don't have an account? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
