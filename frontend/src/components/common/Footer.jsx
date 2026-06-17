import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">🎫</span>
            <span className="footer-logo-text">
              Event<span className="footer-logo-highlight">Book</span>
            </span>
          </div>
          <p className="footer-tagline">Book tickets. Create memories.</p>
          <p className="footer-description">
            Your one-stop platform for discovering and booking the best events in town.
          </p>
        </div>

        {/* Links Section */}
        <div className="footer-links-section">
          <div className="footer-links-group">
            <h4 className="footer-links-group-title">Quick Links</h4>
            <a href="#" className="footer-link">
              <span className="link-icon">🏠</span> Home
            </a>
            <a href="#" className="footer-link">
              <span className="link-icon">🎫</span> Events
            </a>
            <a href="#" className="footer-link">
              <span className="link-icon">📋</span> My Bookings
            </a>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-links-group-title">Support</h4>
            <a href="#" className="footer-link">
              <span className="link-icon">❓</span> Help Center
            </a>
            <a href="#" className="footer-link">
              <span className="link-icon">📧</span> Contact Us
            </a>
            <a href="#" className="footer-link">
              <span className="link-icon">📱</span> FAQ
            </a>
          </div>
        </div>

        {/* Social Section */}
        <div className="footer-social-section">
          <h4 className="footer-social-title">Connect With Us</h4>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook">📱</a>
            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
            <a href="#" className="social-link" aria-label="Instagram">📷</a>
            <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
            <a href="#" className="social-link" aria-label="YouTube">▶️</a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>
            Follow us for updates
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>
            &copy; 2024 EventBook. All rights reserved. Made with{' '}
            <span className="heart">❤️</span> by EventBook Team
          </p>
          <div className="footer-bottom-links">
            <a href="#" className="footer-bottom-link">Privacy Policy</a>
            <a href="#" className="footer-bottom-link">Terms of Service</a>
            <a href="#" className="footer-bottom-link">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;