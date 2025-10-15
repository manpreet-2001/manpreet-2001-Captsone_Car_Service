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
  
  // Form states
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [historyFilter, setHistoryFilter] = useState('');
  const [newBooking, setNewBooking] = useState({
    vehicle: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    vin: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Try to fetch data from API endpoints
      const [vehiclesRes, bookingsRes, servicesRes] = await Promise.allSettled([
        axios.get('/vehicles'),
        axios.get('/bookings'),
        axios.get('/services')
      ]);
      
      // Handle vehicles data
      if (vehiclesRes.status === 'fulfilled') {
        const vehiclesData = vehiclesRes.value.data;
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || []);
      } else {
        console.warn('Failed to fetch vehicles:', vehiclesRes.reason);
        // Set mock data for vehicles if API fails
        setVehicles([
          {
            _id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: '2020',
            licensePlate: 'ABC-123',
            color: 'Silver',
            vin: '1HGBH41JXMN109186',
            createdAt: new Date('2023-01-15')
          },
          {
            _id: '2',
            make: 'Honda',
            model: 'Civic',
            year: '2019',
            licensePlate: 'XYZ-789',
            color: 'Blue',
            vin: '2HGBH41JXMN109187',
            createdAt: new Date('2023-03-22')
          }
        ]);
      }
      
      // Handle bookings data
      if (bookingsRes.status === 'fulfilled') {
        const bookingsData = bookingsRes.value.data;
        setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData?.data || []);
      } else {
        console.warn('Failed to fetch bookings:', bookingsRes.reason);
        // Set mock data for bookings if API fails
        setBookings([
          {
            _id: '1',
            vehicle: { _id: '1', make: 'Toyota', model: 'Camry' },
            service: { _id: '1', serviceName: 'Basic Maintenance', cost: 29 },
            mechanic: { _id: 'm1', name: 'John Smith' },
            date: new Date('2024-01-15'),
            time: '10:00',
            status: 'confirmed',
            notes: 'Regular maintenance check',
            createdAt: new Date('2024-01-10')
          },
          {
            _id: '2',
            vehicle: { _id: '2', make: 'Honda', model: 'Civic' },
            service: { _id: '2', serviceName: 'Premium Service', cost: 79 },
            mechanic: { _id: 'm2', name: 'Sarah Johnson' },
            date: new Date('2024-01-20'),
            time: '14:00',
            status: 'pending',
            notes: 'Full service package',
            createdAt: new Date('2024-01-12')
          },
          {
            _id: '3',
            vehicle: { _id: '1', make: 'Toyota', model: 'Camry' },
            service: { _id: '3', serviceName: 'Repair Service', cost: 150 },
            mechanic: { _id: 'm3', name: 'Mike Wilson' },
            date: new Date('2023-12-10'),
            time: '09:00',
            status: 'completed',
            notes: 'Engine diagnostic and repair',
            createdAt: new Date('2023-12-05')
          },
          {
            _id: '4',
            vehicle: { _id: '2', make: 'Honda', model: 'Civic' },
            service: { _id: '1', serviceName: 'Basic Maintenance', cost: 29 },
            mechanic: { _id: 'm1', name: 'John Smith' },
            date: new Date('2023-11-15'),
            time: '11:00',
            status: 'completed',
            notes: 'Oil change and filter replacement',
            createdAt: new Date('2023-11-10')
          }
        ]);
      }
      
      // Handle services data
      if (servicesRes.status === 'fulfilled') {
        const servicesData = servicesRes.value.data;
        setServices(Array.isArray(servicesData) ? servicesData : servicesData?.data || []);
      } else {
        console.warn('Failed to fetch services:', servicesRes.reason);
        // Set mock data for services if API fails
        setServices([
          {
            _id: '1',
            serviceName: 'Basic Maintenance',
            description: 'Oil change, filter replacement, and basic inspection',
            cost: 29,
            duration: 30
          },
          {
            _id: '2',
            serviceName: 'Premium Service',
            description: 'Comprehensive service package with warranty',
            cost: 79,
            duration: 60
          },
          {
            _id: '3',
            serviceName: 'Repair Service',
            description: 'Specialized repair and diagnostic services',
            cost: 150,
            duration: 120
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty arrays on error to prevent filter errors
      setVehicles([]);
      setBookings([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe array operations with fallbacks
  const upcomingBookings = Array.isArray(bookings) ? bookings.filter(booking => 
    booking && booking.date && new Date(booking.date) > new Date() && 
    booking.status !== 'completed' && 
    booking.status !== 'cancelled'
  ) : [];

  const recentBookings = Array.isArray(bookings) ? bookings.slice(0, 5) : [];

  const stats = {
    totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
    totalBookings: Array.isArray(bookings) ? bookings.length : 0,
    upcomingBookings: upcomingBookings.length,
    completedServices: Array.isArray(bookings) ? bookings.filter(b => b && b.status === 'completed').length : 0
  };

  // Handler functions
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const vehicle = {
      _id: Date.now().toString(),
      ...newVehicle,
      createdAt: new Date()
    };
    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ make: '', model: '', year: '', licensePlate: '', color: '', vin: '' });
    setShowAddVehicle(false);
    alert('Vehicle added successfully!');
  };

  const handleEditVehicle = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    if (vehicle) {
      setNewVehicle(vehicle);
      setShowEditVehicle(vehicleId);
      setShowAddVehicle(true);
    }
  };

  const handleUpdateVehicle = (e) => {
    e.preventDefault();
    setVehicles(vehicles.map(v => 
      v._id === showEditVehicle ? { ...v, ...newVehicle } : v
    ));
    setNewVehicle({ make: '', model: '', year: '', licensePlate: '', color: '', vin: '' });
    setShowEditVehicle(null);
    setShowAddVehicle(false);
    alert('Vehicle updated successfully!');
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(v => v._id !== vehicleId));
      alert('Vehicle deleted successfully!');
    }
  };

  const handleBookService = (e) => {
    e.preventDefault();
    if (!newBooking.vehicle || !newBooking.service || !newBooking.date || !newBooking.time) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedVehicle = vehicles.find(v => v._id === newBooking.vehicle);
    const selectedService = services.find(s => s._id === newBooking.service);
    
    const booking = {
      _id: Date.now().toString(),
      vehicle: selectedVehicle,
      service: selectedService,
      mechanic: { _id: 'm1', name: 'John Smith' }, // Mock mechanic
      date: new Date(newBooking.date),
      time: newBooking.time,
      status: 'pending',
      notes: newBooking.notes,
      createdAt: new Date()
    };

    setBookings([booking, ...bookings]);
    setNewBooking({ vehicle: '', service: '', date: '', time: '', notes: '' });
    setActiveTab('bookings');
    alert('Service booked successfully!');
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      alert('Booking cancelled successfully!');
    }
  };

  const handleRescheduleBooking = (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (booking) {
      setNewBooking({
        vehicle: booking.vehicle._id,
        service: booking.service._id,
        date: booking.date.toISOString().split('T')[0],
        time: booking.time,
        notes: booking.notes
      });
      setActiveTab('booking');
      alert('Please select a new date and time for your appointment');
    }
  };

  // Filter functions
  const getFilteredBookings = () => {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter(b => b && b.status === bookingFilter);
  };

  const getFilteredHistory = () => {
    let filtered = bookings.filter(b => b && b.status === 'completed');
    if (historyFilter) {
      filtered = filtered.filter(b => b.vehicle._id === historyFilter);
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Welcome back, {user?.name}</h1>
            <p>Manage your vehicles and service appointments</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setActiveTab('booking')}>
              Book Service
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
              <button 
                className="btn-primary" 
                onClick={() => {
                  setShowAddVehicle(true);
                  setShowEditVehicle(null);
                  setNewVehicle({ make: '', model: '', year: '', licensePlate: '', color: '', vin: '' });
                }}
              >
                Add Vehicle
              </button>
            </div>

            {showAddVehicle && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>{showEditVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                    <button 
                      className="close-btn" 
                      onClick={() => {
                        setShowAddVehicle(false);
                        setShowEditVehicle(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={showEditVehicle ? handleUpdateVehicle : handleAddVehicle}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Make *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.make}
                          onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Model *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Year *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newVehicle.year}
                          onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                          min="1900"
                          max="2024"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>License Plate *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.licensePlate}
                          onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Color</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.color}
                          onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>VIN</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.vin}
                          onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn-secondary" onClick={() => {
                        setShowAddVehicle(false);
                        setShowEditVehicle(null);
                      }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {showEditVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="vehicles-grid">
              {Array.isArray(vehicles) && vehicles.length > 0 ? (
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
                        <span className="label">Color:</span>
                        <span className="value">{vehicle.color || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Added:</span>
                        <span className="value">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="vehicle-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => handleEditVehicle(vehicle._id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No vehicles added yet</h3>
                  <p>Add your first vehicle to start booking services</p>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowAddVehicle(true);
                      setShowEditVehicle(null);
                    }}
                  >
                    Add Vehicle
                  </button>
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
                <button 
                  className={`filter-btn ${bookingFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'confirmed' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('confirmed')}
                >
                  Confirmed
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('completed')}
                >
                  Completed
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
            <div className="bookings-list">
              {getFilteredBookings().length > 0 ? (
                getFilteredBookings().map(booking => (
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
                      {booking.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span className="value">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="booking-actions">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <>
                          <button 
                            className="btn-secondary"
                            onClick={() => handleRescheduleBooking(booking._id)}
                          >
                            Reschedule
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <button className="btn-primary">Leave Review</button>
                      )}
                      {booking.status === 'cancelled' && (
                        <button 
                          className="btn-primary"
                          onClick={() => setActiveTab('booking')}
                        >
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No bookings found</h3>
                  <p>{bookingFilter === 'all' ? 'Book your first service appointment' : `No ${bookingFilter} bookings`}</p>
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
              <form className="booking-form" onSubmit={handleBookService}>
                <div className="form-section">
                  <h3>Select Vehicle *</h3>
                  <div className="form-group">
                    <select 
                      className="form-select"
                      value={newBooking.vehicle}
                      onChange={(e) => setNewBooking({...newBooking, vehicle: e.target.value})}
                      required
                    >
                      <option value="">Choose your vehicle</option>
                      {Array.isArray(vehicles) && vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                        </option>
                      ))}
                    </select>
                  </div>
                  {vehicles.length === 0 && (
                    <p className="form-help">
                      No vehicles found. <button 
                        type="button" 
                        className="link-btn"
                        onClick={() => setActiveTab('vehicles')}
                      >
                        Add a vehicle first
                      </button>
                    </p>
                  )}
                </div>

                <div className="form-section">
                  <h3>Select Service *</h3>
                  <div className="services-grid">
                    {Array.isArray(services) && services.map(service => (
                      <div key={service._id} className="service-option">
                        <input 
                          type="radio" 
                          id={service._id} 
                          name="service" 
                          value={service._id}
                          checked={newBooking.service === service._id}
                          onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
                          required
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
                  <h3>Select Date & Time *</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={newBooking.date}
                        onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <select 
                        className="form-select"
                        value={newBooking.time}
                        onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                        required
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
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
                      value={newBooking.notes}
                      onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setNewBooking({ vehicle: '', service: '', date: '', time: '', notes: '' })}
                  >
                    Clear Form
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={vehicles.length === 0}
                  >
                    Book Service
                  </button>
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
                <select 
                  className="form-select"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                >
                  <option value="">All Vehicles</option>
                  {Array.isArray(vehicles) && vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="history-list">
              {getFilteredHistory().length > 0 ? (
                getFilteredHistory().map(booking => (
                  <div key={booking._id} className="history-item">
                    <div className="history-date">
                      <div className="date-main">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="date-time">
                        {booking.time}
                      </div>
                    </div>
                    <div className="history-details">
                      <h4>{booking.service?.serviceName}</h4>
                      <p className="vehicle-info">
                        <strong>{booking.vehicle?.make} {booking.vehicle?.model}</strong> ({booking.vehicle?.year})
                      </p>
                      <p className="mechanic-info">
                        <span className="label">Mechanic:</span> {booking.mechanic?.name}
                      </p>
                      {booking.notes && (
                        <p className="notes-info">
                          <span className="label">Notes:</span> {booking.notes}
                        </p>
                      )}
                    </div>
                    <div className="history-cost">
                      <span className="cost-amount">${booking.service?.cost}</span>
                      <span className="cost-label">Total</span>
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
                  <p>
                    {historyFilter 
                      ? 'No completed services found for the selected vehicle' 
                      : 'Your completed services will appear here'
                    }
                  </p>
                  {historyFilter && (
                    <button 
                      className="btn-secondary"
                      onClick={() => setHistoryFilter('')}
                    >
                      Show All Vehicles
                    </button>
                  )}
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
