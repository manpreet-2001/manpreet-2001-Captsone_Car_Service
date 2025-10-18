import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get('/contact/info');
      setContactInfo(response.data.data);
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
      // Set default contact info if API fails
      setContactInfo({
        phone: '+1 (555) 123-4567',
        email: 'contact@carservice.com',
        address: '123 Main Street, City, State 12345',
        hours: {
          weekdays: 'Monday - Friday: 8:00 AM - 6:00 PM',
          saturday: 'Saturday: 9:00 AM - 4:00 PM',
          sunday: 'Sunday: Closed'
        },
        socialMedia: {
          facebook: 'https://facebook.com/carservice',
          twitter: 'https://twitter.com/carservice',
          instagram: 'https://instagram.com/carservice',
          linkedin: 'https://linkedin.com/company/carservice'
        }
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await axios.post('/contact', formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Contact Us</h1>
            <p>Get in touch with our team. We're here to help with all your automotive needs.</p>
          </div>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                {submitStatus === 'success' && (
                  <div className="success-message">
                    ✅ Your message has been sent successfully! We'll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="error-message">
                    ❌ Failed to send message. Please try again or contact us directly.
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'error' : ''}
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="Enter your phone number"
                      disabled={isSubmitting}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={errors.subject ? 'error' : ''}
                      placeholder="What's this about?"
                      disabled={isSubmitting}
                    />
                    {errors.subject && <span className="error-text">{errors.subject}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={errors.message ? 'error' : ''}
                    placeholder="Tell us how we can help you..."
                    rows="6"
                    disabled={isSubmitting}
                  />
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info-section">
              <div className="info-header">
                <h2>Get in Touch</h2>
                <p>We're here to help with all your automotive needs.</p>
              </div>

              {contactInfo && (
                <div className="contact-info">
                  <div className="info-item">
                    <div className="info-icon">📞</div>
                    <div className="info-content">
                      <h3>Phone</h3>
                      <p>{contactInfo.phone}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">✉️</div>
                    <div className="info-content">
                      <h3>Email</h3>
                      <p>{contactInfo.email}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">📍</div>
                    <div className="info-content">
                      <h3>Address</h3>
                      <p>{contactInfo.address}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">🕒</div>
                    <div className="info-content">
                      <h3>Business Hours</h3>
                      <p>{contactInfo.hours.weekdays}</p>
                      <p>{contactInfo.hours.saturday}</p>
                      <p>{contactInfo.hours.sunday}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {contactInfo?.socialMedia && (
                <div className="social-section">
                  <h3>Follow Us</h3>
                  <div className="social-links">
                    <a href={contactInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                      <span className="social-icon">📘</span>
                      Facebook
                    </a>
                    <a href={contactInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                      <span className="social-icon">🐦</span>
                      Twitter
                    </a>
                    <a href={contactInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                      <span className="social-icon">📷</span>
                      Instagram
                    </a>
                    <a href={contactInfo.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                      <span className="social-icon">💼</span>
                      LinkedIn
                    </a>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-item">
                  <h4>How quickly can you respond to service requests?</h4>
                  <p>We typically respond to all inquiries within 24 hours during business days.</p>
                </div>
                <div className="faq-item">
                  <h4>Do you offer emergency services?</h4>
                  <p>Yes, we provide 24/7 emergency roadside assistance for urgent situations.</p>
                </div>
                <div className="faq-item">
                  <h4>What areas do you serve?</h4>
                  <p>We serve the greater metropolitan area and surrounding suburbs with mobile services.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;


