import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './CarOwnerDashboard.css';

const CarOwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, bookingsRes, servicesRes] = await Promise.all([
        axios.get('/vehicles'),
        axios.get('/bookings'),
        axios.get('/services')
      ]);
      
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.date) > new Date() && 
    booking.status !== 'completed' && 
    booking.status !== 'cancelled'
  );

  const recentBookings = bookings.slice(0, 5);

  const stats = {
    totalVehicles: vehicles.length,
    totalBookings: bookings.length,
    upcomingBookings: upcomingBookings.length,
    completedServices: bookings.filter(b => b.status === 'completed').length
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name}</h1>
          <p>Manage your vehicles and service appointments</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setActiveTab('booking')}>
            Book Service
          </button>
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
          className={activeTab === 'vehicles' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('vehicles')}
        >
          My Vehicles
        </button>
        <button 
          className={activeTab === 'bookings' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button 
          className={activeTab === 'booking' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('booking')}
        >
          Book Service
        </button>
        <button 
          className={activeTab === 'history' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('history')}
        >
          Service History
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🚗</div>
                <div className="stat-info">
                  <h3>{stats.totalVehicles}</h3>
                  <p>Total Vehicles</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{stats.upcomingBookings}</h3>
                  <p>Upcoming Appointments</p>
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
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>{stats.totalBookings}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h3>Upcoming Appointments</h3>
                <div className="appointments-list">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.slice(0, 3).map(booking => (
                      <div key={booking._id} className="appointment-item">
                        <div className="appointment-date">
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="appointment-details">
                          <strong>{booking.service?.serviceName}</strong>
                          <span>{booking.vehicle?.make} {booking.vehicle?.model}</span>
                        </div>
                        <div className="appointment-status">
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No upcoming appointments</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {recentBookings.length > 0 ? (
                    recentBookings.map(booking => (
                      <div key={booking._id} className="activity-item">
                        <div className="activity-icon">
                          {booking.status === 'completed' ? '✅' : 
                           booking.status === 'confirmed' ? '📅' : '⏳'}
                        </div>
                        <div className="activity-details">
                          <strong>{booking.service?.serviceName}</strong>
                          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="activity-status">
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="vehicles-tab">
            <div className="tab-header">
              <h2>My Vehicles</h2>
              <button className="btn-primary">Add Vehicle</button>
            </div>
            <div className="vehicles-grid">
              {vehicles.length > 0 ? (
                vehicles.map(vehicle => (
                  <div key={vehicle._id} className="vehicle-card">
                    <div className="vehicle-header">
                      <h3>{vehicle.make} {vehicle.model}</h3>
                      <span className="vehicle-year">{vehicle.year}</span>
                    </div>
                    <div className="vehicle-details">
                      <div className="detail-item">
                        <span className="label">License Plate:</span>
                        <span className="value">{vehicle.licensePlate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Added:</span>
                        <span className="value">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="vehicle-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-danger">Remove</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No vehicles added yet</h3>
                  <p>Add your first vehicle to start booking services</p>
                  <button className="btn-primary">Add Vehicle</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <div className="tab-header">
              <h2>My Bookings</h2>
              <div className="filter-tabs">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Upcoming</button>
                <button className="filter-btn">Completed</button>
                <button className="filter-btn">Cancelled</button>
              </div>
            </div>
            <div className="bookings-list">
              {bookings.length > 0 ? (
                bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-info">
                        <h3>{booking.service?.serviceName}</h3>
                        <p>{booking.vehicle?.make} {booking.vehicle?.model}</p>
                      </div>
                      <div className="booking-status">
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="label">Date:</span>
                        <span className="value">{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Time:</span>
                        <span className="value">{booking.time}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Mechanic:</span>
                        <span className="value">{booking.mechanic?.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Cost:</span>
                        <span className="value">${booking.service?.cost}</span>
                      </div>
                    </div>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button className="btn-secondary">Reschedule</button>
                          <button className="btn-danger">Cancel</button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <button className="btn-primary">Leave Review</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No bookings found</h3>
                  <p>Book your first service appointment</p>
                  <button className="btn-primary" onClick={() => setActiveTab('booking')}>
                    Book Service
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="booking-tab">
            <div className="tab-header">
              <h2>Book a Service</h2>
            </div>
            <div className="booking-form-container">
              <form className="booking-form">
                <div className="form-section">
                  <h3>Select Vehicle</h3>
                  <div className="form-group">
                    <select className="form-select">
                      <option value="">Choose your vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Select Service</h3>
                  <div className="services-grid">
                    {services.map(service => (
                      <div key={service._id} className="service-option">
                        <input 
                          type="radio" 
                          id={service._id} 
                          name="service" 
                          value={service._id}
                        />
                        <label htmlFor={service._id} className="service-label">
                          <div className="service-info">
                            <h4>{service.serviceName}</h4>
                            <p>{service.description}</p>
                            <div className="service-meta">
                              <span className="price">${service.cost}</span>
                              <span className="duration">{service.duration} min</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Select Date & Time</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <select className="form-select">
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Additional Notes</h3>
                  <div className="form-group">
                    <textarea 
                      className="form-textarea" 
                      placeholder="Any specific requirements or notes for the mechanic..."
                      rows="4"
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Book Service</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="tab-header">
              <h2>Service History</h2>
              <div className="history-filters">
                <select className="form-select">
                  <option value="">All Vehicles</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="history-list">
              {bookings.filter(b => b.status === 'completed').length > 0 ? (
                bookings
                  .filter(b => b.status === 'completed')
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(booking => (
                    <div key={booking._id} className="history-item">
                      <div className="history-date">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="history-details">
                        <h4>{booking.service?.serviceName}</h4>
                        <p>{booking.vehicle?.make} {booking.vehicle?.model}</p>
                        <p>Mechanic: {booking.mechanic?.name}</p>
                      </div>
                      <div className="history-cost">
                        ${booking.service?.cost}
                      </div>
                      <div className="history-actions">
                        <button className="btn-secondary">View Details</button>
                        <button className="btn-primary">Leave Review</button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="empty-state">
                  <h3>No service history</h3>
                  <p>Your completed services will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarOwnerDashboard;
