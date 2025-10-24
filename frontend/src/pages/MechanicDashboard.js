import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './MechanicDashboard.css';

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [respondingToReview, setRespondingToReview] = useState(null);
  const [reviewResponse, setReviewResponse] = useState('');
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    description: '',
    category: 'maintenance',
    subcategory: 'oil_change',
    baseCost: '',
    estimatedDuration: '',
    costType: 'fixed'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, servicesRes, reviewsRes] = await Promise.all([
        axios.get('/api/bookings?limit=100'),  // Increased limit to fetch all bookings
        axios.get('/api/services?limit=100'),
        axios.get(`/api/reviews?mechanic=${user._id}&limit=100`)
      ]);
      
      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes.data?.data || [];
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : servicesRes.data?.data || [];
      const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : reviewsRes.data?.data || [];
      
      setAppointments(appointmentsData);
      // Fixed: Compare mechanic ID properly (handle both object and string)
      setServices(servicesData.filter(service => {
        const mechanicId = service.mechanic?._id || service.mechanic;
        return mechanicId === user._id || mechanicId?.toString() === user._id;
      }));
      setReviews(reviewsData);
      
      // Generate sample schedule
      const today = new Date();
      const weekSchedule = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        weekSchedule.push({
          date: date.toISOString().split('T')[0],
          appointments: appointmentsData.filter(apt => {
            if (!apt) return false;
            const aptDate = apt.bookingDate || apt.date;
            if (!aptDate) return false;
            return new Date(aptDate).toDateString() === date.toDateString();
          })
        });
      }
      setSchedule(weekSchedule);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty arrays on error to prevent filter errors
      setAppointments([]);
      setServices([]);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe array operations with fallbacks
  const todayAppointments = Array.isArray(appointments) ? appointments.filter(apt => {
    if (!apt) return false;
    const aptDate = apt.bookingDate || apt.date;
    if (!aptDate) return false;
    return new Date(aptDate).toDateString() === new Date().toDateString();
  }) : [];

  const pendingAppointments = Array.isArray(appointments) ? appointments
    .filter(apt => apt && (apt.status === 'pending' || apt.status === 'rescheduled'))
    .sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.createdAt);
      const dateB = new Date(b.bookingDate || b.createdAt);
      return dateB - dateA; // Latest first
    }) : [];
  
  const confirmedAppointments = Array.isArray(appointments) ? appointments
    .filter(apt => apt && apt.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.createdAt);
      const dateB = new Date(b.bookingDate || b.createdAt);
      return dateB - dateA; // Latest first
    }) : [];

  const stats = {
    totalAppointments: Array.isArray(appointments) ? appointments.length : 0,
    todayAppointments: todayAppointments.length,
    pendingAppointments: pendingAppointments.length,
    completedServices: Array.isArray(appointments) ? appointments.filter(apt => 
      apt && apt.status === 'completed'
    ).length : 0,
    totalServices: Array.isArray(services) ? services.length : 0
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      let updateData = { status };
      
      // If declining, ask for reason
      if (status === 'cancelled') {
        const reason = prompt('Please provide a reason for declining this service:');
        if (!reason || reason.trim() === '') {
          alert('Please provide a reason for declining the service.');
          return;
        }
        updateData.cancellationReason = reason.trim();
      }
      
      await axios.put(`/api/bookings/${appointmentId}/status`, updateData);
      
      // Show appropriate success message
      if (status === 'confirmed') {
        alert('✅ Service confirmed! The customer has been notified.');
      } else if (status === 'cancelled') {
        alert('❌ Service declined. The customer has been notified with your reason.');
      } else if (status === 'completed') {
        alert('🎉 Service marked as completed! The customer has been notified.');
      }
      
      // Update appointment status in local state without full refresh
      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? { ...apt, status } : apt
      ));
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleAddService = () => {
    setEditingService(null);
    setServiceForm({
      serviceName: '',
      description: '',
      category: 'maintenance',
      subcategory: 'oil_change',
      baseCost: '',
      estimatedDuration: '',
      costType: 'fixed'
    });
    setShowServiceModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      serviceName: service.serviceName,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory || 'oil_change',
      baseCost: service.baseCost,
      estimatedDuration: service.estimatedDuration,
      costType: service.costType || 'fixed'
    });
    setShowServiceModal(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`/api/services/${serviceId}`);
        fetchDashboardData();
        alert('Service deleted successfully!');
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure the service is visible to customers
      const serviceData = {
        ...serviceForm,
        isAvailable: true,
        isActive: true
      };

      if (editingService) {
        // Update existing service
        await axios.put(`/api/services/${editingService._id}`, serviceData);
        alert('Service updated successfully!');
      } else {
        // Create new service
        await axios.post('/api/services', serviceData);
        alert('Service created successfully!');
      }
      setShowServiceModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to save service:', error);
      alert('Failed to save service: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReviewResponse = async (reviewId) => {
    if (!reviewResponse.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      await axios.put(`/api/reviews/${reviewId}`, {
        mechanicResponse: {
          comment: reviewResponse,
          respondedAt: new Date()
        }
      });
      alert('Response submitted successfully!');
      setRespondingToReview(null);
      setReviewResponse('');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response: ' + (error.response?.data?.message || error.message));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner message="Loading mechanic dashboard..." />;
  }

  return (
    <div className="mechanic-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Mechanic Portal</h1>
            <p>Welcome back, {user?.name}. Manage your appointments and services.</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setActiveTab('services')}>
              Manage Services
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'appointments' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={activeTab === 'services' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('services')}
        >
          My Services
        </button>
        <button 
          className={activeTab === 'schedule' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button 
          className={activeTab === 'reviews' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{stats.todayAppointments}</h3>
                  <p>Today's Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pendingAppointments}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.completedServices}</h3>
                  <p>Completed Services</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔧</div>
                <div className="stat-info">
                  <h3>{stats.totalServices}</h3>
                  <p>Active Services</p>
                </div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h3>📋 Pending Requests (Need Your Action) - {pendingAppointments.length} Total</h3>
                <div className="pending-list">
                  {pendingAppointments.length > 0 ? (
                    pendingAppointments.map((appointment, index) => (
                      <div key={appointment._id} className="pending-item" onClick={() => handleBookingDetails(appointment)}>
                        <div className="request-number">
                          <span className="number-badge">#{index + 1}</span>
                          <span className="priority-badge">HIGH PRIORITY</span>
                        </div>
                        <div className="pending-date">
                          <div className="date-main">{appointment.bookingDate ? new Date(appointment.bookingDate).toLocaleDateString() : 'TBD'}</div>
                          <div className="date-time">{appointment.bookingTime || appointment.time || 'TBD'}</div>
                        </div>
                        <div className="pending-details">
                          <div className="service-info">
                            <strong className="service-name">
                              {appointment.service?.serviceName}
                              {appointment.status === 'rescheduled' && <span className="rescheduled-badge">🔄 Rescheduled</span>}
                            </strong>
                            <div className="customer-info">
                              <span className="customer-name">👤 {appointment.owner?.name}</span>
                              <span className="vehicle-info">🚗 {appointment.vehicle?.make} {appointment.vehicle?.model} ({appointment.vehicle?.year})</span>
                            </div>
                            <div className="cost-info">
                              <span className="cost">💰 ${appointment.estimatedCost || appointment.service?.baseCost || 'N/A'}</span>
                              <span className="duration">⏱️ {appointment.service?.estimatedDuration || appointment.service?.duration || 'N/A'} min</span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="appointment-notes">
                              <strong>Notes:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                        <div className="pending-actions">
                          <button 
                            className="btn-success btn-sm"
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          >
                            ✓ Accept
                          </button>
                          <button 
                            className="btn-danger btn-sm"
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          >
                            ✗ Decline
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>🎉 All caught up! No pending requests.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <h3>✅ Confirmed Appointments - {confirmedAppointments.length} Total</h3>
                <div className="appointments-list">
                  {confirmedAppointments.length > 0 ? (
                    confirmedAppointments.map((appointment, index) => (
                      <div key={appointment._id} className="appointment-item" onClick={() => handleBookingDetails(appointment)}>
                        <div className="appointment-number">
                          <span className="number-badge">#{index + 1}</span>
                          <span className="status-badge confirmed">CONFIRMED</span>
                        </div>
                        <div className="appointment-time">
                          <div className="time-main">{appointment.bookingTime || appointment.time || 'N/A'}</div>
                          <div className="time-date">{appointment.bookingDate ? new Date(appointment.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</div>
                        </div>
                        <div className="appointment-details">
                          <div className="service-info">
                            <strong className="service-name">{appointment.service?.serviceName}</strong>
                            <div className="customer-info">
                              <span className="customer-name">👤 {appointment.owner?.name}</span>
                              <span className="vehicle-info">🚗 {appointment.vehicle?.make} {appointment.vehicle?.model} ({appointment.vehicle?.year})</span>
                            </div>
                            <div className="cost-info">
                              <span className="cost">💰 ${appointment.estimatedCost || appointment.service?.baseCost || 'N/A'}</span>
                              <span className="duration">⏱️ {appointment.service?.estimatedDuration || appointment.service?.duration || 'N/A'} min</span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="appointment-notes">
                              <strong>Notes:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                        <div className="appointment-actions">
                          <button 
                            className="btn-primary btn-sm"
                            onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                          >
                            ✓ Complete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No confirmed appointments yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-tab">
            <div className="tab-header">
              <h2>All Appointments</h2>
              <div className="filter-tabs">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Today</button>
                <button className="filter-btn">Pending</button>
                <button className="filter-btn">Confirmed</button>
              </div>
            </div>
            <div className="appointments-grid">
              {Array.isArray(appointments) && appointments.length > 0 ? (
                appointments
                  .sort((a, b) => {
                    const dateA = new Date(a.bookingDate || a.createdAt);
                    const dateB = new Date(b.bookingDate || b.createdAt);
                    return dateB - dateA; // Latest first
                  })
                  .map((appointment, index) => (
                  <div key={appointment._id} className="appointment-card" onClick={() => handleBookingDetails(appointment)}>
                    <div className="appointment-header">
                      <div className="appointment-number">
                        <span className="number-badge">#{index + 1}</span>
                        <span className="date-badge">
                          {appointment.bookingDate ? new Date(appointment.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                        </span>
                      </div>
                      <div className="appointment-status">
                        <span className={`status-badge ${appointment.status}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="appointment-info">
                      <div className="service-section">
                        <h3 className="service-name">{appointment.service?.serviceName}</h3>
                        <div className="service-meta">
                          <span className="cost">💰 ${appointment.estimatedCost || appointment.service?.baseCost || appointment.service?.cost || 'N/A'}</span>
                          <span className="duration">⏱️ {appointment.service?.estimatedDuration || appointment.service?.duration || 'N/A'} min</span>
                        </div>
                      </div>
                      <div className="customer-section">
                        <div className="customer-info">
                          <span className="customer-name">👤 {appointment.owner?.name}</span>
                          <span className="vehicle-info">🚗 {appointment.vehicle?.make} {appointment.vehicle?.model} ({appointment.vehicle?.year})</span>
                        </div>
                        <div className="appointment-timing">
                          <span className="appointment-date">📅 {appointment.bookingDate ? new Date(appointment.bookingDate).toLocaleDateString() : 'N/A'}</span>
                          <span className="appointment-time">🕐 {appointment.bookingTime || appointment.time || 'N/A'}</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="appointment-notes">
                          <strong>Customer Notes:</strong>
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button 
                            className="btn-success"
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          >
                            ✓ Confirm
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          >
                            ✗ Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          className="btn-primary"
                          onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                        >
                          ✓ Mark Complete
                        </button>
                      )}
                      {appointment.status === 'completed' && (
                        <span className="completed-badge">✅ Completed</span>
                      )}
                      {appointment.status === 'cancelled' && (
                        <span className="cancelled-badge">❌ Cancelled</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No appointments found</h3>
                  <p>Your appointments will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-tab">
            <div className="tab-header">
              <h2>My Services</h2>
              <button className="btn-primary" onClick={handleAddService}>
                Add Service
              </button>
            </div>
            <div className="services-grid">
              {services.length > 0 ? (
                services.map(service => (
                  <div key={service._id} className="service-card">
                    <div className="service-header">
                      <h3>{service.serviceName}</h3>
                      <span className={`service-status ${service.isAvailable ? 'available' : 'unavailable'}`}>
                        {service.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="service-details">
                      <p>{service.description}</p>
                      <div className="service-meta">
                        <span className="price">${service.baseCost || service.cost}</span>
                        <span className="duration">{service.estimatedDuration || service.duration} min</span>
                        <span className="category">{service.category}</span>
                      </div>
                      {service.rating && service.rating.count > 0 && (
                        <div className="service-rating">
                          ⭐ {service.rating.average.toFixed(1)} ({service.rating.count} reviews)
                        </div>
                      )}
                    </div>
                    <div className="service-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => handleEditService(service)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDeleteService(service._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No services added yet</h3>
                  <p>Add your first service to start receiving bookings</p>
                  <button className="btn-primary" onClick={handleAddService}>
                    Add Service
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-tab">
            <div className="tab-header">
              <h2>Weekly Schedule</h2>
              <div className="schedule-actions">
                <button className="btn-secondary">Previous Week</button>
                <button className="btn-secondary">Next Week</button>
              </div>
            </div>
            <div className="schedule-grid">
              {schedule.map(day => (
                <div key={day.date} className="schedule-day">
                  <div className="day-header">
                    <h4>{new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}</h4>
                    <span className="appointment-count">
                      {Array.isArray(day.appointments) ? day.appointments.length : 0} appointments
                    </span>
                  </div>
                  <div className="day-appointments">
                    {Array.isArray(day.appointments) && day.appointments.length > 0 ? (
                      day.appointments.map(appointment => (
                        <div key={appointment._id} className="schedule-appointment">
                          <div className="appointment-time">{appointment.time}</div>
                          <div className="appointment-service">{appointment.service?.serviceName}</div>
                          <div className="appointment-customer">{appointment.owner?.name}</div>
                        </div>
                      ))
                    ) : (
                      <p className="no-appointments">No appointments</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            <div className="tab-header">
              <h2>Customer Reviews</h2>
              <div className="review-stats">
                {user.rating && user.rating.count > 0 && (
                  <>
                    <div className="avg-rating">
                      <span className="rating-number">{user.rating.average.toFixed(1)}</span>
                      <div className="stars">{renderStars(Math.round(user.rating.average))}</div>
                    </div>
                    <span className="review-count">{user.rating.count} reviews</span>
                  </>
                )}
              </div>
            </div>
            <div className="reviews-list">
              {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="review-info">
                        <h4>{review.customer?.name || 'Anonymous'}</h4>
                        <div className="stars">{renderStars(review.rating)}</div>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-service">
                        <span className="service-badge">{review.service?.serviceName}</span>
                      </div>
                    </div>
                    <div className="review-content">
                      <p className="review-comment">{review.comment}</p>
                      
                      {review.detailedRatings && Object.keys(review.detailedRatings).length > 0 && (
                        <div className="detailed-ratings">
                          <h5>Detailed Ratings:</h5>
                          <div className="rating-grid">
                            {Object.entries(review.detailedRatings).map(([key, value]) => (
                              <div key={key} className="rating-detail">
                                <span className="rating-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <span className="rating-value">{value}/5</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {review.tags && review.tags.length > 0 && (
                        <div className="review-tags">
                          {review.tags.map((tag, idx) => (
                            <span key={idx} className="review-tag">
                              {tag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {review.mechanicResponse && review.mechanicResponse.comment ? (
                        <div className="mechanic-response">
                          <div className="response-header">
                            <strong>Your Response:</strong>
                            <span className="response-date">
                              {new Date(review.mechanicResponse.respondedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p>{review.mechanicResponse.comment}</p>
                        </div>
                      ) : respondingToReview === review._id ? (
                        <div className="response-form">
                          <textarea
                            className="form-textarea"
                            rows="3"
                            placeholder="Write your response..."
                            value={reviewResponse}
                            onChange={(e) => setReviewResponse(e.target.value)}
                          />
                          <div className="response-actions">
                            <button 
                              className="btn-secondary btn-sm"
                              onClick={() => {
                                setRespondingToReview(null);
                                setReviewResponse('');
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn-primary btn-sm"
                              onClick={() => handleReviewResponse(review._id)}
                            >
                              Submit Response
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => setRespondingToReview(review._id)}
                        >
                          Respond to Review
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No reviews yet</h3>
                  <p>Customer reviews will appear here once you complete services</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="close-btn" onClick={() => setShowServiceModal(false)}>×</button>
            </div>
            <form onSubmit={handleServiceSubmit}>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={serviceForm.serviceName}
                  onChange={(e) => setServiceForm({...serviceForm, serviceName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-select"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                    required
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="emergency">Emergency</option>
                    <option value="preventive">Preventive</option>
                    <option value="cosmetic">Cosmetic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Subcategory</label>
                  <select
                    className="form-select"
                    value={serviceForm.subcategory}
                    onChange={(e) => setServiceForm({...serviceForm, subcategory: e.target.value})}
                  >
                    <option value="oil_change">Oil Change</option>
                    <option value="brake_service">Brake Service</option>
                    <option value="tire_service">Tire Service</option>
                    <option value="engine_repair">Engine Repair</option>
                    <option value="transmission">Transmission</option>
                    <option value="electrical">Electrical</option>
                    <option value="ac_service">AC Service</option>
                    <option value="exhaust">Exhaust</option>
                    <option value="suspension">Suspension</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Base Cost ($) *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="0.01"
                    value={serviceForm.baseCost}
                    onChange={(e) => setServiceForm({...serviceForm, baseCost: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="15"
                    max="480"
                    value={serviceForm.estimatedDuration}
                    onChange={(e) => setServiceForm({...serviceForm, estimatedDuration: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowServiceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingDetails(false)}>
          <div className="modal-content booking-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Booking Details</h3>
              <button className="close-btn" onClick={() => setShowBookingDetails(false)}>×</button>
            </div>
            <div className="booking-details-content">
              <div className="detail-section">
                <h4>👤 Customer Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedBooking.owner?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedBooking.owner?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedBooking.owner?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>🚗 Vehicle Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Make:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.make || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Model:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.model || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.year || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">License Plate:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.licensePlate || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">VIN:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.vin || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>🔧 Service Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Service:</span>
                    <span className="detail-value">{selectedBooking.service?.serviceName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedBooking.service?.description || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{selectedBooking.service?.category || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Cost:</span>
                    <span className="detail-value">${selectedBooking.estimatedCost || selectedBooking.service?.baseCost || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{selectedBooking.service?.estimatedDuration || selectedBooking.service?.duration || 'N/A'} minutes</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>📅 Appointment Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{selectedBooking.bookingTime || selectedBooking.time || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedBooking.status}`}>
                      {selectedBooking.status?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="detail-section">
                  <h4>📝 Additional Notes</h4>
                  <div className="notes-content">
                    <p>{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              {selectedBooking.cancellationReason && (
                <div className="detail-section">
                  <h4>❌ Cancellation Reason</h4>
                  <div className="notes-content">
                    <p>{selectedBooking.cancellationReason}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowBookingDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;
