import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaHeartbeat,
  FaUser,
  FaUserMd,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaExclamationCircle,
  FaSpinner,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import PillArchitectureIllustration from '../components/PillArchitectureIllustration';
import './Auth.css';

const RegisterPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [fullName, setFullName] = useState('');
  const [qualification, setQualification] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [sex, setSex] = useState('Male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in your full name, email, and password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (role === 'patient') {
      if (age && (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 130)) {
        setErrorMessage('Please enter a valid age between 0 and 130.');
        return;
      }
      if (weight && (isNaN(Number(weight)) || Number(weight) < 0 || Number(weight) > 500)) {
        setErrorMessage('Please enter a valid weight in kg.');
        return;
      }
    }

    setLoading(true);

    try {
      const { data } = await authService.register({
        email: email.trim(),
        password,
        role,
        fullName: fullName.trim(),
        qualification: qualification.trim(),
        contactDetails: contactDetails.trim(),
        sex,
        age: age ? Number(age) : 30,
        weight: weight ? Number(weight) : 70,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      if (data.user.role === 'doctor') {
        navigate('/dashboard');
      } else {
        navigate('/vital-tracker');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const apiMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null);
      setErrorMessage(apiMsg || error.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="auth-page-wrapper">
      <div className="auth-simple-card">
        {/* Left Side: Medical Presentation */}
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

        {/* Right Side: Simple Clean Register Form */}
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
            <h2>Create an Account</h2>
            <p>Fill in your details to register as a patient or doctor.</p>
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="auth-clean-form" noValidate>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isDoctor ? 'doctor@hospital.com' : 'patient@hospital.com'}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-field-wrapper">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <div className="input-field-wrapper">
                  <input
                    id="reg-confirm"
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    aria-label="Toggle password"
                  >
                    {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Doctor specific fields */}
            {isDoctor ? (
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="reg-qual">Medical Qualification</label>
                  <input
                    id="reg-qual"
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MD, Cardiology"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-contact">Contact Number</label>
                  <input
                    id="reg-contact"
                    type="text"
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    placeholder="e.g. +1 555-0192"
                  />
                </div>
              </div>
            ) : (
              /* Patient specific fields */
              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="reg-sex">Sex</label>
                  <select
                    id="reg-sex"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-age">Age</label>
                  <input
                    id="reg-age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 32"
                    min="1"
                    max="125"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-weight">Weight (kg)</label>
                  <input
                    id="reg-weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70"
                    min="10"
                    max="300"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="btn-spinner" /> Creating account...
                </>
              ) : (
                `Register as ${isDoctor ? 'Doctor' : 'Patient'}`
              )}
            </button>
          </form>

          <div className="auth-bottom-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
