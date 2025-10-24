import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'mechanic':
        return '/mechanic-dashboard';
      default:
        return '/dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Login';
    switch (user.role) {
      case 'admin':
        return 'Admin Panel';
      case 'mechanic':
        return 'Mechanic Portal';
      default:
        return 'My Dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <span className="logo-c">C</span>
            <span className="logo-s">S</span>
          </div>
          <span className="logo-text">CarService</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Home</Link>
          <Link to="/services" className="navbar-item">Services</Link>
          <Link to="/about" className="navbar-item">About</Link>
          <Link to="/contact" className="navbar-item">Contact</Link>
          
          {user ? (
            <div className="navbar-user-section">
              <Link to={getDashboardLink()} className="navbar-item dashboard-link">
                {getDashboardLabel()}
              </Link>
              <div className="user-menu">
                <span className="user-name">{user.name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="navbar-item login-btn">
              Login
            </Link>
          )}
        </div>

        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/services" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            Services
          </Link>
          <Link to="/about" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          {user ? (
            <>
              <Link to={getDashboardLink()} className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                {getDashboardLabel()}
              </Link>
              <button onClick={handleLogout} className="mobile-menu-item logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-menu-item login-btn" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
