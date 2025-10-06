import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalServices: 0,
    totalMechanics: 0,
    totalBookings: 0,
    satisfactionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real app, you'd have an endpoint for stats
      // For now, we'll simulate the data
      setStats({
        totalServices: 45,
        totalMechanics: 28,
        totalBookings: 1250,
        satisfactionRate: 98
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Professional Service",
      description: "Connect with certified mechanics who deliver quality automotive services with guaranteed satisfaction.",
      icon: "wrench"
    },
    {
      title: "Easy Booking",
      description: "Schedule appointments online with real-time availability and instant confirmation notifications.",
      icon: "calendar"
    },
    {
      title: "Transparent Pricing",
      description: "Get upfront pricing with no hidden fees. Compare services and choose the best value for your needs.",
      icon: "dollar"
    },
    {
      title: "Service Tracking",
      description: "Monitor your vehicle's service history, track maintenance schedules, and receive timely reminders.",
      icon: "chart"
    }
  ];

  const services = [
    {
      name: "Basic Maintenance",
      price: "$29",
      duration: "30 min",
      description: "Oil change, filter replacement, and basic inspection",
      features: ["Oil Change", "Filter Replacement", "Basic Inspection", "Fluid Top-up"]
    },
    {
      name: "Premium Service",
      price: "$79",
      duration: "60 min",
      description: "Comprehensive service package with warranty",
      features: ["Everything in Basic", "Brake Inspection", "Engine Diagnostics", "AC System Check", "30-day Warranty"]
    },
    {
      name: "Repair Service",
      price: "$150/hr",
      duration: "Variable",
      description: "Specialized repair and diagnostic services",
      features: ["Engine Repair", "Transmission Service", "Electrical Work", "Emergency Repair"]
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Professional Car Service Management</h1>
            <p>Streamline your vehicle maintenance with our comprehensive booking platform. Connect with certified mechanics and manage your automotive services efficiently.</p>
            <div className="hero-actions">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin-dashboard' : 
                         user.role === 'mechanic' ? '/mechanic-dashboard' : '/dashboard'} 
                      className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-primary">Get Started</Link>
                  <Link to="/services" className="btn-secondary">Browse Services</Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="card-header">
                <h3>Quick Booking</h3>
              </div>
              <div className="card-content">
                <div className="booking-step">
                  <span className="step-number">1</span>
                  <span>Select Service</span>
                </div>
                <div className="booking-step">
                  <span className="step-number">2</span>
                  <span>Choose Mechanic</span>
                </div>
                <div className="booking-step">
                  <span className="step-number">3</span>
                  <span>Book Appointment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalServices}</div>
              <div className="stat-label">Available Services</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalMechanics}</div>
              <div className="stat-label">Certified Mechanics</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalBookings.toLocaleString()}</div>
              <div className="stat-label">Completed Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.satisfactionRate}%</div>
              <div className="stat-label">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Platform Features</h2>
            <p>Comprehensive tools for efficient car service management</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={`icon-${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>Service Packages</h2>
            <p>Choose the service level that meets your vehicle's needs</p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <div className="service-price">
                    <span className="price">{service.price}</span>
                    <span className="duration">{service.duration}</span>
                  </div>
                </div>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <Link to="/services" className="service-btn">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Manage Your Vehicle Services?</h2>
            <p>Join thousands of satisfied customers and mechanics using our platform</p>
            <div className="cta-actions">
              {user ? (
                <Link to="/booking" className="btn-primary large">
                  Book Service Now
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary large">Sign Up Today</Link>
                  <Link to="/login" className="btn-secondary large">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
