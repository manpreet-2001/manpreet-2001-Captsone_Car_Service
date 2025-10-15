import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './ServicesPage.css';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/services');
      const servicesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      // Set mock data if API fails
      setServices([
        {
          _id: '1',
          serviceName: 'Basic Maintenance',
          description: 'Oil change, filter replacement, and basic inspection',
          category: 'maintenance',
          baseCost: 29,
          estimatedDuration: 30,
          rating: { average: 4.5, count: 120 },
          totalBookings: 450,
          isAvailable: true
        },
        {
          _id: '2',
          serviceName: 'Premium Service',
          description: 'Comprehensive service package with warranty',
          category: 'maintenance',
          baseCost: 79,
          estimatedDuration: 60,
          rating: { average: 4.8, count: 89 },
          totalBookings: 234,
          isAvailable: true
        },
        {
          _id: '3',
          serviceName: 'Engine Diagnostic',
          description: 'Complete engine diagnostic and troubleshooting',
          category: 'diagnostic',
          baseCost: 99,
          estimatedDuration: 90,
          rating: { average: 4.7, count: 67 },
          totalBookings: 156,
          isAvailable: true
        },
        {
          _id: '4',
          serviceName: 'Brake Service',
          description: 'Brake pad replacement and brake system inspection',
          category: 'repair',
          baseCost: 149,
          estimatedDuration: 120,
          rating: { average: 4.6, count: 98 },
          totalBookings: 189,
          isAvailable: true
        },
        {
          _id: '5',
          serviceName: 'Emergency Roadside',
          description: '24/7 emergency roadside assistance',
          category: 'emergency',
          baseCost: 75,
          estimatedDuration: 45,
          rating: { average: 4.9, count: 45 },
          totalBookings: 78,
          isAvailable: true
        },
        {
          _id: '6',
          serviceName: 'AC System Service',
          description: 'Air conditioning system maintenance and repair',
          category: 'repair',
          baseCost: 89,
          estimatedDuration: 75,
          rating: { average: 4.4, count: 56 },
          totalBookings: 123,
          isAvailable: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'inspection', label: 'Inspection' }
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = filter === 'all' || service.category === filter;
    const matchesSearch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && service.isAvailable;
  });

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">☆</span>);
    }

    return stars;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading services..." />;
  }

  return (
    <div className="services-page">
      <div className="services-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Our Services</h1>
            <p>Professional automotive services to keep your vehicle running smoothly</p>
          </div>
        </div>
      </div>

      <div className="services-content">
        <div className="container">
          {/* Search and Filter Section */}
          <div className="services-header">
            <div className="search-filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
              
              <div className="filter-tabs">
                {categories.map(category => (
                  <button
                    key={category.value}
                    className={`filter-tab ${filter === category.value ? 'active' : ''}`}
                    onClick={() => setFilter(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <div key={service._id} className="service-card">
                  <div className="service-header">
                    <div className="service-category">
                      <span className={`category-badge ${service.category}`}>
                        {service.category}
                      </span>
                    </div>
                    <div className="service-rating">
                      <div className="stars">
                        {renderStars(service.rating?.average || 0)}
                      </div>
                      <span className="rating-text">
                        {service.rating?.average?.toFixed(1) || '0.0'} ({service.rating?.count || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="service-content">
                    <h3 className="service-name">{service.serviceName}</h3>
                    <p className="service-description">{service.description}</p>
                    
                    <div className="service-meta">
                      <div className="meta-item">
                        <span className="meta-label">Duration:</span>
                        <span className="meta-value">{formatDuration(service.estimatedDuration)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Bookings:</span>
                        <span className="meta-value">{service.totalBookings || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="service-footer">
                    <div className="service-price">
                      <span className="price">${service.baseCost}</span>
                      <span className="price-label">starting from</span>
                    </div>
                    <button className="book-service-btn">
                      Book Service
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-services">
                <div className="no-services-content">
                  <h3>No services found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              </div>
            )}
          </div>

          {/* Service Statistics */}
          <div className="services-stats">
            <div className="stat-item">
              <div className="stat-number">{services.length}</div>
              <div className="stat-label">Available Services</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{services.reduce((total, service) => total + (service.totalBookings || 0), 0)}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{services.filter(s => s.isAvailable).length}</div>
              <div className="stat-label">Active Services</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {services.length > 0 ? (services.reduce((total, service) => total + (service.rating?.average || 0), 0) / services.length).toFixed(1) : '0.0'}
              </div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
