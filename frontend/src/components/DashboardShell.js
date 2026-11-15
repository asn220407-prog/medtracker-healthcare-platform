import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat,
  FaVolumeUp,
  FaVolumeMute,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaUserMd,
  FaUser,
  FaChevronRight
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import './DashboardShell.css';

/**
 * DashboardShell - Clean application header, breadcrumb navigation, sound & theme toggles, and user menu
 */
const DashboardShell = ({
  user,
  breadcrumbCurrent = 'Overview',
  activeTab = 'all',
  onTabChange,
  tabs = [],
  children
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('medtracker_sound_enabled') !== 'false';
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('medtracker_sound_enabled', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const isDoctor = user?.role === 'doctor';
  const roleColor = isDoctor ? '#06b6d4' : '#10b981';

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : isDoctor
    ? 'DR'
    : 'PT';

  return (
    <div className={`dashboard-shell-container ${isDoctor ? 'shell-role-doctor' : 'shell-role-patient'}`}>
      {/* Top Bar Navigation */}
      <header className="shell-topbar" role="banner">
        <div className="shell-left-meta">
          <Link to="/" className="shell-brand-link" aria-label="MedTracker Home">
            <div className="shell-brand-icon">
              <FaHeartbeat />
            </div>
            <span className="shell-brand-name">MedTracker</span>
          </Link>

          <div className="shell-breadcrumb" aria-label="Breadcrumb">
            <FaChevronRight className="crumb-sep" />
            <span className="crumb-workspace">
              {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
            </span>
            <FaChevronRight className="crumb-sep" />
            <span className="crumb-active">{breadcrumbCurrent}</span>
          </div>
        </div>

        <div className="shell-right-actions">
          {/* Sound Notification Toggle */}
          <button
            type="button"
            className={`shell-action-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
            onClick={toggleSound}
            title={soundEnabled ? 'Reminder chime: Enabled' : 'Reminder chime: Muted'}
            aria-label="Toggle reminder audio chimes"
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            <span className="btn-label-desktop">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Quick Theme Switch */}
          <button
            type="button"
            className="shell-action-btn theme-switch"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {/* User Profile Avatar with Popover */}
          <div className="shell-user-menu-wrapper">
            <button
              type="button"
              className="shell-avatar-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="User account menu"
            >
              <div
                className="shell-avatar-ring"
                style={{ borderColor: roleColor, boxShadow: `0 0 10px ${roleColor}40` }}
              >
                <span>{userInitials}</span>
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="shell-menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="shell-user-dropdown" role="menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-name">{user?.fullName || (isDoctor ? 'Doctor' : 'Patient')}</div>
                    <div className="dropdown-email">{user?.email || 'User Account'}</div>
                    <div className="dropdown-role-pill" style={{ color: roleColor, borderColor: `${roleColor}50`, background: `${roleColor}15` }}>
                      {isDoctor ? <FaUserMd /> : <FaUser />}
                      <span>{isDoctor ? 'Doctor' : 'Patient'}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-logout-btn"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Floating Pill-style Tab Navigation Bar */}
      {tabs.length > 0 && (
        <nav className="shell-tab-navbar" aria-label="Dashboard Sub-sections">
          <div className="shell-tab-pills" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`shell-tab-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                >
                  {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="tab-badge-count">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Inner Child Layout */}
      <div className="shell-content-body">
        {children}
      </div>
    </div>
  );
};

export default DashboardShell;