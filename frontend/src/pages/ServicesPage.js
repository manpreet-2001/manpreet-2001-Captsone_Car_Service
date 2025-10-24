import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './ServicesPage.css';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [viewMode, setViewMode] = useState('services'); // 'services' or 'mechanics'

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchServices();
    fetchMechanics();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Fetch with higher limit to get all services
      const response = await axios.get('/api/services?limit=100');
      const servicesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log('Services fetched:', servicesData.length, servicesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      // Set empty array if API fails - let users see no services rather than fake data
      setServices([]);
      /* Removed mock data - let the system show real data or empty state
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
      */
    } finally {
      setLoading(false);
    }
  };

  const fetchMechanics = async () => {
    try {
      const response = await axios.get('/api/users/mechanics');
      const mechanicsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log('Mechanics fetched:', mechanicsData.length, mechanicsData);
      setMechanics(mechanicsData);
    } catch (error) {
      console.error('Failed to fetch mechanics:', error);
      setMechanics([]);
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
    const matchesMechanic = !selectedMechanic || (service.mechanic && service.mechanic._id === selectedMechanic);
    return matchesCategory && matchesSearch && matchesMechanic && service.isAvailable;
  });

  const filteredMechanics = mechanics.filter(mechanic => {
    const matchesSearch = mechanic.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filter === 'all' || (mechanic.specialization && mechanic.specialization.includes(filter));
    return matchesSearch && matchesCategory;
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
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'services' ? 'active' : ''}`}
              onClick={() => setViewMode('services')}
            >
              🔧 Browse Services
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'mechanics' ? 'active' : ''}`}
              onClick={() => setViewMode('mechanics')}
            >
              👨‍🔧 Find Mechanics
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="services-header">
            <div className="search-filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder={viewMode === 'services' ? 'Search services...' : 'Search mechanics...'}
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

              {viewMode === 'services' && mechanics.length > 0 && (
                <div className="mechanic-filter">
                  <select 
                    className="form-select"
                    value={selectedMechanic || ''}
                    onChange={(e) => setSelectedMechanic(e.target.value || null)}
                  >
                    <option value="">All Mechanics</option>
                    {mechanics.map(mechanic => (
                      <option key={mechanic._id} value={mechanic._id}>
                        {mechanic.name} {mechanic.rating?.average > 0 && `(⭐ ${mechanic.rating.average.toFixed(1)})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Services Grid */}
          {viewMode === 'services' && (
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
                      
                      {service.mechanic && (
                        <div className="service-provider">
                          <span className="provider-label">👨‍🔧 Provided by:</span>
                          <span className="provider-name">{service.mechanic.name}</span>
                          {service.mechanic.rating?.average > 0 && (
                            <span className="provider-rating">⭐ {service.mechanic.rating.average.toFixed(1)}</span>
                          )}
                        </div>
                      )}
                      
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
                      <button className="btn btn-primary btn-sm">
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
          )}

          {/* Mechanics Grid */}
          {viewMode === 'mechanics' && (
            <div className="mechanics-grid">
              {filteredMechanics.length > 0 ? (
                filteredMechanics.map(mechanic => (
                  <div key={mechanic._id} className="mechanic-card">
                    <div className="mechanic-header">
                      <div className="mechanic-avatar">
                        {mechanic.profileImage ? (
                          <img src={mechanic.profileImage} alt={mechanic.name} />
                        ) : (
                          <div className="avatar-placeholder">👨‍🔧</div>
                        )}
                      </div>
                      <div className="mechanic-info">
                        <h3>{mechanic.name}</h3>
                        {mechanic.rating?.average > 0 && (
                          <div className="mechanic-rating">
                            <div className="stars">
                              {renderStars(mechanic.rating.average)}
                            </div>
                            <span className="rating-text">
                              {mechanic.rating.average.toFixed(1)} ({mechanic.rating.count} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mechanic-details">
                      {mechanic.experience > 0 && (
                        <div className="detail-item">
                          <span className="detail-icon">🏆</span>
                          <span>{mechanic.experience} years experience</span>
                        </div>
                      )}
                      {mechanic.hourlyRate > 0 && (
                        <div className="detail-item">
                          <span className="detail-icon">💰</span>
                          <span>${mechanic.hourlyRate}/hour</span>
                        </div>
                      )}
                      {mechanic.specialization && mechanic.specialization.length > 0 && (
                        <div className="specializations">
                          <span className="spec-label">Specializations:</span>
                          <div className="spec-tags">
                            {mechanic.specialization.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="spec-tag">
                                {spec.replace('_', ' ')}
                              </span>
                            ))}
                            {mechanic.specialization.length > 3 && (
                              <span className="spec-tag">+{mechanic.specialization.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mechanic-footer">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedMechanic(mechanic._id);
                          setViewMode('services');
                        }}
                      >
                        View Services
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-services">
                  <div className="no-services-content">
                    <h3>No mechanics found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                </div>
              )}
            </div>
          )}

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

