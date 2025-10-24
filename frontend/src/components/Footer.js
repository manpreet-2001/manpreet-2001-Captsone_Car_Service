import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CarService</h3>
            <p>Your trusted partner in automotive care, providing professional services with transparency and quality.</p>
            <div className="social-links">
              <a href="#" className="social-link">📘 Facebook</a>
              <a href="#" className="social-link">🐦 Twitter</a>
              <a href="#" className="social-link">📷 Instagram</a>
              <a href="#" className="social-link">💼 LinkedIn</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>Oil Change</li>
              <li>Brake Service</li>
              <li>Engine Diagnostic</li>
              <li>AC Service</li>
              <li>Transmission Service</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li>Help Center</li>
              <li>Customer Support</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <p>📞 +1 (555) 123-4567</p>
              <p>✉️ contact@carservice.com</p>
              <p>📍 123 Main Street, City, State 12345</p>
              <p>🕒 Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 CarService. All rights reserved.</p>
            <p>Professional automotive services you can trust.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
