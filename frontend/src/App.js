import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReminderAlarmBanner from './components/ReminderAlarmBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import './tokens/design-tokens.css';
import './App.css';

// Route-Based Code Splitting: Lazy-load application modules on demand
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const VitalTrackerPage = lazy(() => import('./pages/VitalTrackerPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));

const ClinicalLoadingFallback = () => (
  <div style={{
    minHeight: '65vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'var(--bg-canvas, #f8fafc)'
  }}>
    <div style={{
      width: '42px',
      height: '42px',
      border: '3px solid rgba(2, 132, 199, 0.15)',
      borderTopColor: '#0284c7',
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite'
    }} />
    <span style={{
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '600'
    }}>
      Loading MedTracker...
    </span>
  </div>
);

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          return null;
        }
        return decodedToken;
      } catch (error) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const token = user ? localStorage.getItem('token') : null;

  return (
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <ToastProvider>
            <Navbar
              user={user}
              setUser={setUser}
            />
            <ReminderAlarmBanner token={token} />
            <main className="app-main-content">
              <Suspense fallback={<ClinicalLoadingFallback />}>
                <Routes>
                  <Route path="/" element={user ? <Navigate to={user.role === 'doctor' ? '/dashboard' : '/vital-tracker'} /> : <LandingPage />} />
                  <Route path="/login" element={<LoginPage setUser={setUser} />} />
                  <Route path="/register" element={<RegisterPage setUser={setUser} />} />
                  <Route path="/dashboard" element={user && user.role === 'doctor' ? <DashboardPage /> : <Navigate to="/login" />} />
                  <Route path="/vital-tracker" element={user && user.role === 'patient' ? <VitalTrackerPage /> : <Navigate to="/login" />} />
                  <Route path="/vital-tracker/:patient_id" element={user ? <VitalTrackerPage /> : <Navigate to="/login" />} />
                  <Route path="/access-denied" element={<AccessDeniedPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </ToastProvider>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
