import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHeartbeat,
  FaSignOutAlt,
  FaUserMd,
  FaUser,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const navSections = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'roles', label: 'Portals' },
  { id: 'security', label: 'Security' },
  { id: 'faq', label: 'FAQ' },
];

const Navbar = ({
  user,
  setUser
}) => {
  const { theme, toggleTheme } = useTheme();
  const currentTheme = theme;
  const onToggleTheme = toggleTheme;
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const lastScrollY = useRef(0);

  // Scroll detection for transparent -> glass & smart hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Hide navbar when scrolling down past 120px, reveal when scrolling up
      if (currentScrollY > 120 && currentScrollY > lastScrollY.current + 8) {
        setNavHidden(true);
      } else if (currentScrollY < lastScrollY.current - 8 || currentScrollY <= 60) {
        setNavHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to highlight active section on the landing page
  useEffect(() => {
    if (!isLandingPage || user) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0,
      }
    );

    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLandingPage, user]);

  // Lock body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const onLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (!isLandingPage) {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname.startsWith('/vital-tracker');
  if (isAuthPage || isDashboardPage) {
    return null;
  }

  return (
    <header
      className={`navbar-header-sticky ${scrolled ? 'nav-scrolled' : 'nav-transparent'} ${
        navHidden ? 'nav-hidden' : ''
      }`}
    >
      <div className="navbar-container">
        <nav className="main-navbar" aria-label="Main Navigation">
          <Link to="/" className="nav-brand-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="nav-brand-icon">
              <FaHeartbeat />
            </div>
            <span className="brand-title">MedTracker</span>
          </Link>

          {/* Center Section Links for Landing Page */}
          {!user && isLandingPage && (
            <ul className="nav-section-links" role="menubar">
              {navSections.map(({ id, label }) => (
                <li key={id} role="none">
                  <button
                    type="button"
                    className={`nav-section-btn ${activeSection === id ? 'active' : ''}`}
                    onClick={() => scrollToSection(id)}
                    role="menuitem"
                  >
                    {label}
                    {activeSection === id && <span className="active-pill-indicator" />}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Right Action Links */}
          <ul className="nav-links-list">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <li>
                <button
                  type="button"
                  className="nav-theme-toggle-btn"
                  onClick={onToggleTheme}
                  aria-label={currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                  title={currentTheme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                >
                  {currentTheme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>
              </li>
            )}

            {user ? (
              <>
                <li className="user-role-indicator">
                  <span className={`role-pill ${user.role}`}>
                    {user.role === 'doctor' ? <FaUserMd /> : <FaUser />}
                    <span className="role-name">
                      {user.role === 'doctor' ? 'Doctor Workspace' : 'Patient Portal'}
                    </span>
                  </span>
                </li>
                <li>
                  <Link
                    to={user.role === 'doctor' ? '/dashboard' : '/vital-tracker'}
                    className="nav-home-link"
                  >
                    {user.role === 'doctor' ? 'Dashboard' : 'My Vitals'}
                  </Link>
                </li>
                <li>
                  <button onClick={onLogout} className="nav-logout-btn" aria-label="Log Out">
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-login-link">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="nav-register-btn">
                    <span>Register</span>
                    <FaArrowRight className="register-arrow" />
                  </Link>
                </li>
                {/* Mobile Hamburger Toggle for Landing Page */}
                {isLandingPage && (
                  <li>
                    <button
                      className="mobile-hamburger-btn"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
                      aria-expanded={mobileMenuOpen}
                    >
                      {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Full-Screen Mobile Drawer for Landing Page */}
      {!user && isLandingPage && mobileMenuOpen && (
        <div className="mobile-menu-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div className="mobile-drawer-inner">
            <div className="mobile-drawer-links">
              {navSections.map(({ id, label }, index) => (
                <button
                  key={id}
                  className="mobile-drawer-link-btn"
                  onClick={() => scrollToSection(id)}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <span>{label}</span>
                  <FaArrowRight className="drawer-arrow" />
                </button>
              ))}
            </div>

            <div className="mobile-drawer-actions">
              <Link to="/login" className="mobile-drawer-login" onClick={() => setMobileMenuOpen(false)}>
                Login to Portal
              </Link>
              <Link to="/register" className="mobile-drawer-register" onClick={() => setMobileMenuOpen(false)}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
